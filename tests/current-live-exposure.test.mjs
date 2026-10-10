// Audit CURRENT public GitHub Pages without relying on the unpublished fix.
// Only prints URLs and HTTP statuses — never logs sensitive response bodies.
import assert from 'node:assert/strict';
const base='https://cosscoll.github.io/IAgile/';
const paths=[
  'backend-iagile/package.json',
  'backend-iagile/api/chat.js',
  'backend-iagile/supabase/database.types.ts',
  'docs/ACADEMY-PLAN.md',
  'docs/ACADEMY-PLAN.html',
  'docs/ETAT-LANCEMENT.html',
  'tests/site-check.mjs',
  'tests/publication-boundary.test.mjs',
  'package.json',
  'api/chat.js',
  'academy-private/index.html',
  'learning-engine.js',
  'webgl.js',
  'README.md',
  'README.html'
];
const nonce=encodeURIComponent(process.env.GITHUB_SHA||'security-probe');
const issues=[];
for(const path of paths){
  let checked=false;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(base+path+'?boundary='+nonce,{
        signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}
      });
      console.log(response.status+' '+path);
      if(![404,410].includes(response.status)){
        issues.push({path,status:response.status});
      }
      checked=true;
      break;
    }catch(error){
      if(attempt===2) issues.push({path,status:'UNVERIFIED',reason:String(error.message||error)});
      else await new Promise(resolve=>setTimeout(resolve,1200));
    }
  }
  if(!checked)console.log('UNVERIFIED '+path);
}
assert(issues.length===0,
 'Internal paths unexpectedly served or could not be verified: '+
 issues.map(x=>x.path+'='+x.status).join(', '));
console.log('PASS: all '+paths.length+' protected source paths are inaccessible on current public site');
