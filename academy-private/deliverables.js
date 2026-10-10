import { renderCourseMarkdown } from './markdown.js';
// Learner-only deliverables. Supabase RLS remains the authorization boundary.
export async function loadDeliverables({supabase,user,course,target,message,isCurrent=()=>true}){
  if(!isCurrent())return;
  target.replaceChildren();
  const [{data:prompts,error},{data:answers,error:answerError},{data:reviews,error:reviewError}]=await Promise.all([
    supabase.from('academy_deliverable_prompts').select('course_slug,deliverable_index,title,instructions_markdown').eq('course_slug',course.slug).eq('published',true).order('deliverable_index'),
    supabase.from('academy_deliverable_answers').select('deliverable_index,content').eq('course_slug',course.slug).eq('user_id',user.id),
    supabase.from('academy_deliverable_feedback').select('deliverable_index,status,feedback_text,reviewed_at').eq('course_slug',course.slug).eq('user_id',user.id)
  ]);
  if(!isCurrent())return;
  if(error||answerError||reviewError){target.textContent='Impossible de charger les travaux pour le moment.';return;}
  if(!prompts?.length){target.textContent='Les travaux de cette formation ne sont pas encore accessibles.';return;}
  const existing=new Map((answers||[]).map(a=>[a.deliverable_index,a.content]));
  const feedbackByIndex=new Map((reviews||[]).map(r=>[r.deliverable_index,r]));
  for(const prompt of prompts){
    const card=document.createElement('article');card.className='module-card';
    const title=document.createElement('h4');title.textContent=prompt.title;
    const instructions=renderCourseMarkdown(prompt.instructions_markdown);
    const label=document.createElement('label');label.textContent='Votre réponse';
    const area=document.createElement('textarea');area.rows=8;area.maxLength=10000;
    area.id='deliverable-'+course.slug+'-'+prompt.deliverable_index;
    area.value=existing.get(prompt.deliverable_index)||'';
    label.htmlFor=area.id;
    const button=document.createElement('button');button.type='button';button.textContent='Enregistrer ma réponse';
    button.addEventListener('click',async()=>{
      if(!isCurrent())return;
      if(!area.value.trim()){message('Ajoutez une réponse avant de sauvegarder.');area.focus();return;}
      button.disabled=true;message('Enregistrement en cours…');
      const payload={user_id:user.id,course_slug:course.slug,deliverable_index:prompt.deliverable_index,content:area.value};
      const {error:saveError}=await supabase.from('academy_deliverable_answers').upsert(payload,{onConflict:'user_id,course_slug,deliverable_index'});
      if(!isCurrent())return;
      button.disabled=false;
      message(saveError?'La réponse n’a pas été enregistrée. Veuillez réessayer.':'Votre réponse est enregistrée.');
    });
    const review=feedbackByIndex.get(prompt.deliverable_index);
    const feedback=document.createElement('section');
    feedback.className='assignment-feedback';
    feedback.setAttribute('aria-label','Retour formateur');
    const status=document.createElement('strong');
    status.textContent=review?(review.status==='validated'?'Travail validé':'Révision demandée'):'En attente de correction';
    feedback.append(status);
    if(review){
      const feedbackText=document.createElement('p');feedbackText.textContent=review.feedback_text;
      feedback.append(feedbackText);
    }
    card.append(title,instructions,label,area,button,feedback);target.append(card);
  }
}
