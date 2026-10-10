import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/deploy.yml'),'utf8');
const allowPart=workflow.match(/files=\(([\s\S]*?)\)/);
assert(allowPart,'Missing approved deployment allowlist');
const approved=new Set([...allowPart[1].matchAll(/^\s*"([^"]+)"\s*$/gm)].map(x=>x[1]));
assert(approved.size>=30,'Unexpectedly small allowlist');

const config=fs.readFileSync(path.join(root,'_config.yml'),'utf8');
assert(config.includes('exclude:\n'),'Missing Jekyll exclusion list');
const excluded=new Set();
for(const line of config.split('\n')){
  const match=line.match(/^\s+-\s+(".*")\s*$/);
  if(!match)continue;
  const value=JSON.parse(match[1]);
  assert(!excluded.has(value),'Duplicate Jekyll exclusion '+value);
  excluded.add(value);
}
assert(excluded.has('_config.yml'),'Jekyll configuration must not be served');

function files(dir=root,prefix=''){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>{
    if(!prefix && ['.git','node_modules','public-site'].includes(item.name))return [];
    const rel=prefix?prefix+'/'+item.name:item.name;
    if(item.isDirectory())return files(path.join(dir,item.name),rel);
    assert(item.isFile(),'Unexpected symbolic link or special file: '+rel);
    return [rel];
  });
}
const all=files();
for(const file of all){
  assert(approved.has(file)||excluded.has(file)||[...excluded].some(dir=>dir.endsWith('/')&&file.startsWith(dir)),
    'Unprotected Jekyll publication source: '+file);
}
for(const file of approved){
  assert(!excluded.has(file),'Approved public file wrongly excluded: '+file);
}
console.log('PASS — Jekyll exclusion covers every non-vitrine file ('+excluded.size+' exclusions; '+approved.size+' approved)');

const requiredDirs=['.github/','academy-private/','api/','backend-iagile/','docs/','tests/'];
for(const dir of requiredDirs)assert(excluded.has(dir),'Sensitive directory not excluded: '+dir);
assert(!/actions\/(?:deploy-pages|upload-pages-artifact)@/.test(workflow),'Custom Pages deployment still enabled');
assert(!/^\s+pages:\s*write\s*$/m.test(workflow),'QA workflow must not have Pages publication permission');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(home.startsWith('---\nlayout: null\n---\n'),'Jekyll metadata frontmatter is required');
assert(home.includes('<!-- iagile-release-sha:{{ site.github.build_revision }} -->'),
 'Native Jekyll revision marker missing');
console.log('PASS — only native Jekyll publishes; restricted directories excluded and revision stamped');
