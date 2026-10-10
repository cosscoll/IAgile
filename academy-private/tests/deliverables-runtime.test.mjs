import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDeliverables } from '../deliverables.js';

class FakeElement {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.text='';this.handlers={};}
 replaceChildren(...parts){this.children=parts;this.text='';}
 append(...parts){this.children.push(...parts);}
 setAttribute(name,value){this[name]=value;}
 set textContent(s){this.children=[];this.text=String(s);}
 get textContent(){return this.text+this.children.map(c=>c.textContent??'').join('');}
 addEventListener(type,fn){this.handlers[type]=fn;}
}
globalThis.document={
 createElement:tag=>new FakeElement(tag),
 createTextNode:s=>{const el=new FakeElement('#text');el.textContent=s;return el;}
};
const defer=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {resolve,promise};};
function fixture(){
 const pendingPrompts=defer(),pendingAnswers=defer(),pendingFeedback=defer();
 let payload=null;
 const db={from(table){
   const q={
     select(){return this;},
     eq(){return this;},
     order(){return this;},
     then(ok,fail){return (table==='academy_deliverable_prompts'?pendingPrompts.promise:(table==='academy_deliverable_feedback'?pendingFeedback.promise:pendingAnswers.promise)).then(ok,fail);},
     async upsert(value){payload=value;return {error:null};}
   };
   return q;
 }};
 return {db,pendingPrompts,pendingAnswers,pendingFeedback,getPayload:()=>payload};
}
const prompt={course_slug:'agents',deliverable_index:0,title:'Projet final',instructions_markdown:'## Mission\n- Décrivez la solution'};
const respond=fixture=>{fixture.pendingPrompts.resolve({data:[prompt],error:null});fixture.pendingAnswers.resolve({data:[],error:null});fixture.pendingFeedback.resolve({data:[],error:null});};

test('a session invalidated during the read never renders previously authorized assignments',async()=>{
 const f=fixture();const target=new FakeElement();let active=true;const statuses=[];
 const work=loadDeliverables({supabase:f.db,user:{id:'A'},course:{slug:'agents'},target,message:s=>statuses.push(s),isCurrent:()=>active});
 active=false;respond(f);await work;
 assert.equal(target.children.length,0);
 assert.equal(f.getPayload(),null);
});
test('an active learner can read and save only their own answer',async()=>{
 const f=fixture();const target=new FakeElement();const messages=[];
 const work=loadDeliverables({supabase:f.db,user:{id:'A'},course:{slug:'agents'},target,message:s=>messages.push(s),isCurrent:()=>true});
 respond(f);await work;
 assert.equal(target.children.length,1);
 const card=target.children[0];const area=card.children.find(e=>e.tagName==='TEXTAREA');
 const save=card.children.find(e=>e.tagName==='BUTTON');
 assert(area&&save);
 area.value='Mon projet';await save.handlers.click();
 assert.deepEqual(f.getPayload(),{user_id:'A',course_slug:'agents',deliverable_index:0,content:'Mon projet'});
 assert(messages.at(-1).includes('enregistrée'));
});

test('feedback is displayed to the learner without altering submitted content',async()=>{
 const f=fixture(),target=new FakeElement();
 const load=loadDeliverables({supabase:f.db,user:{id:'A'},course:{slug:'agents'},target,message:()=>{}});
 f.pendingPrompts.resolve({data:[prompt],error:null});
 f.pendingAnswers.resolve({data:[{deliverable_index:0,content:'Réponse rédigée'}],error:null});
 f.pendingFeedback.resolve({data:[{deliverable_index:0,status:'needs_revision',feedback_text:'Précisez les étapes et justifiez chaque source.'}],error:null});
 await load;
 assert(target.children[0].textContent.includes('Révision demandée'));
 assert(target.children[0].textContent.includes('Précisez les étapes'));
 assert(target.children[0].children.find(x=>x.tagName==='TEXTAREA').value==='Réponse rédigée');
});
