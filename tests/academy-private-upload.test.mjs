import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {uploadApprovedCourseAssets} from '../scripts/upload-approved-course-assets.mjs';

const root=await fs.mkdtemp(path.join(os.tmpdir(),'iagile-storage-import-test-'));
const files=path.join(root,'datasets');
const manifestPath=path.join(root,'manifest.json');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const projectUrl='https://daabfmdlgcwcykevvrcm.supabase.co';
const serviceRoleKey='FAKE_TEST_KEY_NEVER_VALID_FOR_ANY_API_123456789';
const manifest={version:'processus-v0.9.1-CANDIDATE',published:false,
  storage_uploaded:false,files:[]};
for(let i=1;i<=12;i++){
  const name='SYNTHETIC-'+String(i).padStart(2,'0')+'.md';
  const bytes=Buffer.from('FAKE DATA '+i+' — never publish\n');
  manifest.files.push({name,path:'processus/datasets/'+name,
    bytes:bytes.length,sha256:sha(bytes),mime:'text/markdown',published:false});
}
const makeMock=({existing=false,tamper=false,rejectPost=false}={})=>{
  const objects=new Map();
  if(existing)for(const file of manifest.files)
    objects.set(file.path,Buffer.from('FAKE DATA '+Number(file.name.match(/\d+/)[0])+' — never publish\n'));
  const history=[];
  const mock=async(url,{method,headers,body,redirect})=>{
    assert.equal(redirect,'error','Never follow redirects with admin credentials');
    assert.equal(headers.Authorization,'Bearer '+serviceRoleKey);
    assert.equal(headers.apikey,serviceRoleKey);
    const u=new URL(url);
    assert.equal(u.origin,projectUrl);
    const prefix='/storage/v1/object/'+(method==='GET'?'authenticated/':'')+'iagile-course-files/';
    assert(u.pathname.startsWith(prefix),'Wrong private bucket endpoint');
    const remote=decodeURIComponent(u.pathname.slice(prefix.length));
    assert(remote.startsWith('processus/datasets/'));
    history.push({method,remote});
    if(method==='GET'){
      const content=objects.get(remote);
      if(!content)return new Response(null,{status:404});
      return new Response(tamper?Buffer.from('BAD CONTENT'):content,{status:200});
    }
    assert.equal(method,'POST');
    assert.equal(headers['x-upsert'],'false','Never overwrite an existing object');
    if(rejectPost)return new Response(null,{status:403});
    if(objects.has(remote))return new Response(null,{status:409});
    objects.set(remote,Buffer.from(body));
    return new Response(null,{status:200});
  };
  return {mock,history,objects};
};

try{
  await fs.mkdir(files);
  for(const f of manifest.files)
    await fs.writeFile(path.join(files,f.name),'FAKE DATA '+Number(f.name.match(/\d+/)[0])+' — never publish\n');
  await fs.writeFile(manifestPath,JSON.stringify(manifest));
  const approvedManifestSha256=sha(await fs.readFile(manifestPath));
  const base={manifestPath,datasetDir:files,course:'processus',
    projectUrl,serviceRoleKey,approvedManifestSha256};
  let called=0;
  const dry=await uploadApprovedCourseAssets({...base,fetchImpl:()=>{called++;throw Error('Unexpected request')}});
  assert.equal(dry.files,12);
  assert.equal(dry.dryRun,true);
  assert.equal(dry.remotelyVerified,0);
  assert.equal(called,0);
  await assert.rejects(()=>uploadApprovedCourseAssets({...base,execute:true,
    approvedManifestSha256:'a'.repeat(64),fetchImpl:()=>{throw Error('Unexpected request')}}),
    /editorial manifest approval/);
  await assert.rejects(()=>uploadApprovedCourseAssets({...base,execute:true,
    projectUrl:'https://malicious.invalid',fetchImpl:()=>{throw Error('Unexpected request')}}),
    /unexpected Supabase project URL|expected the IAgile/);
  const fresh=makeMock();
  const installed=await uploadApprovedCourseAssets({...base,execute:true,fetchImpl:fresh.mock});
  assert.equal(installed.uploaded,12);
  assert.equal(installed.remotelyVerified,12);
  assert.equal(installed.alreadyVerified,0);
  assert.equal(installed.published,false);
  assert.equal(installed.metadataUpdated,false);
  assert.equal(fresh.history.filter(x=>x.method==='POST').length,12);
  const repeated=await uploadApprovedCourseAssets({...base,execute:true,fetchImpl:fresh.mock});
  assert.equal(repeated.uploaded,0);
  assert.equal(repeated.alreadyVerified,12);
  const corrupt=makeMock({existing:true,tamper:true});
  await assert.rejects(()=>uploadApprovedCourseAssets({...base,execute:true,fetchImpl:corrupt.mock}),
    /downloaded bytes disagree/);
  assert.equal(corrupt.history.filter(x=>x.method==='POST').length,0);
  const denied=makeMock({rejectPost:true});
  await assert.rejects(()=>uploadApprovedCourseAssets({...base,execute:true,fetchImpl:denied.mock}),
    /upload refused/);
  assert.equal(denied.history.filter(x=>x.method==='POST').length,1);
  const first=manifest.files[0].name;
  await fs.appendFile(path.join(files,first),'MODIFIED');
  await assert.rejects(()=>uploadApprovedCourseAssets({...base}),/Resource mismatch/);
  console.log('PASS Academy private import: 12 SHA verified, explicit editorial approval, idempotence, denied/tampered fail-closed, no SQL or publication');
}finally{
  await fs.rm(root,{recursive:true,force:true});
}
