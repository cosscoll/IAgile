// Independent post-deployment audit: compare the current main commit to public Pages.
// Re-run after native Pages becomes the single deployment publisher.
// Executed on a PR branch after both deployment workflows completed.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const main=execFileSync('git',['ls-remote','origin','refs/heads/main'],{encoding:'utf8'}).split(/\s+/)[0];
assert.match(main,/^[0-9a-f]{40}$/);
const url='https://cosscoll.github.io/IAgile/?audit='+main;
let html='',status=0;
const reasons=[];
for(let attempt=0;attempt<5;attempt++){
 try{
  const response=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(12000)});
  status=response.status;
  if(status!==200)throw Error('Homepage status '+status);
  html=await response.text();
  if(html.includes('<!-- iagile-release-sha:'+main+' -->'))break;
  throw Error('Published page does not include expected main revision '+main);
 }catch(error){
  reasons.push(String(error.message||error));
  if(attempt<4)await new Promise(resolve=>setTimeout(resolve,2500));
 }
}
assert.equal(status,200,'Homepage must be accessible');
assert(html.includes('<!-- iagile-release-sha:'+main+' -->'),
 'LIVE REVISION MISMATCH: '+reasons.at(-1));
console.log('PASS: public GitHub Pages is exactly current main '+main);
