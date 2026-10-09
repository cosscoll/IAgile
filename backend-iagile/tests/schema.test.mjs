import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src = fs.readFileSync(new URL('../supabase/database.types.ts', import.meta.url),'utf8');
const required = [
'academy_courses','academy_course_modules','academy_course_assets',
'academy_enrollments','academy_profiles','academy_module_progress',
'academy_deliverable_prompts','academy_deliverable_answers','academy_instructor_courses'
];
test('typed academy schema includes all nine live tables', () => {
  for (const table of required) assert(src.includes(table + ': {'), 'missing table: '+table);
});
test('premium content and enrollment have explicit published and access fields', () => {
  for (const field of ['body_markdown: string','published: boolean','course_slug: string','user_id: string','active: boolean']) {
    assert(src.includes(field), 'missing required field: '+field);
  }
});
test('no server secrets are present in generated types', () => {
  assert(!/\b(?:sk-proj-|sb_secret_|service_role)\S{10,}/.test(src));
});
