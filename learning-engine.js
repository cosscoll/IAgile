/* IAgile CHROME V5. Narrative 3D learning system.
   Scene semantics: processor = AI, linked satellites = competencies acquired
   in sequence. This is a deliberately conceptual learning model, not an AI simulation. */
(() => {
 'use strict';
 const universe=document.getElementById('learningUniverse');
 if(!universe)return;
 const world=document.getElementById('learningWorld');
 const stageName=document.getElementById('learningStageName');
 const counter=universe.querySelector('.learning-counter');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const captions=['LE POINT DE DÉPART','01 — COMPRENDRE','02 — EXPÉRIMENTER','03 — APPLIQUER'];
 const nodes=[...universe.querySelectorAll('.learn-node')];
 let lastStage=-1,az=-22,el=-16,targetAz=-22,targetEl=-16,down=false,oldX=0,oldY=0;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function updateStage(){
   let i=0;
   const zone=document.body.dataset.orbitSection||'accueil';
   if(zone==='accueil'){
     const cinema=document.getElementById('accueil');
     const distance=Math.max(1,cinema.offsetHeight-innerHeight);
     const frac=clamp((window.scrollY-cinema.offsetTop)/distance,0,1);
     i=clamp(Math.floor(frac*4),0,3);
   }else if(zone==='approche') i=1;
   else if(zone==='showcase'||zone==='experience') i=2;
   else i=3;
   const focus=Number(document.body.dataset.skillFocus||0);
   if(focus>0)i=focus;
   if(i===lastStage)return;
   lastStage=i;universe.dataset.stage=String(i);
   stageName.textContent=captions[i];counter.textContent=String(Math.max(1,i)).padStart(2,'0')+' / 03';
   nodes.forEach((n,j)=>n.classList.toggle('is-current',j===Math.max(0,i-1)));
 }
 function step(){
   az+=(targetAz-az)*(reduce?1:.065);el+=(targetEl-el)*(reduce?1:.065);
   world.style.setProperty('--tilt-y',az.toFixed(3)+'deg');
   world.style.setProperty('--tilt-x',el.toFixed(3)+'deg');
   if(!reduce)requestAnimationFrame(step);
 }
 requestAnimationFrame(step);
 universe.addEventListener('pointerdown',e=>{
   if(e.pointerType==='touch'||window.matchMedia('(max-width:650px)').matches)return;
   down=true;oldX=e.clientX;oldY=e.clientY;
   universe.setPointerCapture?.(e.pointerId);
 });
 universe.addEventListener('pointermove',e=>{
   if(window.matchMedia('(max-width:650px)').matches)return;
   if(down){targetAz=clamp(targetAz+(e.clientX-oldX)*.18,-58,58);targetEl=clamp(targetEl-(e.clientY-oldY)*.13,-42,27);oldX=e.clientX;oldY=e.clientY;}
   else if(!reduce){const b=universe.getBoundingClientRect();targetAz=-22+clamp((e.clientX-b.left)/b.width-.5,-.5,.5)*14;targetEl=-16+clamp((e.clientY-b.top)/b.height-.5,-.5,.5)*9;}
 });
 const end=()=>down=false;
 universe.addEventListener('pointerup',end);universe.addEventListener('pointercancel',end);
 universe.addEventListener('pointerleave',()=>{if(!down){targetAz=-22;targetEl=-16;}});
 universe.addEventListener('keydown',e=>{
   if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();targetAz=clamp(targetAz+(e.key==='ArrowLeft'?-15:15),-58,58);}
   if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();targetEl=clamp(targetEl+(e.key==='ArrowUp'?-10:10),-42,27);}
 });
 // The same three competencies connect the 3D system to the visual course catalogue.
 document.querySelectorAll('.course-item').forEach((card,index)=>{
   card.addEventListener('mouseenter',()=>{document.body.dataset.skillFocus=String(index+1);updateStage();});
   card.addEventListener('mouseleave',()=>{delete document.body.dataset.skillFocus;updateStage();});
   card.addEventListener('focus',()=>{document.body.dataset.skillFocus=String(index+1);updateStage();});
   card.addEventListener('blur',()=>{delete document.body.dataset.skillFocus;updateStage();});
 });
 window.addEventListener('scroll',()=>requestAnimationFrame(updateStage),{passive:true});
 window.addEventListener('resize',updateStage,{passive:true});
 updateStage();
 window.__IAgileLearningSystemReady=true;
})();