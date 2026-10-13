import assert from 'node:assert/strict';
import {summarizePilot} from '../scripts/academy-pilot-metrics.mjs';
const base={test_id:'T01',course:'processus',case_id:'CASE-SOURCE',condition:'guided',
 evidence:'verified',passed:true,minutes:12,help_requests:1};
const empty=summarizePilot([]);
assert.equal(empty.status,'no-data');assert.equal(empty.verifiedObservations,0);
const rows=[base,
 {...base,test_id:'T02',condition:'transfer',evidence:'unverified',minutes:20},
 {...base,test_id:'T03',condition:'delayed',passed:false,minutes:25}];
const report=summarizePilot(rows);
assert.equal(report.status,'small-sample');
assert.equal(report.distinctParticipants,3);
assert.equal(report.verifiedObservations,2);
assert.equal(report.counts.guided.passed,1);
assert.equal(report.counts.transfer.verified,0);
assert.equal(report.counts.transfer.nonVerified,1);
assert.equal(report.counts.transfer.passed,0,'Unverified self-claimed passes must not be counted');
assert.equal(report.medianMinutesVerified,18.5);
assert.match(report.confidence,/Never infer market/);
assert.throws(()=>summarizePilot([base,base]),/Duplicate/);
assert.throws(()=>summarizePilot([{...base,email:'example@invalid.test'}]),/identifier/);
assert.throws(()=>summarizePilot([{...base,minutes:0}]),/missing valid/);
assert.throws(()=>summarizePilot([{...base,case_id:'unsafe'}]),/missing valid/);
assert.equal(summarizePilot(Array.from({length:5},(_,i)=>({
 ...base,test_id:'T0'+(i+1)}))).status,'descriptive-only',
 'Even five participants are not representative');
console.log('PASS pilot evidence: zero-data, nonverified outcomes, dedup, pseudonym protection and small sample reporting');
