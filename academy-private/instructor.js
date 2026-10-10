import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.79.0';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './config.js';
import {createRequestGuard} from './request-guard.js';
import {renderCourseMarkdown} from './markdown.js';
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=id=>document.getElementById(id);
const info=txt=>{$('teacherStatus').textContent=txt||'';};
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
let teacher;
const authGuard=createRequestGuard();
const viewGuard=createRequestGuard();
function clearStudentData(){
  for(const id of ['teacherCourses','learners','learnerDetails'])$(id).replaceChildren();
  $('teacherDetails').hidden=true;$('teacherCourseTitle').textContent='';
}
async function start(){
  const authTicket=authGuard.next();viewGuard.invalidate();
  const {data,error}=await db.auth.getUser();
  if(!authGuard.valid(authTicket))return;
  teacher=error?null:data?.user;
  $('teacherAuth').hidden=!!teacher;$('teacherDashboard').hidden=!teacher;
  $('logout').hidden=!teacher;$('identity').textContent=teacher?.email||'';
  if(teacher)await loadCourses();
}
async function loadCourses(){
  const uid=teacher?.id;
  const sessionTicket=authGuard.current(),viewTicket=viewGuard.next();
  const isCurrent=()=>authGuard.valid(sessionTicket)&&viewGuard.valid(viewTicket)&&teacher?.id===uid;
  if(!uid)return;
  $('teacherCourses').hidden=false;$('teacherCourses').replaceChildren();$('teacherDetails').hidden=true;
  const {data:profile,error:profileError}=await db.from('academy_profiles').select('account_status').eq('user_id',teacher.id).maybeSingle();
  if(!isCurrent())return;
  if(profileError||profile?.account_status!=='active'){info('Ce compte ne dispose pas d’un profil formateur actif.');return;}
  const {data:assignments,error}=await db.from('academy_instructor_courses').select('course_slug').eq('instructor_id',teacher.id);
  if(!isCurrent())return;
  if(error){info('Impossible de vérifier les autorisations formateur.');return;}
  if(!assignments?.length){info('Aucune formation ne vous a été attribuée.');return;}
  const slugs=assignments.map(x=>x.course_slug);
  const {data:courses,error:courseError}=await db.from('academy_courses').select('slug,title').in('slug',slugs);
  if(!isCurrent())return;
  if(courseError){info('Impossible de charger les formations.');return;}
  for(const course of courses||[]){
    const card=el('article');card.className='course-card';
    card.append(el('h3',course.title));
    const button=el('button','Voir les apprenants');button.type='button';button.addEventListener('click',()=>openCourse(course));
    card.append(button);$('teacherCourses').append(card);
  }
  info('');
}
async function openCourse(course){
  const uid=teacher?.id;
  const sessionTicket=authGuard.current(),viewTicket=viewGuard.next();
  const isCurrent=()=>authGuard.valid(sessionTicket)&&viewGuard.valid(viewTicket)&&teacher?.id===uid;
  if(!uid)return;
  $('teacherCourses').hidden=true;$('teacherDetails').hidden=false;$('teacherCourseTitle').textContent=course.title;
  $('learners').replaceChildren();$('learnerDetails').replaceChildren();info('Chargement des apprenants…');
  const {data:enrollments,error}=await db.from('academy_enrollments').select('user_id,active').eq('course_slug',course.slug).eq('active',true);
  if(!isCurrent())return;
  if(error){info('Impossible de consulter les inscriptions.');return;}
  if(!enrollments?.length){$('learners').append(el('p','Aucun apprenant inscrit pour le moment.'));info('');return;}
  const ids=enrollments.map(x=>x.user_id);
  const {data:profiles}=await db.from('academy_profiles').select('user_id,display_name').in('user_id',ids);
  if(!isCurrent())return;
  const names=new Map((profiles||[]).map(x=>[x.user_id,x.display_name]));
  for(const e of enrollments){
    const row=el('article');row.className='module-card';
    row.append(el('h3',names.get(e.user_id)||'Compte apprenant'));
    const button=el('button','Consulter le suivi');button.type='button';button.addEventListener('click',()=>openLearner(course,e.user_id,names.get(e.user_id)));
    row.append(button);$('learners').append(row);
  }
  info('');
}
async function openLearner(course,uid,name){
  const instructorId=teacher?.id;
  const sessionTicket=authGuard.current(),viewTicket=viewGuard.next();
  const isCurrent=()=>authGuard.valid(sessionTicket)&&viewGuard.valid(viewTicket)&&teacher?.id===instructorId;
  if(!instructorId)return;
  $('learnerDetails').replaceChildren();info('Chargement du suivi…');
  const [{data:progress,error:e1},{data:answers,error:e2},{data:prompts,error:e3},{data:feedback,error:e4}]=await Promise.all([
    db.from('academy_module_progress').select('module_index,completed,updated_at').eq('user_id',uid).eq('course_slug',course.slug),
    db.from('academy_deliverable_answers').select('deliverable_index,content,updated_at').eq('user_id',uid).eq('course_slug',course.slug),
    db.from('academy_deliverable_prompts').select('deliverable_index,title,instructions_markdown').eq('course_slug',course.slug).eq('published',true),
    db.from('academy_deliverable_feedback').select('deliverable_index,instructor_id,status,feedback_text').eq('user_id',uid).eq('course_slug',course.slug)
  ]);
  if(!isCurrent())return;
  if(e1||e2||e3||e4){info('Lecture du suivi ou des retours non autorisée ou indisponible.');return;}
  const wrap=el('section');wrap.className='panel';
  wrap.append(el('h3',name||'Suivi apprenant'));
  wrap.append(el('p',(progress||[]).filter(x=>x.completed).length+' module(s) terminés.'));
  const title=el('h4','Travaux transmis');wrap.append(title);
  if(!answers?.length)wrap.append(el('p','Aucun livrable enregistré.'));
  const promptByIndex=new Map((prompts||[]).map(p=>[p.deliverable_index,p]));
  const feedbackByIndex=new Map((feedback||[]).map(f=>[f.deliverable_index,f]));
  for(const answer of answers||[]){
    const prompt=promptByIndex.get(answer.deliverable_index);
    wrap.append(el('h5',prompt?.title||'Livrable '+answer.deliverable_index));
    if(prompt){
      const details=el('details');
      details.append(el('summary','Voir les consignes et critères d’évaluation'));
      details.append(renderCourseMarkdown(prompt.instructions_markdown));
      wrap.append(details);
    }
    const text=el('pre',answer.content);text.className='lesson';wrap.append(text);
    const review=feedbackByIndex.get(answer.deliverable_index);
    const reviewArea=el('section');reviewArea.className='module-card';
    const reviewTitle=el('h5','Évaluation du travail');reviewArea.append(reviewTitle);
    if(review){
      reviewArea.append(el('p',review.status==='validated'?'Statut : validé':'Statut : modifications demandées'));
      reviewArea.append(el('p',review.feedback_text));
    }else{
      reviewArea.append(el('p','Aucun retour formateur enregistré.'));
    }
    if(!review||review.instructor_id===instructorId){
      const suffix=course.slug+'-'+uid+'-'+answer.deliverable_index;
      const statusLabel=el('label','Décision pédagogique');
      const status=el('select');status.id='review-status-'+suffix;statusLabel.htmlFor=status.id;
      for(const [value,title] of [['needs_revision','À retravailler'],['validated','Validé']]){
        const option=el('option',title);option.value=value;status.append(option);
      }
      status.value=review?.status||'needs_revision';
      const commentLabel=el('label','Retour pédagogique (20 caractères minimum)');
      const comment=el('textarea');comment.id='review-comment-'+suffix;commentLabel.htmlFor=comment.id;
      comment.rows=5;comment.maxLength=5000;comment.minLength=20;
      comment.value=review?.feedback_text||'';
      const button=el('button','Enregistrer le retour');button.type='button';
      button.addEventListener('click',async()=>{
        if(!isCurrent())return;
        const feedbackText=comment.value.trim();
        if(feedbackText.length<20){info('Le retour pédagogique doit contenir au moins 20 caractères.');comment.focus();return;}
        button.disabled=true;info('Enregistrement de l’évaluation…');
        const payload={user_id:uid,course_slug:course.slug,deliverable_index:answer.deliverable_index,
          instructor_id:instructorId,status:status.value,feedback_text:feedbackText,reviewed_at:new Date().toISOString()};
        const {error:saveError}=await db.from('academy_deliverable_feedback').upsert(payload,
          {onConflict:'user_id,course_slug,deliverable_index'});
        if(!isCurrent())return;
        button.disabled=false;
        if(saveError){info('Évaluation non enregistrée. Vérifiez les autorisations ou réessayez.');return;}
        feedbackByIndex.set(answer.deliverable_index,payload);
        info('Retour pédagogique enregistré.');
      });
      reviewArea.append(statusLabel,status,commentLabel,comment,button);
    }
    wrap.append(reviewArea);
  }
  $('learnerDetails').append(wrap);info('');
}
$('teacherLogin').addEventListener('submit',async e=>{
  e.preventDefault();info('Connexion en cours…');
  const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
  $('password').value='';
  if(error){info('Identifiants invalides ou accès indisponible.');return;}
  await start();
});
$('logout').addEventListener('click',async()=>{
  authGuard.invalidate();viewGuard.invalidate();teacher=null;clearStudentData();
  $('teacherDashboard').hidden=true;$('teacherAuth').hidden=false;$('identity').textContent='';
  const {error}=await db.auth.signOut();
  if(error){info('Impossible de terminer la session distante. Veuillez réessayer.');return;}
  info('Déconnexion effectuée.');
});
$('teacherBack').addEventListener('click',()=>{ $('teacherCourses').hidden=false;loadCourses(); });
db.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){authGuard.invalidate();viewGuard.invalidate();teacher=null;clearStudentData();$('identity').textContent='';$('teacherDashboard').hidden=true;$('teacherAuth').hidden=false;}});
start().catch(()=>info('Service formateur temporairement indisponible.'));
