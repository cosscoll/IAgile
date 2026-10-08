/* IAgile CHROME / Immersive experience — no third-party JS dependency */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer:coarse)').matches;
  const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
  const lerp = (a,b,t) => a+(b-a)*t;
  let chapter=0, cinemaProgress=0, scrollY=0;
  let mouseX=0,mouseY=0,dragX=0,dragY=0;
  let scrollQueued=false;
  const cinema=$('.cinema'), stages=$$('.stage'), chapterCurrent=$('#chapterCurrent');

  // The entire introduction is a three-chapter pinned cinematic scroll scene.
  function renderScroll(){
    scrollQueued=false;
    scrollY=window.scrollY;
    const top=cinema.getBoundingClientRect().top;
    const available=cinema.offsetHeight-window.innerHeight;
    cinemaProgress=clamp(-top/Math.max(1,available),0,1);
    const current=cinemaProgress<.34?0:cinemaProgress<.69?1:2;
    if(current!==chapter){
      chapter=current;
      stages.forEach((el,i)=>{
        el.classList.toggle('is-active',i===chapter);
        el.setAttribute('aria-hidden',String(i!==chapter));
      });
      chapterCurrent.textContent=String(chapter+1).padStart(2,'0');
    }
    // Camera and background movement are tied continuously to scroll progress.
    $('#cinemaSticky').style.setProperty('--chapter-progress',cinemaProgress.toFixed(4));
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const percent=Math.round(scrollY/max*100);
    $('#scrollMeterProgress').style.height=percent+'%';
    $('#scrollPercent').textContent=String(percent).padStart(2,'0')+'%';
    $('#header').classList.toggle('scrolled',scrollY>55);
    // A subtle independent parallax layer makes the grid feel separate from the scene.
    $('.cinema-grid').style.transform=`translate3d(0,${cinemaProgress*-37}px,0) scale(${(1+cinemaProgress*.14).toFixed(3)})`;
  }
  const requestScroll=()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(renderScroll)}};
  window.addEventListener('scroll',requestScroll,{passive:true});
  window.addEventListener('resize',requestScroll,{passive:true});
  renderScroll();

  // Staggered text reveals — each word animates separately as it enters the viewport.
  function splitWords(root){
    function visit(node){
      if(node.nodeType===Node.TEXT_NODE){
        const text=node.textContent;
        if(!text.trim())return;
        const fragment=document.createDocumentFragment();
        for(const part of text.split(/(\s+)/)){
          if(!part)continue;
          if(/^\s+$/.test(part)){fragment.appendChild(document.createTextNode(part));continue}
          const wrapper=document.createElement('span'),inner=document.createElement('span');
          wrapper.className='word';inner.className='word-inner';inner.textContent=part;
          wrapper.appendChild(inner);fragment.appendChild(wrapper);
        }
        node.replaceWith(fragment);
      } else if(node.nodeType===Node.ELEMENT_NODE) {
        [...node.childNodes].forEach(visit);
      }
    }
    [...root.childNodes].forEach(visit);
  }
  $$('.kinetic-text').forEach(splitWords);
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('visible','words-visible');
        observer.unobserve(entry.target);
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:.06});
    $$('.reveal,.kinetic-text').forEach(el=>observer.observe(el));
  }else{$$('.reveal,.kinetic-text').forEach(el=>el.classList.add('visible','words-visible'))}

  const cursor=$('#cursorRing');
  if(!coarse){
    document.addEventListener('pointermove',e=>{
      mouseX=e.clientX/innerWidth*2-1;mouseY=1-e.clientY/innerHeight*2;
      cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';cursor.style.opacity='1';
    },{passive:true});
    $$('a,button,.lab-card').forEach(el=>{
      el.addEventListener('pointerenter',()=>cursor.classList.add('active'));
      el.addEventListener('pointerleave',()=>cursor.classList.remove('active'));
    });
    $$('[data-tilt]').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        if(reduced)return;
        const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(950px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
  }

  // Navigation wipes, not simple jumps.
  const transition=$('#transitionScreen');
  let changing=false;
  $$('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',e=>{
      const target=$(link.getAttribute('href'));
      if(!target)return;
      e.preventDefault();
      $('#mobileNav').classList.remove('open');
      $('#menuButton').setAttribute('aria-expanded','false');
      if(changing||reduced){target.scrollIntoView({behavior:reduced?'auto':'smooth'});return}
      changing=true;transition.classList.add('on');
      setTimeout(()=>{
        target.scrollIntoView({behavior:'instant',block:'start'});
        history.replaceState(null,'',link.getAttribute('href'));
        transition.classList.remove('on');
        setTimeout(()=>changing=false,850);
      },650);
    });
  });
  $('#menuButton').addEventListener('click',()=>{
    const nav=$('#mobileNav');nav.classList.toggle('open');
    $('#menuButton').setAttribute('aria-expanded',String(nav.classList.contains('open')));
  });

  // Training catalogue, selection drawer and course detail modal are interactive demos.
  const courses={
    fondamentaux:{tag:'01 / INITIATION',title:"LES FONDAMENTAUX DE L'IA.",description:"Découvrez les principes essentiels de l'intelligence artificielle, ses possibilités et ses limites, puis familiarisez-vous avec les premiers usages."},
    productivite:{tag:'02 / PRATIQUE',title:"L'IA AU SERVICE DE VOTRE TEMPS.",description:"Explorez des méthodes concrètes pour utiliser l'IA au travail, structurer vos demandes et intégrer les outils dans un flux de travail."},
    strategie:{tag:'03 / VISION',title:"PENSER PLUS LOIN AVEC L'IA.",description:"Découvrez comment identifier des opportunités, concevoir des usages adaptés et intégrer l'IA à vos projets avec discernement."}
  };
  let selection=[];
  try{selection=JSON.parse(localStorage.getItem('iagile-chrome-cart')||'[]').filter(id=>courses[id])}catch(e){}
  let selectedId='fondamentaux';
  const overlay=$('#overlay'),drawer=$('#drawer'),modal=$('#courseModal');
  const formatCount=n=>String(n).padStart(2,'0');
  function renderSelection(){
    $('#cartCount').textContent=formatCount(selection.length);
    $('#drawerCount').textContent='('+formatCount(selection.length)+')';
    $('#drawerItems').innerHTML=selection.length?selection.map(id=>`<div class="selection-item"><strong>${courses[id].title}</strong><button data-remove="${id}" aria-label="Retirer de la sélection">×</button></div>`).join(''):'<p class="drawer-empty">Votre sélection est vide.<br>Le prochain pas commence ici.</p>';
    try{localStorage.setItem('iagile-chrome-cart',JSON.stringify(selection))}catch(e){}
  }
  function closePanels(){
    overlay.hidden=true;drawer.classList.remove('open');modal.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  function openPanel(element){
    closePanels();overlay.hidden=false;element.classList.add('open');element.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    element.querySelector('button')?.focus();
  }
  function openCourse(id){if(!courses[id])return;selectedId=id;
    $('#modalType').textContent=courses[id].tag;
    $('#modalTitle').textContent=courses[id].title;
    $('#modalDescription').textContent=courses[id].description;
    $('#modalAdd').firstChild.textContent=selection.includes(id)?'DÉJÀ DANS MA SÉLECTION ':'AJOUTER À MA SÉLECTION ';
    openPanel(modal);
  }
  $$('.course-open').forEach(button=>button.addEventListener('click',()=>openCourse(button.dataset.detail)));
  $$('.filter').forEach(button=>button.addEventListener('click',()=>{
    $$('.filter').forEach(b=>b.classList.toggle('active',b===button));
    $$('.course-row').forEach(row=>row.classList.toggle('filtered',button.dataset.filter!=='all'&&row.dataset.category!==button.dataset.filter));
  }));
  $('#modalAdd').addEventListener('click',()=>{
    if(!selection.includes(selectedId))selection.push(selectedId);
    renderSelection();openPanel(drawer);
  });
  $('#cartTrigger').addEventListener('click',()=>{renderSelection();openPanel(drawer)});
  $('#drawerItems').addEventListener('click',e=>{
    const button=e.target.closest('[data-remove]');
    if(button){selection=selection.filter(id=>id!==button.dataset.remove);renderSelection()}
  });
  $('#drawerExplore').addEventListener('click',()=>closePanels());
  $('#drawerClose').addEventListener('click',closePanels);
  $('#modalClose').addEventListener('click',closePanels);
  overlay.addEventListener('click',closePanels);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanels()});
  renderSelection();

  // Physically rotating 3D knot geometry with chrome studio reflections.
  // Native WebGL with no external JavaScript dependencies.
  function startChromeScene(){
    const canvas=$('#chrome3d');
    const modeButton=$('#sceneMode');
    let hologram=false;
    modeButton.addEventListener('click',()=>{
      hologram=!hologram;
      modeButton.setAttribute('aria-pressed',String(hologram));
      modeButton.textContent=hologram?'◇ MODE CHROME':'◇ MODE HOLOGRAMME';
      modeButton.setAttribute('aria-label',hologram?'Revenir au matériau chromé':'Activer le mode hologramme pour la sculpture 3D');
    });
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:false,powerPreference:'default'});
    if(!gl){document.body.classList.add('no-webgl');modeButton.disabled=true;modeButton.textContent='◇ APERÇU STATIQUE';return}
    const vert=`
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform float uAspect,uTime,uScroll,uMobile;
uniform vec2 uMouse,uDrag;
varying vec3 vNormal;
varying vec3 vWorld;
mat3 rx(float a){float s=sin(a),c=cos(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
mat3 ry(float a){float s=sin(a),c=cos(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rz(float a){float s=sin(a),c=cos(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
void main(){
  mat3 rotation=ry(.42+uTime*.12+uScroll*4.1+uDrag.x*.6+uMouse.x*.09)*rx(-.20+sin(uTime*.16)*.13+uScroll*1.5+uDrag.y*.6)*rz(.38+uScroll*.8);
  float scale=mix(1.,1.15,smoothstep(.0,1.,uScroll));
  vec3 p=rotation*aPosition*scale;
  p.xy+=mix(vec2(1.35,.02),vec2(0.,-.70),uMobile);
  p.z-=5.3;
  vWorld=p;
  vNormal=normalize(rotation*aNormal);
  float depth=max(1.,-p.z);
  gl_Position=vec4(p.x*4.0/uAspect,p.y*4.0,(depth-1.)*.9,depth);
}`;
    const frag=`
precision mediump float;
uniform float uTime,uMode;
varying vec3 vNormal;
varying vec3 vWorld;
void main(){
  vec3 n=normalize(vNormal);
  vec3 view=normalize(-vWorld);
  vec3 refl=reflect(-view,n);
  float edge=pow(1.-max(dot(n,view),0.),2.3);
  float upper=smoothstep(-.64,.74,refl.y);
  float darkStrip=smoothstep(.13,.27,refl.x)-smoothstep(.40,.58,refl.x);
  float whiteStrip=pow(max(dot(refl,normalize(vec3(-.72,.66,.64))),0.),21.);
  float whiteStrip2=pow(max(dot(refl,normalize(vec3(.85,.3,.40))),0.),38.);
  float rim=pow(max(dot(refl,normalize(vec3(.12,-.82,.54))),0.),11.);
  vec3 metal=mix(vec3(.045,.058,.09),vec3(.70,.78,.91),upper);
  metal+=vec3(1.0,1.08,1.14)*(whiteStrip*1.2+whiteStrip2*.9);
  metal+=vec3(.29,.40,.71)*rim;
  metal-=vec3(.33,.38,.42)*darkStrip;
  metal+=vec3(.21,.37,.80)*edge*.64;
  metal+=vec3(.57,.67,.88)*pow(max(dot(n,normalize(vec3(-.55,1.0,.86))),0.),7.)*.25;
  metal=max(metal,vec3(.016,.02,.03));
  metal=metal/(1.+metal*.37);
  metal=pow(metal,vec3(.83));
  float holoScan=pow(.5+.5*sin(vWorld.y*34.0-uTime*4.0),12.0);
  vec3 holo=vec3(.035,.25,.67)+vec3(.10,.48,.95)*edge*2.2+vec3(.15,.55,.78)*holoScan*.85;
  vec3 color=mix(metal,holo,uMode);
  gl_FragColor=vec4(color,1.);
}`;
    function shader(type,source){
      const item=gl.createShader(type);gl.shaderSource(item,source);gl.compileShader(item);
      if(!gl.getShaderParameter(item,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(item));
      return item;
    }
    function point(u){
      const p=2,q=3,angle=u,twist=q/p*u;
      return [(2+Math.cos(twist))*.55*Math.cos(angle),(2+Math.cos(twist))*.55*Math.sin(angle),Math.sin(twist)*.62];
    }
    function norm(v){const d=Math.hypot(...v)||1;return v.map(x=>x/d)}
    function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
    function makeKnot(){
      const rings=280,sides=28,tube=.28,vertices=[],indices=[];
      for(let i=0;i<=rings;i++){
        const u=i/rings*Math.PI*4;
        const center=point(u),ahead=point(u+.012),back=point(u-.012);
        const tangent=norm(ahead.map((x,k)=>x-back[k]));
        const arbitrary=Math.abs(tangent[2])<.9?[0,0,1]:[0,1,0];
        const n=norm(cross(tangent,arbitrary)),b=norm(cross(tangent,n));
        for(let j=0;j<=sides;j++){
          const a=j/sides*Math.PI*2;
          const normal=n.map((v,k)=>v*Math.cos(a)+b[k]*Math.sin(a));
          const p=center.map((v,k)=>v+normal[k]*tube);
          vertices.push(...p,...normal);
        }
      }
      for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){
        const x=i*(sides+1)+j,y=x+sides+1;
        indices.push(x,y,x+1,y,y+1,x+1);
      }
      return {vertices:new Float32Array(vertices),indices:new Uint16Array(indices)};
    }
    try{
      const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vert));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      const model=makeKnot();
      const data=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,data);gl.bufferData(gl.ARRAY_BUFFER,model.vertices,gl.STATIC_DRAW);
      const indices=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,model.indices,gl.STATIC_DRAW);
      for(const [name,offset] of [['aPosition',0],['aNormal',12]]){
        const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,24,offset);
      }
      const uni={};['uAspect','uTime','uScroll','uMobile','uMouse','uDrag','uMode'].forEach(name=>uni[name]=gl.getUniformLocation(program,name));
      gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
      const size={width:0,height:0};let raf=0,dragging=false,lastX=0,lastY=0,inView=true,lastDraw=0;
      function resize(){
        const box=canvas.getBoundingClientRect();
        const dpr=Math.min(window.devicePixelRatio||1,coarse?1:1.4);
        const w=Math.round(box.width*dpr),h=Math.round(box.height*dpr);
        if(w!==size.width||h!==size.height){canvas.width=w;canvas.height=h;size.width=w;size.height=h;gl.viewport(0,0,w,h)}
      }
      window.addEventListener('resize',resize,{passive:true});resize();
      canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
      canvas.addEventListener('pointermove',e=>{
        if(!dragging)return;
        dragX+=(e.clientX-lastX)/150;dragY+=(e.clientY-lastY)/150;lastX=e.clientX;lastY=e.clientY;
      });
      ['pointerup','pointercancel','lostpointercapture'].forEach(k=>canvas.addEventListener(k,()=>dragging=false));
      if('IntersectionObserver' in window){new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting??true},{threshold:0}).observe(cinema)}
      let renderCount=0;
      function draw(timestamp){
        raf=requestAnimationFrame(draw);
        if(!inView||document.hidden||(!reduced&&timestamp-lastDraw<(coarse?33:16)))return;
        if(reduced&&renderCount>0)return;
        lastDraw=timestamp;renderCount++;
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.uniform1f(uni.uAspect,size.width/Math.max(1,size.height));
        gl.uniform1f(uni.uTime,reduced?0:timestamp*.001);
        gl.uniform1f(uni.uScroll,cinemaProgress);
        gl.uniform1f(uni.uMode,hologram?1:0);
        gl.uniform1f(uni.uMobile,innerWidth<700?1:0);
        gl.uniform2f(uni.uMouse,mouseX,mouseY);
        gl.uniform2f(uni.uDrag,dragX,dragY);
        gl.drawElements(gl.TRIANGLES,model.indices.length,gl.UNSIGNED_SHORT,0);
      }
      raf=requestAnimationFrame(draw);
      canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);document.body.classList.add('no-webgl')});
      window.addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});
      document.documentElement.dataset.renderEngine='webgl-mesh-3d';
    }catch(e){console.warn('IAgile WebGL fallback:',e);document.body.classList.add('no-webgl');modeButton.disabled=true;modeButton.textContent='◇ APERÇU STATIQUE'}
  }
  startChromeScene();
  setTimeout(()=>$('#preloader').classList.add('done'),1100);
})();