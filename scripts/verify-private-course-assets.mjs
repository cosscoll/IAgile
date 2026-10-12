#!/usr/bin/env node
// Read-only preflight: NEVER uploads resources or toggles publication flags.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const COURSES=new Set(['processus','agents','automatisation','sites-3d']);
const MIME={'.md':'text/markdown','.csv':'text/csv'};
const fail=why=>{throw new Error(why)};
export async function verifyCourseAssets(manifestPath,dir,course){
  if(!manifestPath||!dir||!COURSES.has(course))
    fail('Usage: node scripts/verify-private-course-assets.mjs <private-manifest.json> <datasets-directory> <course-slug>');
  const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
  if(manifest?.published!==false||manifest?.storage_uploaded!==false)
    fail('Only unpublished, not-uploaded manifests are accepted');
  if(!Array.isArray(manifest.files)||!manifest.files.length||manifest.files.length>200)
    fail('Invalid manifest resources');
  const base=await fs.realpath(dir);
  if(!(await fs.stat(base)).isDirectory())fail('The private data path is not a directory');
  const observed=new Set();
  let totalBytes=0;
  for(const item of manifest.files){
    if(!item||typeof item.name!=='string'||typeof item.path!=='string'||
       typeof item.sha256!=='string'||!Number.isSafeInteger(item.bytes)||
       item.published!==false)fail('Invalid resource metadata');
    if(!/^[A-Z0-9][A-Z0-9._-]*\.(md|csv)$/.test(item.name))fail('Invalid resource filename');
    if(item.mime!==MIME[path.extname(item.name)])fail('Invalid MIME');
    if(item.bytes<1||item.bytes>51200)fail('Resource exceeds private bucket constraints');
    if(!/^[a-f0-9]{64}$/.test(item.sha256))fail('Invalid SHA-256');
    if(item.path!==course+'/datasets/'+item.name)fail('Resource belongs to another course or path');
    if(observed.has(item.name))fail('Duplicate resource');
    observed.add(item.name);
    const local=path.join(base,item.name);
    const stat=await fs.lstat(local);
    if(!stat.isFile()||stat.isSymbolicLink())fail('Resource cannot be a symlink');
    const real=await fs.realpath(local);
    if(path.dirname(real)!==base)fail('Resource escaped private directory');
    const data=await fs.readFile(real);
    const hash=crypto.createHash('sha256').update(data).digest('hex');
    if(data.length!==item.bytes||hash!==item.sha256)fail('Resource mismatch: '+item.name);
    totalBytes+=data.length;
  }
  const present=(await fs.readdir(base,{withFileTypes:true}))
    .filter(x=>x.isFile()||x.isSymbolicLink()).map(x=>x.name);
  if(present.length!==observed.size||present.some(x=>!observed.has(x)))
    fail('Unlisted or missing private dataset');
  return {files:observed.size,bytes:totalBytes,version:String(manifest.version||'unknown'),uploaded:false,published:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  verifyCourseAssets(process.argv[2],process.argv[3],process.argv[4])
    .then(result=>console.log('PRIVATE ASSET PREFLIGHT PASS',JSON.stringify(result)))
    .catch(error=>{console.error('PRIVATE ASSET PREFLIGHT FAIL',error.message);process.exitCode=1;});
