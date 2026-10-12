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
    removeAttribute(key){delete this.attributes[key]},
    querySelector(){return {textContent:'Créer des agents'}},
    classList:{toggle(){}}
  };
}
async function simulate({
  course='agents', user=true, profile=true, enrollment=true,
  published=true, modules=[{title:'Leçon autorisée',body_markdown:'Texte privé',module_index:0}],
  moduleError=false, profileError=false, progressError=false, writeError=false, progress=[], deferProgressWrites=false,
  tasks=[], answers=[], feedback=[], answersError=false, answerWriteError=false,
  assets=[], assetsError=false, storageError=false, signedUrl='https://example.supabase.co/storage/v1/object/sign/iagile-course-files/agents/sample.md?token=test'
}={}){
  const elements=new Map();
  for(const id of ['status','auth-section','learner-section','logout','login-form','account-info','modules','deliverables','deliverables-content','course-resources','course-resources-list'])
    elements.set(id,element());
  const form=elements.get('login-form');
  form.elements={email:{value:'pilote@example.invalid'}};
  form.reportValidity=()=>true;
  const calls=[];
  const writes=[];
  const pendingWrites=[];
  const signatures=[];
  const responses={
    academy_profiles:{data:profile?{account_status:'active'}:null,error:profileError?{message:'denied'}:null},
    academy_enrollments:{data:enrollment?[{course_slug:course,active:true}]:[],error:null},
    academy_courses:{data:{slug:course,published},error:null},
    academy_course_modules:{data:modules,error:moduleError?{message:'RLS blocked'}:null},
    academy_module_progress:{data:progress,error:progressError?{message:'Progression refusée'}:null},
    academy_deliverable_prompts:{data:tasks,error:null},
    academy_deliverable_answers:{data:answers,error:answersError?{message:'RLS denied'}:null},
    academy_deliverable_feedback:{data:feedback,error:null},
    academy_course_assets:{data:assets,error:assetsError?{message:'forbidden'}:null}
  };
  const makeQuery=table=>{
    const state={table, filters:[],columns:''};
    const result=()=>{
      calls.push({...state, filters:[...state.filters]});
      return responses[table]||{data:null,error:{message:'Unknown table'}};
    };
    const q={
      select(cols){state.columns=cols;return q},
      upsert(payload,opts){writes.push({table,payload,opts});if(table==='academy_module_progress'&&deferProgressWrites)return new Promise(resolve=>pendingWrites.push(()=>resolve({error:writeError?{message:'RLS denied'}:null})));return Promise.resolve({error:(table==='academy_deliverable_answers'?answerWriteError:writeError)?{message:'RLS denied'}:null})},
      eq(key,value){state.filters.push([key,value]);return q},
      maybeSingle(){return Promise.resolve(result())},
      order(){return Promise.resolve(result())},
      then(ok,bad){return Promise.resolve(result()).then(ok,bad)}
    };
    return q;
  };
  const storedProgress=new Map(progress.map(p=>[p.module_index,{...p}]));
  const client={
    from:makeQuery,
    rpc(name,payload){
      assert.equal(name,'academy_save_progress');
      const prior=storedProgress.get(payload.p_module_index)||{notes:'',completed:false};
      const next={
        notes:payload.p_notes===undefined?String(prior.notes||''):payload.p_notes,
        completed:payload.p_completed===undefined?!!prior.completed:payload.p_completed,
        updated_at:'2026-10-12T13:00:00Z'
      };
      writes.push({table:'academy_module_progress',rpc:name,rpcPayload:payload,
        payload:{user_id:'pilot-1',course_slug:payload.p_course_slug,
        module_index:payload.p_module_index,completed:next.completed,notes:next.notes},
        opts:{onConflict:'user_id,course_slug,module_index'}});
      const finish=()=>{
        if(writeError)return {data:null,error:{message:'RLS denied'}};
        storedProgress.set(payload.p_module_index,next);
        return {data:next,error:null};
      };
      if(deferProgressWrites)return new Promise(resolve=>pendingWrites.push(()=>resolve(finish())));
      return Promise.resolve(finish());
    },
    storage:{from(bucket){return {createSignedUrl(filePath,expiry,opts){signatures.push({bucket,filePath,expiry,opts});return Promise.resolve({data:storageError?null:{signedUrl},error:storageError?{message:'Access denied'}:null});}}}},
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
    URL,
    console
  };
  vm.runInNewContext(source,context,{filename:'academy-app/app.js'});
  // Flush multiple async Supabase query steps, allowing refresh() to settle.
  for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve));
  return {elements,calls,writes,pendingWrites,signatures};
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


