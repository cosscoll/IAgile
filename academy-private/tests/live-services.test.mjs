import test from 'node:test';
import assert from 'node:assert/strict';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '../config.js';

test('live Supabase Auth service responds without server errors',async()=>{
 const response=await fetch(SUPABASE_URL+'/auth/v1/health',{
   headers:{apikey:SUPABASE_PUBLISHABLE_KEY},
   signal:AbortSignal.timeout(12000)
 });
 assert.equal(response.status,200,'Supabase Auth health endpoint must return HTTP 200');
});

test('live private Storage does not issue anonymous course downloads',async()=>{
 const path='/storage/v1/object/authenticated/iagile-course-files/processus/datasets/LUMEN-REGLES.md';
 const response=await fetch(SUPABASE_URL+path,{
   headers:{apikey:SUPABASE_PUBLISHABLE_KEY},
   signal:AbortSignal.timeout(12000)
 });
 assert.notEqual(response.status,200,'Private course files must never be accessible to anonymous requests');
 assert([400,401,403,404].includes(response.status),'Unexpected storage status '+response.status);
});
