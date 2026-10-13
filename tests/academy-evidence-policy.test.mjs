import assert from 'node:assert/strict';
import {CASES,verifyEvidenceChoice} from '../academy-app/atelier-preuve-policy.mjs';
assert.equal(Object.keys(CASES).length,2);
const explanation='Je ne dispose pas de la preuve externe nécessaire pour confirmer une action.';
for(const caseId of Object.keys(CASES)){
 const accepted=verifyEvidenceChoice({caseId,optionId:'B',reasonId:'unconfirmed',explanation});
 assert.equal(accepted.status,'consistent',caseId);
 assert.equal(accepted.correct,true);
 assert.match(accepted.text,/n’a pas été évaluée automatiquement/);
 assert.equal(verifyEvidenceChoice({caseId,optionId:'A',reasonId:'unconfirmed',explanation}).status,'review');
 assert.equal(verifyEvidenceChoice({caseId,optionId:'B',reasonId:CASES[caseId].risks[1].id,explanation}).correct,false);
 assert.equal(verifyEvidenceChoice({caseId,optionId:'B',reasonId:'unconfirmed',explanation:'ok'}).status,'incomplete');
}
assert.equal(verifyEvidenceChoice({caseId:'fake',optionId:'B',reasonId:'unconfirmed',explanation}).status,'invalid');
assert.equal(verifyEvidenceChoice({caseId:'rendezvous',optionId:'Z',reasonId:'unconfirmed',explanation}).status,'incomplete');
console.log('PASS — local evidence / transfer rules reject invented confirmations, invalid inputs and fake auto-grading');
