import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.79.0';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './config.js';
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=id=>document.getElementById(id);
const info=txt=>{$('teacherStatus').textContent=txt||'';};
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
let teacher;
async function start(){
  const {data,error}=await db.auth.getUser();
  teacher=error?null:data?.user;
  $('teacherAuth').hidden=!!teacher;$('teacherDashboard').hidden=!teacher;
  $('logout').hidden=!teacher;$('identity').textContent=teacher?.email||'';
  if(teacher)await loadCourses();
}
async function loadCourses(){
  $('teacherCourses').replaceChildren();$('teacherDetails').hidden=true;
  const {data:profile,error:profileError}=await db.from('academy_profiles').select('account_status').eq('user_id',teacher.id).maybeSingle();
  if(profileError||profile?.account_status!=='active'){info('Ce compte ne dispose pas d’un profil formateur actif.');return;}
  const {data:assignments,error}=await db.from('academy_instructor_courses').select('course_slug').eq('instructor_id',teacher.id);
  if(error){info('Impossible de vérifier les autorisations formateur.');return;}
  if(!assignments?.length){info('Aucune formation ne vous a été attribuée.');return;}
  const slugs=assignments.map(x=>x.course_slug);
  const {data:courses,error:courseError}=await db.from('academy_courses').select('slug,title').in('slug',slugs);
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
  $('teacherCourses').hidden=true;$('teacherDetails').hidden=false;$('teacherCourseTitle').textContent=course.title;
  $('learners').replaceChildren();$('learnerDetails').replaceChildren();info('Chargement des apprenants…');
  const {data:enrollments,error}=await db.from('academy_enrollments').select('user_id,active').eq('course_slug',course.slug).eq('active',true);
  if(error){info('Impossible de consulter les inscriptions.');return;}
  if(!enrollments?.length){$('learners').append(el('p','Aucun apprenant inscrit pour le moment.'));info('');return;}
  const ids=enrollments.map(x=>x.user_id);
  const {data:profiles}=await db.from('academy_profiles').select('user_id,display_name').in('user_id',ids);
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
  $('learnerDetails').replaceChildren();info('Chargement du suivi…');
  const [{data:progress,error:e1},{data:answers,error:e2}]=await Promise.all([
    db.from('academy_module_progress').select('module_index,completed,updated_at').eq('user_id',uid).eq('course_slug',course.slug),
    db.from('academy_deliverable_answers').select('deliverable_index,content,updated_at').eq('user_id',uid).eq('course_slug',course.slug)
  ]);
  if(e1||e2){info('Lecture du suivi non autorisée ou indisponible.');return;}
  const wrap=el('section');wrap.className='panel';
  wrap.append(el('h3',name||'Suivi apprenant'));
  wrap.append(el('p',(progress||[]).filter(x=>x.completed).length+' module(s) terminés.'));
  const title=el('h4','Travaux transmis');wrap.append(title);
  if(!answers?.length)wrap.append(el('p','Aucun livrable enregistré.'));
  for(const answer of answers||[]){
    wrap.append(el('h5','Livrable '+answer.deliverable_index));
    const text=el('pre',answer.content);text.className='lesson';wrap.append(text);
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
$('logout').addEventListener('click',async()=>{await db.auth.signOut();teacher=null;await start();});
$('teacherBack').addEventListener('click',()=>{ $('teacherCourses').hidden=false;loadCourses(); });
db.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){teacher=null;$('teacherDashboard').hidden=true;$('teacherAuth').hidden=false;}});
start().catch(()=>info('Service formateur temporairement indisponible.'));
