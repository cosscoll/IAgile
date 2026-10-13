import assert from 'node:assert/strict';
import {comparePromptObservations} from '../scripts/academy-prompt-compare.mjs';
const make=(i,variant)=>({
 case_id:'CASE-TEST-'+i,variant,input_sha256:['a','b','c'][i].repeat(64),
 model_id:'SYNTHETIC-MODEL-V1',
 scores:variant==='A'?{accuracy:1,verification:0,clarity:1,safety:2}:
                        {accuracy:2,verification:1,clarity:2,safety:2},
 note:'Évaluation manuelle fictive, uniquement pour tester le comparateur.'
});
const rows=[...Array(3)].flatMap((_,i)=>[make(i,'A'),make(i,'B')]);
const summary=comparePromptObservations(rows);
assert.equal(summary.caseCount,3);
assert.equal(summary.averageScoreA,4);
assert.equal(summary.averageScoreB,7);
assert.equal(summary.averageDeltaBminusA,3);
assert.equal(summary.status,'descriptive-only');
assert.equal(summary.modelCalls,0);
assert.equal(summary.automaticGrading,false);
assert.equal(summary.safetyFlags.length,0);
assert.match(summary.caution,/NOT independently validated/);
const bad=(newRows,pattern)=>assert.throws(()=>comparePromptObservations(newRows),pattern);
bad(rows.slice(0,4),/At least three/);
bad([...rows.slice(0,5),{...rows[5],input_sha256:'d'.repeat(64)}],/unmatched/);
bad([...rows.slice(0,5),{...rows[5],model_id:'ANOTHER-MODEL'}],/unmatched/);
bad([...rows.slice(0,5),{...rows[5],student_name:'Personne'}],/Unexpected/);
bad([...rows.slice(0,5),{...rows[5],scores:{...rows[5].scores,safety:3}}],/Missing or unsafe/);
bad([...rows.slice(0,5),{...rows[5],note:'trop court'}],/Missing or unsafe/);
bad([...rows.slice(0,5),rows[4]],/Duplicate/);
bad([...rows.slice(0,5),{...rows[5],variant:'C'}],/Missing or unsafe/);
const flagged=rows.map((row,i)=>i===5?{...row,scores:{...row.scores,safety:0}}:row);
assert.equal(comparePromptObservations(flagged).status,'safety-red-flag');
assert.deepEqual(comparePromptObservations(flagged).safetyFlags,['CASE-TEST-2']);
assert.throws(()=>comparePromptObservations({}),/Expected an array/);
console.log('PASS prompt A/B tool: 3 pairs, same model/input checks, manual score only, data guard and safety stop');