const moduleList=[
 {title:'Module de départ',body_markdown:'# Introduction',module_index:0},
 {title:'Deuxième module',body_markdown:'# Étape 2',module_index:1},
 {title:'Troisième module',body_markdown:'# Étape 3',module_index:2}
];
const navigable=await simulate({modules:moduleList});
const lessonViews=navigable.elements.get('modules').children.filter(n=>n.className==='lesson');
const chooser=navigable.elements.get('modules').children.find(n=>n.className==='module-nav');
const options=chooser.children.find(n=>n.className==='module-nav-list').children.map(li=>li.children[0]);
const paging=navigable.elements.get('modules').children.find(n=>n.className==='module-pager');
const [prev,next]=paging.children;
assert.equal(lessonViews.length,3);
assert.deepEqual(lessonViews.map(n=>n.hidden),[false,true,true],'Only the selected lesson should be visible');
assert.equal(options[0].attributes['aria-current'],'step');
assert.equal(prev.disabled,true);
assert.equal(next.disabled,false);
await options[2].listeners.click();
assert.deepEqual(lessonViews.map(n=>n.hidden),[true,true,false]);
assert.equal(options[0].attributes['aria-current'],undefined);
assert.equal(options[2].attributes['aria-current'],'step');
assert.equal(next.disabled,true);
await prev.listeners.click();
assert.deepEqual(lessonViews.map(n=>n.hidden),[true,false,true]);
assert.equal(prev.disabled,false);
await next.listeners.click();
assert.deepEqual(lessonViews.map(n=>n.hidden),[true,true,false]);
console.log('PASS accessible one-at-a-time lesson navigation, previous and next');

const resume=await simulate({modules:moduleList,progress:[{module_index:0,completed:true}]});
const resumedLessons=resume.elements.get('modules').children.filter(n=>n.className==='lesson');
assert.deepEqual(resumedLessons.map(n=>n.hidden),[true,false,true],'Resume first incomplete lesson');
const resumedNav=resume.elements.get('modules').children.find(n=>n.className==='module-nav');
const resumedOptions=resumedNav.children.find(n=>n.className==='module-nav-list').children.map(li=>li.children[0]);
assert(resumedOptions[0].textContent.includes('Terminé'));
assert.equal(resumedOptions[1].attributes['aria-current'],'step');
console.log('PASS resume the next incomplete lesson and identify completed modules');


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


const task={deliverable_index:2,title:'Projet contrôlé',instructions_markdown:'Décrivez votre procédure.'};
const validDeliverable=await simulate({
  tasks:[task], answers:[{deliverable_index:2,content:'Première réponse',updated_at:'2026-10-12T08:00:00+00:00'}],
  feedback:[{deliverable_index:2,status:'en révision',feedback_text:'Soignez les cas limites.',answer_updated_at:'2026-10-12T08:00:00+00:00'}]
});
assert.equal(validDeliverable.elements.get('deliverables').hidden,false);
const entries=validDeliverable.elements.get('deliverables-content').children;
assert.equal(entries.length,1);
const item=entries[0];
assert(item.children.some(e=>e.textContent==='Projet contrôlé'),'Title must be visible only after enrollment');
assert(item.children.some(e=>e.textContent==='Décrivez votre procédure.'),'Instructions must be visible only after enrollment');
assert(item.children.some(e=>e.className==='instructor-feedback'),'Instructor feedback must be read-only');
const submission=item.children.find(e=>e.className==='deliverable-form');
const textarea=submission.children.find(e=>e.tagName==='textarea'||e.rows===6);
const save=submission.children.find(e=>e.type==='submit');
const state=submission.children.find(e=>e.className==='deliverable-state');
textarea.value='Un résultat mesurable';
await submission.listeners.submit({preventDefault(){}});
assert.equal(validDeliverable.writes.length,1);
assert.equal(validDeliverable.writes[0].table,'academy_deliverable_answers');
assert.equal(validDeliverable.writes[0].payload.user_id,'pilot-1');
assert.equal(validDeliverable.writes[0].payload.course_slug,'agents');
assert.equal(validDeliverable.writes[0].payload.deliverable_index,2);
assert.equal(validDeliverable.writes[0].payload.content,'Un résultat mesurable');
assert.equal(validDeliverable.writes[0].opts.onConflict,'user_id,course_slug,deliverable_index');
assert(state.textContent.includes('enregistré'),'Only a successful database response may confirm saving');
assert(item.children.find(e=>e.className==='instructor-feedback').hidden===true,'Prior feedback must disappear after a successful new answer');
assert(state.textContent.includes('nouvelle évaluation'),'New answer must signal correction is pending');
console.log('PASS learner can save an authorized assignment in its own course');


