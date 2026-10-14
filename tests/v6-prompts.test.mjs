import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'academy-app/v6-prompts.js'),'utf8');
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.hidden=false;this.textContent='';this.listeners={};this.style={};this.value='';}
 append(...kids){this.children.push(...kids);}
 replaceChildren(...kids){this.children=[...kids];}
 setAttribute(name,value){(this.attrs ||= {})[name]=value;}
 addEventListener(type,fn){this.listeners[type]=fn;}
}
const areas={'v6-prompts':new Element('section'),'v6-prompts-list':new Element('div')};
const sandbox={window:{},document:{getElementById:id=>areas[id],createElement:tag=>new Element(tag)}};
vm.runInNewContext(source,sandbox);
const {load,clear}=sandbox.window.IAgileV6Prompts;
const rows=[{prompt_code:'P01',module_index:0,title:'Diagnostic',content_markdown:'<script>bad()</script>'},{prompt_code:'P02',module_index:1,title:'Planifier',content_markdown:'Vérifier le temps'}];
const chain={eq(){return this;},order(){return this;},then(ok,fail){return Promise.resolve({data:rows,error:null}).then(ok,fail)}};
let fromCount=0;
const client={from(table){assert.equal(table,'academy_prompt_library');fromCount++;return{select(cols){assert(cols.includes('content_markdown'));return chain}}}};
await load(client,'processus',()=>true);
assert.equal(fromCount,1);
assert.equal(areas['v6-prompts'].hidden,false);
const container=areas['v6-prompts-list'];
assert.equal(container.children.length,3);
const cards=container.children[2].children;
assert.equal(cards.length,2);assert.equal(cards[0].children[1].textContent,'<script>bad()</script>');
const search=container.children[0].children[0];
search.value='planifier';search.listeners.input();
assert.equal(cards[0].hidden,true);assert.equal(cards[1].hidden,false);
clear();assert.equal(areas['v6-prompts'].hidden,true);assert.equal(container.children.length,0);
await load(client,'processus',()=>false);assert.equal(fromCount,1);
await load(client,'invalid',()=>true);assert.equal(fromCount,1);
const makeClient = (response, wait=false) => ({from(){return {select(){return {
 eq(){return this;},order(){return this;},then(done){return wait ? new Promise(resolve=>setTimeout(()=>resolve(done(response)),1)) : Promise.resolve(response).then(done);}
};}};}});
let alive=true;
const promise=load(makeClient({data:rows,error:null},true),'processus',()=>alive);
alive=false;await promise;
assert.equal(areas['v6-prompts'].hidden,true);assert.equal(container.children.length,0);
await load(makeClient({data:null,error:{message:'denied'}}),'processus',()=>true);
assert.equal(areas['v6-prompts'].hidden,true);
console.log('PASS: V6 library gating, DOM escaping, search, denial and race conditions');