import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'academy-app/v9-tools.js'),'utf8');
class Element {constructor(tag){this.tag=tag;this.children=[];this.hidden=false;this.textContent='';this.listeners={};this.style={};this.value='';}
 append(...children){this.children.push(...children)} replaceChildren(...children){this.children=[...children]}
 setAttribute(key,value){(this.attrs??={})[key]=value;}addEventListener(name,fn){this.listeners[name]=fn;}}
const el={'v9-tools':new Element('section'),'v9-tools-list':new Element('div')};
const context={window:{},document:{getElementById:key=>el[key],createElement:tag=>new Element(tag)},Object};
vm.runInNewContext(source,context);
const {load,clear}=context.window.IAgileV9Tools;
const good=(id='G054')=>({course_slug:'agents',module_index:6,tool_id:id,title:'Outil sécurisé',short_description:'Aucune donnée réelle. <script>hack()</script>',source_url:'https://github.com/openai/openai-agents-python',priority:'P0',license_status:'MIT',approved_for_course:true,published:true,archived:false});
let requested=0;const response=[good(),good('G055'),{...good('G056'),source_url:'javascript:alert(1)'},{...good('G057'),course_slug:'processus'},{...good('G058'),archived:true},{...good('G059'),approved_for_course:false},{...good('G060'),published:false}];
const client=(data=response,err=null,delayed=false)=>({from(table){assert.equal(table,'academy_external_learning_resources');requested++;return{select(cols){assert(cols.includes('source_url'));return{eq(){return this},order(){return this},limit(n){assert(n<=200);return this},then(cb){const value={data,error:err};return delayed?new Promise(done=>setTimeout(()=>done(cb(value)),5)):Promise.resolve().then(()=>cb(value))}}}}}});
await load(client(),'agents',()=>true);
assert.equal(el['v9-tools'].hidden,false);
assert.equal(el['v9-tools-list'].children.length,4);
const cards=el['v9-tools-list'].children[3].children;
assert.equal(cards.length,2,'reject unpublished, cross-course, archived and hostile URL');
assert.equal(cards[0].children[1].textContent,good().short_description,'textContent must preserve and escape markup');
const search=el['v9-tools-list'].children[0].children[0];search.value='unknown';search.listeners.input();assert(cards.every(x=>x.hidden));
search.value='';search.listeners.input();assert(cards.every(x=>!x.hidden));
const priority=el['v9-tools-list'].children[1].children[0];priority.value='P2';priority.listeners.change();assert(cards.every(x=>x.hidden));
priority.value='P0';priority.listeners.change();assert(cards.every(x=>!x.hidden));
await load(client(),'agents',()=>false);assert.equal(el['v9-tools'].hidden,false,'stale before request cannot blank live page');
clear();assert.equal(el['v9-tools'].hidden,true);assert.equal(el['v9-tools-list'].children.length,0);
await load(client(),'wrong',()=>true);assert.equal(el['v9-tools'].hidden,true);
let alive=true;const p=load(client(response,null,true),'agents',()=>alive);alive=false;await p;assert.equal(el['v9-tools'].hidden,true);
await load(client(null,{message:'permission denied'}),'agents',()=>true);assert.equal(el['v9-tools'].hidden,true);
console.log('PASS: V9 external resource viewer — 9 access/render/search/race checks');