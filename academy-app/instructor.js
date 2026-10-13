import {buildReviewQueue,sameRevision} from './instructor-policy.mjs';
import {createStructuredFeedback,parseStructuredFeedback} from './instructor-rubric.mjs';
const $=id=>document.getElementById(id);
const status=$('status'),auth=$('auth-section'),work=$('work-section'),
  logout=$('logout'),list=$('work-list'),count=$('count');
let generation=0;
let logoutRequested=false;
const PAGE_SIZE=50;
const FEEDBACK_PAGE_SIZE=200;
const MAX_FEEDBACK_PAGES=40;
let currentPage=0;
const pagination=$('pagination'),previousPage=$('previous-page'),nextPage=$('next-page');
const message=text=>{status.textContent=text;};
const clear=()=>{list.replaceChildren();count.textContent='';work.hidden=true;pagination.hidden=true;};
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
  async function load(page=currentPage){
    if(logoutRequested){clear();auth.hidden=true;logout.hidden=false;message('Déconnexion non confirmée. Réessayez ou rechargez la page.');return;}
    const request=++generation;
    currentPage=page;
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
      // Query one deterministic page plus a sentinel. Never silently drop older
      // pending copies because the first 200 global records were reached.
      const allOnPage=await query(client.from('academy_deliverable_answers')
        .select('user_id,course_slug,deliverable_index,content,updated_at')
        .in('course_slug',enabled)
        .order('updated_at',{ascending:false})
        .order('user_id',{ascending:true})
        .order('course_slug',{ascending:true})
        .order('deliverable_index',{ascending:true})
        .range(page*PAGE_SIZE,(page+1)*PAGE_SIZE));
      if(request!==generation)return;
      const hasNext=allOnPage.length>PAGE_SIZE;
      const answers=allOnPage.slice(0,PAGE_SIZE);
      // Feedback must be paged too: a separate 200-row limit could display
      // old copies as unreviewed or mask valid human assessments.
      const users=[...new Set(answers.map(a=>a.user_id))];
      const corrections=[];
      if(users.length){
        let complete=false;
        for(let index=0;index<MAX_FEEDBACK_PAGES;index++){
          const batch=await query(client.from('academy_deliverable_feedback')
            .select('user_id,course_slug,deliverable_index,status,feedback_text,answer_updated_at,instructor_id')
            .in('course_slug',enabled).in('user_id',users)
            .order('user_id',{ascending:true})
            .range(index*FEEDBACK_PAGE_SIZE,(index+1)*FEEDBACK_PAGE_SIZE-1));
          if(request!==generation)return;
          corrections.push(...batch);
          if(batch.length<FEEDBACK_PAGE_SIZE){complete=true;break;}
        }
        if(!complete)throw new Error('Instructor feedback exceeds protected page scan');
      }
      if(request!==generation)return;
      const queue=buildReviewQueue(courses,prompts,answers,corrections);
      logout.hidden=false;auth.hidden=true;work.hidden=false;
      pagination.hidden=page===0&&!hasNext;
      previousPage.disabled=page===0;
      nextPage.disabled=!hasNext;
      count.textContent='Page '+(page+1)+' · '+queue.length+' copie(s) accessible(s) sur cette page (50 max).';
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
        const previousFeedback=parseStructuredFeedback(answer.last_review?.feedback_text||'');
        const criterionLabel=document.createElement('label');
        criterionLabel.textContent='Critère évalué (8 à 900 caractères)';
        const criterion=document.createElement('input');
        criterion.type='text';criterion.className='review-criterion';
        criterion.required=true;criterion.minLength=8;criterion.maxLength=900;
        criterion.value=previousFeedback.criterion;
        criterionLabel.append(criterion);
        const notesLabel=document.createElement('label');
        notesLabel.textContent='Preuve ou élément observé dans la copie (20 à 2 500 caractères)';
        const notes=document.createElement('textarea');
        notes.required=true;notes.minLength=20;notes.maxLength=2500;notes.rows=5;
        notes.className='review-evidence';
        notes.value=previousFeedback.evidence;
        notesLabel.append(notes);
        const nextLabel=document.createElement('label');
        nextLabel.textContent='Action concrète à effectuer ensuite (15 à 1 200 caractères)';
        const nextAction=document.createElement('textarea');
        nextAction.required=true;nextAction.minLength=15;nextAction.maxLength=1200;nextAction.rows=3;
        nextAction.className='review-next-action';
        nextAction.value=previousFeedback.nextAction;
        nextLabel.append(nextAction);
        const save=document.createElement('button');
        save.type='submit';save.textContent='Enregistrer cette correction';
        const output=document.createElement('p');
        output.className='instructor-save-status';
        output.setAttribute('role','status');output.setAttribute('aria-live','polite');
        form.append(label,criterionLabel,notesLabel,nextLabel,save,output);
        form.addEventListener('submit',async event=>{
          event.preventDefault();
          const structured=createStructuredFeedback({criterion:criterion.value,
            evidence:notes.value,nextAction:nextAction.value});
          const feedbackText=structured.text;
          if(request!==generation||save.disabled)return;
          if(!['validated','needs_revision'].includes(select.value)||!structured.ok){
            output.textContent='Précisez le critère, une preuve et une action concrète.';return;
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
  $('reload').addEventListener('click',()=>{void load(currentPage);});
  previousPage.addEventListener('click',()=>{if(currentPage>0)void load(currentPage-1);});
  nextPage.addEventListener('click',()=>{if(!nextPage.disabled)void load(currentPage+1);});
  logout.addEventListener('click',async()=>{
    logoutRequested=true;
    ++generation;clear();logout.hidden=true;auth.hidden=true;
    message('Déconnexion en cours…');
    try{
      const {error}=await client.auth.signOut();
      if(error)throw new Error('Signout not confirmed');
      logoutRequested=false;
      currentPage=0;
      void load(0);
    }catch(_error){
      // Auth failures must never bring instructor copies back before retry.
      logout.hidden=false;auth.hidden=true;
      message('Déconnexion non confirmée. Réessayez ou rechargez la page.');
    }
  });
  // Invalidate in-flight reads and hide private copies synchronously on any auth change.
  client.auth.onAuthStateChange(event=>{
    ++generation;clear();logout.hidden=true;auth.hidden=true;
    if(event==='SIGNED_OUT')logoutRequested=false;
    if(logoutRequested){
      logout.hidden=false;
      message('Déconnexion non confirmée. Réessayez ou rechargez la page.');
      return;
    }
    currentPage=0;
    message('Vérification de la session…');
    setTimeout(()=>{void load(0);},0);
  });
  void load();
}
