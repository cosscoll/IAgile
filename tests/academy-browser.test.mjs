// Non-public Academy Chromium smoke tests, mocked Supabase only.
// Does not prove real authentication, database RLS or Vercel deployment.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=path.join(root,'academy-app');
const output=path.join(root,'academy-browser-artifacts');
fs.mkdirSync(output,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=createServer(async(req,res)=>{
 try {
   const requested=new URL(req.url,'http://127.0.0.1').pathname;
   const target=path.resolve(app,'.'+decodeURIComponent(requested));
   if(target!==app&&!target.startsWith(app+path.sep)){res.writeHead(403);res.end();return;}
   const bytes=await readFile(target);
   res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});
   res.end(bytes);
 }catch(_error){res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;

function setupFakeSupabase(){
 window.supabase={
  createClient:()=>({
   auth:{
    getUser:async()=>({data:{user:window.__mockAuthenticated?
       {id:'fake-user',email:'pilot@example.invalid'}:null},error:null}),
    signInWithOtp:async()=>({error:null}),
    signOut:async()=>({error:null}),
    onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})
   },
   from:table=>{
    const q={
     select(){return q},
     eq(){return q},
     maybeSingle(){return Promise.resolve({data:table==='academy_profiles'?
       {account_status:'active'}:table==='academy_courses'?
       {slug:'agents',published:false}:null,error:null})},
     then(resolve,reject){return Promise.resolve({data:
       table==='academy_enrollments'?[{course_slug:'agents',active:true}]:
       table==='academy_courses'?[{slug:'agents',published:false}]:[],
       error:null}).then(resolve,reject)},
     order(){return Promise.resolve({data:[],error:null})}
    };
    return q;
   }
  })
 };
}
let browser;
try {
 browser=await chromium.launch({headless:true});
 async function setup(page,authenticated=false){
  await page.addInitScript(value=>{window.__mockAuthenticated=value;},authenticated);
  await page.route('https://cdn.jsdelivr.net/**/supabase.js',route=>route.fulfill({
   status:200,contentType:'text/javascript',body:'('+setupFakeSupabase.toString()+')();'
  }));
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  return errors;
 }
 for(const {label,width,height} of [
  {label:'desktop',width:1440,height:900},
  {label:'mobile',width:375,height:812},
  {label:'small-mobile',width:320,height:640}
 ]){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=await setup(page);
  await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('Connectez-vous'));
  assert.equal(await page.locator('#auth-section').isVisible(),true,label+' sign-in form missing');
  assert.equal(await page.locator('#learner-section').isVisible(),false,label+' premium UI leaked');
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),label+' horizontal overflow');
  assert.deepEqual(errors,[],label+' JavaScript browser errors');
  await page.screenshot({path:path.join(output,'academy-'+label+'.png'),fullPage:true});
  console.log('PASS '+label+' anonymous layout and access gating');
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=await setup(page,true);
 await page.goto(base+'/cours/agents/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('en préparation'));
 assert.equal(await page.locator('#learner-section').isVisible(),true);
 assert.equal(await page.locator('#modules').isVisible(),false);
 assert.equal(await page.locator('#deliverables').isVisible(),false);
 assert.deepEqual(errors,[]);
 await page.screenshot({path:path.join(output,'academy-preparation.png'),fullPage:true});
 console.log('PASS published state gate: unpublished course and assignments remain invisible');
 await page.close();
}finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
