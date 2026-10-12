// Full synthetic nine-module/nine-assignment Pilot Processus browser journey.
// No real student, paid lesson text, source dataset or correction is embedded.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','academy-app');
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    const full=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const body=await fs.readFile(full);
    res.writeHead(200,{'Content-Type':full.endsWith('.html')?'text/html':full.endsWith('.css')?'text/css':'text/javascript'});
    res.end(body);
  }catch(_e){res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch();
try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.addInitScript(()=>{
    const progress=new Map(),answers=new Map();
    window.__pilotMock={progress,answers,signRequests:0,denied:false};
    const modules=Array.from({length:9},(_,i)=>({module_index:i,title:'Module fictif '+(i+1),
      body_markdown:'# Travail pédagogique fictif '+(i+1)+'\n\nVérifier les données. <script>alert(1)</script>'}));
    const tasks=Array.from({length:9},(_,i)=>({deliverable_index:i,title:'Livrable test '+(i+1),
      instructions_markdown:'## Cas fictif '+(i+1)+'\n\nExpliquez votre contrôle.'}));
    const assets=Array.from({length:12},(_,i)=>({asset_key:'asset'+i,
      title:'Fichier fictif '+(i+1),storage_path:'processus/datasets/TEST-'+i+'.md',
      module_index:i%9,content_bytes:30}));
    const values=table=>({
      academy_enrollments:[{course_slug:'processus',active:true}],
      academy_course_modules:modules,academy_deliverable_prompts:tasks,
      academy_module_progress:[...progress.entries()].map(([i,r])=>({module_index:i,...r})),
      academy_deliverable_answers:[...answers.entries()].map(([i,r])=>({deliverable_index:i,...r})),
      academy_deliverable_feedback:[],academy_course_assets:assets
    })[table]||[];
    const query=table=>{
      const q={select(){return q},eq(){return q},order(){return q},in(){return q},limit(){return q},
        maybeSingle:async()=>({data:table==='academy_profiles'?{account_status:'active'}:
          table==='academy_courses'?{slug:'processus',published:true}:null,error:null}),
        upsert:async payload=>{
          if(table==='academy_deliverable_answers'){
            answers.set(payload.deliverable_index,{content:payload.content,updated_at:new Date().toISOString()});
            return {error:null};
          }
          return {error:{message:'denied'}};
        },
        then(resolve,reject){return Promise.resolve({data:values(table),error:null}).then(resolve,reject)}
      };return q;
    };
    window.supabase={createClient:()=>({
      auth:{getUser:async()=>({data:{user:{id:'pilot-synthetic',email:'pilot@example.invalid'}},error:null}),
        signInWithOtp:async()=>({error:null}),signOut:async()=>({error:null}),onAuthStateChange:()=>({})},
      from:query,
      rpc:async(name,payload)=>{
        if(name!=='academy_save_progress')return {error:{message:'unknown rpc'}};
        const prev=progress.get(payload.p_module_index)||{completed:false,notes:''};
        const next={...prev,
          completed:payload.p_completed===undefined?prev.completed:payload.p_completed,
          notes:payload.p_notes===undefined?prev.notes:payload.p_notes};
        progress.set(payload.p_module_index,next);return {data:next,error:null};
      },
      storage:{from:()=>({createSignedUrl:async p=>{
        window.__pilotMock.signRequests++;
        return {data:{signedUrl:window.IAgileAcademyConfig.url+
          '/storage/v1/object/sign/iagile-course-files/'+p+'?token=synthetic'},error:null};
      }})}
    })};
  });
  await page.route('**/cdn.jsdelivr.net/**',r=>r.fulfill({status:200,body:'',contentType:'text/javascript'}));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/cours/processus/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('.module-nav-choice').first().waitFor();
  assert.equal(await page.locator('.module-nav-choice').count(),9);
  assert.equal(await page.locator('.deliverable-card').count(),9);
  assert.equal(await page.locator('.course-resource').count(),12);
  assert.equal(await page.locator('.lesson:visible').count(),1);
  assert.equal(await page.locator('script[src*="onerror"]').count(),0);
  assert.equal(await page.locator('.lesson-body script').count(),0);
  assert.equal(await page.locator('.course-resource a:visible').count(),0);
  assert.equal(await page.evaluate(()=>window.__pilotMock.signRequests),0);
  await page.locator('.module-nav-choice').nth(8).click();
  assert((await page.locator('.lesson:visible h4').textContent()).includes('Module fictif 9'));
  const notes=page.locator('.lesson:visible .lesson-notes-form');
  await notes.locator('textarea').fill('Ma méthode fictive : vérifier.');
  await notes.locator('button').click();
  await notes.getByText('Notes enregistrées.').waitFor();
  await page.locator('.lesson:visible button.complete-button').first().click();
  await page.getByText('1 module(s) terminés sur 9').waitFor();
  const state=await page.evaluate(()=>window.__pilotMock.progress.get(8));
  assert.equal(state.completed,true);
  assert.equal(state.notes,'Ma méthode fictive : vérifier.');
  const task=page.locator('.deliverable-card').nth(8);
  await task.locator('textarea').fill('Démonstration fictive avec contrôles explicites et sources.');
  await task.locator('button').click();
  await task.getByText('Travail enregistré. Vous pouvez reprendre cette réponse plus tard.').waitFor();
  assert.equal(await page.evaluate(()=>window.__pilotMock.answers.size),1);
  await page.locator('.course-resource').first().locator('button').click();
  await page.locator('.course-resource').first().locator('a:visible').waitFor();
  assert.equal(await page.evaluate(()=>window.__pilotMock.signRequests),1);
  assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3)),'Mobile overflow');
  assert.deepEqual(errors,[],'Mock pilot page must have no JavaScript exceptions');
  await page.close();
  console.log('PASS full mock pilot: 9 modules, 9 deliverables, 12 gated assets, mobile, notes, progress, hand-in');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
