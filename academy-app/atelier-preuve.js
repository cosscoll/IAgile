import {CASES,verifyEvidenceChoice} from './atelier-preuve-policy.mjs';
const $=id=>document.getElementById(id),form=$('evidence-form'),result=$('evidence-result');
let step=0;
const cases=['rendezvous','remboursement'];
function render(){
  const c=CASES[cases[step]];
  $('scenario-step').textContent=step===0?'CAS GUIDÉ / 1 SUR 2':'CAS NOUVEAU / 2 SUR 2';
  $('scenario-title').textContent=c.title;
  $('scenario-context').textContent=c.context;
  $('choice-a').textContent=c.options[0].text;
  $('choice-b').textContent=c.options[1].text;
  const risks=$('risk-list');risks.replaceChildren();
  c.risks.forEach(item=>{
    const label=document.createElement('label');
    const input=document.createElement('input');
    input.type='radio';input.name='risk';input.value=item.id;input.required=true;
    const span=document.createElement('span');span.textContent=item.text;label.append(input,span);risks.append(label);
  });
  form.reset();result.hidden=true;
  $('transfer-button').hidden=true;
}
form.addEventListener('input',()=>{result.hidden=true;});
form.addEventListener('submit',event=>{
 event.preventDefault();
 const response=verifyEvidenceChoice({caseId:cases[step],
  optionId:form.querySelector('input[name="choice"]:checked')?.value,
  reasonId:form.querySelector('input[name="risk"]:checked')?.value,
  explanation:$('explanation').value});
 $('result-title').textContent=response.status==='consistent'?'Raisonnement cohérent':'Vérification à revoir';
 $('result-summary').textContent=response.text;
 $('result-detail').textContent=response.explanation||'';
 result.hidden=false;
 $('transfer-button').hidden=step!==0||!response.correct;
 result.scrollIntoView({behavior:'instant',block:'nearest'});
});
$('transfer-button').addEventListener('click',()=>{
 if(step===0){step=1;render();$('scenario-title').focus();}
});
render();
