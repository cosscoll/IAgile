import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
// GitHub repositories are public regardless of Jekyll's deployment exclusions.
// This check rejects copying private course archives or exercises into *any* path.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const forbiddenBinary=/\.(?:zip|7z|rar|pdf|docx|pptx|xlsx|csv|sqlite|db|pem|key)$/i;
const premiumName=/(?:^|\/)(?:LUMEN-|ORBE-|SILLAGE-|CORRIGE_FORMATEUR|CORRIG[EÉ]S?[-_]|COPIES_TESTS_|IAgile_Processus_V0(?:8|9)|IAgile_Academy_Private_Seed)/i;
const privateDatasetDir=/(?:^|\/)(?:datasets|private-datasets|formateur-confidentiel|paid-lessons)(?:\/|$)/i;
function traverse(dir=root,relative=''){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(relative===''&&['.git','node_modules','public-site'].includes(entry.name))continue;
  const p=relative?relative+'/'+entry.name:entry.name;
  const abs=path.join(dir,entry.name);
  assert(!entry.isSymbolicLink(),'Symlink in repository: '+p);
  assert(!premiumName.test(p)&&!privateDatasetDir.test(p),
    'Premium curriculum resource must stay outside public GitHub repository: '+p);
  if(entry.isDirectory()){traverse(abs,p);continue;}
  assert(entry.isFile(),'Unexpected repository entry: '+p);
  assert(!forbiddenBinary.test(p),
    'Review required: binary/dataset file cannot be committed to public repository: '+p);
 }
}
traverse();
console.log('PASS public repository contains no protected curriculum archive, dataset or restricted file type');
