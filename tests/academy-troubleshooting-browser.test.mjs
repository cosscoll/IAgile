import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','academy-app');
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const absolute=path.resolve(root,'.'+pathname);
  if(!absolute.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(absolute);
  res.writeHead(200,{'Content-Type':absolute.endsWith('.html')?'text/html':absolute.endsWith('.css')?'text/css':'text/javascript'});
  res.end(bytes);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:320,height:720}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/depannage.html');
 assert.equal(await page.locator('.troubleshoot-card').count(),20);
 assert.match(await page.locator('#search-status').innerText(),/20 fiche/);
 await page.locator('#course-filter').selectOption('agents');
 assert.equal(await page.locator('.troubleshoot-card').count(),5);
 await page.locator('#course-filter').selectOption('automatisation');
 await page.locator('#query-filter').fill('429');
 assert.equal(await page.locator('.troubleshoot-card').count(),1);
 assert.match(await page.locator('.troubleshoot-card h3').innerText(),/429/);
 await page.locator('#course-filter').selectOption('sites-3d');
 await page.locator('#query-filter').fill('camera');
 assert((await page.locator('.troubleshoot-card').count())>=1);
 await page.locator('#query-filter').fill('<img src=x onerror=alert(1)>');
 assert.equal(await page.locator('.troubleshoot-card').count(),0);
 assert.equal(await page.locator('img').count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true);
 assert.deepEqual(errors,[]);
 await page.close();
 console.log('PASS troubleshooting browser: 20 cards, filters, accent-aware search, safe DOM and 320px screen');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
