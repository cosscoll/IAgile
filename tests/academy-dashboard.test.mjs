// Simulated dashboard tests: the displayed availability must match real
// enrollment + published state, not merely whether a user can sign in.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'academy-app/app.js'),'utf8');
const slugs=['sites-3d','agents','automatisation','processus'];

function element(){
 return {
   textContent:'',hidden:true,disabled:false,children:[],attributes:{},listeners:{},
   append(...parts){this.children.push(...parts)},
   replaceChildren(){this.children=[]},
   addEventListener(name,fn){this.listeners[name]=fn},
   setAttribute(name,value){this.attributes[name]=value},
   getAttribute(name){return this.attributes[name]},
   classList:{toggle(){}}
 };
}
async function simulate({activeCourses=[],publishedCourses=[],moduleRows=[],progressRows=[],catalogueError=false,user=true}={}){
 const els=new Map(['status','auth-section','learner-section','logout','login-form','account-info','modules','deliverables','deliverables-content'].map(k=>[k,element()]));
 els.get('login-form').elements={email:{value:'user@example.invalid'}};
 const cards=slugs.map(slug=>{
   const card=element();
   const strong=element();
   strong.textContent=slug;
   const small=element();
   card.attributes.href='cours/'+slug+'/index.html';
   card.querySelector=selector=>selector==='strong'?strong:(selector==='small'?small:null);
   return {slug,card,small};
 });
 const calls=[];
 const responses={
  academy_profiles:{data:{account_status:'active'},error:null},
  academy_enrollments:{data:activeCourses.map(course_slug=>({course_slug,active:true})),error:null},
  academy_courses:{data:slugs.map(slug=>({slug,published:publishedCourses.includes(slug)})),error:catalogueError?{}:null},
  academy_course_modules:{data:moduleRows,error:null},
  academy_module_progress:{data:progressRows,error:null}
 };
 const from=table=>{
   const state={table,filters:[]};
   const record=()=>{calls.push({table,filters:[...state.filters]});return responses[table]||{data:null,error:{message:'Not mocked'}}};
   const q={
     select(){return q},
     eq(k,v){state.filters.push([k,v]);return q},
     maybeSingle(){return Promise.resolve(record())},
     order(){return Promise.resolve(record())},
     then(resolve,reject){return Promise.resolve(record()).then(resolve,reject)}
   };
   return q;
 };
 const fakeSupabase={
   from,
   auth:{
     getUser:async()=>({data:{user:user?{id:'pilot-1',email:'user@example.invalid'}:null},error:null}),
     onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),
     signInWithOtp:async()=>({error:null}),
     signOut:async()=>({error:null})
   }
 };
 vm.runInNewContext(source,{
   document:{
     body:{dataset:{course:''}},
     getElementById:id=>els.get(id),
     querySelectorAll:selector=>selector==='.course-card'?cards.map(x=>x.card):[],
     createElement:()=>element()
   },
   window:{
     IAgileAcademyConfig:{url:'https://example.supabase.co',publishableKey:'sb_publishable_dummy'},
     supabase:{createClient:()=>fakeSupabase}
   },
   setTimeout:()=>0,
   console
 },{filename:'academy-app/app.js'});
 for(let n=0;n<15;n++)await new Promise(resolve=>setImmediate(resolve));
 return {els,cards,calls};
}

let session=await simulate({activeCourses:['agents']});
assert(session.cards.find(c=>c.slug==='agents').small.textContent.includes('en préparation'));
assert(session.cards.filter(c=>c.slug!=='agents').every(c=>c.small.textContent==='Accès réservé'));
assert(!session.calls.some(c=>c.table==='academy_course_modules'));
console.log('PASS: active enrollment alone does not claim the course is open');

session=await simulate({
 activeCourses:['agents'],
 publishedCourses:['agents'],
 moduleRows:[{course_slug:'agents',module_index:0},{course_slug:'agents',module_index:1}],
 progressRows:[{course_slug:'agents',module_index:0,completed:true}]
});
assert(session.cards.find(c=>c.slug==='agents').small.textContent.includes('1 / 2 modules terminés'));
assert(session.cards.filter(c=>c.slug!=='agents').every(c=>c.small.textContent==='Accès réservé'));
assert(session.calls.some(c=>c.table==='academy_module_progress'&&c.filters.some(x=>x[0]==='user_id'&&x[1]==='pilot-1')));
console.log('PASS: permitted course displays accurate learner completion');

session=await simulate({activeCourses:[],publishedCourses:['agents']});
assert(session.cards.every(c=>c.small.textContent==='Accès réservé'));
assert(!session.calls.some(c=>c.table==='academy_course_modules'));
console.log('PASS: published does not mean accessible to an unenrolled user');

session=await simulate({activeCourses:['agents'],catalogueError:true});
assert(session.els.get('status').textContent.includes('temporairement indisponible'));
assert(!session.calls.some(c=>c.table==='academy_course_modules'));
console.log('PASS: catalogue errors do not produce misleading access claims');

session=await simulate({activeCourses:['agents'],user:false,publishedCourses:['agents']});
assert(session.els.get('learner-section').hidden);
assert(session.calls.length===0);
console.log('PASS: anonymous dashboard never requests catalogue or premium data');
