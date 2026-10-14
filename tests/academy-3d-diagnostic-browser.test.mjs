import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','academy-app');
const server=createServer(async(req,res)=>{
 try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'text/javascript'});res.end(bytes);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:320,height:680},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/diagnostic-3d.html');
 await page.locator('#diag-status').waitFor({state:'visible'});
 assert((await page.locator('#diag-status').innerText()).includes('Contexte')||
   (await page.locator('#diag-status').innerText()).includes('WebGL'));
 assert((await page.locator('#environment').innerText()).includes('NON TESTÉ'));
 assert((await page.locator('#environment').innerText()).includes('Demandé'));
 assert.equal(await page.locator('.diag3d nav a').count(),3);
 await page.locator('#run-again').click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true);
 assert.deepEqual(errors,[]);
 console.log('PASS 3D browser: device check, no invented FPS, fallback navigation, reduced motion, 320px');
 await page.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
