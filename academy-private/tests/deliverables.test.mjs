import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const js=fs.readFileSync(new URL('../deliverables.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
test('apprenant: livrables connectés au cours',()=>{assert(app.includes("import { loadDeliverables }"));assert(app.includes("target:$('prompts')"));});
test('apprenant: données filtrées et rendues sans HTML non fiable',()=>{for(const x of [".eq('course_slug',course.slug)",".eq('published',true)",".eq('user_id',user.id)"])assert(js.includes(x));assert(!js.includes('.innerHTML'));});
test('apprenant: sauvegarde limitée aux réponses personnelles',()=>{assert(js.includes("user_id:user.id"));assert(js.includes("academy_deliverable_answers"));assert(js.includes("onConflict:'user_id,course_slug,deliverable_index'"));});
