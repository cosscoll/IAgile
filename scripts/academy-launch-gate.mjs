import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const REQUIRED=['vitrine','curriculum_reference','private_storage','academy_staging',
  'academy_browser','auth_isolation','pedagogy_pilot','seller','legal_offer','price',
  'merchant','signed_checkout','invoices','refund','customer_support'];
export function evaluateLaunchEvidence(input){
  if(!input||!Array.isArray(input.gates))throw new Error('Missing launch evidence');
  const ids=new Set(),checks=[];
  for(const item of input.gates){
    if(!item||typeof item.id!=='string'||ids.has(item.id))throw new Error('Duplicate/invalid gate');
    if(!['verified','blocked'].includes(item.status))throw new Error('Invalid gate status: '+item.id);
    if(typeof item.evidence!=='string'||item.evidence.length<15)
      throw new Error('Missing documented observation: '+item.id);
    ids.add(item.id);
    checks.push({...item});
  }
  const missing=REQUIRED.filter(x=>!ids.has(x));
  if(missing.length)throw new Error('Missing launch gate(s): '+missing.join(','));
  const blocked=checks.filter(x=>x.status!=='verified');
  return {ready:blocked.length===0,total:checks.length,verified:checks.length-blocked.length,
    blocked:blocked.map(x=>({id:x.id,label:x.label,evidence:x.evidence})),
    reminder:'Evidence must be independently verified: this tool never activates payments or courses.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const target=process.argv[2]||path.resolve('docs/IAgile-LAUNCH-EVIDENCE.json');
    const data=JSON.parse(await fs.readFile(target,'utf8'));
    const result=evaluateLaunchEvidence(data);
    console.log(JSON.stringify(result,null,2));
    if(!result.ready)process.exitCode=2;
  }catch(error){console.error('Launch evidence invalid:',error.message);process.exitCode=1;}
}
