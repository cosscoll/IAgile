/* IAgile CHROME V9 — camera-linked narrative + interactive academy. */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)),lerp=(a,b,t)=>a+(b-a)*t;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const journey=$('#accueil'),chapters=$$('.chapter'),exhibits=$$('.exhibit'),markers=$$('.chapter-controls button');
const sceneCount=chapters.length;
let targetProgress=0, smoothProgress=0, active=-1, scrollQueued=false;
let mouse=[0,0], lastFrame=0;
// A single, continuously damped progress drives BOTH the 3D camera and the 3D cards.
function measureScroll(){
 scrollQueued=false;
 const y=window.scrollY;
 const pageHeight=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 $('#progressBar').style.width=(100*clamp(y/pageHeight)).toFixed(2)+'%';
 const travel=Math.max(1,journey.offsetHeight-innerHeight);
 targetProgress=clamp((y-journey.offsetTop)/travel);
}
function requestMeasure(){if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(measureScroll)}
window.addEventListener('scroll',requestMeasure,{passive:true});
window.addEventListener('resize',requestMeasure,{passive:true});
measureScroll();
function renderNarrative(progress){
 const step=Math.min(sceneCount-1,Math.floor(Math.min(.999999,progress)*sceneCount));
 if(step!==active){
  active=step;
  chapters.forEach((x,i)=>{
   const isActive=i===step;
   x.classList.toggle('is-active',isActive);
   x.classList.toggle('is-exiting',i<step);
   x.setAttribute('aria-hidden',isActive?'false':'true');
   x.inert=!isActive;
   x.querySelectorAll('a,button').forEach(el=>{if(isActive)el.removeAttribute('tabindex');else el.setAttribute('tabindex','-1')});
  });
  exhibits.forEach((x,i)=>{
   x.classList.toggle('is-active',i===step);
   x.classList.toggle('is-exiting',i<step);
   x.setAttribute('aria-hidden',i===step?'false':'true');
   x.inert=i!==step;
   x.querySelectorAll('a').forEach(el=>{if(i===step)el.removeAttribute('tabindex');else el.setAttribute('tabindex','-1')});
  });
  markers.forEach((x,i)=>{
   x.classList.toggle('is-active',i===step);
   if(i===step)x.setAttribute('aria-current','step');else x.removeAttribute('aria-current');
  });
  $('#sceneNumber').textContent=String(step+1).padStart(2,'0')+' / '+String(sceneCount).padStart(2,'0');
 }
 $('#sceneGauge').style.height=(100*progress).toFixed(2)+'%';
 const phase=clamp(progress*sceneCount-step);
 const exhibit=exhibits[step];
 if(exhibit && !reduce){
   // Small local movement makes each installation feel anchored in the passing architecture.
   exhibit.style.setProperty('--scene-nudge',((phase-.5)*23).toFixed(2)+'px');
   exhibit.style.translate=(mouse[0]*-8).toFixed(1)+'px '+(mouse[1]*-6).toFixed(1)+'px';
 }
 const gallery=$('#fallbackGallery');
 if(gallery){
  gallery.style.setProperty('--fallback-a',(progress*1260).toFixed(1)+'px');
  gallery.style.setProperty('--fallback-b',(progress*925).toFixed(1)+'px');
  gallery.style.setProperty('--fallback-c',(progress*630).toFixed(1)+'px');
  gallery.style.setProperty('--grid-shift',(progress*600).toFixed(1)+'px');
 }
 window.dispatchEvent(new CustomEvent('IAgile:camera',{detail:{progress,mouse,scene:step,phase}}));
}
function tick(time){
 const dt=lastFrame?Math.min(64,time-lastFrame):16.7;lastFrame=time;
 // Frame-rate independent damping: same feel on 60 / 120 Hz and during trackpad bursts.
 const damping=reduce?1:1-Math.exp(-dt/135);
 smoothProgress+= (targetProgress-smoothProgress)*damping;
 if(Math.abs(targetProgress-smoothProgress)<.000015)smoothProgress=targetProgress;
 renderNarrative(smoothProgress);
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.addEventListener('pointermove',e=>{
 mouse=[clamp(e.clientX/innerWidth-.5,-.5,.5),clamp(e.clientY/innerHeight-.5,-.5,.5)];
},{passive:true});
markers.forEach(button=>button.addEventListener('click',()=>{
 const index=Number(button.dataset.scene);
 // Center the destination scene rather than jumping across a scene boundary.
 const travel=Math.max(1,journey.offsetHeight-innerHeight);
 window.scrollTo({top:journey.offsetTop+travel*((index+.48)/sceneCount),behavior:reduce?'instant':'smooth'});
}));
const demos={web:{heading:"De l'idée à l'interface.",description:"Découvrez comment une intention peut devenir un projet visuel prêt à être développé.",presets:['ATELIER','CAFÉ','PORTFOLIO']},flow:{heading:'Vos outils commencent à collaborer.',description:'Suivez un exemple de workflow, du message entrant à la préparation de sa réponse.',presets:['MESSAGE','SYNTHÈSE','ORGANISATION']},agent:{heading:'Un assistant pensé pour vous.',description:"Découvrez comment un assistant pourrait transformer des notes en prochaines actions.",presets:['PLAN','SYNTHÈSE','PRIORITÉS']}};
const websitePresets=[['ATELIER','ATELIER\nIMAGINÉ.'],['CAFÉ','CAFÉ\nMÉMOIRE.'],['PORTFOLIO','DES IDÉES\nEN IMAGES.']];
const agentPresets=['→ 01  Clarifier l’objectif\n→ 02  Planifier les étapes\n→ 03  Définir les indicateurs','→ 01  Repérer les idées clés\n→ 02  Structurer la synthèse\n→ 03  Identifier les questions','→ 01  Classer les tâches\n→ 02  Évaluer les urgences\n→ 03  Préparer un calendrier'];
let demo='web',preset=0,timerToken=0;
const stage=$('#studioStage'),status=$('#demoStatus'),run=$('#demoRun');
function applyPreset(){if(demo==='web'){$('#previewName').textContent=websitePresets[preset][0]+' / CONCEPT';$('#previewHeading').textContent=websitePresets[preset][1];stage.dataset.preset=preset;}if(demo==='agent'){$('#copilotAnswer').textContent=agentPresets[preset]}}
function selectDemo(mode){if(!demos[mode])return;++timerToken;demo=mode;preset=0;run.disabled=false;stage.dataset.demo=mode;stage.classList.remove('is-running');$$('.experience-tabs button').forEach(b=>{let on=b.dataset.demo===mode;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});$('#demoHeading').textContent=demos[mode].heading;$('#demoDescription').textContent=demos[mode].description;$('#studioPresets').replaceChildren(...demos[mode].presets.map((label,i)=>{let b=document.createElement('button');b.dataset.preset=i;b.type='button';b.textContent=label;if(i===0)b.className='is-active';return b}));$('#wf1').textContent='READY';$('#wf2').textContent='WAITING';$('#wf3').textContent='WAITING';status.textContent='DÉMONSTRATION VISUELLE — AUCUNE IA CONNECTÉE';applyPreset()}
$$('.experience-tabs button').forEach(b=>b.addEventListener('click',()=>selectDemo(b.dataset.demo)));
$('.experience-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const ts=$$('.experience-tabs button');let i=ts.findIndex(t=>t===document.activeElement);i=e.key==='Home'?0:e.key==='End'?ts.length-1:e.key==='ArrowLeft'?(i+ts.length-1)%ts.length:(i+1)%ts.length;selectDemo(ts[i].dataset.demo);ts[i].focus()});
$('#studioPresets').addEventListener('click',e=>{let b=e.target.closest('button[data-preset]');if(!b)return;preset=Number(b.dataset.preset);$$('#studioPresets button').forEach(v=>v.classList.toggle('is-active',v===b));applyPreset()});
$$('[data-select]').forEach(a=>a.addEventListener('click',()=>selectDemo(a.dataset.select)));
run.addEventListener('click',()=>{let token=++timerToken;run.disabled=true;stage.classList.remove('is-running');void stage.offsetWidth;stage.classList.add('is-running');status.textContent='◉ VISUALISATION EN COURS...';if(demo==='flow'){$('#wf1').textContent='DONE';$('#wf2').textContent='WORKING';$('#wf3').textContent='WAITING';setTimeout(()=>{if(token!==timerToken)return;$('#wf2').textContent='DONE';$('#wf3').textContent='DONE'},650)}setTimeout(()=>{if(token!==timerToken)return;run.disabled=false;status.textContent='✓ EXEMPLE TERMINÉ — IL S’AGIT D’UNE SIMULATION';},1150)});
// Interactive portal navigation: physical panels at different depths, with pointer parallax.
const overlay=$('#worldOverlay');let priorFocus=null;
function openOverlay(){priorFocus=document.activeElement;overlay.hidden=false;$('#worldTrigger').setAttribute('aria-expanded','true');document.querySelector('main').inert=true;document.querySelector('header').inert=true;document.body.style.overflow='hidden';$('#closeUniverse').focus();}
function closeOverlay(){overlay.hidden=true;$('#worldTrigger').setAttribute('aria-expanded','false');document.querySelector('main').inert=false;document.querySelector('header').inert=false;document.body.style.overflow='';priorFocus?.focus?.()}
$('#worldTrigger').addEventListener('click',openOverlay);$('#closeUniverse').addEventListener('click',closeOverlay);
$$('.universe-door').forEach(door=>door.addEventListener('click',()=>{let section=door.dataset.destination;closeOverlay();$('#'+section)?.scrollIntoView({behavior:reduce?'instant':'smooth',block:'start'});}));
overlay.addEventListener('pointermove',e=>{if(reduce)return;let x=clamp(e.clientX/innerWidth-.5,-.5,.5),y=clamp(e.clientY/innerHeight-.5,-.5,.5);$('#universeSpace').style.setProperty('--hover-x',(y*-8).toFixed(2)+'deg');$('#universeSpace').style.setProperty('--hover-y',(x*12).toFixed(2)+'deg')},{passive:true});
overlay.addEventListener('pointerleave',()=>{$('#universeSpace').style.setProperty('--hover-x','0deg');$('#universeSpace').style.setProperty('--hover-y','0deg')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closeOverlay();if(e.key==='Tab'&&!overlay.hidden){let els=[$('#closeUniverse'),...$$('.universe-door')],first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
$('#restart').addEventListener('click',()=>window.scrollTo({top:0,behavior:reduce?'instant':'smooth'}));
if(!reduce&&'IntersectionObserver' in window){const nodes=$$('.section-mark,.break-head,.showcase-head,.possibilities-header,.academy-header,.academy-course,.possibility-card');nodes.forEach(n=>n.classList.add('entrance-reveal'));const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -20px 0px'});nodes.forEach(n=>observer.observe(n));document.body.classList.add('motion-ready');}
$$('.possibility-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(reduce||matchMedia('(pointer:coarse)').matches)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.setProperty('--card-x',(x*9).toFixed(2)+'deg');card.style.setProperty('--card-y',(-y*7).toFixed(2)+'deg')});card.addEventListener('pointerleave',()=>{card.style.setProperty('--card-x','0deg');card.style.setProperty('--card-y','0deg')})});
// Interactive course orientation; all choices resolve to working local pages.
const pathfinder=[
 ['Créer des sites web 3D animés','Concevez une expérience immersive complète et publiez votre projet.','formations/sites-web-3d.html'],
 ['Créer des agents personnalisés','Définissez, équipez et testez un agent métier fiable.','formations/agents-personnalises.html'],
 ['Automatiser une tâche fastidieuse','Construisez un workflow robuste avec contrôles et gestion des erreurs.','formations/automatiser-tache.html'],
 ['Simplifier les processus du quotidien','Créez un système IA personnel pour rechercher, organiser et mieux décider.','formations/ia-au-quotidien.html']
];
$$('[data-course]').forEach(b=>b.addEventListener('click',()=>{
 const n=Number(b.dataset.course),item=pathfinder[n];if(!item)return;
 $$('.path-option').forEach(el=>{const selected=el===b;el.classList.toggle('is-selected',selected);el.setAttribute('aria-pressed',String(selected));});
 $('#pathResultTitle').textContent=item[0];$('#pathResultDesc').textContent=item[1];$('#pathResultLink').href=item[2];
}));
window.__IAgileVersion='CHROME V13 / ACCESSIBLE + OPTIMIZED + SEO';window.__IAgileDemoNote='Three static simulations; no live AI connected.';
})();
