import assert from 'node:assert/strict';
import {assessPrerequisites,COURSES} from '../academy-app/preflight-policy.mjs';
assert.equal(Object.keys(COURSES).length,4);
const test=(name,input,status,fragment)=>{
 const res=assessPrerequisites(input);
 assert.equal(res.status,status,name);
 assert(res.reason.includes(fragment),name+' reason missing');
 assert(res.steps.length>=1&&res.steps.every(s=>typeof s==='string'&&s.length>10));
};
test('invalid course',{course:'made-up'},'blocked','Sélectionnez');
for(const course of Object.keys(COURSES)){
 test('sensitive blocked for '+course,{course,privacy:'real-sensitive'},'blocked','Ne transmettez');
 test('unknown privacy for '+course,{course,privacy:'unknown'},'prepare','ne savons pas');
}
test('non AI suitable',{course:'processus',task:'one-off'},'alternative','ne justifie pas');
test('repeatable',{course:'processus'},'ready','compte payant');
test('invalid JSON',{course:'automatisation',sample:'{"id":},'},'prepare','ne peut pas être analysée');
test('array JSON invalid',{course:'automatisation',sample:'[]'},'prepare','champs texte');
test('object missing status',{course:'automatisation',sample:'{"id":"x"}'},'prepare','champs texte');
test('valid JSON',{course:'automatisation',sample:'{"id":"x","statut":"ok"}'},'ready','ne prouve ni');
test('agent local',{course:'agents'},'alternative','simulateur fictif');
test('agent budget missing',{course:'agents',toolAccess:'live'},'prepare','sans limites');
test('agent budget approved is still not verified',{course:'agents',toolAccess:'live',budget:'confirmed'},'prepare','ne peut ni vérifier');
test('webgl absent',{course:'sites-3d',webgl:false},'alternative','sans GPU');
test('webgl present still needs device QA',{course:'sites-3d',webgl:true},'ready','restent non testés');
console.log('PASS Academy prerequisite policy — four courses, sensitive data denial, missing costs, false-ready prevention');
