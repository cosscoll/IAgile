/* IAgile CHROME V7. Fullscreen spatial navigator with keyboard, swipe, wheel and physical CSS-3D depth. */
(() => {
 'use strict';
 const d=document, root=d.getElementById('nwAtlas');
 if(!root)return;
 const $=s=>root.querySelector(s);
 const $$=s=>Array.from(root.querySelectorAll(s));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const points=[
  {label:'DÉCOUVRIR',subtitle:'LE POINT DE DÉPART',href:'#accueil',num:'01'},
  {label:'CRÉER',subtitle:'LE STUDIO DES POSSIBLES',href:'#atelier',num:'02'},
  {label:'ESSAYER',subtitle:'LE LABORATOIRE',href:'#experience',num:'03'},
  {label:'APPRENDRE',subtitle:'LES FORMATIONS',href:'#formations',num:'04'}
 ];
 const cam=$('#nwCamera'),nodes=$$('.nw-node'),enter=$('#nwEnter'),num=$('#nwNumber'),currentTitle=$('#nwCurrentTitle'),beacons=$$('.nw-beacons button');
 let active=0, opened=false, tiltY=0,tiltX=0,dragging=false,dragAtX=0,dragAtY=0,lastWheel=0,returnFocus=null, scrolling=false;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function setActive(n){
  active=(n+points.length)%points.length;
  nodes.forEach((node,i)=>{
    const delta=i-active;
    const mobile=window.innerWidth<731;
    const x=delta*(mobile?175:330);
    const z=-Math.abs(delta)*(mobile?210:250);
    const y=Math.abs(delta)*(mobile?15:42);
    node.style.transform=`translate3d(${x}px,${y}px,${z}px) rotateY(${delta===0?(mobile?-8:-11):delta*(mobile?-21:-24)}deg) rotateX(${delta===0?-3:4}deg) scale(${delta===0?1:.79})`;
    node.style.opacity=Math.abs(delta)>2?.13:Math.abs(delta)>1?.4:1;
    node.dataset.active=String(delta===0);
    node.tabIndex=Math.abs(delta)>1?-1:0;
    node.setAttribute('aria-pressed',String(delta===0));
    node.setAttribute('aria-label',`${points[i].label}${delta===0?', sélectionné':', afficher'}`);
  });
  num.textContent=points[active].num;
  currentTitle.textContent=points[active].subtitle;
  enter.querySelector('span').textContent=`ENTRER : ${points[active].label}`;
  beacons.forEach((b,i)=>{if(i===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
  cam.style.transform=`rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
 }
 function open(){
  if(opened)return;
  returnFocus=d.activeElement;
  opened=true;
  root.dataset.open='true';root.removeAttribute('inert');root.setAttribute('aria-hidden','false');
  d.body.classList.add('nw-locked');d.body.classList.remove('menu-open');
  const old=d.getElementById('mobileMenu');if(old)old.classList.remove('open');
  setActive(0);$('#nwClose').focus({preventScroll:true});
 }
 function close(){
  if(!opened)return;
  opened=false;root.dataset.open='false';root.setAttribute('aria-hidden','true');root.setAttribute('inert','');
  d.body.classList.remove('nw-locked');
  if(returnFocus&&returnFocus.isConnected)returnFocus.focus({preventScroll:true});
 }
 function go(){const dest=points[active].href;close();const target=d.querySelector(dest);if(target){target.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});history.replaceState(null,'',dest);}}
 d.querySelectorAll('[data-nw-open]').forEach(b=>b.addEventListener('click',open));
 $('#nwClose').addEventListener('click',close);
 $('#nwPrev').addEventListener('click',()=>setActive(active-1));
 $('#nwNext').addEventListener('click',()=>setActive(active+1));
 enter.addEventListener('click',go);
 nodes.forEach((n,i)=>n.addEventListener('click',()=>{if(i===active)go();else setActive(i)}));
 beacons.forEach((b,i)=>b.addEventListener('click',()=>setActive(i)));
 root.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();close();}
  if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();setActive(active+1)}
  if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();setActive(active-1)}
  if(e.key==='Enter'&&e.target.classList.contains('nw-node')){e.preventDefault();const i=Number(e.target.dataset.index);i===active?go():setActive(i)}
  if(e.key==='Tab'){
   const focusables=Array.from(root.querySelectorAll('button:not([disabled]):not([tabindex="-1"])')).filter(e=>e.offsetParent!==null);
   if(!focusables.length)return;
   const a=focusables[0],b=focusables[focusables.length-1];
   if(e.shiftKey&&d.activeElement===a){e.preventDefault();b.focus();}
   else if(!e.shiftKey&&d.activeElement===b){e.preventDefault();a.focus();}
  }
 });
 root.addEventListener('wheel',e=>{if(!opened)return;e.preventDefault();const now=performance.now();if(now-lastWheel<520||Math.abs(e.deltaY)<5)return;lastWheel=now;setActive(active+Math.sign(e.deltaY))},{passive:false});
 const stage=$('#nwStage');
 stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dragging=true;dragAtX=e.clientX;dragAtY=e.clientY;stage.setPointerCapture?.(e.pointerId)});
 stage.addEventListener('pointermove',e=>{
  if(dragging)return;
  if(e.pointerType==='touch'||reduced)return;
  const rect=stage.getBoundingClientRect();
  tiltY=clamp(((e.clientX-rect.left)/rect.width-.5)*9,-5,5);
  tiltX=clamp(((e.clientY-rect.top)/rect.height-.5)*-5,-3,3);
  cam.style.transform=`rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
 });
 function release(e){if(!dragging)return;dragging=false;const dx=e.clientX-dragAtX,dy=e.clientY-dragAtY;if(Math.abs(dx)>50||Math.abs(dy)>100)setActive(active+(Math.abs(dx)>Math.abs(dy)?(dx<0?1:-1):(dy<0?1:-1)));}
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',()=>dragging=false);
 stage.addEventListener('pointerleave',()=>{if(!dragging){tiltX=0;tiltY=0;cam.style.transform='rotateX(0deg) rotateY(0deg)'}});
 window.__IAgileSpatialNavigation={ready:true,version:7,sections:points.length,accessible:true,real3D:'CSS preserve-3d with multiple physical planes'};
 setActive(0);
})();