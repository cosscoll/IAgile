/* Supplemental 3D architecture in raw WebGL — no network/library dependency.
   The product scenes themselves remain available through semantic CSS 3D when WebGL is unavailable. */
(() => {
  'use strict';
  const canvas=document.getElementById('depthCanvas');
  if(!canvas)return;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power',depth:false,preserveDrawingBuffer:false});
  if(!gl)return;
  const vert=`attribute vec3 pos;attribute vec3 tint;varying vec3 vTint;uniform float phase;uniform float time;uniform float aspect;
  void main(){
    vec3 p=pos;
    float a=phase*1.15+sin(time*.12)*.10;
    mat3 ry=mat3(cos(a),0.,sin(a),0.,1.,0.,-sin(a),0.,cos(a));
    p=ry*p;
    p.y+=sin(time*.28+p.x*.32)*.12;
    float depth=9.0+p.z;
    float fac=5.2/max(3.,depth);
    gl_Position=vec4(p.x*fac/aspect,p.y*fac,0.,1.);
    vTint=tint;
  }`;
  const frag=`precision mediump float;varying vec3 vTint;void main(){gl_FragColor=vec4(vTint, .25);}`;
  function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
  const vs=compile(gl.VERTEX_SHADER,vert),fs=compile(gl.FRAGMENT_SHADER,frag);if(!vs||!fs)return;
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  gl.useProgram(program);
  const data=[];
  function segment(a,b,color){data.push(...a,...color,...b,...color)}
  const blue=[.13,.33,1],grey=[.5,.56,.66];
  // Architectural portals, three-dimensional circular rails, and a network of linked outputs.
  for(let j=0;j<4;j++){
    const cx=(j-1.5)*1.7,cz=j%2===0?0:-1.7,r=1.18+j*.25;
    for(let k=0;k<112;k++){
      const t=k/112*Math.PI*2,u=(k+1)/112*Math.PI*2;
      const point=q=>[cx+Math.cos(q)*r,Math.sin(q)*r*.77,cz+Math.sin(q*2+j)*.54];
      segment(point(t),point(u),j===2?blue:grey);
    }
  }
  const anchors=[[-3.1,-1.5,-.5],[-1.4,.9,-1.3],[.6,-.7,.4],[2.4,1.45,-1.2],[3.4,-.35,.7]];
  for(let i=0;i<anchors.length-1;i++){
    const a=anchors[i],b=anchors[i+1];segment(a,b,i%2?blue:grey);
    for(let n=0;n<8;n++){
      const f=n/8;const x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f,z=a[2]+(b[2]-a[2])*f;
      segment([x,y,z],[x,y+.10,z],blue);
    }
  }
  const arr=new Float32Array(data),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);
  const stride=6*4,locP=gl.getAttribLocation(program,'pos'),locC=gl.getAttribLocation(program,'tint');
  gl.enableVertexAttribArray(locP);gl.vertexAttribPointer(locP,3,gl.FLOAT,false,stride,0);
  gl.enableVertexAttribArray(locC);gl.vertexAttribPointer(locC,3,gl.FLOAT,false,stride,12);
  const up=gl.getUniformLocation(program,'phase'),ut=gl.getUniformLocation(program,'time'),ua=gl.getUniformLocation(program,'aspect');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last=0,stopped=false;
  function render(ms){
    if(stopped)return;
    if(!reduced&&ms-last<34){requestAnimationFrame(render);return;}
    last=ms;
    const bounds=canvas.getBoundingClientRect();
    const ratio=Math.min(devicePixelRatio||1,1.3),w=Math.min(1450,Math.max(1,Math.round(bounds.width*ratio))),h=Math.max(1,Math.round(bounds.height*ratio));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    const story=document.querySelector('.journey');const p=Math.max(0,Math.min(1,scrollY/Math.max(1,story.offsetHeight-innerHeight)));
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(up,p*2.4);gl.uniform1f(ut,ms/1000);gl.uniform1f(ua,Math.max(.5,w/h));
    gl.drawArrays(gl.LINES,0,arr.length/6);
    if(!reduced)requestAnimationFrame(render);
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopped=true;}else if(stopped){stopped=false;requestAnimationFrame(render)}});
  requestAnimationFrame(render);
  window.__IAgileWebGL=true;
})();