import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const courses=new Set(['processus','automatisation','agents','sites-3d']);
const conditions=new Set(['guided','transfer','delayed']);
const evidences=new Set(['verified','unverified','not-tested']);
const forbidden=new Set(['email','name','full_name','phone','address','birthdate','ip','user_id']);
export function summarizePilot(observations=[]){
 if(!Array.isArray(observations))throw Error('Expected an array');
 const counts={guided:{attempts:0,verified:0,passed:0,notTested:0},
   transfer:{attempts:0,verified:0,passed:0,notTested:0},
   delayed:{attempts:0,verified:0,passed:0,notTested:0}};
 const testers=new Set(),unique=new Set(),times=[];
 for(const row of observations){
   if(!row||Array.isArray(row)||typeof row!=='object')throw Error('Invalid observation');
   for(const k of Object.keys(row))if(forbidden.has(k.toLowerCase()))
     throw Error('Personal identifier field forbidden: '+k);
   if(typeof row.test_id!=='string'||!/^T[0-9]{2,4}$/.test(row.test_id)||
      !courses.has(row.course)||!conditions.has(row.condition)||
      typeof row.case_id!=='string'||!/^CASE-[A-Z0-9_-]{1,32}$/.test(row.case_id)||
      !evidences.has(row.evidence)||
      typeof row.passed!=='boolean'||!Number.isFinite(row.minutes)||
      row.minutes<=0||row.minutes>480||!Number.isInteger(row.help_requests)||row.help_requests<0||row.help_requests>200){
     throw Error('Observation missing valid pseudonym, course, case, condition, evidence, duration or help count');
   }
   const key=JSON.stringify([row.test_id,row.course,row.case_id,row.condition]);
   if(unique.has(key))throw Error('Duplicate case/condition — explicit attempt version required before measuring');
   unique.add(key);testers.add(row.test_id);
   const c=counts[row.condition];c.attempts++;
   if(row.evidence==='verified'){c.verified++;if(row.passed)c.passed++;times.push(row.minutes);}
   else{c.notTested++;}
 }
 const sorted=times.sort((a,b)=>a-b);
 const median=sorted.length?
   (sorted[Math.floor((sorted.length-1)/2)]+sorted[Math.floor(sorted.length/2)])/2:null;
 return {
   status:observations.length===0?'no-data':testers.size<5?'small-sample':'descriptive-only',
   distinctParticipants:testers.size,observations:observations.length,
   verifiedObservations:times.length,medianMinutesVerified:median,
   counts,confidence:'Descriptive only. Never infer market performance, causality, or population-level rates.',
   caution:observations.length===0?'No participant test has been performed in this dataset.':
     'Self-selected small samples and differences between tasks prevent claims of improvement without a controlled protocol.'
 };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const file=process.argv[2];
 if(!file){process.stderr.write('Usage: node scripts/academy-pilot-metrics.mjs /private/path/pilot-pseudonymized.json\n');process.exitCode=1;}
 else{
   try{
     const observations=JSON.parse(await readFile(file,'utf8'));
     process.stdout.write(JSON.stringify(summarizePilot(observations),null,2)+'\n');
   }catch(error){process.stderr.write('Invalid private pilot observations: '+error.message+'\n');process.exitCode=1;}
 }
}
