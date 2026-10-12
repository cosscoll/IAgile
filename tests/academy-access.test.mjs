// Exercise the real learner application without a browser or live credentials.
// Fake Supabase responses simulate RLS allow/deny; the server's actual RLS must
// still be tested separately with distinct real accounts before production.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'academy-app/app.js'),'utf8');

function element(){
  return {
    hidden:true,textContent:'',value:'',disabled:false,
    children:[],attributes:{},listeners:{},
    append(...nodes){this.children.push(...nodes)},
    replaceChildren(){this.children=[]},
    addEventListener(type,callback){this.listeners[type]=callback},
    setAttribute(key,value){this.attributes[key]=value},
    querySelector(){return {textContent:'Créer des agents'}},
    classList:{toggle(){}}
  };
}
async function simulate({
  course='agents', user=true, profile=true, enrollment=true,
  published=true, modules=[{title:'Leçon autorisée',body_markdown:'Texte privé',module_index:0}],
  moduleError=false, profileError=false, progressError=false, writeError=false
}={}){
  const elements=new Map();
  for(const id of ['status','auth-section','learner-section','logout','login-form','account-info','modules'])
    elements.set(id,element());
  const form=elements.get('login-form');
  form.elements={email:{value:'pilote@example.invalid'}};
  form.reportValidity=()=>true;
  const calls=[];
  const writes=[];
  const responses={
    academy_profiles:{data:profile?{account_status:'active'}:null,error:profileError?{message:'denied'}:null},
    academy_enrollments:{data:enrollment?[{course_slug:course,active:true}]:[],error:null},
    academy_courses:{data:{slug:course,published},error:null},
    academy_course_modules:{data:modules,error:moduleError?{message:'RLS blocked'}:null},
    academy_module_progress:{data:[],error:progressError?{message:'Progression refusée'}:null}
  };
  const makeQuery=table=>{
    const state={table, filters:[],columns:''};
    const result=()=>{
      calls.push({...state, filters:[...state.filters]});
      return responses[table]||{data:null,error:{message:'Unknown table'}};
    };
    const q={
      select(cols){state.columns=cols;return q},
      upsert(payload,opts){writes.push({table,payload,opts});return Promise.resolve({error:writeError?{message:'RLS denied'}:null})},
      eq(key,value){state.filters.push([key,value]);return q},
      maybeSingle(){return Promise.resolve(result())},
      order(){return Promise.resolve(result())},
      then(ok,bad){return Promise.resolve(result()).then(ok,bad)}
    };
    return q;
  };
  const client={
    from:makeQuery,
    auth:{
      getUser:async()=>({data:{user:user?{id:'pilot-1',email:'pilote@example.invalid'}:null},error:null}),
      signInWithOtp:async()=>({error:null}),
      signOut:async()=>({error:null}),
      onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})
    }
  };
  const context={
    window:{
      IAgileAcademyConfig:{url:'https://example.supabase.co',publishableKey:'sb_publishable_example'},
      supabase:{createClient:()=>client},
      location:{origin:'https://academy.example.invalid',pathname:'/cours/agents/'}
    },
    document:{
      body:{dataset:{course}},
      getElementById:id=>elements.get(id),
      createElement:()=>element(),
      querySelectorAll:()=>[]
    },
    setTimeout:()=>0,
    console
  };
  vm.runInNewContext(source,context,{filename:'academy-app/app.js'});
  // Flush multiple async Supabase query steps, allowing refresh() to settle.
  for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve));
  return {elements,calls,writes};
}

const tests=[
  {name:'anonymous user',opts:{user:false},expect:'Connectez-vous',calls:0},
  {name:'unapproved profile',opts:{profile:false},expect:'doit encore être activé',calls:1},
  {name:'profile request refused',opts:{profileError:true},expect:'doit encore être activé',calls:1},
  {name:'no enrollment',opts:{enrollment:false},expect:'Accès réservé',calls:2},
  {name:'unpublished course',opts:{published:false},expect:'encore en préparation',calls:3},
  {name:'module query denied',opts:{moduleError:true},expect:'n’ont pas pu être chargées',calls:4}
];
for(const t of tests){
  const v=await simulate(t.opts);
  assert(v.elements.get('status').textContent.includes(t.expect),t.name+' should deny by default');
  assert(v.elements.get('modules').hidden,t.name+' must hide module container');
  assert.equal(v.elements.get('modules').children.length,0,t.name+' must never render premium text');
  assert.equal(v.calls.length,t.calls,t.name+' should not query beyond access boundary');
  console.log('PASS '+t.name);
}

const permitted=await simulate();
assert(permitted.elements.get('status').textContent.includes('progression ont été chargés'));
assert(!permitted.elements.get('modules').hidden,'enrolled user should receive published lessons');
assert(permitted.elements.get('modules').children.some(n=>n.children.some(v=>v.textContent==='Texte privé')));
assert(permitted.calls.some(x=>x.table==='academy_course_modules' && x.filters.some(([k,v])=>k==='published'&&v===true)));
assert(permitted.calls.some(x=>x.table==='academy_course_modules' && x.filters.some(([k,v])=>k==='course_slug'&&v==='agents')));
console.log('PASS permitted enrollment receives published modules through RLS-backed query');

const injected=await simulate({modules:[{title:'<img src=x onerror=alert(1)>',body_markdown:'<script>bad()</script>',module_index:0}]});
assert(injected.elements.get('modules').children.some(n=>n.children.some(v=>v.textContent==='<script>bad()</script>')));
assert(!source.includes('innerHTML'),'Private Markdown must never be parsed as raw HTML');
console.log('PASS course content rendered as inert text');

const section=permitted.elements.get('modules').children.find(n=>n.className==='lesson');
const completion=section?.children.find(n=>n.className==='complete-button');
assert(completion,'A learner must have an accessible progress action');
assert.equal(completion.attributes['aria-pressed'],'false');
await completion.listeners.click();
assert.equal(permitted.writes.length,1,'One completion event must produce one DB mutation');
assert.equal(permitted.writes[0].table,'academy_module_progress');
assert.equal(permitted.writes[0].payload.user_id,'pilot-1');
assert.equal(permitted.writes[0].payload.course_slug,'agents');
assert.equal(permitted.writes[0].payload.completed,true);
assert.equal(permitted.writes[0].opts.onConflict,'user_id,course_slug,module_index');
assert.equal(completion.attributes['aria-pressed'],'true','Success must update UI only after DB success');
console.log('PASS learner completion is persisted for the exact account and course');

const rejected=await simulate({writeError:true});
const rejectedButton=rejected.elements.get('modules').children
  .find(n=>n.className==='lesson')?.children.find(n=>n.className==='complete-button');
await rejectedButton.listeners.click();
assert.equal(rejectedButton.attributes['aria-pressed'],'false','RLS-denied write cannot display false success');
assert(rejected.elements.get('status').textContent.includes('n’a pas été enregistrée'));
console.log('PASS denied progress write does not fake success');

const offline=await simulate({progressError:true});
const offlineButton=offline.elements.get('modules').children
  .find(n=>n.className==='lesson')?.children.find(n=>n.className==='complete-button');
assert(offlineButton.disabled,'Unable to read progress must disable progress writes');
console.log('PASS inaccessible progress stays read-only');
