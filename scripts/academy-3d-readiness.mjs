import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
// 3D readiness is an evidence log, not a substitute for a browser or device audit.
export const CHECKS=Object.freeze([
 {id:'html-fallback',label:'Readable primary content without WebGL'},
 {id:'keyboard-navigation',label:'All useful navigation works by keyboard'},
 {id:'visible-focus',label:'Focus remains visible and predictable'},
 {id:'reduced-motion',label:'Reduced-motion preference removes nonessential travel'},
 {id:'mobile-320',label:'Viewport 320px is readable without overflow'},
 {id:'mobile-375',label:'Viewport 375px remains usable'},
 {id:'no-webgl',label:'Unsupported WebGL does not cause a blank page'},
 {id:'camera-geometry',label:'Camera does not pass through tunnel or walls'},
 {id:'camera-direction',label:'Menu transitions are short and never reverse unexpectedly'},
 {id:'direct-navigation',label:'Every main destination is reachable without a long travel'},
 {id:'gpu-memory',label:'GPU resources are disposed on scene change'},
 {id:'performance',label:'Real loading and frame time observed on target mobile device'},
 {id:'public-version',label:'Exact deployed HTTPS version verified and rollback documented'}
]);
const allowedStatus=new Set(['passed','failed','not-tested']);
const keys=new Set(['id','status','evidence','device','browser']);
export function assess3DReadiness(observations=[]){
 if(!Array.isArray(observations))throw Error('Expected array');
 const byId=new Map(),expected=new Set(CHECKS.map(x=>x.id));
 for(const row of observations){
   if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Invalid row');
   for(const key of Object.keys(row))if(!keys.has(key))throw Error('Unexpected field '+key);
   if(!expected.has(row.id)||!allowedStatus.has(row.status)||byId.has(row.id))
     throw Error('Unknown, duplicate or invalid checklist item');
   for(const key of ['evidence','device','browser']){
     if(row[key]!==undefined&&(typeof row[key]!=='string'||row[key].length>360))
       throw Error('Invalid '+key+' text');
   }
   if(row.status!=='not-tested'&&(!row.evidence||row.evidence.trim().length<16||
      !row.device||row.device.trim().length<3||!row.browser||row.browser.trim().length<3))
     throw Error('Claimed results require evidence, tested device and browser');
   byId.set(row.id,row);
 }
 const all=CHECKS.map(item=>({...item,...(byId.get(item.id)||{status:'not-tested'})}));
 const failed=all.filter(x=>x.status==='failed').map(x=>x.id);
 const missing=all.filter(x=>x.status==='not-tested').map(x=>x.id);
 const declaredPassed=all.filter(x=>x.status==='passed').length;
 return {
  status:failed.length?'self-reported-failures':missing.length?'not-fully-tested':'self-reported-ready-for-independent-review',
  checks:CHECKS.length,declaredPassed,failed,missing,
  warning:'Self-reported evidence is not independently verified. Do not call a site production-ready without external and human device testing.',
  results:all
 };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const file=process.argv[2];
 if(!file){process.stderr.write('Usage: node scripts/academy-3d-readiness.mjs /private/path/device-checks.json\n');process.exitCode=1;}
 else try{const report=assess3DReadiness(JSON.parse(await readFile(file,'utf8')));
   process.stdout.write(JSON.stringify(report,null,2)+'\n');
   if(report.status!=='self-reported-ready-for-independent-review')process.exitCode=2;
 }catch(error){process.stderr.write('Unusable 3D report: '+error.message+'\n');process.exitCode=1;}
}
