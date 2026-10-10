import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../instructor.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../instructor.js',import.meta.url),'utf8');
test('formateur: structure accessible',()=>{for(const id of ['teacherAuth','teacherDashboard','teacherCourses','teacherStatus'])assert(html.includes('id="'+id+'"'));assert(html.includes('noindex,nofollow'));});
test('formateur: autorisations',()=>{assert(js.includes("from('academy_instructor_courses')"));assert(js.includes(".eq('instructor_id',teacher.id)"));assert(js.includes("profile?.account_status!=='active'"));});
test('formateur: consultation des réponses, écriture limitée au retour pédagogique',()=>{assert(js.includes("from('academy_deliverable_answers')"));assert(js.includes("from('academy_deliverable_feedback').upsert(payload"));assert(!/from\(['"]academy_(?:deliverable_answers|enrollments|module_progress)['"]\)\.\s*(?:upsert|insert|update|delete)/.test(js));assert(!js.includes('.innerHTML'));});

test('formateur: sortie nettoie les donnees privees',()=>{
  assert(js.includes('function clearStudentData()'));
  assert(js.includes("['teacherCourses','learners','learnerDetails']"));
  assert(/if\(event==='SIGNED_OUT'\)\{[^}]*authGuard\.invalidate\(\);[^}]*clearStudentData\(\)/.test(js));
});

test('formateur: grille de livrable visible sans modification ni HTML non fiable',()=>{
  assert(js.includes("from('academy_deliverable_prompts')"));
  assert(js.includes(".eq('published',true)"));
  assert(js.includes("renderCourseMarkdown(prompt.instructions_markdown)"));
  assert(js.includes("'Voir les consignes et critères d’évaluation'"));
});

test('formateur: validation et commentaire pédagogique',()=>{assert(js.includes("'needs_revision'"));assert(js.includes("'validated'"));assert(js.includes('feedbackText.length<20'));});
