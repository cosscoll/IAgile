// The production Academy HTML loads this exact UMD build; a mocked browser
// cannot tell us if the vendor URL itself is available.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'academy-app/index.html'),'utf8');
const match=html.match(/src="(https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@[^"]+\.js)"/);
assert(match,'Pinned Supabase browser build is missing');
let last;
for(let i=0;i<3;i++){
 try{
  const response=await fetch(match[1],{signal:AbortSignal.timeout(12000)});
  assert.equal(response.status,200,'Supabase browser SDK CDN URL returned '+response.status);
  const text=await response.text();
  assert(text.length>10000,'Supabase SDK asset is unusually small');
  assert(/supabase/i.test(text),'Unexpected SDK response content');
  console.log('PASS vendor SDK available at pinned URL (HTTP 200, '+text.length+' chars)');
  process.exit(0);
 }catch(e){
  last=e;
  if(i<2)await new Promise(resolve=>setTimeout(resolve,1500));
 }
}
throw last;
