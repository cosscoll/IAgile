import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';
import { loadDeliverables } from './deliverables.js';
import { loadCourseAssets } from './assets.js';
import { renderCourseMarkdown } from './markdown.js';
import { createRequestGuard } from './request-guard.js';
const $ = id => document.getElementById(id);
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
const message = text => { $('status').textContent = text || ''; };
const node = (tag,text,cls) => { const e=document.createElement(tag); if(text!==undefined)e.textContent=text; if(cls)e.className=cls; return e; };
let user = null;
let recovering = false;
const authGuard=createRequestGuard();
const viewGuard=createRequestGuard();
function showSignedIn(value) { $('auth').hidden=value; $('dashboard').hidden=!value; $('signout').hidden=!value; $('identity').textContent=value?(user?.email||'Compte connecté'):''; }
function clearPrivateContent(){
  for(const id of ['courses','modules','prompts','courseAssets'])$(id).replaceChildren();
  $('courseView').hidden=true;
  $('courseTitle').textContent='';$('courseDescription').textContent='';
}

async function start() {
  if(recovering)return;
  const authTicket=authGuard.next();
  viewGuard.invalidate();
  $('configuration').hidden=true;
  const {data,error}=await supabase.auth.getUser();
  if(!authGuard.valid(authTicket))return;
  if(error || !data?.user){ user=null; showSignedIn(false); return; }
  user=data.user; showSignedIn(true); await listCourses();
}
async function listCourses() {
  const uid=user?.id;
  const ticket=viewGuard.next();
  const sessionTicket=authGuard.current();
  const isCurrent=()=>viewGuard.valid(ticket)&&authGuard.valid(sessionTicket)&&user?.id===uid;
  if(!uid)return;
  $('courseView').hidden=true; $('courses').hidden=false;
  $('courses').replaceChildren();
  message('Chargement de vos formations…');
  const {data:profile,error:profileError}=await supabase.from('academy_profiles').select('account_status').eq('user_id',user.id).maybeSingle();
  if(!isCurrent())return;
  if(profileError){message('Impossible de vérifier le statut de votre compte.');return;}
  if(!profile || profile.account_status!=='active'){
    $('courses').append(node('p',"Ce compte apprenant n'est pas encore activé. Aucun contenu privé n'est accessible."));
    message('');return;
  }
  const {data:enrollments,error:accessError}=await supabase.from('academy_enrollments').select('course_slug').eq('user_id',user.id).eq('active',true);
  if(!isCurrent())return;
  if(accessError){ message('Impossible de charger vos accès. Réessayez.'); return; }
  const slugs=[...new Set((enrollments||[]).map(x=>x.course_slug))];
  if(!slugs.length){ $('courses').append(node('p',"Aucune formation n'est actuellement attribuée à ce compte. L'accès aux cours reste réservé aux inscriptions validées."));message('');return; }
  const {data:courses,error}=await supabase.from('academy_courses').select('slug,title,summary,published').in('slug',slugs);
  if(!isCurrent())return;
  if(error){message('Catalogue momentanément indisponible.');return;}
  const available=(courses||[]).filter(c=>c.published);
  if(!available.length){$('courses').append(node('p','Vos formations sont enregistrées, mais ne sont pas encore ouvertes.'));message('');return;}
  for(const course of available){
    const card=node('article',undefined,'course-card');
    card.append(node('span','Formation accessible','eyebrow'),node('h3',course.title),node('p',course.summary));
    const b=node('button','Ouvrir la formation');b.type='button';b.addEventListener('click',()=>openCourse(course));
    card.append(b);$('courses').append(card);
  }
  message('');
}
async function openCourse(course){
  const uid=user?.id;
  const ticket=viewGuard.next();
  const sessionTicket=authGuard.current();
  const isCurrent=()=>viewGuard.valid(ticket)&&authGuard.valid(sessionTicket)&&user?.id===uid;
  if(!uid)return;
  $('courses').hidden=true;$('courseView').hidden=false;$('courseTitle').textContent=course.title;$('courseDescription').textContent=course.summary;
  $('modules').replaceChildren();message('Chargement des modules…');
  const [{data:modules,error},{data:progress,error:progressError}]=await Promise.all([
    supabase.from('academy_course_modules').select('course_slug,module_index,title,published').eq('course_slug',course.slug).eq('published',true).order('module_index'),
    supabase.from('academy_module_progress').select('module_index,completed,notes').eq('course_slug',course.slug).eq('user_id',user.id)
  ]);
  if(!isCurrent())return;
  if(error||progressError){message('Les modules ne sont pas disponibles actuellement.');return;}
  const done=new Set((progress||[]).filter(x=>x.completed).map(x=>x.module_index));
  const existingNotes=new Map((progress||[]).map(x=>[x.module_index,x.notes]));
  const refreshProgress=()=>{
    const total=(modules||[]).length;
    const completed=(modules||[]).filter(x=>done.has(x.module_index)).length;
    $('progressText').textContent=total?completed+' module(s) sur '+total+' terminés':'Aucun module disponible';
    $('progressMeter').max=Math.max(1,total);
    $('progressMeter').value=completed;
  };
  refreshProgress();
  if(!modules?.length){$('modules').append(node('p','Les leçons de cette formation ne sont pas encore disponibles.'));message('');await Promise.all([
    loadDeliverables({supabase,user,course,target:$('prompts'),message,isCurrent}),
    loadCourseAssets({supabase,course,target:$('courseAssets'),message,isCurrent})
  ]);return;}
  for(const mod of modules){
    const card=node('article',undefined,'module-card'),title=node('h3',mod.title),label=node('span',done.has(mod.module_index)?'Terminé':'À découvrir','pill');
    const detail=node('div');detail.hidden=true;
    const show=node('button','Lire le module');show.type='button';
    show.addEventListener('click',async()=>{
      if(!isCurrent())return;
      if(!detail.hidden){detail.hidden=true;show.textContent='Lire le module';return;}
      show.disabled=true;message('Ouverture de votre leçon…');
      const {data,error:readError}=await supabase.from('academy_course_modules').select('body_markdown').eq('course_slug',course.slug).eq('module_index',mod.module_index).eq('published',true).maybeSingle();
      if(!isCurrent())return;
      show.disabled=false;
      if(readError||!data){message('Accès refusé ou leçon indisponible.');return;}
      detail.replaceChildren(renderCourseMarkdown(data.body_markdown));
      const complete=node('button',done.has(mod.module_index)?'Marquer comme non terminé':'Marquer comme terminé');
      complete.type='button';complete.addEventListener('click',async()=>{
        if(!isCurrent())return;
        complete.disabled=true;const completed=!done.has(mod.module_index);
        const payload={user_id:user.id,course_slug:course.slug,module_index:mod.module_index,completed,notes:existingNotes.get(mod.module_index)||'',updated_at:new Date().toISOString()};
        const {error:saveError}=await supabase.from('academy_module_progress').upsert(payload,{onConflict:'user_id,course_slug,module_index'});
        if(!isCurrent())return;
        complete.disabled=false;if(saveError){message('Progression non enregistrée.');return;}
        if(completed)done.add(mod.module_index);else done.delete(mod.module_index);
        label.textContent=completed?'Terminé':'À découvrir';complete.textContent=completed?'Marquer comme non terminé':'Marquer comme terminé';refreshProgress();message('Progression enregistrée.');
      });
      const notesLabel=node('label','Mes notes de cours');
      const notesArea=node('textarea');
      notesArea.id='module-notes-'+course.slug+'-'+mod.module_index;
      notesArea.rows=5;notesArea.maxLength=4000;
      notesArea.value=existingNotes.get(mod.module_index)||'';
      notesLabel.htmlFor=notesArea.id;
      const saveNotes=node('button','Enregistrer mes notes');
      saveNotes.type='button';
      saveNotes.addEventListener('click',async()=>{
        if(!isCurrent())return;
        saveNotes.disabled=true;message('Enregistrement des notes…');
        const notes=notesArea.value;
        const {error:notesError}=await supabase.from('academy_module_progress').upsert({
          user_id:user.id,course_slug:course.slug,module_index:mod.module_index,
          completed:done.has(mod.module_index),notes,updated_at:new Date().toISOString()
        },{onConflict:'user_id,course_slug,module_index'});
        if(!isCurrent())return;
        saveNotes.disabled=false;
        if(notesError){message('Impossible de sauvegarder les notes.');return;}
        existingNotes.set(mod.module_index,notes);
        message('Notes enregistrées.');
      });
      detail.append(complete,notesLabel,notesArea,saveNotes);
      detail.hidden=false;show.textContent='Refermer';message('');
    });
    card.append(label,title,show,detail);$('modules').append(card);
  }
  message('');
  await Promise.all([
    loadDeliverables({supabase,user,course,target:$('prompts'),message,isCurrent}),
    loadCourseAssets({supabase,course,target:$('courseAssets'),message,isCurrent})
  ]);
}
$('loginForm').addEventListener('submit',async(event)=>{
  event.preventDefault();$('loginBtn').disabled=true;message('Vérification de vos identifiants…');
  const {error}=await supabase.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
  $('loginBtn').disabled=false;$('password').value='';
  if(error){message('Connexion impossible. Vérifiez les identifiants ou la confirmation de votre e-mail.');return;}
  await start();
});
$('signout').addEventListener('click',async()=>{
  authGuard.invalidate();viewGuard.invalidate();user=null;clearPrivateContent();showSignedIn(false);
  const {error}=await supabase.auth.signOut();
  message(error?'Déconnexion distante impossible, veuillez réessayer.':'Déconnexion effectuée.');
});
$('refresh').addEventListener('click',()=>start());
$('back').addEventListener('click',()=>listCourses());
$('reset').addEventListener('click',async()=>{
  const email=$('email').value.trim();if(!email){message("Indiquez d'abord votre adresse e-mail.");$('email').focus();return;}
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:new URL('index.html',location.href).href});
  message(error?'La récupération du mot de passe est temporairement indisponible.':"Si cette adresse est enregistrée, un e-mail de réinitialisation sera envoyé.");
});
supabase.auth.onAuthStateChange((event)=>{
  if(event==='PASSWORD_RECOVERY'){
    authGuard.invalidate();viewGuard.invalidate();clearPrivateContent();
    recovering=true;$('auth').hidden=true;$('dashboard').hidden=true;$('recovery').hidden=false;
    message('Définissez un mot de passe d’au moins dix caractères.');
  }
  if(event==='SIGNED_OUT'){authGuard.invalidate();viewGuard.invalidate();user=null;recovering=false;clearPrivateContent();$('recovery').hidden=true;showSignedIn(false);}
});
$('recoveryForm').addEventListener('submit',async(event)=>{
  event.preventDefault();
  if(!recovering){message('Lien de réinitialisation requis.');return;}
  const password=$('newPassword').value;
  if(password!==$('confirmPassword').value){message('Les mots de passe ne correspondent pas.');return;}
  const button=event.currentTarget.querySelector('button');button.disabled=true;
  const {error}=await supabase.auth.updateUser({password});button.disabled=false;
  if(error){message('Impossible de modifier ce mot de passe. Utilisez un nouveau lien.');return;}
  $('recoveryForm').reset();recovering=false;$('recovery').hidden=true;message('Mot de passe modifié.');
  await start();
});
start().catch(()=>{showSignedIn(false);message('Service indisponible. Réessayez plus tard.');});