const oldFeedback=await simulate({
  tasks:[task],
  answers:[{deliverable_index:2,content:'Version 2',updated_at:'2026-10-12T08:02:00Z'}],
  feedback:[{deliverable_index:2,status:'validé',feedback_text:'Ancienne approbation',answer_updated_at:'2026-10-12T08:00:00Z'}]
});
assert(!oldFeedback.elements.get('deliverables-content').children[0].children.some(n=>n.className==='instructor-feedback'),'Stale feedback must never be shown');
console.log('PASS historical feedback is not shown against a newer learner answer');

const fineRevision=await simulate({
  tasks:[task],
  answers:[{deliverable_index:2,content:'Révision',updated_at:'2026-10-12T08:00:00.000002+00:00'}],
  feedback:[{deliverable_index:2,status:'validé',feedback_text:'Ancien avis',answer_updated_at:'2026-10-12T08:00:00.000001+00:00'}]
});
assert(!fineRevision.elements.get('deliverables-content').children[0].children
  .some(n=>n.className==='instructor-feedback'));
console.log('PASS timestamp precision retains separate revisions');

const noAnswerFeedback=await simulate({
  tasks:[task],answers:[],
  feedback:[{deliverable_index:2,status:'validé',feedback_text:'Note orpheline',answer_updated_at:'2026-10-12T08:00:00Z'}]
});
assert(!noAnswerFeedback.elements.get('deliverables-content').children[0].children.some(n=>n.className==='instructor-feedback'),'Missing answer must hide orphan review');

const deniedEdit=await simulate({
  tasks:[task],answerWriteError:true,
  answers:[{deliverable_index:2,content:'Ancienne réponse',updated_at:'2026-10-12T08:00:00Z'}],
  feedback:[{deliverable_index:2,status:'validé',feedback_text:'Validation actuelle',answer_updated_at:'2026-10-12T08:00:00Z'}]
});
const dItem=deniedEdit.elements.get('deliverables-content').children[0];
const dForm=dItem.children.find(n=>n.className==='deliverable-form');
dForm.children.find(n=>n.rows===6).value='Nouvelle réponse refusée';
await dForm.listeners.submit({preventDefault(){}});
assert.equal(dItem.children.find(n=>n.className==='instructor-feedback').hidden,false,'Failed write must not hide valid prior feedback');
console.log('PASS failed answer edits retain the valid review on the saved version');

const writeDenied=await simulate({tasks:[task],answerWriteError:true});
const badForm=writeDenied.elements.get('deliverables-content').children[0].children.find(e=>e.className==='deliverable-form');
badForm.children.find(e=>e.rows===6).value='Donnée sensible à protéger';
await badForm.listeners.submit({preventDefault(){}});
assert(badForm.children.find(e=>e.className==='deliverable-state').textContent.includes('refusé'));
console.log('PASS rejected assignment writes do not report success');

const readDenied=await simulate({tasks:[task],answersError:true});
const readForm=readDenied.elements.get('deliverables-content').children[0].children.find(e=>e.className==='deliverable-form');
assert.equal(readForm.children.find(e=>e.type==='submit').disabled,true);
assert.equal(readForm.children.find(e=>e.rows===6).disabled,true);
console.log('PASS unable to read saved answers disables writing to avoid overwriting');

const noAccount=await simulate({user:false,tasks:[task]});
assert.equal(noAccount.elements.get('deliverables').hidden,true);
assert(!noAccount.calls.some(e=>e.table.startsWith('academy_deliverable')),'Anonymous user must never fetch assignments');

const noAccess=await simulate({enrollment:false,tasks:[task]});
assert.equal(noAccess.elements.get('deliverables').hidden,true);
assert(!noAccess.calls.some(e=>e.table.startsWith('academy_deliverable')),'Unenrolled user must never fetch assignments');

