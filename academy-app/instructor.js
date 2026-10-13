import {buildReviewQueue,sameRevision} from './instructor-policy.mjs';
const $=id=>document.getElementById(id);
const status=$('status'),auth=$('auth-section'),work=$('work-section'),
  logout=$('logout'),list=$('work-list'),count=$('count');
let generation=0;
const message=text=>{status.textContent=text;};
const clear=()=>{list.replaceChildren();count.textContent='';work.hidden=true;};
const config=window.IAgileAcademyConfig;
if(!config?.url||!config?.publishableKey||!window.supabase?.createClient){
  clear();message('Connexion indisponible : la configuration Academy manque.');
} else {
  const client=window.supabase.createClient(config.url,config.publishableKey,{
    auth:{flowType:'pkce',detectSessionInUrl:true,autoRefreshToken:true,persistSession:true}
  });
  const field=(labelText,value)=>{
    const item=document.createElement('p');
    item.className='instructor-meta';
    const label=document.createElement('strong');
    label.textContent=labelText+' : ';
    const span=document.createElement('span');
    span.textContent=String(value||'');
    item.append(label,span);
    return item;
  };
  const query=async builder=>{
    const {data,error}=await builder;
    if(error||!Array.isArray(data))throw new Error('Private Academy query failed');
    return data;
  };
  const fail=reason=>{
    ++generation;clear();logout.hidden=true;auth.hidden=false;message(reason);
  };
  async function load(){
    const request=++generation;
    clear();auth.hidden=true;logout.hidden=true;message('Vérification du compte formateur…');
    try{
      const {data:userData,error:userError}=await client.auth.getUser();
      if(request!==generation)return;
      if(userError||!userData?.user){fail('Connectez-vous avec votre compte formateur autorisé.');return;}
      const id=userData.user.id;
      const profile=await client.from('academy_profiles').select('account_status')
        .eq('user_id',id).maybeSingle();
      if(request!==generation)return;
      if(profile.error||profile.data?.account_status!=='active'){
        fail('Compte formateur non actif ou autorisation indisponible.');return;
      }
      const assignments=await query(client.from('academy_instructor_courses')
        .select('course_slug').eq('instructor_id',id));
      if(request!==generation)return;
      const slugs=[...new Set(assignments.map(x=>x.course_slug))];
      if(!slugs.length){fail('Aucun cours attribué à ce compte formateur.');return;}
      const courses=await query(client.from('academy_courses').select('slug,title,published')
        .in('slug',slugs).eq('published',true));
      if(request!==generation)return;
      const enabled=courses.map(x=>x.slug);
      if(!enabled.length){fail('Aucun cours attribué n’est publié. Aucune copie à corriger.');return;}
      // Independent RLS checks apply to every source. Never trust browser filters as authorization.
      const prompts=await query(client.from('academy_deliverable_prompts')
        .select('course_slug,deliverable_index,title,published')
        .in('course_slug',enabled).eq('published',true));
      const answers=await query(client.from('academy_deliverable_answers')
        .select('user_id,course_slug,deliverable_index,content,updated_at')
        .in('course_slug',enabled).order('updated_at',{ascending:false}).limit(200));
      const corrections=await query(client.from('academy_deliverable_feedback')
        .select('user_id,course_slug,deliverable_index,status,feedback_text,answer_updated_at,instructor_id')
        .in('course_slug',enabled).limit(200));
      if(request!==generation)return;
      const queue=buildReviewQueue(courses,prompts,answers,corrections);
      logout.hidden=false;auth.hidden=true;work.hidden=false;
      count.textContent=queue.length+' copie(s) accessible(s). Maximum 200 copies sont affichées à la fois.';
      if(!queue.length){message('Aucun travail accessible à corriger pour le moment.');return;}
      for(const answer of queue){
        const section=document.createElement('section');
        section.className='instructor-copy';
        const h=document.createElement('h3');
        h.textContent=answer.course_title+' — '+answer.prompt_title;
        const date=new Date(answer.updated_at);
        const explanation=field('Version soumise',date.toLocaleString('fr-FR'));
        const learner=field('Compte apprenant',answer.user_id);
        const body=document.createElement('pre');
        body.className='instructor-answer';
        body.textContent=answer.content; // Never inject learner HTML.
        const last=field('Dernière correction valide',
          answer.last_review ? (answer.last_review.status==='validated'?'Validé':'Révision demandée') : 'Aucune');
        section.append(h,learner,explanation,body,last);
        const form=document.createElement('form');
        form.className='instructor-review-form';
        const label=document.createElement('label');
        label.textContent='Décision sur cette version de la copie';
        const select=document.createElement('select');
        select.required=true;
        for(const [value,text] of [['needs_revision','Demander une révision'],['validated','Valider ce travail']]){
          const option=document.createElement('option');
          option.value=value;option.textContent=text;select.append(option);
        }
        select.value=answer.last_review?.status||'needs_revision';
        label.append(select);
        const notesLabel=document.createElement('label');
        notesLabel.textContent='Retour formateur (20 à 5 000 caractères)';
        const notes=document.createElement('textarea');
        notes.required=true;notes.minLength=20;notes.maxLength=5000;notes.rows=6;
        notes.value=String(answer.last_review?.feedback_text||'');
        notesLabel.append(notes);
        const save=document.createElement('button');
        save.type='submit';save.textContent='Enregistrer cette correction';
        const output=document.createElement('p');
        output.className='instructor-save-status';
        output.setAttribute('role','status');output.setAttribute('aria-live','polite');
        form.append(label,notesLabel,save,output);
        form.addEventListener('submit',async event=>{
          event.preventDefault();
          const feedbackText=notes.value.trim();
          if(request!==generation||save.disabled)return;
          if(!['validated','needs_revision'].includes(select.value)||
             feedbackText.length<20||feedbackText.length>5000){
            output.textContent='Décision ou commentaire invalide.';return;
          }
          save.disabled=true;output.textContent='Enregistrement en cours…';
          try{
            const payload={user_id:answer.user_id,course_slug:answer.course_slug,
              deliverable_index:answer.deliverable_index,instructor_id:id,
              status:select.value,feedback_text:feedbackText,
              answer_updated_at:answer.updated_at};
            const {error}=await client.from('academy_deliverable_feedback').upsert(
              payload,{onConflict:'user_id,course_slug,deliverable_index'});
            if(request!==generation)return;
            if(error){output.textContent='Correction refusée ou copie modifiée. Actualisez la liste.';return;}
            const result=await client.from('academy_deliverable_feedback')
              .select('status,feedback_text,answer_updated_at,instructor_id')
              .eq('user_id',answer.user_id).eq('course_slug',answer.course_slug)
              .eq('deliverable_index',answer.deliverable_index).maybeSingle();
            if(request!==generation)return;
            if(result.error||result.data?.status!==select.value||
               result.data?.feedback_text!==feedbackText||result.data?.instructor_id!==id||
               !sameRevision(result.data?.answer_updated_at,answer.updated_at)){
              output.textContent='Correction non confirmée. Actualisez la liste.';return;
            }
            last.lastChild.textContent=select.value==='validated'?'Validé':'Révision demandée';
            output.textContent='Correction enregistrée et confirmée pour cette version.';
          }catch(_error){
            if(request===generation)output.textContent='Connexion indisponible. Rien n’est confirmé.';
          }finally{
            if(request===generation)save.disabled=false;
          }
        });
        section.append(form);list.append(section);
      }
      message('Vous consultez les seules copies autorisées par vos affectations.');
    }catch(_error){
      if(request===generation)fail('Impossible de vérifier les accès ou de charger les copies.');
    }
  }
  $('login-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const form=event.currentTarget;
    const email=String(form.elements.email?.value||'').trim();
    if(!email||!form.reportValidity())return;
    const button=form.querySelector('button[type=submit]');
    button.disabled=true;message('Envoi du lien de connexion…');
    try{
      const {error}=await client.auth.signInWithOtp({email,options:{
        shouldCreateUser:false,emailRedirectTo:window.location.origin+window.location.pathname
      }});
      message(error?'Le lien ne peut pas être envoyé. Vérifiez votre compte.':
        'Si le compte est autorisé, un lien de connexion a été envoyé.');
    }catch(_error){message('Service de connexion temporairement indisponible.');}
    finally{button.disabled=false;}
  });
  $('reload').addEventListener('click',()=>{void load();});
  logout.addEventListener('click',async()=>{
    ++generation;clear();await client.auth.signOut();void load();
  });
  // Invalidate in-flight reads and hide private copies synchronously on any auth change.
  client.auth.onAuthStateChange(()=>{
    ++generation;clear();logout.hidden=true;auth.hidden=true;
    message('Vérification de la session…');
    setTimeout(()=>{void load();},0);
  });
  void load();
}
