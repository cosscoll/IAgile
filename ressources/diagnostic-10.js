/* Aucune communication réseau : diagnostic local et recommandations explicitement heuristiques. */
(() => {
'use strict';
const form=document.getElementById('diagnostic10');if(!form)return;
const result=document.getElementById('diagnostic-results'),progress=document.getElementById('diagnostic-progress'),save=document.getElementById('save-diagnostic');
const processes={
redaction:['Préparer un brief de rédaction','Structurer un brouillon à vérifier','Créer une trame réutilisable avec contrôle final'],
recherche:['Définir une grille de sources','Séparer les faits des interprétations','Produire une synthèse sourcée à relire'],
organisation:['Préparer un ordre du jour','Structurer un compte rendu validé','Créer un brief de passation'],
donnees:['Documenter les colonnes d’un tableau','Définir une checklist de cohérence','Présenter le résultat et ses limites'],
relation:['Classer des demandes non sensibles','Préparer une réponse soumise à validation','Construire une FAQ interne vérifiée'],
autre:['Cartographier la tâche','Définir une checklist de qualité','Documenter une méthode transmissible']};
const node=(tag,txt,parent)=>{const e=document.createElement(tag);e.textContent=txt;parent.appendChild(e);return e;};
const clear=()=>{result.hidden=true;result.replaceChildren();save.hidden=true;};
const count=()=>progress.textContent=[...new FormData(form)].length+' / 10 réponses';
const download=txt=>{const u=URL.createObjectURL(new Blob([txt],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='iagile-diagnostic-processus.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
form.addEventListener('change',()=>{count();clear();});
form.addEventListener('reset',()=>setTimeout(()=>{clear();count();},0));
form.addEventListener('submit',e=>{
e.preventDefault();const values=Object.fromEntries(new FormData(form));clear();
if(Object.keys(values).length!==10){result.hidden=false;node('p','Répondez aux dix questions.',result);return;}
const v=values;
const candidates=processes[v.domaine]||processes.autre;
const ordered=v.priorite==='qualite'?[candidates[1],candidates[2],candidates[0]]:v.priorite==='reprise'?[candidates[2],candidates[0],candidates[1]]:v.difficulte==='contexte'?[candidates[0],candidates[2],candidates[1]]:candidates;
const cautions=[];
if(['confidentielles','sensibles'].includes(v.sensibilite))cautions.push('Données confidentielles, personnelles ou sensibles : faites l’exercice sur des informations fictives. N’utilisez pas d’outil IA non autorisé.');
if(v.impact==='eleve'||v.controle==='non')cautions.push('Contrôle humain indispensable : ne déléguez pas automatiquement une décision importante ou un résultat difficile à vérifier.');
if(v.stabilite==='unique')cautions.push('Cas variables : commencez par documenter une procédure manuelle plutôt que l’automatiser.');
if(v.duree==='1'&&v.frequence==='1')cautions.push('Tâche courte et rare : une checklist peut être plus efficace qu’un système IA.');
let advice=v.frequence==='4'||v.frequence==='3'?'Sélectionnez une tâche récurrente.':'Commencez par une tâche simple et unique.';
advice+=' Décrivez les entrées, le résultat attendu et les critères de vérification.';
if(v.transfert!=='oui')advice+=' Préparez un bref document de passation.';
if(v.difficulte==='verification')advice+=' Choisissez à l’avance les sources de contrôle.';
node('h2','Trois pistes à tester',result);
node('p','Ce classement pédagogique ne correspond pas à une efficacité mesurée.',result);
const ol=node('ol','',result);ordered.forEach(s=>node('li',s,ol));
node('h3','Premier essai conseillé',result);node('p',advice,result);
if(cautions.length){node('h3','Précautions',result);const ul=node('ul','',result);cautions.forEach(s=>node('li',s,ul));}
node('p','Suite : vérifier un vrai résultat et mesurer préparation, génération, vérification et correction avec la Scorecard.',result);
result.hidden=false;save.hidden=false;
const report=['IAgile — Diagnostic pédagogique en 10 questions','Pistes non mesurées',...ordered.map((s,i)=>(i+1)+'. '+s),advice,...cautions,'Mesurez un essai réel avant toute affirmation de gain.'].join('\n');
save.onclick=()=>download(report);result.scrollIntoView({block:'start'});
});
count();
})();