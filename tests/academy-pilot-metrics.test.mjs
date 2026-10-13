import assert from 'node:assert/strict';
import {summarizePilot} from '../scripts/academy-pilot-metrics.mjs';
const empty=summarizePilot([]);
assert.equal(empty.status,'no-data');
assert.equal(empty.verifiedObservations,0);
assert.equal(empty.medianMinutesVerified,null);
assert.equal(empty.distinctParticipants,0);
const rows=[
 {test_id:'T01',course:'processus',case_id:'CASE-A',condition:'guided',evidence:'verified',passed:true,minutes:20,help_requests:2},
 {test_id:'T01',course:'processus',case_id:'CASE-B',condition:'transfer',evidence:'verified',passed:false,minutes:32,help_requests:1},
 {test_id:'T02',course:'automatisation',case_id:'CASE-C',condition:'guided',evidence:'unverified',passed:false,minutes:15,help_requests:0},
 {test_id:'T02',course:'automatisation',case_id:'CASE-D',condition:'delayed',evidence:'not-tested',passed:false,minutes:13,help_requests:0},
 {test_id:'T03',course:'agents',case_id:'CASE-E',condition:'transfer',evidence:'verified',passed:true,minutes:45,help_requests:5}
];
const result=summarizePilot(rows);
assert.equal(result.status,'small-sample');
assert.equal(result.distinctParticipants,3);
assert.equal(result.observations,5);
assert.equal(result.verifiedObservations,3);
assert.equal(result.medianMinutesVerified,32);
assert.equal(result.counts.guided.attempts,2);
assert.equal(result.counts.guided.verified,1);
assert.equal(result.counts.guided.nonVerified,1);
assert.equal(result.counts.transfer.passed,1);
assert.equal(result.byCourse.processus.passed,1);
assert.equal(result.byCourse.automatisation.nonVerified,2);
assert.match(result.confidence,/Never infer market/);
const rejected=[
 [...rows,rows[0]],
 [{...rows[0],email:'test@example.invalid'}],
 [{...rows[0],student_name:'A'}],
 [{...rows[0],evidence:'unverified',passed:true}],
 [{...rows[0],evidence:'not-tested',passed:true}],
 [{...rows[0],test_id:'real-user-id'}],
 [{...rows[0],minutes:-1}],
 [{...rows[0],help_requests:1.5}],
 [{...rows[0],case_id:'../../fake'}],
 [{...rows[0],course:'other'}],
 [{...rows[0],evidence:'unknown'}],
 [{...rows[0],condition:'unknown'}]
];
for(const scenario of rejected)assert.throws(()=>summarizePilot(scenario),/Duplicate|Unexpected|missing valid/);
const five=Array.from({length:5},(_,i)=>({...rows[0],test_id:'T'+String(i+10)}));
assert.equal(summarizePilot(five).status,'descriptive-only','Five synthetic participants still yield descriptive data');
assert.throws(()=>summarizePilot({}),/array/);
console.log('PASS pilot evidence: zero data, small sample, grouped counts, median, PII rejected and no false pass');
