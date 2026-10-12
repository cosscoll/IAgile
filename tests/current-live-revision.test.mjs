// Check the exact current main revision, not the PR's synthetic merge SHA.
// Run on a GitHub-hosted runner with outgoing HTTPS access.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const base='https://cosscoll.github.io/IAgile/';
const expected=(process.env.EXPECTED_MAIN_SHA ||
  execFileSync('git',['ls-remote','origin','refs/heads/main'],{encoding:'utf8'}).trim().split(/\s+/)[0]);
assert.match(expected,/^[a-f0-9]{40}$/,'Could not determine main SHA');
const marker='<!-- iagile-release-sha:'+expected+' -->';
const max=Number(process.env.REVISION_ATTEMPTS||12);
const wait=Number(process.env.REVISION_WAIT_MS||5000);
let actual='not found';
for(let n=0;n<max;n++){
  try{
    const response=await fetch(base+'?verified-release='+expected.slice(0,12)+'-'+n,{
      signal:AbortSignal.timeout(14000),
      headers:{'Cache-Control':'no-cache'}
    });
    assert.equal(response.status,200,'Homepage unreachable');
    const html=await response.text();
    const match=html.match(/<!--\s*iagile-release-sha:([a-f0-9]{40})\s*-->/);
    actual=match?.[1]||'missing marker';
    if(html.includes(marker)){
      console.log('PASS — Pages actually serves main revision '+expected);
      process.exit(0);
    }
    console.log('Waiting for Pages — expected '+expected.slice(0,12)+'; found '+actual.slice(0,12));
  }catch(e){
    actual='fetch error: '+String(e.message||e).slice(0,120);
    console.log('Waiting for Pages — '+actual);
  }
  if(n<max-1)await new Promise(resolve=>setTimeout(resolve,wait));
}
throw Error('Published site is not current main: expected '+expected+'; found '+actual);
