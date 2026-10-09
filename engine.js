/* IAgile CHROME V9 — native WebGL architectural gallery. Fully self-contained, no CDN. */
(()=>{
'use strict';
const canvas=document.getElementById('universeCanvas');if(!canvas)return;
let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,powerPreference:'low-power'});}catch(e){}
if(!gl){window.__IAgileRender='CSS perspective fallback';return;}
const vsrc=`attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;uniform mat4 uView;uniform mat4 uProj;uniform vec3 uEye;uniform float uTime;varying vec3 vC;varying float vF;void main(){vec3 p=aP;float d=length(p-uEye);vec3 n=normalize(aN);vec3 light=normalize(vec3(-.40,.73,.48));float nd=max(dot(n,light),0.);float shine=pow(max(dot(reflect(-light,n),normalize(uEye-p)),0.),24.);float edge=pow(1.-max(dot(n,normalize(uEye-p)),0.),2.);vC=aC*(.52+nd*.51)+vec3(.94,.96,.93)*shine*.70+vec3(.42,.51,.56)*edge*.19;vF=clamp((d-5.)/59.,0.,1.);gl_Position=uProj*uView*vec4(p,1.);}`;
const fsrc=`precision mediump float;varying vec3 vC;varying float vF;void main(){vec3 haze=vec3(.91,.92,.91);vec3 c=mix(vC,haze,pow(vF,1.38)*.72);gl_FragColor=vec4(c,1.);}`;
function shader(type,source){let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn('3D shader',gl.getShaderInfoLog(s));return null;}return s;}
let vs=shader(gl.VERTEX_SHADER,vsrc),fs=shader(gl.FRAGMENT_SHADER,fsrc);if(!vs||!fs)return;
let prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return;
gl.useProgram(prog);
const buf=[];const silver=[.71,.77,.79], bright=[.94,.95,.93], dark=[.47,.54,.57], blue=[.48,.56,.59], white=[.99,.99,.97], floor=[.86,.89,.88];
function tri(a,b,c,n,col){for(const p of [a,b,c])buf.push(...p,...n,...col)}
function quad(a,b,c,d,n,col){tri(a,b,c,n,col);tri(a,c,d,n,col)}
function box(cx,cy,cz,sx,sy,sz,col){let x=cx-sx/2,X=cx+sx/2,y=cy-sy/2,Y=cy+sy/2,z=cz-sz/2,Z=cz+sz/2;
quad([x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z],[0,0,1],col);quad([X,y,z],[x,y,z],[x,Y,z],[X,Y,z],[0,0,-1],col);
quad([x,y,z],[x,y,Z],[x,Y,Z],[x,Y,z],[-1,0,0],col);quad([X,y,Z],[X,y,z],[X,Y,z],[X,Y,Z],[1,0,0],col);
quad([x,Y,Z],[X,Y,Z],[X,Y,z],[x,Y,z],[0,1,0],col);quad([x,y,z],[X,y,z],[X,y,Z],[x,y,Z],[0,-1,0],col)}
function tube(a,b,r,col){const dir=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(...dir),v=dir.map(x=>x/l);let u=Math.abs(v[1])<.8?[0,1,0]:[1,0,0];let q=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],ql=Math.hypot(...q);q=q.map(x=>x/ql);u=[v[1]*q[2]-v[2]*q[1],v[2]*q[0]-v[0]*q[2],v[0]*q[1]-v[1]*q[0]];
const N=7;for(let i=0;i<N;i++){let t=i*2*Math.PI/N,tt=(i+1)*2*Math.PI/N;const p=(base,ang)=>base.map((v,j)=>v+r*(Math.cos(ang)*q[j]+Math.sin(ang)*u[j]));const n=(ang)=>q.map((v,j)=>v*Math.cos(ang)+u[j]*Math.sin(ang));let p1=p(a,t),p2=p(a,tt),p3=p(b,tt),p4=p(b,t);tri(p1,p2,p3,n(t),col);tri(p1,p3,p4,n(tt),col);}}
function torus(cx,cy,cz,R,r,col,angle=0){const N=44,M=9;for(let j=0;j<N;j++)for(let k=0;k<M;k++){
const point=(v,w)=>{let x=(R+r*Math.cos(w))*Math.cos(v),y=(R+r*Math.cos(w))*Math.sin(v),z=r*Math.sin(w);return [cx+x*Math.cos(angle)-z*Math.sin(angle),cy+y,cz+x*Math.sin(angle)+z*Math.cos(angle)];};
const normal=(v,w)=>{let x=Math.cos(w)*Math.cos(v),y=Math.cos(w)*Math.sin(v),z=Math.sin(w);return [x*Math.cos(angle)-z*Math.sin(angle),y,x*Math.sin(angle)+z*Math.cos(angle)];};
let a=j*2*Math.PI/N,b=(j+1)*2*Math.PI/N,c=k*2*Math.PI/M,d=(k+1)*2*Math.PI/M;
tri(point(a,c),point(b,c),point(b,d),normal(a,c),col);tri(point(a,c),point(b,d),point(a,d),normal(b,d),col);}}
// A sequence of architectural chambers: portals and illuminated learning stations.
for(let i=0;i<16;i++){
let z=-5-i*6.5; const active=i%3===1;let rail=active?bright:silver;
box(-5.05,0,z,.27,6.5,.28,rail);box(5.05,0,z,.27,6.5,.28,rail);box(0,3.24,z,10.42,.27,.28,rail);
box(-5.02,-3.23,z,.18,.2,.23,dark);box(5.02,-3.23,z,.18,.2,.23,dark);
box(-4.87,0,z+.19,.09,5.97,.08,i===7?blue:dark);box(4.87,0,z+.19,.09,5.97,.08,i===7?blue:dark);box(0,3.07,z+.19,9.8,.08,.08,i===7?blue:dark);
// Structured split line, a visual architectural cue for route branching.
if(i%3===0){box(-3.6,2.92,z+1,2.1,.08,.15,silver);box(3.6,2.92,z+1,2.1,.08,.15,silver);}
if(i%4===0){torus(0,-.25,z-2,1.25,.075,active?blue:silver,.17);torus(0,-.25,z-2,1.75,.028,dark,-.2);}
}
// Actual walkway under the camera, with visible converging perspective lines.
for(let i=0;i<165;i++){
let z=5-i*.65;box(0,-3.45,z,10.5,.045,.024,i%10===0?silver:floor);
if(i%4===0){box(-3,-3.39,z,.07,.055,.65,dark);box(3,-3.39,z,.07,.055,.65,dark);}}
for(let x of [-5.7,5.7]){tube([x,-3.35,5],[x,-3.35,-106],.055,silver);tube([x,2.8,5],[x,2.8,-106],.025,dark);}
for(let i=0;i<5;i++){let z=-7-i*18.2;
// Functional learning pavilions, made of recognizable architectural volumes.
box(-6.1,-1.6,z-3,1.45,3.0,4.1,i%2?dark:silver);box(6.1,-1.7,z-3,1.45,2.8,4.1,silver);
box(-6.1,.1,z-3,1.65,.14,4.4,bright);box(6.1,-.16,z-3,1.65,.11,4.4,silver);
box(-6.12,-1.8,z-.7,.04,1.9,.1,white);box(6.13,-1.8,z-.7,.04,1.9,.1,white);
}
const bytes=new Float32Array(buf);let buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,bytes,gl.STATIC_DRAW);
const stride=9*4;for(let [key,offset] of [['aP',0],['aN',12],['aC',24]]){let loc=gl.getAttribLocation(prog,key);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,stride,offset);}
let uniV=gl.getUniformLocation(prog,'uView'),uniP=gl.getUniformLocation(prog,'uProj'),uniE=gl.getUniformLocation(prog,'uEye');
function perspective(fov,asp,n,f){let t=1/Math.tan(fov/2),a=new Float32Array(16);a[0]=t/asp;a[5]=t;a[10]=(f+n)/(n-f);a[11]=-1;a[14]=(2*f*n)/(n-f);return a;}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function norm(a){let d=Math.hypot(...a)||1;return a.map(x=>x/d)}
function lookAt(eye,target,up){let z=norm(eye.map((x,i)=>x-target[i])),x=norm(cross(up,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-x.reduce((s,v,i)=>s+v*eye[i],0),-y.reduce((s,v,i)=>s+v*eye[i],0),-z.reduce((s,v,i)=>s+v*eye[i],0),1]);}
let dpr=Math.min(window.devicePixelRatio||1,innerWidth<700?.85:1.05),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,step=0,mouse=[0,0],visible=true,inView=true,last=0,animation=0;
let canvasObserver=null;
window.addEventListener('IAgile:camera',e=>{step=e.detail.progress;mouse=e.detail.mouse||mouse;});
window.addEventListener('pointermove',e=>{mouse=[(e.clientX/innerWidth-.5),e.clientY/innerHeight-.5]},{passive:true});
document.addEventListener('visibilitychange',()=>{visible=!document.hidden; if(visible)wake()});
if('IntersectionObserver' in window){canvasObserver=new IntersectionObserver(e=>{inView=e[0].isIntersecting;if(inView)wake()},{threshold:0});canvasObserver.observe(document.getElementById('odysseyPin')||canvas)}
function wake(){if(!animation && visible && inView){last=0;animation=requestAnimationFrame(frame)}}
function frame(ms){animation=0;if(!visible||!inView)return;animation=requestAnimationFrame(frame);if(ms-last<(innerWidth<700?30:16.5))return;last=ms;if(!document.getElementById('worldOverlay')?.hidden)return;
let rect=canvas.getBoundingClientRect();let w=Math.min(1450,Math.max(1,Math.round(rect.width*dpr))),h=Math.min(1100,Math.max(1,Math.round(rect.height*dpr)));if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
let u=Math.max(0,Math.min(1,step));let travel=u-Math.sin(2*Math.PI*u)*.014;let camZ=3-travel*76;let x=Math.sin(u*4.65)*.35+(reduce?0:mouse[0]*.20);let eye=[x,.35+Math.sin(u*5.2)*.09,camZ];let target=[x*.7+Math.sin(u*4.2)*.12,.05,camZ-18];
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
gl.uniformMatrix4fv(uniP,false,perspective(66*Math.PI/180,w/h,.15,150));gl.uniformMatrix4fv(uniV,false,lookAt(eye,target,[0,1,0]));gl.uniform3fv(uniE,new Float32Array(eye));gl.drawArrays(gl.TRIANGLES,0,bytes.length/9);
}
wake();document.body.classList.add('webgl-ready');window.__IAgileRender='Native WebGL 3D gallery / CHROME V12 5-stage smooth travel';
})();
