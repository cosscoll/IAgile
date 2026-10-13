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
 const page=await browser.newPage({viewport:{width:320,height:720}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/atelier-preuve.html');
 assert.match(await page.locator('#scenario-step').innerText(),/1 SUR 2/);
 await page.locator('input[name=choice][value=A]').check();
 await page.locator('input[name=risk][value=unconfirmed]').check();
 await page.locator('#explanation').fill('Il manque une confirmation que le calendrier ne fournit pas.');
 await page.locator('#evidence-form button[type=submit]').click();
 assert.match(await page.locator('#result-title').innerText(),/à revoir/);
 assert.equal(await page.locator('#transfer-button').isHidden(),true);
 await page.locator('input[name=choice][value=B]').check();
 await page.locator('#evidence-form button[type=submit]').click();
 assert.match(await page.locator('#result-title').innerText(),/cohérent/);
 await page.locator('#transfer-button').click();
 assert.match(await page.locator('#scenario-step').innerText(),/2 SUR 2/);
 assert.equal(await page.locator('input[name=choice]:checked').count(),0,'Transfer must not keep previous answer');
 await page.locator('input[name=choice][value=B]').check();
 await page.locator('input[name=risk][value=unconfirmed]').check();
 await page.locator('#explanation').fill('Il n’existe aucune preuve système que le remboursement a été effectué.');
 await page.locator('#evidence-form button[type=submit]').click();
 assert.match(await page.locator('#result-title').innerText(),/cohérent/);
 assert.match(await page.locator('.evidence-disclaimer').innerText(),/pas été corrigée par une personne/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true);
 assert.deepEqual(errors,[]);
 console.log('PASS Academy evidence browser: wrong answer, justified choice, distinct case and 320px viewport');
 await page.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
