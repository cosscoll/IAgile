import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
// No model calls or automatic grading. Manual labels are reported, not verified.
const rubrics=['accuracy','verification','clarity','safety'];
const fields=new Set(['case_id','variant','input_sha256','model_id','scores','note']);
const noteMinimum=15;
const score=(run)=>rubrics.reduce((total,key)=>total+run.scores[key],0);
export function comparePromptObservations(rows=[]){
 if(!Array.isArray(rows))throw Error('Expected an array of paired observations');
 const byCase=new Map();
 for(const row of rows){
   if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Invalid observation');
   for(const key of Object.keys(row))if(!fields.has(key))throw Error('Unexpected field '+key+' (no learner data allowed)');
   if(typeof row.case_id!=='string'||!/^CASE-[A-Z0-9_-]{2,32}$/.test(row.case_id)||
      !['A','B'].includes(row.variant)||typeof row.input_sha256!=='string'||
      !/^[a-f0-9]{64}$/.test(row.input_sha256)||typeof row.model_id!=='string'||
      !/^[A-Z0-9._-]{3,48}$/.test(row.model_id)||
      typeof row.note!=='string'||row.note.trim().length<noteMinimum||row.note.length>500||
      !row.scores||typeof row.scores!=='object'||Array.isArray(row.scores)||
      Object.keys(row.scores).length!==rubrics.length||
      rubrics.some(key=>!Number.isInteger(row.scores[key])||row.scores[key]<0||row.scores[key]>2))
     throw Error('Missing or unsafe scores, case, input hash, model or evidence');
   const group=byCase.get(row.case_id)||new Map();
   if(group.has(row.variant))throw Error('Duplicate prompt variant observation for case '+row.case_id);
   group.set(row.variant,row);
   byCase.set(row.case_id,group);
 }
 if(byCase.size<3)throw Error('At least three paired fictitious cases are required');
 const comparisons=[];
 for(const [caseId,group] of byCase){
   const a=group.get('A'),b=group.get('B');
   if(!a||!b||a.input_sha256!==b.input_sha256||a.model_id!==b.model_id)
     throw Error('Cannot compare unmatched inputs or model versions in '+caseId);
   comparisons.push({caseId,scoreA:score(a),scoreB:score(b),
     delta:score(b)-score(a),safetyFlag:a.scores.safety===0||b.scores.safety===0});
 }
 const safetyFlags=comparisons.filter(x=>x.safetyFlag).map(x=>x.caseId);
 const average=values=>values.reduce((sum,v)=>sum+v,0)/values.length;
 return {status:safetyFlags.length?'safety-red-flag':'descriptive-only',
  modelCalls:0,automaticGrading:false,caseCount:comparisons.length,
  averageScoreA:average(comparisons.map(x=>x.scoreA)),
  averageScoreB:average(comparisons.map(x=>x.scoreB)),
  averageDeltaBminusA:average(comparisons.map(x=>x.delta)),
  safetyFlags,comparisons,
  caution:'Scores and input hashes are user-supplied and NOT independently validated. No inference of effectiveness, statistical significance, or superiority is supported.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const file=process.argv[2];
 if(!file){process.stderr.write('Usage: node scripts/academy-prompt-compare.mjs /private/path/manual-observations.json\n');process.exitCode=1;}
 else try{
   const report=comparePromptObservations(JSON.parse(await readFile(file,'utf8')));
   process.stdout.write(JSON.stringify(report,null,2)+'\n');
   if(report.safetyFlags.length)process.exitCode=2;
 }catch(error){process.stderr.write('Unusable comparison: '+error.message+'\n');process.exitCode=1;}
}
