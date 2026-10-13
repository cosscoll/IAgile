import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','academy-app');
const server=createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const resolved=path.resolve(root,'.'+name);
  if(!resolved.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(resolved);
  res.writeHead(200,{'Content-Type':resolved.endsWith('.html')?'text/html':resolved.endsWith('.css')?'text/css':'text/javascript'});
  res.end(bytes);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:320,height:720},permissions:[]});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/preflight.html');
 await page.locator('#course').selectOption('processus');
 await page.locator('#task').selectOption('one-off');
 await page.locator('#preflight-form button[type="submit"]').click();
 assert.match(await page.locator('#diagnostic-title').innerText(),/sans IA/);
 assert.equal(await page.locator('#diagnostic').getAttribute('data-status'),'alternative');
 await page.locator('input[value="real-sensitive"]').check();
 await page.locator('#preflight-form button[type="submit"]').click();
 assert.match(await page.locator('#diagnostic-title').innerText(),/non autorisées/);
 assert.equal(await page.locator('#diagnostic').getAttribute('data-status'),'blocked');
 await page.locator('input[value="synthetic"]').check();
 await page.locator('#course').selectOption('automatisation');
 await page.locator('#json-sample').fill('{"id":}');
 await page.locator('#preflight-form button[type="submit"]').click();
 assert.match(await page.locator('#diagnostic-title').innerText(),/JSON/);
 await page.locator('#json-sample').fill('{"id":"A","statut":"a_traiter"}');
 await page.locator('#preflight-form button[type="submit"]').click();
 assert.match(await page.locator('#diagnostic-title').innerText(),/Simulation/);
 await page.locator('#course').selectOption('agents');
 await page.locator('#tool-access').selectOption('live');
 await page.locator('#preflight-form button[type="submit"]').click();
 assert.match(await page.locator('#diagnostic-title').innerText(),/Budget/);
 await page.locator('#course').selectOption('sites-3d');
 await page.locator('#preflight-form button[type="submit"]').click();
 assert.match(await page.locator('#diagnostic-title').innerText(),/WebGL|Navigateur compatible/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true,'No horizontal overflow on 320px');
 assert.deepEqual(errors,[],'No browser script errors');
 await page.close();
 console.log('PASS Academy preflight: four paths, blocked privacy, JSON correction, live-agent checks, mobile browser');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
