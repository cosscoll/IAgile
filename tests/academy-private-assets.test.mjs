import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {verifyCourseAssets} from '../scripts/verify-private-course-assets.mjs';
const root=await fs.mkdtemp(path.join(os.tmpdir(),'iagile-manifest-check-'));
const dir=path.join(root,'datasets');await fs.mkdir(dir);
const file=path.join(dir,'EXEMPLE-FICTIF.csv');
const bytes=Buffer.from('id,statut\nT1,A_FAIRE\n');
const digest=crypto.createHash('sha256').update(bytes).digest('hex');
const json=path.join(root,'manifest.json');
const original={version:'synthetic-test',published:false,storage_uploaded:false,files:[{
 name:'EXEMPLE-FICTIF.csv',path:'processus/datasets/EXEMPLE-FICTIF.csv',
 bytes:bytes.length,sha256:digest,mime:'text/csv',published:false
}]};
const write=async m=>fs.writeFile(json,JSON.stringify(m));
const reject=async regex=>assert.rejects(()=>verifyCourseAssets(json,dir,'processus'),regex);
try{
  await fs.writeFile(file,bytes);await write(original);
  const pass=await verifyCourseAssets(json,dir,'processus');
  assert.equal(pass.files,1);assert.equal(pass.published,false);
  await fs.writeFile(file,Buffer.from('id,statut\nT1,TERMINE\n'));
  await reject(/Resource mismatch/);
  await fs.writeFile(file,bytes);
  await write({...original,published:true});await reject(/unpublished/);
  await write({...original,files:[{...original.files[0],path:'agents/datasets/EXEMPLE-FICTIF.csv'}]});
  await reject(/another course/);
  await write({...original,files:[{...original.files[0],path:'processus/datasets/..\/EXEMPLE-FICTIF.csv'}]});
  await reject(/another course/);
  await write(original);
  await fs.writeFile(path.join(dir,'EXTRA.md'),'unlisted');await reject(/Unlisted/);
  await fs.unlink(path.join(dir,'EXTRA.md'));
  await fs.unlink(file);await fs.symlink(json,file);await reject(/symlink/);
  await fs.unlink(file);await fs.writeFile(file,bytes);
  assert.equal((await verifyCourseAssets(json,dir,'processus')).bytes,bytes.length);
  console.log('PASS private-course preflight: checksum, status, course isolation, path, extra files, symlinks');
}finally{await fs.rm(root,{recursive:true,force:true});}
