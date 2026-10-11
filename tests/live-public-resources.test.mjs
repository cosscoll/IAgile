import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

// Runs from a PR against the currently deployed version of main.
// A 200 from the GitHub Actions deployment job alone does not establish
// that the seven new Pages assets were actually served.
const base='https://cosscoll.github.io/IAgile/';
const sha=execFileSync('git',['ls-remote','origin','refs/heads/main'],{encoding:'utf8'}).split(/\s+/)[0];
assert.match(sha,/^[a-f0-9]{40}$/);
const resources=[
 'ressources/index.html',
 'ressources/diagnostic-10-questions.html',
 'ressources/diagnostic-ia.html',
 'ressources/demo-processus.html',
 'ressources/incident-lab.html',
 'ressources/agent-readiness.html',
 'ressources/brief-site-3d.html'
];
const protectedPaths=[
 'academy-private/import.html',
 'academy-private/index.html',
 'ressources/README.md',
 'docs/MARKETING-INTEGRATION.md',
 'backend-iagile/package.json'
];
async function check(path,expected){
 let last;
 for(let n=0;n<3;n++){
  try{
   const response=await fetch(base+path+'?qa='+sha.slice(0,12)+'-'+n,{
    headers:{'Cache-Control':'no-cache'},
    signal:AbortSignal.timeout(14000)
   });
   if(response.status!==expected)throw Error(path+': expected '+expected+', got '+response.status);
   if(expected===200){
    const html=await response.text();
    assert.match(html,/<main\b/i,path+': missing main region');
    assert.match(html,/<h1\b/i,path+': missing heading');
    assert.match(html,/<title>[^<]+<\/title>/i,path+': missing title');
    assert.match(html,/<link[^>]+rel="canonical"/i,path+': missing canonical URL');
    assert(!/\bnoindex\b/i.test(html),path+': unexpectedly excluded from indexing');
   }
   console.log('PASS '+response.status+' '+path);
   return;
  }catch(error){
   last=error;
   if(n<2)await new Promise(r=>setTimeout(r,1200));
  }
 }
 throw last;
}
const home=await fetch(base+'?release='+sha.slice(0,12),{
 headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(14000)
});
assert.equal(home.status,200,'Homepage must be reachable');
const html=await home.text();
assert(html.includes('<!-- iagile-release-sha:'+sha+' -->'),
 'Production version is not latest main '+sha);
assert(html.includes('href="ressources/index.html"'),
 'Home is missing link to new free resources');
console.log('PASS released SHA='+sha);
for(const path of resources)await check(path,200);
for(const path of protectedPaths)await check(path,404);
console.log('PASS 7 free resource pages + 5 private exclusions + homepage revision');
