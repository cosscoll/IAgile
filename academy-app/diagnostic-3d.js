import {sample3DEnvironment,safeChecklist} from './diagnostic-3d-policy.mjs';
const $=id=>document.getElementById(id);
function detect(){
 let webgl2=false,webgl1=false;
 try{const canvas=document.createElement('canvas');const c=canvas.getContext('webgl2');if(c){webgl2=true;c.getExtension('WEBGL_lose_context')?.loseContext();}
 else{const g=canvas.getContext('webgl');if(g){webgl1=true;g.getExtension('WEBGL_lose_context')?.loseContext();}}}catch{}
 return sample3DEnvironment({width:window.innerWidth,height:window.innerHeight,
  motion:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false,webgl1,webgl2});
}
function redraw(){
 const report=detect(),data=$('environment'),list=$('checklist');data.replaceChildren();list.replaceChildren();
 for(const [label,value] of [
  ['Moteur utilisable',report.backend==='html'?'Alternative HTML':report.backend.toUpperCase()],
  ['Fenêtre actuelle',window.innerWidth+' × '+window.innerHeight+' px'],
  ['Mouvement réduit',report.motionReduced?'Demandé':'Non demandé'],
  ['Mesure FPS','NON TESTÉE'],['Mémoire GPU','NON TESTÉE'],['Appareil physique','NON TESTÉ']
 ]){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value;data.append(dt,dd);}
 for(const value of safeChecklist(report)){const item=document.createElement('li');item.textContent=value;list.append(item);}
 $('diag-status').textContent=report.verdict==='fallback'?
  'Aucun contexte WebGL confirmé. Le contenu HTML alternatif reste accessible.':
  'Contexte '+report.backend+' créé localement. Cela ne valide ni les performances ni la recette du site.';
}
$('run-again').addEventListener('click',redraw);redraw();
