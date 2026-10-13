import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','academy-app');
const server=createServer(async(req,res)=>{
  try{
    const pathname=new URL(req.url,'http://localhost').pathname;
    const abs=path.resolve(root,'.'+decodeURIComponent(pathname));
    if(!abs.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const body=await fs.readFile(abs);
    const type=abs.endsWith('.html')?'text/html':abs.endsWith('.css')?'text/css':'text/javascript';
    res.writeHead(200,{'Content-Type':type});res.end(body);
  }catch(_error){res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
async function openRole(role){
  const page=await browser.newPage();
  await page.addInitScript(value=>{
    window.__mockRole=value;
    const answer={user_id:'user_sample',course_slug:'processus',deliverable_index:3,
      content:'<img src=x onerror="window.__injected=1">',updated_at:'2026-10-12T12:00:00.000Z'};
    let review=null;
    const response={
      academy_instructor_courses:[{course_slug:'processus'}],
      academy_courses:[{slug:'processus',title:'IA au quotidien',published:true}],
      academy_deliverable_prompts:[{course_slug:'processus',deliverable_index:3,title:'Exercice test',published:true}],
      academy_deliverable_answers:value==='teacher-large'?Array.from({length:120},(_,i)=>({...answer,user_id:'learner_'+String(i).padStart(3,'0'),content:'Réponse synthétique '+i})): [answer],
      academy_deliverable_feedback:[]
    };
    const makeQuery=table=>{
      let start=0,end=Number.MAX_SAFE_INTEGER;
      const q={
        select(){return q},eq(){return q},in(){return q},order(){return q},range(a,b){start=a;end=b;return q},limit(){return q},
        maybeSingle:async()=>({data:table==='academy_profiles'?{account_status:'active'}:
          table==='academy_deliverable_feedback'?review:null,error:null}),
        upsert:async payload=>{
          if(!['teacher','teacher-large'].includes(value))return {error:{message:'RLS'}};
          if(payload.answer_updated_at!==answer.updated_at)return {error:{message:'stale'}};
          review=payload;return {error:null};
        },
        then(resolve,reject){
          const data=!['teacher','teacher-large'].includes(value)?[]:
            (table==='academy_deliverable_feedback'?(review?[review]:[]):(response[table]||[])).slice(start,end+1);
          return Promise.resolve({data,error:null}).then(resolve,reject);
        }
      };
      return q;
    };
    window.supabase={createClient:()=>({
      auth:{
        getUser:async()=>({data:{user:value==='visitor'?null:{id:'instructor_example',email:'teacher@example.invalid'}},error:null}),
        signInWithOtp:async()=>({error:null}),signOut:async()=>({error:null}),
        onAuthStateChange:()=>({})
      },
      from:makeQuery
    })};
  },role);
  await page.route('**/cdn.jsdelivr.net/**',route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(base+'/instructor.html');
  return page;
}
try{
  const guest=await openRole('visitor');
  await guest.locator('#auth-section').waitFor({state:'visible'});
  assert.equal(await guest.locator('.instructor-copy').count(),0);
  await guest.close();
  const denied=await openRole('unauthorized');
  await denied.locator('#auth-section').waitFor({state:'visible'});
  assert.equal(await denied.locator('.instructor-copy').count(),0);
  await denied.close();
  const teacher=await openRole('teacher');
  await teacher.locator('.instructor-copy').waitFor({state:'visible'});
  assert.equal(await teacher.locator('img').count(),0,'Answer markup must remain inert');
  assert((await teacher.locator('.instructor-answer').innerText()).includes('<img src=x'));
  assert.equal(await teacher.evaluate(()=>window.__injected||0),0);
  await teacher.locator('textarea').fill('Merci de préciser les sources et les décisions à valider.');
  await teacher.locator('.instructor-review-form button').click();
  await teacher.getByText('Correction enregistrée et confirmée pour cette version.').waitFor();
  assert.equal(await teacher.locator('.instructor-copy').count(),1);
  await teacher.close();
  const many=await openRole('teacher-large');
  await many.locator('.instructor-copy').first().waitFor({state:'visible'});
  assert.equal(await many.locator('.instructor-copy').count(),50);
  assert.equal(await many.locator('#next-page').isEnabled(),true);
  await many.locator('#next-page').click();
  await many.getByText('Page 2', {exact:false}).first().waitFor();
  assert.equal(await many.locator('.instructor-copy').count(),50);
  await many.locator('#next-page').click();
  await many.getByText('Page 3', {exact:false}).first().waitFor();
  assert.equal(await many.locator('.instructor-copy').count(),20);
  assert.equal(await many.locator('#next-page').isDisabled(),true);
  await many.locator('#previous-page').click();
  await many.getByText('Page 2', {exact:false}).first().waitFor();
  assert.equal(await many.locator('.instructor-copy').count(),50);
  await many.close();
  console.log('PASS instructor browser: guest denied, RLS mock review, inert HTML and 120-copy pagination');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
