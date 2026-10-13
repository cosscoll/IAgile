import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=path.join(root,'academy-app');
const config=fs.readFileSync(path.join(app,'config.js'),'utf8');
const logic=fs.readFileSync(path.join(app,'app.js'),'utf8');
const nativeConfig=fs.readFileSync(path.join(root,'_config.yml'),'utf8');
const workflows=fs.readFileSync(path.join(root,'.github/workflows/deploy.yml'),'utf8');
const slugs=['sites-3d','agents','automatisation','processus'];

assert(nativeConfig.includes('  - "academy-app/"'),'Jekyll may serve untested learner shell');
assert(!workflows.includes('"academy-app/'),'Learner source should not be staged as a public asset');
assert(/sb_publishable_/.test(config),'Use a supported publishable key');
assert(!/sb_secret_|service_role|OPENAI_API_KEY/.test(config),'A secret key is forbidden in the browser');
assert(logic.includes(".from('academy_profiles')"),'Missing active profile check');
assert(logic.includes(".from('academy_enrollments')"),'Missing server-side enrollment lookup');
assert(logic.includes(".from('academy_course_modules')"),'Missing RLS-backed lesson lookup');
assert(logic.includes(".from('academy_deliverable_prompts')"),'Missing RLS-backed assignment prompts');
assert(logic.includes(".from('academy_deliverable_answers')"),'Missing scoped learner submission lookup');
assert(logic.includes(".from('academy_deliverable_feedback')"),'Missing read-only instructor feedback');
assert(logic.includes(".from('academy_course_assets')"),'Missing private resource registry lookup');
assert(logic.includes(".createSignedUrl(path,60"),'Missing short-lived signed Storage URL');
assert(!logic.includes('.getPublicUrl('),'Paid files cannot have a public URL');
assert(!/\.from\('academy_deliverable_feedback'\)[\s\S]{0,120}\.(?:insert|update|upsert|delete)\(/.test(logic),'Learners must not write instructor feedback');

assert(logic.includes(".eq('published',true)"),'Lessons must be explicitly published');
assert(logic.includes("record?.published"),'Course must be published');
assert(logic.includes('body.textContent'),'Learner-generated or Markdown body must not be inserted as HTML');
assert(!logic.includes('innerHTML'),'Unsanitized HTML insertion forbidden');
assert(logic.includes('shouldCreateUser: false'),'Do not open uninvited account creation');
assert(!/\.from\('academy_enrollments'\)[\s\S]{0,150}\.(?:insert|update|upsert|delete)\(/.test(logic),'Browser enrollment writes forbidden');

for(const [slug,file] of [['',path.join(app,'index.html')],...slugs.map(s=>[s,path.join(app,'cours',s,'index.html')])]){
 const source=fs.readFileSync(file,'utf8');
 assert.match(source,/<html lang="fr">/);
 assert.match(source,/name="robots" content="noindex,nofollow"/);
 assert(source.includes('data-course="'+slug+'"'),'Wrong route identifier for '+(slug||'dashboard'));
 assert(source.includes('id="login-form"')&&source.includes('id="logout"'),'Missing account controls');
 assert(source.includes('id="auth-section"')&&source.includes('id="learner-section" hidden'),'Private state must start hidden');
 if(slug){
   assert(source.includes('id="deliverables"')&&source.includes('id="deliverables-content"'),'Course missing private assignment region');
   assert(source.includes('id="deliverables" class="deliverables" hidden'),'Assignment region must start hidden');
   assert(source.includes('id="course-resources" class="course-resources" hidden'),'Resource list must start hidden');
   assert(source.includes('id="course-resources-list"'),'Private resource content container missing');
 }

 assert(source.includes('app.js')&&source.includes('config.js')&&source.includes('app.css'),'Shared guarded app missing');
 assert(!/<script[^>]*>[\s\S]*?(?:body_markdown|course_slug)[\s\S]*?<\/script>/i.test(source),'Premium data embedded in HTML');
}
const vercel=JSON.parse(fs.readFileSync(path.join(app,'vercel.json'),'utf8'));
assert(vercel.headers?.[0]?.headers?.some(h=>h.key==='X-Robots-Tag'&&h.value.includes('noindex')),'Staging deployment must block search indexation');
assert(vercel.headers[0].headers.some(h=>h.key==='Content-Security-Policy'&&h.value.includes("frame-ancestors 'none'")),'Missing staging CSP');

const releaseManifest=JSON.parse(fs.readFileSync(path.join(app,'deployment-files.json'),'utf8'));
const expectedAssets=[
  'index.html','app.css','app.js','config.js',
  'instructor.html','instructor.css','instructor.js','instructor-policy.mjs','instructor-rubric.mjs',
  'preflight.html','preflight.css','preflight.js','preflight-policy.mjs',
  'atelier-preuve.html','atelier-preuve.css','atelier-preuve.js','atelier-preuve-policy.mjs',
  'vercel.json','cours/sites-3d/index.html','cours/agents/index.html',
  'cours/automatisation/index.html','cours/processus/index.html'
];
assert.equal(releaseManifest.schema_version,1);
assert.deepEqual([...releaseManifest.files].sort(),[...expectedAssets].sort(),
  'The protected staging release must contain all 22 reviewed client files, including preflight and instructor assets');
const deployable=new Set(releaseManifest.files);
for(const asset of deployable){
  assert(!asset.startsWith('/')&&!asset.includes('..')&&!asset.includes('\\'),
    'Do not deploy a file outside the Academy client directory');
  assert(fs.statSync(path.join(app,asset)).isFile(),'Missing listed deployment asset: '+asset);
}
for(const filename of ['index.html','instructor.html','preflight.html','atelier-preuve.html',...slugs.map(s=>'cours/'+s+'/index.html')]){
  const html=fs.readFileSync(path.join(app,filename),'utf8');
  for(const match of html.matchAll(/<(?:script|link)\\b[^>]*\\b(?:src|href)="([^"]+)"/g)){
    const url=match[1].split(/[?#]/)[0];
    if(!url||/^(?:https?:|\/\/|data:)/i.test(url))continue;
    const resolved=path.relative(app,path.resolve(path.dirname(path.join(app,filename)),url))
      .split(path.sep).join('/');
    assert(deployable.has(resolved),
      'Referenced Academy asset missing from private Vercel package: '+filename+' -> '+resolved);
  }
}
assert(deployable.has('instructor-policy.mjs')&&
  fs.readFileSync(path.join(app,'instructor.js'),'utf8').includes("from './instructor-policy.mjs'"),
  'Instructor module import must be packaged with its source');
console.log('PASS — private Academy deployment manifest: 21 local files, all stylesheet/script references included');

console.log('PASS — private Academy shell: 5 entrypoints, no embedded lessons, guarded Supabase access');