const hiddenCourse=await simulate({published:false,tasks:[task]});
assert.equal(hiddenCourse.elements.get('deliverables').hidden,true);
assert(!hiddenCourse.calls.some(e=>e.table.startsWith('academy_deliverable')),'Unpublished course must not fetch assignments');
console.log('PASS assignments are never queried for anonymous, unenrolled or unpublished courses');

const scriptSafe=await simulate({
  tasks:[{deliverable_index:2,title:'<img src=x onerror=alert(1)>',instructions_markdown:'<script>alert(1)</script>'}],
  feedback:[{deliverable_index:2,status:'validé',feedback_text:'<script>alert(1)</script>'}]
});
const scriptItem=scriptSafe.elements.get('deliverables-content').children[0];
assert(scriptItem.children.some(e=>e.textContent==='<img src=x onerror=alert(1)>'));
assert(scriptItem.children.some(e=>e.textContent==='<script>alert(1)</script>'));
console.log('PASS assignment and trainer text remain inert even with HTML payloads');


// Storage is private; the resource record alone never authorizes a download.
const resource={asset_key:'sample',title:'Supports privés',storage_path:'agents/sample.md',module_index:0,content_bytes:123,published:true};
const assetAllowed=await simulate({assets:[resource]});
assert.equal(assetAllowed.elements.get('course-resources').hidden,false);
assert.equal(assetAllowed.signatures.length,0,'Do not generate bearer links before an explicit click');
const resourceItem=assetAllowed.elements.get('course-resources-list').children[0];
const resourceButton=resourceItem.children.find(n=>n.type==='button');
const resourceLink=resourceItem.children.find(n=>n.tagName==='a'||n.textContent.includes('Ouvrir le support'));
assert(resourceLink.hidden,'Signed URL initially hidden');
await resourceButton.listeners.click();
assert.equal(assetAllowed.signatures.length,1);
assert.equal(assetAllowed.signatures[0].bucket,'iagile-course-files');
assert.equal(assetAllowed.signatures[0].filePath,'agents/sample.md');
assert.equal(assetAllowed.signatures[0].expiry,60);
assert.equal(assetAllowed.signatures[0].opts.download,true);
assert.equal(resourceLink.hidden,false);
assert(resourceLink.href.includes('?token='));
assert.equal(resourceLink.target,'_blank');
assert.equal(resourceLink.rel,'noopener noreferrer');
console.log('PASS signed link is requested only after user click, for exact private path and 60 seconds');

const signedDenied=await simulate({assets:[resource],storageError:true});
const deniedItem=signedDenied.elements.get('course-resources-list').children[0];
const deniedButton=deniedItem.children.find(n=>n.type==='button');
const deniedLink=deniedItem.children.find(n=>n.textContent.includes('Ouvrir le support'));
await deniedButton.listeners.click();
assert.equal(deniedLink.hidden,true);
assert(deniedItem.children.some(n=>n.textContent.includes('refusé')));
console.log('PASS denied storage signature never provides a download link');

const offsite=await simulate({
  assets:[resource],signedUrl:'https://malicious.invalid/storage/v1/object/sign/iagile-course-files/agents/sample.md'
});
const offsiteItem=offsite.elements.get('course-resources-list').children[0];
await offsiteItem.children.find(n=>n.type==='button').listeners.click();
assert(offsiteItem.children.find(n=>n.textContent.includes('Ouvrir le support')).hidden);
console.log('PASS signed URL cannot direct the learner to another host');

const badPath=await simulate({assets:[{...resource,storage_path:'autre-formation/sample.md'}]});
assert.equal(badPath.elements.get('course-resources').hidden,true);
assert.equal(badPath.elements.get('course-resources-list').children.length,0);
console.log('PASS cross-course resource paths are not presented');

const assetsDenied=await simulate({assets:[resource],assetsError:true});
assert(assetsDenied.elements.get('course-resources').hidden);
assert.equal(assetsDenied.signatures.length,0);
const assetsUnenrolled=await simulate({enrollment:false,assets:[resource]});
assert.equal(assetsUnenrolled.elements.get('course-resources').hidden,true);
assert(!assetsUnenrolled.calls.some(c=>c.table==='academy_course_assets'));
const assetsAnonymous=await simulate({user:false,assets:[resource]});
assert(!assetsAnonymous.calls.some(c=>c.table==='academy_course_assets'));
const assetsUnpublished=await simulate({published:false,assets:[resource]});
assert(!assetsUnpublished.calls.some(c=>c.table==='academy_course_assets'));
console.log('PASS private asset lookup obeys course/enrollment gate and fails closed');

