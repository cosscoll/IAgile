// Pure presentation rules; actual permission is always enforced by Supabase RLS.
export const allowedCourses=new Set(['processus','agents','automatisation','sites-3d']);
const key=(user,course,index)=>JSON.stringify([user,course,index]);
export function sameRevision(a,b){
  // Supabase serializes both timestamptz columns canonically. Compare every
  // character: Date.parse() drops microseconds, which could hide a later edit.
  return typeof a==='string'&&typeof b==='string'&&a.length>0&&a===b;
}
export function buildReviewQueue(courses,prompts,answers,feedback){
  const available=new Map((courses||[]).filter(x=>
    x.published===true&&allowedCourses.has(x.slug)).map(x=>[x.slug,String(x.title||x.slug)]));
  const names=new Map((prompts||[]).filter(x=>available.has(x.course_slug)&&x.published===true)
    .map(x=>[JSON.stringify([x.course_slug,x.deliverable_index]),String(x.title||'Travail')]));
  const reviewed=new Map((feedback||[]).map(x=>[key(x.user_id,x.course_slug,x.deliverable_index),x]));
  return (answers||[]).filter(x=>
    available.has(x.course_slug)&&
    names.has(JSON.stringify([x.course_slug,x.deliverable_index])) &&
    typeof x.content==='string'&&typeof x.user_id==='string'&&
    Number.isInteger(x.deliverable_index)&&Number.isFinite(Date.parse(x.updated_at)))
  .map(x=>{
    const note=reviewed.get(key(x.user_id,x.course_slug,x.deliverable_index));
    const valid=note&&sameRevision(note.answer_updated_at,x.updated_at);
    return {...x,course_title:available.get(x.course_slug),
      prompt_title:names.get(JSON.stringify([x.course_slug,x.deliverable_index])),
      last_review:valid?note:null};
  });
}
