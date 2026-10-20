import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const names=['LUMEN-MESSAGES.md','LUMEN-REGLES.md','ORBE-ENCAISSEMENTS.csv','ORBE-EVENEMENTS.csv','ORBE-REGLES.md','SILLAGE-AGENDA.csv','SILLAGE-CONFIDENTIALITE.csv','SILLAGE-CONTRAINTES.md','SILLAGE-DECISIONS.md','SILLAGE-POLITIQUE.md','SILLAGE-REUNION.md','SILLAGE-TACHES.csv'];
const rows=names.map((name,i)=>{const content='Synthetic fixture '+(i+1)+' for a private course upload check.\n';const b=Buffer.from(content);return {file:'datasets/'+name,private_storage_path:'processus/datasets/'+name,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),content};});
const manifest={course_slug:'processus',version:'0.1',status:'draft_unpublished',files:rows.map(({content,...rest})=>rest)};
const unzipMock='export function unzipSync(bytes,opts={}){const enc=new TextEncoder();const isBomb=new TextDecoder().decode(bytes).includes("BOMB");const rows='+JSON.stringify(rows)+';const payloads=[["manifest.json",enc.encode('+JSON.stringify(JSON.stringify(manifest))+')],...rows.map(row=>[row.file,enc.encode(row.content)])];if(isBomb)payloads.push(["datasets/BOMB.md",enc.encode("bomb")]);const all={};for(const [name,data] of payloads){const originalSize=name==="datasets/BOMB.md"?999999999:data.byteLength;if(opts.filter?.({name,originalSize})!==false)all[name]=data;}return all;}';
const supabaseMock='export function createClient(){let active=true;const user={id:"FORMATEUR",email:"qa@example.invalid"};const rows='+JSON.stringify(rows)+';const saved=new Map();window.__importTestState={uploaded:[],saved};return {auth:{async getUser(){return {data:{user:active?user:null},error:null}},async signInWithPassword(){active=true;return {error:null}},async signOut(){active=false;return {error:null}},onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}}}},from(table){let filters=[];return {select(){return this},eq(k,v){filters.push([k,v]);return this},order(){return this},maybeSingle(){return Promise.resolve({data:{account_status:"active"},error:null})},then(resolve,reject){let data=table==="academy_instructor_courses"?[{instructor_id:"FORMATEUR",course_slug:"processus"}]:table==="academy_course_assets"?rows.map(r=>({course_slug:"processus",storage_path:r.private_storage_path,content_sha256:r.sha256,content_bytes:r.bytes,source_version:"v0.1",published:false})):[];return Promise.resolve({data:data.filter(r=>filters.every(([k,v])=>r[k]===v)),error:null}).then(resolve,reject)}}},storage:{from(bucket){if(bucket!=="iagile-course-files")throw Error("bucket");return {async download(path){const b=saved.get(path);return b?{data:new Blob([b]),error:null}:{data:null,error:{statusCode:"404"}}},async upload(path,blob,options){if(options.upsert!==false||saved.has(path))return {error:{statusCode:"409"}};saved.set(path,new Uint8Array(await blob.arrayBuffer()));window.__importTestState.uploaded.push(path);return {error:null}}}}}}}';
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR'});
 await context.route('https://esm.sh/**',route=>{
  const uri=route.request().url();
  return route.fulfill({status:200,contentType:'text/javascript',headers:{'access-control-allow-origin':'*'},body:uri.includes('fflate@0.8.2')?unzipMock:supabaseMock});
 });
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:8123/academy-private/import.html',{waitUntil:'domcontentloaded'});
 await page.locator('#importer').waitFor({state:'visible',timeout:20000});
 await page.locator('#package').setInputFiles({name:'bomb.zip',mimeType:'application/zip',buffer:Buffer.from('BOMB')});
 await page.locator('#verify').click();
 await page.getByText(/Vérification refusée : Fichier ZIP annoncé trop volumineux/).waitFor({timeout:12000});
 assert.equal(await page.locator('#upload').isDisabled(),true);
 // A rejected archive must never lead to an upload.
 assert.equal(await page.evaluate(()=>window.__importTestState.uploaded.length),0);
 await page.locator('#package').setInputFiles({name:'synthetic.zip',mimeType:'application/zip',buffer:Buffer.from('LOCAL TEST ONLY')});
 await page.locator('#verify').click();
 await page.getByText('12 fichiers vérifiés. Vous pouvez déclencher l’import privé.').waitFor({timeout:12000});
 assert.equal(await page.locator('#files li').count(),12);
 await page.locator('#upload').click();
 await page.getByText(/Import privé terminé : 12\/12 fichiers vérifiés/).waitFor({timeout:12000});
 assert.equal(await page.evaluate(()=>window.__importTestState.uploaded.length),12);
 assert.deepEqual(errors,[]);
 await page.locator('#signout').click();
 await page.locator('#auth').waitFor({state:'visible'});
 assert.equal(await page.locator('#importer').isVisible(),false);
 assert.equal(await page.locator('#files li').count(),0);
 console.log('PASS: all 12 synthetic ZIP entries verified and uploaded to mocked private Storage; logout purges UI');
 await context.close();
}finally{await browser.close();}
