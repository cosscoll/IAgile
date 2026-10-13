import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createAcademyWorkspace,WORKSPACES} from '../scripts/create-academy-workspace.mjs';
const parent=await fs.mkdtemp(path.join(os.tmpdir(),'iagile-workspace-'));
try{
 assert.deepEqual(Object.keys(WORKSPACES).sort(),['agents','automatisation','processus','sites-3d'].sort());
 for(const slug of Object.keys(WORKSPACES)){
  const dir=path.join(parent,'starter-'+slug);
  const result=await createAcademyWorkspace(slug,dir);
  assert.equal(result.course,slug);
  assert.equal(result.remoteCreated,false);
  assert.equal(result.files,8);
  const files=(await fs.readdir(dir)).sort();
  assert(files.includes('README.md'));
  assert(files.includes('.gitignore'));
  assert(files.includes('GITHUB.md'));
  assert(files.includes('SOURCES.md'));
  const docs=await fs.readFile(path.join(dir,'docs','TESTS.md'),'utf8');
  assert.match(docs,/NON TESTÉ/);
  const readme=await fs.readFile(path.join(dir,'README.md'),'utf8');
  assert(readme.includes(WORKSPACES[slug].name));
  assert.match(readme,/sans supports premium/);
  const git=await fs.readFile(path.join(dir,'GITHUB.md'),'utf8');
  assert(git.includes('gh repo create --private --source=. --remote=origin --push'));
  assert(git.includes('git init'));
  const ignore=await fs.readFile(path.join(dir,'.gitignore'),'utf8');
  assert(ignore.includes('.env'));
  assert(ignore.includes('private/'));
  assert(ignore.includes('datasets/'));
  await assert.rejects(createAcademyWorkspace(slug,dir),/EEXIST/,
    'Never overwrite a pre-existing workspace');
  assert.equal(await fs.readFile(path.join(dir,'README.md'),'utf8'),readme);
 }
 await assert.rejects(createAcademyWorkspace('inconnu',path.join(parent,'other')),/Unknown course/);
 await assert.rejects(createAcademyWorkspace('processus',''),/destination/);
 console.log('PASS Academy GitHub workspace generator: four tracks, private-safe boilerplate, repeat refusal, no remote action');
}finally{await fs.rm(parent,{recursive:true,force:true});}
