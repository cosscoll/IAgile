// Inspect the exact bytes of the staged, pre-publication site.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stage=path.join(root,'public-site');
const sha=process.env.GITHUB_SHA||process.argv[2];
assert.match(sha||'',/^[a-f0-9]{40}$/,'Missing release commit SHA');
assert(fs.existsSync(stage),'Build the public artifact before inspecting it');
const home=fs.readFileSync(path.join(stage,'index.html'),'utf8');
assert.match(home,/^\s*<!doctype html>/i,'Jekyll frontmatter leaked to artifact');
assert(home.includes('<!-- iagile-release-sha:'+sha+' -->'),'Staged release SHA mismatch');

function walk(dir,prefix=''){
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
   const relative=prefix?prefix+'/'+entry.name:entry.name;
   if(entry.isDirectory())return walk(path.join(dir,entry.name),relative);
   assert(entry.isFile()&&!entry.isSymbolicLink(),'Nonregular staged asset: '+relative);
   return [relative];
 });
}
let localLinks=0,htmlFiles=0;
for(const page of walk(stage).filter(p=>p.endsWith('.html'))){
 const source=fs.readFileSync(path.join(stage,page),'utf8');
 assert(!source.startsWith('---\n'),'Unprocessed YAML frontmatter: '+page);
 assert(!/\{\{\s*site\./.test(source),'Unprocessed Jekyll tag: '+page);
 assert(!/<\/(?:meta|link)>/i.test(source),'Invalid closing void tag: '+page);
 for(const found of source.matchAll(/\b(?:href|src)="([^"\r\n]+)"/g)){
   const link=found[1];
   if(/^(?:https?:|mailto:|tel:|data:|javascript:|blob:|#|\/\/)/i.test(link))continue;
   let url=link.split(/[?#]/)[0];
   if(!url)continue;
   let target;
   if(url.startsWith('/IAgile/'))target=path.resolve(stage,url.slice('/IAgile/'.length));
   else if(url.startsWith('/'))throw Error('Unscoped root-relative URL in '+page+': '+link);
   else target=path.resolve(path.dirname(path.join(stage,page)),url);
   assert(target===stage||target.startsWith(stage+path.sep),'Link escapes public artifact: '+page+' => '+link);
   if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
   assert(fs.existsSync(target)&&fs.statSync(target).isFile(),'Broken staged asset: '+page+' => '+link);
   localLinks++;
 }
 htmlFiles++;
}
console.log('PASS — staged site: '+htmlFiles+' HTML pages, '+localLinks+' local links, commit '+sha);