const noteCase=await simulate();
const noteLesson=noteCase.elements.get('modules').children.find(n=>n.className==='lesson');
const noteForm=noteLesson.children.find(n=>n.className==='lesson-notes-form');
assert(noteForm,'Private note editor is expected on the lesson');
const noteArea=noteForm.children.find(n=>n.rows===4);
const noteButton=noteForm.children.find(n=>n.type==='submit');
noteArea.value='À revoir : vérifier les sources';
await noteForm.listeners.submit({preventDefault(){}});
assert.equal(noteCase.writes.length,1);
assert.equal(noteCase.writes[0].table,'academy_module_progress');
assert.equal(noteCase.writes[0].payload.notes,'À revoir : vérifier les sources');
assert.equal(noteCase.writes[0].payload.user_id,'pilot-1');
assert.equal(noteCase.writes[0].payload.completed,false);
assert(noteForm.children.some(n=>n.textContent==='Notes enregistrées.'));
console.log('PASS private notes are saved for the exact learner, course and lesson');

const notesOffline=await simulate({progressError:true});
const offlineLesson=notesOffline.elements.get('modules').children.find(n=>n.className==='lesson');
const offlineNoteForm=offlineLesson.children.find(n=>n.className==='lesson-notes-form');
assert(offlineNoteForm.children.find(n=>n.rows===4).disabled);
assert(offlineNoteForm.children.find(n=>n.type==='submit').disabled);
console.log('PASS unreadable progress cannot allow note overwrites');

const notesDenied=await simulate({writeError:true});
const deniedNoteForm=notesDenied.elements.get('modules').children.find(n=>n.className==='lesson')
  .children.find(n=>n.className==='lesson-notes-form');
deniedNoteForm.children.find(n=>n.rows===4).value='Ne pas effacer';
await deniedNoteForm.listeners.submit({preventDefault(){}});
assert(deniedNoteForm.children.some(n=>n.textContent.includes('non confirmées')));
console.log('PASS refused note save does not display false success');


assert(source.includes('let lessonWritePending=false'),'Lesson operations must share an in-flight write lock');
assert(source.includes('lessonWritePending || button.disabled'),'Progress and notes cannot write concurrently');
assert(source.includes('lessonWritePending || noteSave.disabled'),'Notes must honor the same write lock');
console.log('PASS learner progress and notes use one in-flight write guard per module');

const locked=await simulate({deferProgressWrites:true});
const lockedLesson=locked.elements.get('modules').children.find(n=>n.className==='lesson');
const lockedComplete=lockedLesson.children.find(n=>n.className==='complete-button');
const lockedNotes=lockedLesson.children.find(n=>n.className==='lesson-notes-form');
lockedNotes.children.find(n=>n.rows===4).value='Mon point important';
const notePromise=lockedNotes.listeners.submit({preventDefault(){}});
assert.equal(locked.writes.length,1);
assert.equal(lockedComplete.disabled,true,'Completion is disabled while notes are saving');
await lockedComplete.listeners.click();
assert.equal(locked.writes.length,1,'Concurrent completion must not overwrite in-flight notes');
locked.pendingWrites[0]();
await notePromise;
assert.equal(lockedComplete.disabled,false);
const completePromise=lockedComplete.listeners.click();
assert.equal(locked.writes.length,2);
assert.equal(locked.writes[1].payload.notes,'Mon point important','Completion preserves saved notes');
locked.pendingWrites[1]();
await completePromise;
console.log('PASS simultaneous notes and progress writes are serialized, preserving both states');

assert.equal(noteCase.writes[0].rpc,'academy_save_progress');
assert.equal(noteCase.writes[0].rpcPayload.p_course_slug,'agents');
assert.equal(noteCase.writes[0].rpcPayload.p_notes,'À revoir : vérifier les sources');
assert(!Object.hasOwn(noteCase.writes[0].rpcPayload,'user_id'),
  'Authenticated user ID must be derived server-side, never supplied by browser');
assert.equal(locked.writes[1].rpcPayload.p_completed,true);
assert(!Object.hasOwn(locked.writes[1].rpcPayload,'p_notes'),
  'Completion RPC must never overwrite notes with an old value');
console.log('PASS atomic progress API: independent field patch and server-derived user ID');
