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

test('learner notes preserve ownership and completion state',()=>{
  assert(js.includes("id='module-notes-'"));
  assert(js.includes("existingNotes.set(mod.module_index,notes)"));
  assert(js.includes("completed:done.has(mod.module_index),notes"));
  assert(js.includes("updated_at:new Date().toISOString()"));
});
test('sign-out clears protected content from the DOM',()=>{
  assert(js.includes('function clearPrivateContent()'));
  for(const id of ["'courses'","'modules'","'prompts'"]) assert(js.includes(id));
  assert(js.includes("if(event==='SIGNED_OUT'){user=null;recovering=false;clearPrivateContent()"));
});

test('progress is measurable and updates after completion changes',()=>{
  assert(html.includes('id="progressMeter"'));
  assert(html.includes('id="progressText"'));
  assert(js.includes("const refreshProgress=()=>"));
  assert(js.includes("refreshProgress();message('Progression enregistrée.')"));
});
