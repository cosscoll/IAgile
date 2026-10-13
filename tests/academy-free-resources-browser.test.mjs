import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','ressources');
const server=createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const abs=path.resolve(root,'.'+name);
  if(!abs.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await fs.readFile(abs);
  res.writeHead(200,{'Content-Type':abs.endsWith('.css')?'text/css':abs.endsWith('.js')?'text/javascript':'text/html'});
  res.end(bytes);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:320,height:700}});
 await page.goto(base+'/incident-lab.html');
 await page.locator('input[value="status"]').check();
 await page.getByRole('button',{name:'Vérifier mon hypothèse'}).click();
 assert.match(await page.locator('#incident-result').innerText(),/SUCCESS/);
 await page.locator('input[value="filter"]').check();
 await page.getByRole('button',{name:'Vérifier mon hypothèse'}).click();
 assert.match(await page.locator('#incident-result').innerText(),/Bonne première piste/);
 assert.equal(await page.locator('#incident-diagnostic').count(),1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+3),true,
  'Incident Lab must not overflow on 320px viewport');

 await page.goto(base+'/brief-site-3d.html');
 await page.getByRole('button',{name:'Préparer le brief'}).click();
 assert.match(await page.locator('#brief-result').innerText(),/Précisez au minimum/);
 assert.equal(await page.locator('#save-brief').isHidden(),true);
 await page.locator('#goal').fill('Expliquer un produit fictif');
 await page.locator('#role').fill('Orienter vers les différents espaces');
 await page.getByRole('button',{name:'Préparer le brief'}).click();
 assert.match(await page.locator('#brief-result').innerText(),/Expliquer un produit fictif/);
 assert.equal(await page.locator('#save-brief').isVisible(),true);
 await page.locator('#role').fill('Nouvelle raison de la 3D');
 assert.equal(await page.locator('#save-brief').isHidden(),true,
  'Export must be invalidated after a brief field changes');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+3),true,
  '3D briefing must not overflow on 320px viewport');

 await page.goto(base+'/agent-readiness.html');
 await page.locator('#agent-c0').check();
 assert.match(await page.locator('#agent-result').innerText(),/1 \/ 10 points/);
 await page.locator('#agent-c0').uncheck();
 assert.match(await page.locator('#agent-result').innerText(),/0 \/ 10 points/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+3),true,
  'Agent readiness must not overflow on 320px viewport');
 await page.close();
 console.log('PASS free public resources: interactive incident, safe 3D brief and agent checklist at 320px');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
