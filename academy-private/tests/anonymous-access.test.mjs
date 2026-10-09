import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../config.js';

const protectedTables = [
  'academy_courses',
  'academy_instructor_courses',
  'academy_course_modules',
  'academy_course_assets',
  'academy_deliverable_prompts',
  'academy_deliverable_answers',
  'academy_enrollments',
  'academy_module_progress',
  'academy_profiles'
];

for (const table of protectedTables) {
  test('anonymous API cannot read private rows: '+table, async () => {
    const url = SUPABASE_URL + '/rest/v1/' + table + '?select=*&limit=3';
    const response = await fetch(url, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
      signal: AbortSignal.timeout(12000)
    });
    if (response.ok) {
      const rows = await response.json();
      assert(Array.isArray(rows) && rows.length===0, 'Unexpected anonymous data exposure: '+table);
    } else {
      assert([401,403,404].includes(response.status), 'Unexpected API response status '+response.status);
    }
  });
}
