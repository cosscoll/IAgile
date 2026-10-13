#!/usr/bin/env node
// PRIVATE OPERATOR TOOL. NEVER bundles learning assets or credentials in the repo.
// Dry-run by default. Requires two separate explicit approvals for real upload.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {verifyCourseAssets} from './verify-private-course-assets.mjs';

const REF='daabfmdlgcwcykevvrcm';
const BUCKET='iagile-course-files';
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const fail=why=>{throw new Error(why)};
const remotePath=path=>path.split('/').map(encodeURIComponent).join('/');

// This tool does not write SQL, alter publications, delete or overwrite objects.
// Imported objects remain inaccessible to learners until a separate editorial
// review, byte-verification and transaction updates the private asset registry.
export async function uploadApprovedCourseAssets({
  manifestPath,datasetDir,course='processus',execute=false,
  approvedManifestSha256='',projectUrl='',serviceRoleKey='',
  fetchImpl=globalThis.fetch
}={}){
  const proof=await verifyCourseAssets(manifestPath,datasetDir,course);
  const manifestBytes=await fs.readFile(manifestPath);
  const manifestSha256=digest(manifestBytes);
  const manifest=JSON.parse(manifestBytes.toString('utf8'));
  const count=manifest.files.length;
  if(course!=='processus'||manifest.version!=='processus-v0.9.1-CANDIDATE'||count!==12)
    fail('STOP: expected the unpublished Processus V0.9.1 candidate with exactly 12 files');

  const result={course,version:manifest.version,files:count,manifestSha256,
    dryRun:!execute,uploaded:0,alreadyVerified:0,remotelyVerified:0,
    published:false,metadataUpdated:false};
  if(!execute)return result;

  if(approvedManifestSha256!==manifestSha256)
    fail('STOP: editorial manifest approval hash is missing or differs');
  if(typeof serviceRoleKey!=='string'||serviceRoleKey.length<40)
    fail('STOP: server-only credential missing; never use a publishable browser key');
  if(typeof fetchImpl!=='function')fail('STOP: no HTTP client supplied');
  let origin;
  try{
    const url=new URL(projectUrl);
    if(url.protocol!=='https:'||url.hostname!==REF+'.supabase.co'||
       url.username||url.password||url.pathname!=='/'||url.search||url.hash)
      fail('STOP: unexpected Supabase project URL');
    origin=url.origin;
  }catch(_error){fail('STOP: expected the IAgile HTTPS Supabase project URL');}

  const authHeaders={apikey:serviceRoleKey,Authorization:'Bearer '+serviceRoleKey};
  for(const item of manifest.files){
    // Preflight has already verified size, content type, path and SHA-256.
    const bytes=await fs.readFile(path.join(datasetDir,item.name));
    if(digest(bytes)!==item.sha256||bytes.length!==item.bytes)
      fail('STOP: local dataset changed after the preflight');
    const objectPath=remotePath(item.path);
    const url=origin+'/storage/v1/object/authenticated/'+BUCKET+'/'+objectPath;
    const readBack=async()=>{
      const response=await fetchImpl(url,{method:'GET',
        headers:{...authHeaders,'Cache-Control':'no-store'},redirect:'error'});
      if(response.status===404)return null;
      if(!response.ok)fail('STOP: private read refused for '+item.name+' (HTTP '+response.status+')');
      return Buffer.from(await response.arrayBuffer());
    };
    let remote=await readBack();
    if(remote===null){
      const upload=await fetchImpl(origin+'/storage/v1/object/'+BUCKET+'/'+objectPath,{
        method:'POST',redirect:'error',
        headers:{...authHeaders,'content-type':item.mime,'x-upsert':'false'},
        body:bytes
      });
      if(!upload.ok)fail('STOP: upload refused for '+item.name+' (HTTP '+upload.status+')');
      result.uploaded++;
      remote=await readBack();
    }else result.alreadyVerified++;

    if(!remote||remote.length!==item.bytes||digest(remote)!==item.sha256)
      fail('STOP: downloaded bytes disagree with approved SHA-256 for '+item.name);
    result.remotelyVerified++;
  }
  return result;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [manifestPath,datasetDir,course,flag,...rest]=process.argv.slice(2);
  if(rest.length|| (flag!==undefined&&flag!=='--execute-after-editorial-signoff')){
    console.error('Usage: node scripts/upload-approved-course-assets.mjs <private-manifest> <private-datasets> processus [--execute-after-editorial-signoff]');
    process.exitCode=1;
  }else{
    uploadApprovedCourseAssets({
      manifestPath,datasetDir,course,
      execute:flag==='--execute-after-editorial-signoff',
      approvedManifestSha256:process.env.IAGILE_APPROVED_MANIFEST_SHA256,
      projectUrl:process.env.IAGILE_SUPABASE_URL,
      serviceRoleKey:process.env.IAGILE_SUPABASE_SERVICE_ROLE_KEY
    }).then(proof=>console.log(JSON.stringify(proof,null,2)))
      .catch(error=>{console.error(error.message);process.exitCode=1;});
  }
}
