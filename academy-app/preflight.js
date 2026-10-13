import {assessPrerequisites} from './preflight-policy.mjs';
const $=id=>document.getElementById(id);
const form=$('preflight-form'),course=$('course'),panel=$('diagnostic');
const sections={processus:$('process-question'),automatisation:$('automation-question'),
  agents:$('agent-question'),'sites-3d':$('webgl-question')};
let last='';
const conceal=()=>{panel.hidden=true;last='';$('copy-status').textContent='';};
function supportsWebGL(){
  try{
    const canvas=document.createElement('canvas');
    const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');
    if(!gl)return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  }catch{return false;}
}
function updateCourse(){
  for(const [slug,element] of Object.entries(sections))element.hidden=slug!==course.value;
  conceal();
}
course.addEventListener('change',updateCourse);
form.addEventListener('input',conceal);
form.addEventListener('change',conceal);
form.addEventListener('submit',event=>{
  event.preventDefault();
  const privacy=form.querySelector('input[name="privacy"]:checked')?.value||'unknown';
  const result=assessPrerequisites({course:course.value,privacy,task:$('task').value,
    sample:$('json-sample').value,toolAccess:$('tool-access').value,
    budget:$('budget').value,webgl:supportsWebGL()});
  $('diagnostic-title').textContent=result.title;
  $('diagnostic-reason').textContent=result.reason;
  panel.dataset.status=result.status;
  const list=$('diagnostic-steps');list.replaceChildren();
  for(const step of result.steps){const item=document.createElement('li');item.textContent=step;list.append(item);}
  panel.hidden=false;
  last=[result.title,result.reason,...result.steps.map((step,index)=>(index+1)+'. '+step)].join('\n');
  panel.focus();
});
$('copy-diagnostic').addEventListener('click',async()=>{
  if(!last)return;
  try{
    if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');
    await navigator.clipboard.writeText(last);
    $('copy-status').textContent='Étapes copiées.';
  }catch{
    $('copy-status').textContent='Copie indisponible : sélectionnez les étapes affichées.';
  }
});
updateCourse();
