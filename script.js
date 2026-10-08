/* IAgile CHROME V8 — cinematic spatial storytelling.
   Everything is rendered locally in CSS 3D; no external 3D runtime dependency.
   Lab scenes are transparent, non-generative simulations. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const clamp = (n,lo=0,hi=1) => Math.min(hi,Math.max(lo,n));
  const mix = (a,b,t) => a+(b-a)*t;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(pointer:coarse)').matches;
  const stage = $('#journeyStage');
  const journey = $('#accueil');
  const world = $('#spaceWorld');
  const head = $('#header');
  const rail = $$('.chapter-button');
  const copies = $$('.scene-text');
  const chapters = 4;
  const dest=[-8,-5,7,12];
  const yaw=[-10,-4,-19,9];
  const scale=[1,1.02,.96,.97];
  let progress=0, active=-1, mouseX=0, mouseY=0, currX=0, currY=0, lastScroll=0;
  let animationTick=0;

  function updateScroll(){
    const y=window.scrollY||0;
    lastScroll=y;
    const total=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    $('#scrollProgress').style.width=(clamp(y/total)*100).toFixed(2)+'%';
    head.classList.toggle('is-scrolled',y>80);
    const travel=Math.max(1,journey.offsetHeight-innerHeight);
    progress=clamp((y-journey.offsetTop)/travel);
    const index=Math.min(chapters-1,Math.floor(progress*chapters));
    if(index!==active){
      active=index;document.body.dataset.chapter=String(index);
      copies.forEach((el,i)=>{el.classList.toggle('is-visible',i===index);el.setAttribute('aria-hidden',i===index?'false':'true')});
      rail.forEach((el,i)=>{el.classList.toggle('active',i===index);el.setAttribute('aria-current',i===index?'step':'false')});
      $('#chapterCounter').textContent=String(index+1).padStart(2,'0');
    }
    $('#chapterTrack').style.height=(progress*100).toFixed(1)+'%';
  }
  let scheduled=false;
  window.addEventListener('scroll',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;updateScroll()})},{passive:true});
  window.addEventListener('resize',updateScroll,{passive:true});updateScroll();
  stage.addEventListener('pointermove',e=>{
    if(touch||reduced)return;
    const r=stage.getBoundingClientRect();
    mouseX=clamp((e.clientX-r.left)/r.width-.5,-.5,.5);mouseY=clamp((e.clientY-r.top)/r.height-.5,-.5,.5);
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{mouseX=mouseY=0});
  function animation(){
    const frac=progress*4;
    const i=Math.min(3,Math.floor(frac));
    const t=reduced?0:clamp(frac-i);
    const smooth=t*t*(3-2*t);
    const next=Math.min(3,i+1);
    currX=mix(currX,mouseX,reduced?1:.06);currY=mix(currY,mouseY,reduced?1:.06);
    const x=mix(dest[i],dest[next],smooth)+(reduced?0:currY*7);
    const y=mix(yaw[i],yaw[next],smooth)+(reduced?0:currX*12);
    const s=mix(scale[i],scale[next],smooth);
    world.style.setProperty('--cam-x',x.toFixed(2)+'deg');
    world.style.setProperty('--cam-y',y.toFixed(2)+'deg');
    world.style.setProperty('--cam-ty',(Math.sin(progress*Math.PI*5)*8).toFixed(1)+'px');
    world.style.setProperty('--cam-scale',String(s));
    if(!reduced)animationTick=requestAnimationFrame(animation);
  }
  animation();
  rail.forEach(btn=>btn.addEventListener('click',()=>{
    const n=Number(btn.dataset.gotoStep);
    const destination=journey.offsetTop+(journey.offsetHeight-innerHeight)*((n+.07)/chapters);
    window.scrollTo({top:destination,behavior:reduced?'instant':'smooth'});
  }));

  // The laboratory contains only deterministic, explicitly described simulations.
  const demos={
    web:{title:'Imaginez. Décrivez. Visualisez.',description:'Choisissez un concept : découvrez comment une intention peut devenir une interface visuelle.',presets:['STUDIO CRÉATIF','CAFÉ DESIGN','PORTFOLIO']},
    flow:{title:'Une idée. Un processus. Du temps gagné.',description:'Déclenchez un exemple d’automatisation et suivez le traitement, de l’e-mail au résultat.',presets:['RÉPONDRE','ORGANISER','RÉSUMER']},
    agent:{title:'Votre savoir, toujours accessible.',description:'Visualisez comment un assistant peut organiser l’information et préparer une réponse structurée.',presets:['SYNTHÈSE','PROJET','PRIORITÉS']}
  };
  const webVariants=[
    ['ATELIER STUDIO','L’imagination\nprend forme.','UN UNIVERS CRÉÉ À PARTIR D’UNE IDÉE'],
    ['CAFÉ MÉMOIRE','Un lieu.\nDes histoires.','IDENTITÉ VISUELLE POUR UN CAFÉ'],
    ['PORTFOLIO','Imaginer.\nConstruire.','UNE VITRINE POUR SES PROJETS']
  ];
  const agentVariants=[
    'Voici une synthèse structurée : contexte, trois constats essentiels et recommandations à examiner.',
    'Votre projet peut être découpé en trois étapes : cadrage, expérimentation et amélioration continue.',
    'Priorités suggérées : clarifier l’objectif, valider les ressources disponibles et mesurer les résultats.'
  ];
  let current='web',preset=0,token=0;
  const ws=$('#labWorkspace'),state=$('#demoState'),run=$('#demoRun');
  function selectDemo(mode){
    token++;run.disabled=false;
    current=mode;preset=0;ws.classList.remove('flow-running');ws.dataset.mode=mode;
    $$('.lab-tabs button').forEach(b=>{const on=b.dataset.demo===mode;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',on?'true':'false')});
    $('#demoTitle').textContent=demos[mode].title;$('#demoDescription').textContent=demos[mode].description;
    $('#demoPresets').replaceChildren(...demos[mode].presets.map((s,i)=>{const b=document.createElement('button');b.type='button';b.dataset.preset=String(i);b.className=i===0?'is-selected':'';b.textContent=s;return b}));
    state.textContent='● EXEMPLE VISUEL · SANS IA CONNECTÉE';
    $('#flowState1').textContent='READY';$('#flowState2').textContent='WAITING';$('#flowState3').textContent='WAITING';
    applyPreset();
  }
  function applyPreset(){
    if(current==='web'){
      const data=webVariants[preset];$('#previewTitle').textContent=data[0];$('#previewHeadline').textContent=data[1];$('#previewCaption').textContent=data[2];
      ws.style.setProperty('--preset-hue',String(preset));
    } else if(current==='agent'){$('#agentAnswer').textContent=agentVariants[preset]}
  }
  $$('.lab-tabs button').forEach(b=>b.addEventListener('click',()=>selectDemo(b.dataset.demo)));
  $('#demoPresets').addEventListener('click',e=>{const b=e.target.closest('button[data-preset]');if(!b)return;preset=Number(b.dataset.preset);$$('.demo-presets button').forEach(x=>x.classList.toggle('is-selected',x===b));applyPreset()});
  run.addEventListener('click',()=>{
    const myToken=++token;
    run.disabled=true;
    state.textContent='◉ SIMULATION EN COURS...';
    if(current==='flow'){
      ws.classList.add('flow-running');$('#flowState1').textContent='DONE';$('#flowState2').textContent='PROCESSING';$('#flowState3').textContent='WAITING';
      window.setTimeout(()=>{if(myToken!==token)return;$('#flowState2').textContent='DONE';$('#flowState3').textContent='DONE';state.textContent='✓ SCÉNARIO SIMULÉ · LES 3 ÉTAPES SONT TERMINÉES';run.disabled=false},1100);
    }else{
      if(current==='web'){
        const art=$('.lab-art');art.animate([{filter:'blur(18px) saturate(.4)',transform:'scale(.9)'},{filter:'blur(0) saturate(1)',transform:'scale(1)'}],{duration:950,easing:'cubic-bezier(.19,1,.22,1)'});
      } else $('.lab-agent-answer').animate([{opacity:.15,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:920});
      window.setTimeout(()=>{if(myToken!==token)return;state.textContent='✓ VISUALISATION TERMINÉE · EXEMPLE SIMULÉ';run.disabled=false},950);
    }
  });
  $$('[data-demo-link]').forEach(link=>link.addEventListener('click',()=>selectDemo(link.dataset.demoLink)));

  // Cinematic navigation. Full viewport 3D instead of a persistent side widget.
  const map=$('#worldMap');let previousFocus=null;
  function openMap(){previousFocus=document.activeElement;map.hidden=false;map.classList.remove('is-closing');map.classList.add('is-opening');map.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#closeMap').focus()}
  function closeMap(){map.classList.add('is-closing');map.setAttribute('aria-hidden','true');document.body.style.overflow='';window.setTimeout(()=>{map.hidden=true;map.classList.remove('is-opening','is-closing')},reduced?0:500);previousFocus?.focus?.()}
  $('#openMap').addEventListener('click',openMap);$('#mobileMap').addEventListener('click',()=>{closeMobile();openMap()});$('#closeMap').addEventListener('click',closeMap);
  const sections=['#accueil','#laboratoire','#capacites','#formations'];
  $$('.map-card').forEach(card=>{
    const enter=()=>{const target=sections[Number(card.dataset.map)];closeMap();window.setTimeout(()=>document.querySelector(target)?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'}),reduced?0:310)};
    card.addEventListener('click',enter);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enter()}});
  });
  map.addEventListener('pointermove',e=>{
    if(touch||reduced)return;
    const r=map.getBoundingClientRect();
    map.style.setProperty('--map-x',(-9-((e.clientY-r.top)/r.height-.5)*13).toFixed(1)+'deg');
    map.style.setProperty('--map-y',(-12+((e.clientX-r.left)/r.width-.5)*17).toFixed(1)+'deg');
  });
  map.addEventListener('pointerleave',()=>{map.style.setProperty('--map-x','-9deg');map.style.setProperty('--map-y','-12deg')});
  const mobilePanel=$('#mobilePanel');
  function closeMobile(){mobilePanel.hidden=true;$('#mobileMenu').setAttribute('aria-expanded','false')}
  $('#mobileMenu').addEventListener('click',()=>{mobilePanel.hidden=!mobilePanel.hidden;$('#mobileMenu').setAttribute('aria-expanded',String(!mobilePanel.hidden))});
  $$('#mobilePanel a').forEach(a=>a.addEventListener('click',closeMobile));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!map.hidden)closeMap();else closeMobile()}if(e.key==='Tab'&&!map.hidden){const focusable=[...map.querySelectorAll('button,[role=button]')];const a=focusable[0],b=focusable.at(-1);if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}}});
  // Small protective loader, never block the experience on slow fonts or devices.
  const loader=$('#loader');
  const clearLoader=()=>{loader.classList.add('is-done');window.setTimeout(()=>loader.remove(),750)};
  if(reduced){clearLoader()}else window.setTimeout(clearLoader,1050);
  window.__IAgileVersion='CHROME V8 / SPATIAL STORYTELLING';
  window.__IAgileExperience={journey:true,spatialNavigation:true,labDemos:3,realAIConnected:false};
})();