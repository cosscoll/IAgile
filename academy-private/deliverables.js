// Learner-only deliverables. Supabase RLS remains the authorization boundary.
export async function loadDeliverables({supabase,user,course,target,message}){
  target.replaceChildren();
  const [{data:prompts,error},{data:answers,error:answerError}]=await Promise.all([
    supabase.from('academy_deliverable_prompts').select('course_slug,deliverable_index,title,instructions_markdown').eq('course_slug',course.slug).eq('published',true).order('deliverable_index'),
    supabase.from('academy_deliverable_answers').select('deliverable_index,content').eq('course_slug',course.slug).eq('user_id',user.id)
  ]);
  if(error||answerError){target.textContent='Impossible de charger les travaux pour le moment.';return;}
  if(!prompts?.length){target.textContent='Les travaux de cette formation ne sont pas encore accessibles.';return;}
  const existing=new Map((answers||[]).map(a=>[a.deliverable_index,a.content]));
  for(const prompt of prompts){
    const card=document.createElement('article');card.className='module-card';
    const title=document.createElement('h4');title.textContent=prompt.title;
    const instructions=document.createElement('p');instructions.className='lesson';instructions.textContent=prompt.instructions_markdown;
    const label=document.createElement('label');label.textContent='Votre réponse';
    const area=document.createElement('textarea');area.rows=8;area.maxLength=10000;
    area.id='deliverable-'+course.slug+'-'+prompt.deliverable_index;
    area.value=existing.get(prompt.deliverable_index)||'';
    label.htmlFor=area.id;
    const button=document.createElement('button');button.type='button';button.textContent='Enregistrer ma réponse';
    button.addEventListener('click',async()=>{
      if(!area.value.trim()){message('Ajoutez une réponse avant de sauvegarder.');area.focus();return;}
      button.disabled=true;message('Enregistrement en cours…');
      const payload={user_id:user.id,course_slug:course.slug,deliverable_index:prompt.deliverable_index,content:area.value};
      const {error:saveError}=await supabase.from('academy_deliverable_answers').upsert(payload,{onConflict:'user_id,course_slug,deliverable_index'});
      button.disabled=false;
      message(saveError?'La réponse n’a pas été enregistrée. Veuillez réessayer.':'Votre réponse est enregistrée.');
    });
    card.append(title,instructions,label,area,button);target.append(card);
  }
}
