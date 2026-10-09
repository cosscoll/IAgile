import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const cfg=fs.readFileSync(new URL('../config.js',import.meta.url),'utf8');
test('portal has accessible authentication and learner regions',()=>{
  for(const id of ['main','loginForm','email','password','dashboard','courses','modules','status','signout'])
    assert(html.includes('id="'+id+'"'),'missing: '+id);
  assert(html.includes('role="status"')&&html.includes('aria-live'));
  assert(html.includes('name="robots" content="noindex,nofollow"'));
});
test('portal reads only assigned courses and published lessons',()=>{
  assert(js.includes("from('academy_enrollments')"));
  assert(js.includes(".eq('user_id',user.id).eq('active',true)"));
  assert(js.includes("from('academy_course_modules')"));
  assert(js.includes(".eq('published',true)"));
  assert(js.includes("from('academy_module_progress')"));
});
test('portal never grants enrollments or inserts private course content',()=>{
  assert(!/from\(['"]academy_enrollments['"]\)\.(?:insert|update|upsert|delete)/.test(js));
  assert(!/from\(['"]academy_course_modules['"]\)\.(?:insert|update|upsert|delete)/.test(js));
  assert(!js.includes('.innerHTML'));
});
test('browser config is publishable-only, never a server credential',()=>{
  assert(cfg.includes('SUPABASE_PUBLISHABLE_KEY'));
  assert(!/sb_secret_|service_role|sk-proj-/.test(cfg));
});
