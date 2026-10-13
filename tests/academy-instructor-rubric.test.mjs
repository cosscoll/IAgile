import assert from 'node:assert/strict';
import {createStructuredFeedback,parseStructuredFeedback} from '../academy-app/instructor-rubric.mjs';
const review={criterion:'Identifier les sources non vérifiées',
 evidence:'La copie conclut sans mentionner la source ni vérifier la date de validité.',
 nextAction:'Ajouter une source contrôlable et préciser la date avant de conclure.'};
const built=createStructuredFeedback(review);
assert.equal(built.ok,true);assert.equal(built.text.includes('Critère contrôlé :'),true);
assert.deepEqual(parseStructuredFeedback(built.text),{...review,legacy:false});
for(const empty of ['criterion','evidence','nextAction']){
 const bad=createStructuredFeedback({...review,[empty]:'x'});
 assert.equal(bad.ok,false,empty);
 assert.equal(bad.text,'','Invalid feedback must not be persisted');
}
const legacy=parseStructuredFeedback('Ancienne correction libre de la formation sans sections.');
assert.equal(legacy.legacy,true);
assert.equal(legacy.evidence,'Ancienne correction libre de la formation sans sections.');
assert.equal(legacy.criterion,'');
assert.equal(legacy.nextAction,'');
const max=createStructuredFeedback({...review,evidence:'x'.repeat(2501)});
assert.equal(max.ok,false,'Oversize evidence must be rejected');
const multiline=createStructuredFeedback({...review,evidence:'Preuve\r\nobservée sur un exemple fictif et relue.'});
assert.equal(multiline.ok,true);assert(!multiline.text.includes('\r'));
console.log('PASS instructor rubric: criterion/evidence/next step required; round-trip and legacy correction retained');
