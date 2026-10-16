import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCourseAssets} from '../assets.js';

class Node {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.handlers={};this._text='';}
 replaceChildren(...children){this.children=children;this._text='';}
 append(...children){this.children.push(...children);}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 addEventListener(event,listener){this.handlers[event]=listener;}
}
globalThis.document={createElement:tag=>new Node(tag)};
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {resolve,promise};}
function mock(){
 const pending=deferred(),link=deferred();let requested=null;
 const q={select(){return this;},eq(){return this;},order(){return this;},then(ok,bad){return pending.promise.then(ok,bad);}};
 const client={
   from(name){assert.equal(name,'academy_course_assets');return q;},
   storage:{from(bucket){assert.equal(bucket,'iagile-course-files');return {createSignedUrl(path,expiry){requested={path,expiry};return link.promise;}}}}
 };
 return {client,pending,link,getRequest:()=>requested};
}
const resource={asset_key:'slides',title:'Fiche de pratique',storage_path:'agents/private/slides.pdf'};
test('authorized resource requires a separate, short-lived signed URL',async()=>{
 const f=mock(),target=new Node(),notifications=[];
 const load=loadCourseAssets({supabase:f.client,course:{slug:'agents'},target,message:s=>notifications.push(s)});
 f.pending.resolve({data:[resource],error:null});await load;
 assert.equal(target.children.length,1);
 const button=target.children[0].children[1];const destination=target.children[0].children[2];
 const click=button.handlers.click();
 assert.deepEqual(f.getRequest(),{path:resource.storage_path,expiry:60});
 assert.equal(destination.children.length,0);
 f.link.resolve({data:{signedUrl:'https://example.org/signed?token=fake'},error:null});await click;
 assert.equal(destination.children.length,1);
 const a=destination.children[0];
 assert.equal(a.target,'_blank');assert.equal(a.rel,'noopener noreferrer');
 assert.equal(a.href,'https://example.org/signed?token=fake');
});
test('expired session discards pending private file metadata',async()=>{
 const f=mock(),target=new Node();let active=true;
 const work=loadCourseAssets({supabase:f.client,course:{slug:'agents'},target,message:()=>{},isCurrent:()=>active});
 active=false;f.pending.resolve({data:[resource],error:null});await work;
 assert.equal(target.children.length,0);
});
test('expired session discards signed links still in flight',async()=>{
 const f=mock(),target=new Node();let active=true;
 const work=loadCourseAssets({supabase:f.client,course:{slug:'agents'},target,message:()=>{},isCurrent:()=>active});
 f.pending.resolve({data:[resource],error:null});await work;
 const destination=target.children[0].children[2];
 const click=target.children[0].children[1].handlers.click();
 active=false;f.link.resolve({data:{signedUrl:'https://example.org/private'},error:null});await click;
 assert.equal(destination.children.length,0);
});
