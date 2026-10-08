import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.xml':'application/xml'};
const server = http.createServer(async (req,res)=>{
  try {
    const parsed = new URL(req.url, 'http://localhost');
    const raw = decodeURIComponent(parsed.pathname);
    const rel = (raw.startsWith('/') ? raw.slice(1) : raw) || 'index.html';
    const requested = path.resolve(root, rel);
    if (requested!==root && !requested.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
    const file = (await fs.stat(requested)).isDirectory()?path.join(requested,'index.html'):requested;
    res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});
    res.end(await fs.readFile(file));
  } catch {res.writeHead(404).end('Not Found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/';
let browser;let passed=0;
const test=(name,fn)=>({name,fn});
const tests=[
  test('all four resources load and remain navigable',async page=>{
    for(const name of ['index.html','diagnostic-ia.html','diagnostic-10-questions.html','incident-lab.html','agent-readiness.html','brief-site-3d.html']){
      const response=await page.goto(base+'ressources/'+name);
      assert.equal(response.status(),200,name);
      assert.ok(await page.locator('h1').count(),name+' missing main heading');
      assert.ok(await page.locator('main').count(),name+' missing main');
    }
    await page.goto(base+'ressources/index.html');
    for(const p of ['diagnostic-ia','incident-lab','agent-readiness','brief-site-3d'])assert.ok(await page.locator('main a[href="'+p+'.html"]').count());
  }),
  test('course CTAs point to real resources',async page=>{
    for(const [course,resource] of [['ia-au-quotidien','diagnostic-ia'],['automatiser-tache','incident-lab'],['agents-personnalises','agent-readiness'],['sites-web-3d','brief-site-3d']]){
      await page.goto(base+'formations/'+course+'.html');
      const link=page.locator('a[href="../ressources/'+resource+'.html"]');
      assert.equal(await link.count(),1,'missing CTA for '+course);
      await link.click();
      await page.waitForURL('**/ressources/'+resource+'.html');
      assert.equal(await page.locator('h1').count(),1);
    }
  }),
  test('10 question diagnostic gives three recommendations with risk controls',async page=>{
    await page.goto(base+'ressources/diagnostic-10-questions.html');
    assert.equal(await page.locator('fieldset.question').count(),10);
    for(const [name,value] of [['domaine','redaction'],['frequence','4'],['duree','3'],['difficulte','verification'],['sensibilite','sensibles'],['impact','eleve'],['controle','non'],['stabilite','variable'],['transfert','non'],['priorite','qualite']]){
      await page.locator('input[name="'+name+'"][value="'+value+'"]').check();
    }
    assert.match(await page.locator('#diagnostic-progress').innerText(),/10 \/ 10/);
    await page.locator('#diagnostic10 button[type="submit"]').click();
    assert.equal(await page.locator('#diagnostic-results ol li').count(),3);
    assert.match(await page.locator('#diagnostic-results').innerText(),/Contrôle humain/);
    assert.match(await page.locator('#diagnostic-results').innerText(),/Données confidentielles/);
    const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('#save-diagnostic').click()]);
    assert.equal(dl.suggestedFilename(),'iagile-diagnostic-processus.txt');
    await page.locator('input[name="sensibilite"][value="publiques"]').check();
    assert.equal(await page.locator('#diagnostic-results').isVisible(),false);
  }),
  test('scorecard computes positive and negative gain without transmission',async page=>{
    await page.goto(base+'ressources/diagnostic-ia.html');
    assert.equal(await page.locator('#save-score').isVisible(),false,'export must start hidden');
    const fill=async (id,n)=>page.locator('#'+id).fill(String(n));
    await fill('before',20);await fill('prep',2);await fill('run',1);await fill('review',3);await fill('fix',2);
    await page.locator('button[type="submit"]').click();
    assert.match(await page.locator('#score-result').innerText(),/Écart : 12 min/);
    assert.match(await page.locator('#score-result').innerText(),/Ce gain n’est pas validé/);
    await page.locator('#quality-ok').check();
    assert.equal(await page.locator('#save-score').isVisible(),false,'editing must hide stale export');
    await page.locator('button[type="submit"]').click();
    assert.match(await page.locator('#score-result').innerText(),/qualité déclarée vérifiée/);
    assert.equal(await page.locator('#save-score').isVisible(),true);
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#save-score').click()]);
    assert.equal(download.suggestedFilename(),'iagile-scorecard.txt');
    await fill('before',1);
    assert.equal(await page.locator('#score-result').isVisible(),false,'editing must hide old result');
    await page.locator('button[type="submit"]').click();
    assert.match(await page.locator('#score-result').innerText(),/demandé plus de temps/);
    await fill('before',0.3);await fill('prep',0.1);await fill('run',0.1);await fill('review',0.1);await fill('fix',0);
    await page.locator('button[type="submit"]').click();
    assert.match(await page.locator('#score-result').innerText(),/Écart : 0 min/,'decimal arithmetic must be rounded');
    await page.locator('#prep').fill('-2');
    assert.equal(await page.locator('#prep').evaluate(el=>el.checkValidity()),false);
  }),
  test('agent checklist updates and incident answer stays opt-in',async page=>{
    await page.goto(base+'ressources/agent-readiness.html');
    assert.equal(await page.locator('#agent-checks input[type=checkbox]').count(),10);
    await page.locator('label[for="agent-c0"]').click();
    await page.locator('label[for="agent-c9"]').click();
    assert.match(await page.locator('#agent-result').innerText(),/2 \/ 10/);
    await page.goto(base+'ressources/incident-lab.html');
    const answer=page.locator('details').first();
    assert.equal(await answer.evaluate(el=>el.open),false);
    await answer.locator('summary').click();
    assert.equal(await answer.evaluate(el=>el.open),true);
  }),
  test('3D brief exports user-provided content',async page=>{
    await page.goto(base+'ressources/brief-site-3d.html');
    await page.locator('#goal').fill('Présenter une marque locale');
    await page.locator('#audience').fill('Visiteurs sur téléphone');
    await page.locator('button[type="submit"]').click();
    assert.match(await page.locator('#brief-result').innerText(),/Présenter une marque locale/);
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#save-brief').click()]);
    assert.equal(download.suggestedFilename(),'iagile-brief-3d.txt');
  }),
  test('resource pages pass WCAG 2.1 A/AA automated accessibility checks',async page=>{
    for(const p of ['index.html','diagnostic-ia.html','diagnostic-10-questions.html','incident-lab.html','agent-readiness.html','brief-site-3d.html']){
      await page.goto(base+'ressources/'+p);
      const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      const details=results.violations.map(x=>x.id+': '+x.nodes.map(n=>n.target.join(' ')).join(', '));
      assert.deepEqual(details,[],'WCAG violations for '+p);
    }
  }),
  test('mobile viewport does not overflow; skip link accepts keyboard focus',async page=>{
    for(const p of ['index.html','diagnostic-ia.html','diagnostic-10-questions.html','incident-lab.html','agent-readiness.html','brief-site-3d.html']){
      await page.goto(base+'ressources/'+p);
      const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
      assert.ok(sizes.scroll <= sizes.viewport+2,p+' has horizontal overflow: '+JSON.stringify(sizes));
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.skip').evaluate(el=>document.activeElement===el),true,p+' missing usable skip link');
    }
  })
];
try{
  browser=await chromium.launch({headless:true});
  for(const viewport of [{width:1365,height:900},{width:390,height:844}]){
    const context=await browser.newContext({viewport,acceptDownloads:true,reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for(const {name,fn} of tests){
      try{await fn(page);assert.deepEqual(errors,[],'browser JS errors');passed++;process.stdout.write('PASS '+viewport.width+'px — '+name+'\\n');}
      catch(error){throw Error(viewport.width+'px — '+name+': '+error.stack);}
    }
    await page.goto(base+'ressources/index.html');
    await page.screenshot({path:path.join(root,'resource-preview-'+viewport.width+'.png'),fullPage:true});
    await context.close();
  }
  console.log('PASS — '+passed+' functional browser checks, desktop and mobile');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
