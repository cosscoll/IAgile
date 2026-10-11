/* Processus démontré réellement en JavaScript local. Aucune IA, collecte ou réseau. */
(() => {
'use strict';
const form=document.getElementById('demo-workflow');if(!form)return;
const input=document.getElementById('demo-notes');
const wrap=document.getElementById('demo-comparison');
const before=document.getElementById('demo-before'),after=document.getElementById('demo-after');
const status=document.getElementById('demo-status'),save=document.getElementById('save-demo');
const clear=()=>{wrap.hidden=true;save.hidden=true;before.textContent='';after.textContent='';status.textContent='';};
const download=txt=>{const url=URL.createObjectURL(new Blob([txt],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='iagile-demo-processus.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
const strip=s=>s.replace(/^\s+|\s+$/g,'');
input.addEventListener('input',clear);
form.addEventListener('reset',()=>setTimeout(clear,0));
form.addEventListener('submit',event=>{
event.preventDefault();clear();
const lines=input.value.split(/\r?\n/).map((text,index)=>({text:strip(text),line:index+1})).filter(x=>x.text);
if(!lines.length){status.textContent='Saisissez au moins une ligne.';wrap.hidden=false;return;}
const groups={DECISION:[],ACTION:[],RISQUE:[],AUTRE:[]};let missing=0;
for(const item of lines){
 const match=/^(DECISION|DÉCISION|ACTION|RISQUE)\s*:\s*(.*)$/i.exec(item.text);
 const cat=match?(match[1].toUpperCase().startsWith('D')?'DECISION':match[1].toUpperCase()):'AUTRE';
 const payload=match?strip(match[2]):item.text;
 const alerts=[];
 if(cat==='ACTION'){
   if(!/\bresponsable\s*:\s*\S+/i.test(payload))alerts.push('responsable à préciser');
   if(!/\b(?:échéance|echeance)\s*:\s*\S+/i.test(payload))alerts.push('échéance à préciser');
 }
 if(!payload)alerts.push('information vide');
 missing+=alerts.length;
 groups[cat].push('[ligne '+item.line+'] '+(payload||'(vide)')+(alerts.length?' [À VÉRIFIER : '+alerts.join(', ')+']':''));
}
const baseline=lines.map(item=>'['+item.line+'] '+item.text).join('\n');
const sections=[['DECISION','DÉCISIONS'],['ACTION','ACTIONS'],['RISQUE','RISQUES'],['AUTRE','NON CLASSÉ — À REVOIR']];
const structured=sections.map(([cat,label])=>label+' ('+groups[cat].length+')\n'+(groups[cat].join('\n')||'Aucune entrée')).join('\n\n');
before.textContent=baseline;after.textContent=structured;
status.textContent=lines.length+' ligne(s) traitée(s), '+missing+' champ(s) manquant(s) détecté(s), '+groups.AUTRE.length+' ligne(s) non classée(s). Ces détections sont fondées sur des mots-clés, elles ne remplacent pas une validation humaine.';
wrap.hidden=false;save.hidden=false;
save.onclick=()=>download(['IAgile — Démonstration d’un processus local (non IA)','NOTES D’ORIGINE',baseline,'','VERSION STRUCTURÉE',structured,'','BILAN',status.textContent].join('\n'));
wrap.scrollIntoView({block:'start'});
});
})();