/* IAgile® CHROME V3 — self-contained ray-marched WebGL sculpture + interaction design.
   No external runtime dependencies. All simulated prompt examples are explicitly labelled. */
(() => {
  'use strict';
  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => [...root.querySelectorAll(s)];
  const clamp = (v,lo=0,hi=1) => Math.min(hi,Math.max(lo,v));
  const lerp = (a,b,t) => a + (b-a)*t;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width:650px)').matches;
  const coarse = matchMedia('(pointer:coarse)').matches;
  const cinema = $('#accueil');
  const pin = $('#cinemaPin');
  const canvas = $('#threeCanvas');
  const threeArea = $('#threeArea');
  const scenes = $$('.scene-copy');
  const header = $('#siteHeader');
  let scrollProgress = 0, chapter = 0, sceneChange = -1;
  let mouseX = 0, mouseY = 0, dragX=0, dragY=0, targetDragX=0, targetDragY=0, modelMode=0;
  let dragging = false, startX=0, startY=0, lastX=0, lastY=0;
  let previousFocus = null;
  const loader = $('#loader');
  let loaderDone=false;

  function dismissLoader() {
    if(loaderDone) return;
    loaderDone=true;
    loader.classList.add('done');
    window.setTimeout(()=>loader.remove(),1200);
  }
  window.setTimeout(dismissLoader,1350);
  if(document.readyState==='complete')window.setTimeout(dismissLoader,450);
  else window.addEventListener('load',()=>window.setTimeout(dismissLoader,350),{once:true});

  function updateScroll() {
    const s = window.scrollY;
    const full = document.documentElement.scrollHeight - innerHeight;
    $('#pageProgress').style.width = (full>0 ? 100*s/full : 0).toFixed(2)+'%';
    header.classList.toggle('scrolled',s>45);
    const track = Math.max(1, cinema.offsetHeight-innerHeight);
    scrollProgress = clamp((s-cinema.offsetTop)/track);
    let next = Math.min(3,Math.floor(scrollProgress*4));
    if(scrollProgress>.98)next=3;
    if(chapter!==next) {
      chapter=next;
      scenes.forEach((node,index)=>{
        node.classList.toggle('active',index===chapter);
        node.classList.toggle('leaving',index<chapter);
        node.setAttribute('aria-hidden',String(index!==chapter));
        node.querySelectorAll('a').forEach(a=>a.tabIndex=index===chapter?0:-1);
      });
      $('#chapterNumber').textContent=String(next+1).padStart(2,'0');
    }
    $('#cinemaAura').style.transform=`translate3d(${scrollProgress*7}vw,${scrollProgress*-13}vh,0)`;
    const feature=$('#showcase');
    const rect=feature.getBoundingClientRect();
    if(rect.bottom>0 && rect.top<innerHeight){
      let f=clamp((innerHeight-rect.top)/(innerHeight+rect.height));
      const b=$('.feature-sphere');
      if(b)b.style.transform=`translate(-50%,-50%) scale(${lerp(.83,1.17,f)}) rotate(${lerp(-18,38,f)}deg)`;
      const text=$('#featureText');
      if(text)text.style.transform=`translateY(${lerp(40,-40,f)}px)`;
    }
  }
  let queued=false;
  window.addEventListener('scroll',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;updateScroll();});},{passive:true});
  window.addEventListener('resize',updateScroll,{passive:true});
  updateScroll();

  // WEBGL: Actual 3D triangle meshes, dynamic camera projection, studio environment
  // reflections, interactive 360° rotation, morphing chapters and GPU particles.
  // We build our own meshes without a CDN, so the sculpture doesn't disappear if
  // a third-party library is blocked or still loading.
  const vert=`attribute vec3 aPosition;attribute vec3 aNormal;
  uniform vec2 uResolution; uniform vec2 uRotate;uniform float uTime;uniform float uScroll;
  uniform float uGroup;varying vec3 vNormal;varying vec3 vWorld;varying float vDepth;
  mat3 rX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
  mat3 rY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
  mat3 rZ(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
  void main(){
    float scroll=uScroll;
    mat3 turn =rY(uRotate.x+uTime*.22+scroll*3.5)*rX(uRotate.y+sin(uTime*.26)*.09+scroll*1.8);
    float ringRot=uGroup==1.?1.1+scroll*1.35:uGroup==2.?-1.04-scroll*1.5:0.;
    mat3 local=rZ(ringRot)*rX(uGroup==1.?.6:uGroup==2.?1.25:0.);
    float scale=uGroup==1.?1.02:uGroup==2.?.83:1.;
    vec3 pos=turn*(local*aPosition*scale);
    vec3 nor=normalize(turn*local*aNormal);
    if(uGroup==3.){pos*=.95+scroll*.12;}
    float z=5.5-pos.z;
    gl_Position=vec4(pos.x*2.9/(uResolution.x/uResolution.y),pos.y*2.9,(z-1.2)*.62,z);
    vNormal=nor;vWorld=pos;vDepth=z;
  }`;
  const frag=`precision highp float;
  uniform float uTime;uniform float uMode;uniform float uGroup;uniform float uScroll;
  varying vec3 vNormal;varying vec3 vWorld;varying float vDepth;
  vec3 env(vec3 r){
    float strip1=1.-smoothstep(.08,.22,abs(r.x+.48));
    float strip2=1.-smoothstep(.06,.15,abs(r.x-.3));
    float strip3=1.-smoothstep(.18,.38,abs(r.y-.82));
    vec3 base=mix(vec3(.018,.035,.07),vec3(.38,.52,.69),smoothstep(-.65,.9,r.y));
    base+=vec3(1.15,1.28,1.50)*strip1*.81;
    base+=vec3(1.25,1.42,1.65)*strip2*.69;
    base+=vec3(.48,.63,.91)*strip3*.74;
    base+=vec3(.09,.13,.22)*pow(max(0.,dot(r,normalize(vec3(.4,.68,.3)))),6.);
    return base;
  }
  void main(){
    vec3 n=normalize(vNormal);
    vec3 toEye=normalize(vec3(0.,0.,5.5)-vWorld);
    float facing=max(0.,dot(n,toEye));
    vec3 r=reflect(-toEye,n);
    vec3 top=normalize(vec3(-.49,.8,.5)),side=normalize(vec3(.83,.12,.4));
    float glow=pow(max(0.,dot(r,top)),38.);
    float glow2=pow(max(0.,dot(r,side)),66.);
    float fresnel=pow(1.-facing,2.0);
    vec3 metal=env(r)*(.78+max(dot(n,top),0.)*.23);
    metal+=vec3(1.5,1.66,1.9)*glow*.9+vec3(.55,.83,1.4)*glow2*.9;
    metal+=vec3(.2,.38,.75)*fresnel;
    metal*=uGroup==1.?.95:uGroup==2.?.82:1.12;
    vec3 xray=vec3(.015,.10,.22)+fresnel*vec3(.13,.62,1.4)+glow2*vec3(.2,.7,1.8);
    xray+=vec3(.08,.28,.6)*(.5+.5*sin(vWorld.y*38.+uTime*1.5));
    vec3 color=mix(metal,xray,uMode);
    color=mix(color,vec3(.27,.58,1.),.11*uScroll);
    color=color/(color+vec3(.36));
    color=pow(color,vec3(.82));
    gl_FragColor=vec4(color,1.);
  }`;
  const particleVert=`attribute vec3 aPosition;attribute float aSize;
    uniform vec2 uResolution;uniform vec2 uRotate;uniform float uTime;uniform float uScroll;
    varying float vAlpha;mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
    mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
    void main(){vec3 p=ry(uRotate.x+uTime*.16+uScroll*2.)*rx(uRotate.y+uScroll)*aPosition;
      p*=1.+uScroll*.18;float z=5.5-p.z;
      gl_Position=vec4(p.x*2.9/(uResolution.x/uResolution.y),p.y*2.9,(z-1.2)*.62,z);
      gl_PointSize=aSize*(6.3/z);vAlpha=.4+.6*(.5+.5*sin(uTime*1.1+aPosition.x*10.));}`;
  const particleFrag=`precision mediump float;varying float vAlpha;void main(){float dist=length(gl_PointCoord-.5);float a=smoothstep(.5,.08,dist)*vAlpha;gl_FragColor=vec4(.55,.73,1.,a);}`;
  const shaderState={gl:null,program:null,particleProgram:null,uniforms:null,playing:false,failed:false,start:performance.now(),frames:0,meshes:[],particles:null};
  function createTubePath(pointFn,segments=180,sides=16,radius=.18){
    const vertices=[],normals=[],indices=[];
    const getTangent=t=>{
      const d=.002,p=pointFn(t+d),q=pointFn(t-d);
      const v=[p[0]-q[0],p[1]-q[1],p[2]-q[2]];
      const l=Math.hypot(...v)||1;return v.map(x=>x/l);
    };
    const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const unit=a=>{let l=Math.hypot(...a)||1;return a.map(x=>x/l);};
    for(let i=0;i<=segments;i++){
      const t=i/segments*Math.PI*2, p=pointFn(t), tan=getTangent(t);
      let ref=Math.abs(tan[2])>.88?[0,1,0]:[0,0,1];
      const n=unit(cross(tan,ref)),b=unit(cross(tan,n));
      for(let j=0;j<=sides;j++){
        const a=j/sides*Math.PI*2, cs=Math.cos(a), sn=Math.sin(a);
        const nor=[n[0]*cs+b[0]*sn,n[1]*cs+b[1]*sn,n[2]*cs+b[2]*sn];
        const w=radius*(1+.07*Math.sin(t*12));
        vertices.push(...p.map((v,k)=>v+nor[k]*w));
        normals.push(...nor);
      }
    }
    for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){
      const a=i*(sides+1)+j,b=(i+1)*(sides+1)+j;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
    return {vertices:new Float32Array(vertices),normals:new Float32Array(normals),indices:new Uint16Array(indices)};
  }
  function createSphere(lat=38,lon=48,radius=.55){
    const vertices=[],normals=[],indices=[];
    for(let y=0;y<=lat;y++)for(let x=0;x<=lon;x++){
      const theta=y/lat*Math.PI,phi=x/lon*Math.PI*2;
      const nx=Math.sin(theta)*Math.cos(phi),ny=Math.cos(theta),nz=Math.sin(theta)*Math.sin(phi);
      const bump=1+.055*Math.sin(phi*9+theta*7)*Math.sin(theta*12);
      vertices.push(nx*radius*bump,ny*radius*bump,nz*radius*bump);normals.push(nx,ny,nz);
    }
    for(let y=0;y<lat;y++)for(let x=0;x<lon;x++){
      const a=y*(lon+1)+x,b=a+lon+1;indices.push(a,b,a+1,b,b+1,a+1);
    }
    return {vertices:new Float32Array(vertices),normals:new Float32Array(normals),indices:new Uint16Array(indices)};
  }
  function makeProgram(gl,vsrc,fsrc){
    function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);
      if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
    const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vsrc));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fsrc));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));return program;
  }
  function makeBuffer(gl,data,target=gl.ARRAY_BUFFER){const buf=gl.createBuffer();gl.bindBuffer(target,buf);gl.bufferData(target,data,gl.STATIC_DRAW);return buf;}
  function initWebGL(){
    let gl;
    try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance'})||canvas.getContext('experimental-webgl');}catch(e){}
    if(!gl){showFallback();return;}
    try{
      const program=makeProgram(gl,vert,frag),particleProgram=makeProgram(gl,particleVert,particleFrag);
      const knot=t=>{let x=(1.0+.35*Math.cos(3*t))*Math.cos(2*t),y=(1.0+.35*Math.cos(3*t))*Math.sin(2*t),z=.48*Math.sin(3*t);return [x,y,z];};
      const ring=t=>[1.45*Math.cos(t),1.45*Math.sin(t),0.];
      const meshes=[createTubePath(knot,250,20,.18),createTubePath(ring,160,12,.095),createTubePath(ring,160,12,.065),createSphere(40,56,.59)];
      const buffers=meshes.map((m,i)=>({pos:makeBuffer(gl,m.vertices),nor:makeBuffer(gl,m.normals),idx:makeBuffer(gl,m.indices,gl.ELEMENT_ARRAY_BUFFER),len:m.indices.length,group:i}));
      let points=[];
      let seed=827;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
      for(let i=0;i<520;i++){
        const theta=Math.acos(2*rand()-1),phi=rand()*6.283185,r=1.8+rand()*.7;
        points.push(Math.sin(theta)*Math.cos(phi)*r,Math.cos(theta)*r,Math.sin(theta)*Math.sin(phi)*r,1.+rand()*3.3);
      }
      const pointsBuffer=makeBuffer(gl,new Float32Array(points));
      const uniforms={};for(const n of ['uResolution','uTime','uScroll','uRotate','uMode','uGroup'])uniforms[n]=gl.getUniformLocation(program,n);
      const particleUniforms={};for(const n of ['uResolution','uTime','uScroll','uRotate'])particleUniforms[n]=gl.getUniformLocation(particleProgram,n);
      shaderState.gl=gl;shaderState.program=program;shaderState.particleProgram=particleProgram;shaderState.uniforms=uniforms;
      shaderState.particleUniforms=particleUniforms;shaderState.meshes=buffers;shaderState.particles={buffer:pointsBuffer,count:points.length/4};shaderState.playing=true;
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
      resizeGL();renderGL(performance.now());
    }catch(err){console.warn('Chrome 3D renderer unavailable:',err);showFallback();}
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();shaderState.playing=false;showFallback();});
    canvas.addEventListener('webglcontextrestored',()=>{shaderState.failed=false;initWebGL();});
  }
  let canvas3DPlaying=false;
  let canvas3dCtx=null;
  let fallbackMeshes=[];
  let fallbackParticles=[];
  function showFallback(){
    shaderState.failed=true;
    if(canvas3DPlaying)return;
    try { canvas3dCtx=canvas.getContext('2d',{alpha:true}); } catch(e){}
    if(!canvas3dCtx){$('#webglFallback').classList.add('show');return;}
    $('.engine-indicator').innerHTML='<i></i> LIVE CANVAS / 3D';
    threeArea.classList.add('ready','fallback-3d');
    // Generate the same parametric 3D geometry for a WebGL-free software renderer.
    const knot=t=>[(1+.35*Math.cos(3*t))*Math.cos(2*t),(1+.35*Math.cos(3*t))*Math.sin(2*t),.48*Math.sin(3*t)];
    const ring=t=>[1.45*Math.cos(t),1.45*Math.sin(t),0];
    fallbackMeshes=[createTubePath(knot,132,11,.19),createTubePath(ring,86,9,.095),createTubePath(ring,86,9,.065),createSphere(24,32,.58)];
    let seed=479127;
    const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<190;i++){const a=rand()*Math.PI*2,u=2*rand()-1,r=1.83+rand()*.77,s=Math.sqrt(1-u*u);fallbackParticles.push([r*s*Math.cos(a),r*u,r*s*Math.sin(a),rand()]);}
    function sizeCanvas3d(){
      const rect=threeArea.getBoundingClientRect();const scale=small?.8:1;
      canvas.width=Math.max(1,Math.floor(rect.width*scale));canvas.height=Math.max(1,Math.floor(rect.height*scale));
    }
    sizeCanvas3d();window.addEventListener('resize',sizeCanvas3d,{passive:true});
    canvas3DPlaying=true;
    let lastFrame=0;
    function drawFallback(now){
      if(!canvas3DPlaying)return;
      requestAnimationFrame(drawFallback);
      if(document.hidden||cinema.getBoundingClientRect().bottom<0||cinema.getBoundingClientRect().top>innerHeight)return;
      if(now-lastFrame<48)return;lastFrame=now;
      const ctx=canvas3dCtx,w=canvas.width,h=canvas.height,aspect=w/h;
      if(!w||!h)return;
      dragX=lerp(dragX,targetDragX+(coarse?0:mouseX*.18),.12);
      dragY=lerp(dragY,targetDragY+(coarse?0:mouseY*.13),.12);
      const time=reduced?0:(now-shaderState.start)/1000;
      const ay=dragX+time*.22+scrollProgress*3.5,ax=dragY+Math.sin(time*.26)*.09+scrollProgress*1.8;
      const cx=Math.cos(ax),sx=Math.sin(ax),cy=Math.cos(ay),sy=Math.sin(ay);
      const rz=(p,a)=>{let c=Math.cos(a),s=Math.sin(a);return [p[0]*c-p[1]*s,p[0]*s+p[1]*c,p[2]];};
      const rx=(p,a)=>{let c=Math.cos(a),s=Math.sin(a);return [p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c];};
      const trans=(p,g)=>{
        if(g===1)p=rx(rz(p,1.1+scrollProgress*1.35),.6);
        if(g===2)p=rx(rz(p,-1.04-scrollProgress*1.5),1.25);
        const sc=g===1?1.02:g===2?.83:1;
        const x=p[0]*sc,y=p[1]*sc,z=p[2]*sc;
        const xt=x*cy+z*sy,zt=-x*sy+z*cy;
        return [xt,y*cx-zt*sx,y*sx+zt*cx];
      };
      const project=p=>{const depth=5.5-p[2], k=2.9/depth;return [w/2+p[0]*k*h/2,h/2-p[1]*k*h/2,depth];};
      ctx.clearRect(0,0,w,h);
      // Add the soft, blue spatial glow behind the 3D sculpture.
      const radius=Math.min(w,h)*.45,glow=ctx.createRadialGradient(w/2,h/2,8,w/2,h/2,radius);
      glow.addColorStop(0,'rgba(77,117,190,.1)');glow.addColorStop(.55,'rgba(59,94,154,.075)');glow.addColorStop(1,'rgba(20,46,92,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
      // Tiny space particles with genuine depth/perspective movement.
      for(let i=0;i<fallbackParticles.length;i++){
        const point=trans(fallbackParticles[i],0),pr=project(point);
        let size=(1+fallbackParticles[i][3]*1.2)*5.5/pr[2];
        ctx.fillStyle=`rgba(173,205,255,${.3+fallbackParticles[i][3]*.45})`;
        ctx.fillRect(pr[0],pr[1],size,size);
      }
      const tris=[];
      fallbackMeshes.forEach((mesh,g)=>{
        const projected=[],world=[],normal=[];
        for(let i=0;i<mesh.vertices.length;i+=3){
          const xyz=trans([mesh.vertices[i],mesh.vertices[i+1],mesh.vertices[i+2]],g);
          world.push(xyz);projected.push(project(xyz));
          normal.push(trans([mesh.normals[i],mesh.normals[i+1],mesh.normals[i+2]],g));
        }
        for(let i=0;i<mesh.indices.length;i+=3){
          const a=mesh.indices[i],b=mesh.indices[i+1],c=mesh.indices[i+2];
          const p=projected[a],q=projected[b],r=projected[c];
          // Skip triangles behind the camera or degenerate slivers.
          if(p[2]<.8||q[2]<.8||r[2]<.8)continue;
          const n=[(normal[a][0]+normal[b][0]+normal[c][0])/3,(normal[a][1]+normal[b][1]+normal[c][1])/3,(normal[a][2]+normal[b][2]+normal[c][2])/3];
          const ni=Math.hypot(...n)||1;n[0]/=ni;n[1]/=ni;n[2]/=ni;
          const rx=-2*n[2]*n[0],ry=-2*n[2]*n[1];
          const strip=Math.max(0,1-Math.abs(rx+.38)*3.4)+Math.max(0,1-Math.abs(rx-.44)*4.2);
          const lit=Math.max(0,n[0]*-.4+n[1]*.7+n[2]*.62);
          const edge=Math.pow(1-Math.max(0,n[2]),2);
          const intensity=Math.min(1,.14+lit*.32+strip*.43+edge*.15+(g===3?.12:0));
          const ch=modelMode? [24,143,245]:[173,196,222];
          const base=modelMode?[11,30,63]:[13,20,34];
          const rr=Math.round(base[0]+(ch[0]-base[0])*intensity),gg=Math.round(base[1]+(ch[1]-base[1])*intensity),bb=Math.round(base[2]+(ch[2]-base[2])*intensity);
          tris.push({p,q,r,depth:(p[2]+q[2]+r[2])/3,color:`rgb(${rr},${gg},${bb})`});
        }
      });
      // Painter's algorithm on genuinely rotated 3D faces, furthest surfaces first.
      tris.sort((a,b)=>b.depth-a.depth);
      for(const t of tris){ctx.fillStyle=t.color;ctx.beginPath();ctx.moveTo(t.p[0],t.p[1]);ctx.lineTo(t.q[0],t.q[1]);ctx.lineTo(t.r[0],t.r[1]);ctx.closePath();ctx.fill();}
      shaderState.frames++;if(shaderState.frames===2)window.__IAgileCanvas3DReady=true;
    }
    requestAnimationFrame(drawFallback);
  }
  function resizeGL(){
    const {gl}=shaderState;if(!gl)return;
    const r=threeArea.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,small?.76:1.1);
    const w=Math.max(1,Math.round(r.width*ratio)),h=Math.max(1,Math.round(r.height*ratio));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
  }
  window.addEventListener('resize',resizeGL,{passive:true});
  function renderGL(now){
    if(!shaderState.playing)return;
    if(!document.hidden && cinema.getBoundingClientRect().bottom>=0&&cinema.getBoundingClientRect().top<=innerHeight){
      const {gl,program,uniforms,particleProgram,particleUniforms}=shaderState;
      dragX=lerp(dragX,targetDragX+(coarse?0:mouseX*.18),.09);
      dragY=lerp(dragY,targetDragY+(coarse?0:mouseY*.13),.09);
      const time=reduced?0:(now-shaderState.start)/1000,scroll=reduced?0:scrollProgress;
      gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(uniforms.uResolution,canvas.width,canvas.height);
      gl.uniform2f(uniforms.uRotate,dragX,dragY);gl.uniform1f(uniforms.uTime,time);
      gl.uniform1f(uniforms.uScroll,scroll);gl.uniform1f(uniforms.uMode,modelMode);
      for(const m of shaderState.meshes){
        gl.uniform1f(uniforms.uGroup,m.group);
        gl.bindBuffer(gl.ARRAY_BUFFER,m.pos);const pos=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER,m.nor);const nor=gl.getAttribLocation(program,'aNormal');gl.enableVertexAttribArray(nor);gl.vertexAttribPointer(nor,3,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.idx);gl.drawElements(gl.TRIANGLES,m.len,gl.UNSIGNED_SHORT,0);
      }
      gl.useProgram(particleProgram);gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      gl.uniform2f(particleUniforms.uResolution,canvas.width,canvas.height);
      gl.uniform2f(particleUniforms.uRotate,dragX,dragY);gl.uniform1f(particleUniforms.uTime,time);gl.uniform1f(particleUniforms.uScroll,scroll);
      gl.bindBuffer(gl.ARRAY_BUFFER,shaderState.particles.buffer);
      const pLoc=gl.getAttribLocation(particleProgram,'aPosition'),sLoc=gl.getAttribLocation(particleProgram,'aSize');
      gl.enableVertexAttribArray(pLoc);gl.vertexAttribPointer(pLoc,3,gl.FLOAT,false,16,0);
      gl.enableVertexAttribArray(sLoc);gl.vertexAttribPointer(sLoc,1,gl.FLOAT,false,16,12);
      gl.drawArrays(gl.POINTS,0,shaderState.particles.count);
      gl.disable(gl.BLEND);gl.depthMask(true);
      shaderState.frames++;
      if(shaderState.frames===1)threeArea.classList.add('ready');
      if(shaderState.frames===2)window.__IAgileWebGLReady=true;
    }
    requestAnimationFrame(renderGL);
  }
  initWebGL();
  threeArea.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;startY=e.clientY;lastX=e.clientX;lastY=e.clientY;try{threeArea.setPointerCapture(e.pointerId)}catch(err){}});
  threeArea.addEventListener('pointermove',e=>{
    const r=threeArea.getBoundingClientRect();mouseX=clamp((e.clientX-r.left)/r.width*2-1,-1,1);mouseY=clamp((e.clientY-r.top)/r.height*2-1,-1,1);
    if(!dragging)return;
    targetDragX+=(e.clientX-lastX)*.007;targetDragY+=(e.clientY-lastY)*.007;lastX=e.clientX;lastY=e.clientY;
  });
  const finishDrag=()=>{dragging=false};threeArea.addEventListener('pointerup',finishDrag);threeArea.addEventListener('pointercancel',finishDrag);
  $('#modelMode').addEventListener('click',e=>{modelMode=1-modelMode;e.currentTarget.setAttribute('aria-pressed',String(!!modelMode));e.currentTarget.innerHTML=modelMode?'<span class="mode-dot"></span> BASCULER / CHROME':'<span class="mode-dot"></span> BASCULER / X-RAY';});

  // Reveal elements with a visible fallback for browsers without IO.
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{rootMargin:'0px 0px -9% 0px',threshold:.08});
    $$('.reveal,.headline-reveal').forEach(el=>io.observe(el));
  }else{$$('.reveal,.headline-reveal').forEach(el=>el.classList.add('visible'));}

  // Cinematic UI transitions as navigation moves between sections.
  let curtainBusy=false;
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const selector=a.getAttribute('href');if(selector.length<2)return;
    const target=$(selector);if(!target)return;
    e.preventDefault();
    $('#mobileMenu').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');
    if(document.body.classList.contains('modal-open'))closeModal();
    if(reduced||curtainBusy){target.scrollIntoView({behavior:reduced?'auto':'smooth'});return;}
    curtainBusy=true;
    const curtain=$('#siteCurtain');
    const anim=curtain.animate([{transform:'translateY(105%)'},{transform:'translateY(0)',offset:.40},{transform:'translateY(0)',offset:.54},{transform:'translateY(-105%)'}],{duration:1050,easing:'cubic-bezier(.48,.02,.18,.99)'});
    window.setTimeout(()=>target.scrollIntoView({behavior:'instant'}),480);
    anim.onfinish=()=>{curtainBusy=false};
  }));
  $('#menuToggle').addEventListener('click',e=>{const open=e.currentTarget.getAttribute('aria-expanded')!=='true';e.currentTarget.setAttribute('aria-expanded',String(open));$('#mobileMenu').classList.toggle('open',open);document.body.classList.toggle('menu-open',open)});

  // Magnetic call-to-actions and cursor feedback.
  if(!coarse&&!reduced){
    const halo=$('#pointerHalo');let tx=0,ty=0,hx=0,hy=0;
    window.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;halo.style.opacity='1';},{passive:true});
    function moveHalo(){hx=lerp(hx,tx,.23);hy=lerp(hy,ty,.23);halo.style.left=hx+'px';halo.style.top=hy+'px';requestAnimationFrame(moveHalo);}moveHalo();
    $$('a,button').forEach(el=>{el.addEventListener('mouseenter',()=>halo.classList.add('focused'));el.addEventListener('mouseleave',()=>halo.classList.remove('focused'));});
    $$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.11}px,${(e.clientY-r.top-r.height/2)*.18}px)`});el.addEventListener('pointerleave',()=>el.style.transform='');});
  }

  const tasks={
    marketing:{id:'TASK_001',q:'« Rédige un post pour annoncer mon nouveau service. »',p:"Tu es spécialiste de la communication pour les petites entreprises. Rédige un post LinkedIn de 120 mots pour annoncer le lancement d'un nouveau service. Adopte un ton professionnel et accessible. Commence par le bénéfice client, puis explique le fonctionnement et termine par un appel à l'action. Ne crée pas de chiffres ni de témoignages fictifs."},
    productivite:{id:'TASK_002',q:'« Aide-moi à organiser ma semaine de travail. »',p:"Agis comme un assistant en organisation. Je dispose de 35 heures de travail cette semaine. Aide-moi à répartir mes tâches selon leur urgence, leur importance et le temps estimé. Commence par me demander la liste des tâches et les échéances. Propose ensuite un planning simple sous forme de tableau, avec des créneaux de concentration et une marge pour les imprévus."},
    creation:{id:'TASK_003',q:'« Donne-moi des idées pour mon prochain projet. »',p:"Agis comme un partenaire créatif. Je développe un projet dans le domaine de [secteur]. Ma cible est [public] et mon principal objectif est [objectif]. Propose 5 concepts réellement différents, chacun avec un nom, une promesse, un exemple d'application et un risque à anticiper. Pose-moi d'abord 3 questions pour mieux comprendre mes contraintes avant de proposer les idées."}
  };
  $$('.task-choice').forEach((b,i)=>b.addEventListener('click',()=>{
    $$('.task-choice').forEach(x=>x.classList.toggle('selected',x===b));
    const task=tasks[b.dataset.task];
    $('#screenQuestion').textContent=task.q;$('#promptId').textContent=task.id;
    $('#promptContent').textContent=task.p;
    $('.screen-foot span:last-child').textContent=String(i+1).padStart(2,'0')+' / 03';
    $('#promptOutput').animate([{opacity:.2,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:460,easing:'ease-out'});
  }));
  $('#copyPrompt').addEventListener('click',async e=>{
    const content=$('#promptContent').textContent;
    const label=e.currentTarget;
    try{
      if(navigator.clipboard&&location.protocol==='https:')await navigator.clipboard.writeText(content);
      else{const t=document.createElement('textarea');t.value=content;document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();if(!ok)throw Error('copy failed');}
      label.innerHTML='PROMPT COPIÉ <span>✓</span>';
      setTimeout(()=>label.innerHTML='COPIER LE PROMPT <span>↗</span>',1800);
    }catch(err){label.innerHTML='SÉLECTIONNEZ LE TEXTE POUR COPIER <span>↗</span>';setTimeout(()=>label.innerHTML='COPIER LE PROMPT <span>↗</span>',3000);}
  });

  const courses=[
    {tag:'01 / DÉCOUVERTE',title:'COMPRENDRE L’INTELLIGENCE ARTIFICIELLE.',description:"Un parcours d'initiation pour mieux comprendre l'intelligence artificielle, ses capacités, ses limites et les bons usages à adopter. Programme détaillé à définir."},
    {tag:'02 / PRODUCTIVITÉ',title:'L’IA AU SERVICE DE VOTRE QUOTIDIEN.',description:"Une introduction aux pratiques qui permettent d'explorer l'IA dans le travail : recherche, synthèse, création de contenu et organisation. Programme détaillé à définir."},
    {tag:'03 / STRATÉGIE',title:'CONSTRUIRE AVEC L’IA.',description:"Un parcours orienté projets pour découvrir comment identifier des opportunités, structurer des workflows et expérimenter des solutions. Programme détaillé à définir."}
  ];
  function openModal(i){
    const course=courses[i];if(!course)return;
    previousFocus=document.activeElement;
    $('#modalKicker').textContent=course.tag;$('#modalTitle').textContent=course.title;$('#modalDescription').textContent=course.description;
    $('#modalOverlay').hidden=false;$('#courseModal').classList.add('open');$('#courseModal').setAttribute('aria-hidden','false');document.body.classList.add('modal-open');$('#closeModal').focus();
  }
  function closeModal(){
    $('#modalOverlay').hidden=true;$('#courseModal').classList.remove('open');$('#courseModal').setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');if(previousFocus&&previousFocus.focus)previousFocus.focus();
  }
  $$('.course-item').forEach(b=>b.addEventListener('click',()=>openModal(Number(b.dataset.course))));
  $('#closeModal').addEventListener('click',closeModal);$('#modalOverlay').addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') {if(document.body.classList.contains('modal-open'))closeModal();else if(document.body.classList.contains('menu-open'))$('#menuToggle').click();}
    if(e.key==='Tab'&&document.body.classList.contains('modal-open')){
      const focusable=$$('button,a[href]',$('#courseModal')).filter(el=>el.offsetParent!==null);
      if(focusable.length){const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
    }
  });
  // No invented corporate mailbox: the launch contact endpoint must be approved first.
  const cta=$('#outroCta');
  cta.href='#formations';cta.innerHTML='EXPLORER LES FORMATIONS <b>↗</b>';
  $('.outro-note').textContent='Démonstration du site — catalogue et inscriptions à finaliser.';
  $('#modalCta').href='#experience';$('#modalCta').innerHTML='ESSAYER LE LABORATOIRE <span>↗</span>';
  // Useful debug/status indicator for launch QA, not exposed in UI.
  window.__IAgileVersion='CHROME V3';
})();