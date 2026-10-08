import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'parcours.html', 'a-propos.html', 'faq.html', '404.html','formations/sites-web-3d.html','formations/agents-personnalises.html','formations/automatiser-tache.html','formations/ia-au-quotidien.html','ressources/index.html','ressources/diagnostic-ia.html','ressources/incident-lab.html','ressources/agent-readiness.html','ressources/brief-site-3d.html','ressources/diagnostic-10-questions.html','ressources/demo-processus.html'];
let links=0;let checked=0;
for (const page of pages) {
  const source = fs.readFileSync(path.join(root,page), 'utf8');
  assert.match(source, /<title>[^<]+<\/title>/i, page+' missing title');
  assert.match(source, /<meta[^>]+name="description"/i, page+' missing description');
  assert.match(source, /<html[^>]+lang="fr"/i, page+' missing fr lang');
  assert.match(source, /<main\b/i, page+' missing main');
  assert.match(source, /<h1\b/i, page+' missing h1');
  assert.match(source, /rel="canonical"/i, page+' missing canonical');
  let hits=[...source.matchAll(/\b(?:href|src)="([^"\r\n]+)"/g)].map(m=>m[1]);
  for (let h of hits) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/.test(h)) continue;
    if (!h || h==='#') continue;
    let [rel,fragment] = h.split('#');
    if(!rel && fragment){
      assert(source.includes(`id="${fragment}"`) || source.includes(`name="${fragment}"`), `${page}: missing local anchor #${fragment}`);
      links++; continue;
    }
    let filename = path.resolve(path.dirname(path.join(root,page)),rel||page);
    assert(filename.startsWith(root+path.sep) || filename===root,`${page}: href escapes root ${h}`);
    assert(fs.existsSync(filename), `${page}: missing file ${h}`);
    if(fragment && /\.html?$/.test(rel)) {
      const target=fs.readFileSync(filename,'utf8');
      assert(target.includes(`id="${fragment}"`) || target.includes(`name="${fragment}"`), `${page}: missing target ${h}`);
    }
    links++;
  }
  checked++;
}
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for (const p of pages.filter(p=>p!=='404.html')) {
  const url='https://cosscoll.github.io/IAgile/'+(p==='index.html'?'':p);
  assert(sitemap.includes(`<loc>${url}</loc>`), `sitemap missing ${p}`);
}
assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'), /data-chapter="4"/);
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert((home.match(/data-chapter="[0-4]"/g)||[]).length===5,'home must have exactly 5 chapters');
assert(home.includes('id="universeCanvas"'),'3D canvas must be preserved');
for (const expected of ['a-propos.html','faq.html','parcours.html']) assert(home.includes(`href="${expected}"`));
assert(!fs.existsSync(path.join(root,'.env')),'no credentials in published root');
for (const [course,resource] of [
 ['formations/ia-au-quotidien.html','diagnostic-ia.html'],
 ['formations/automatiser-tache.html','incident-lab.html'],
 ['formations/agents-personnalises.html','agent-readiness.html'],
 ['formations/sites-web-3d.html','brief-site-3d.html']
]) {
 const html=fs.readFileSync(path.join(root,course),'utf8');
 assert(html.includes('../ressources/'+resource),course+' missing resource CTA');
}
for (const localScript of ['ressources/ressources.js','ressources/diagnostic-10.js','ressources/demo-processus.js']) {
 const script=fs.readFileSync(path.join(root,localScript),'utf8');
 assert(!/\bfetch\s*\(|localStorage|sessionStorage|XMLHttpRequest|navigator\.sendBeacon|WebSocket\s*\(/.test(script),localScript+' must not upload or persist user data');
}
const diagnostic=fs.readFileSync(path.join(root,'ressources/diagnostic-10-questions.html'),'utf8');
assert((diagnostic.match(/<fieldset\b/g)||[]).length===10,'diagnostic must contain 10 real questions');
const demo=fs.readFileSync(path.join(root,'ressources/demo-processus.html'),'utf8');
assert(demo.includes('id="demo-before"')&&demo.includes('id="demo-after"'),'demo needs both calculated outputs');
console.log(`PASS — ${checked} HTML pages, ${links} internal assets/links, ${pages.length-1} sitemap URLs, 5 cinematic chapters`);
