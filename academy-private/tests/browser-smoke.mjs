import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true});
const url='http://127.0.0.1:8123/academy-private/';
try {
 for (const viewport of [{width:390,height:844},{width:1440,height:900}]) {
   const page=await browser.newPage({viewport,locale:'fr-FR'});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   await page.locator('#auth').waitFor({state:'visible',timeout:30000});
   assert.match(await page.title(),/IAgile Academy/);
   assert.equal(await page.locator('#dashboard').isVisible(),false);
   assert.equal(await page.locator('#loginForm input').count(),2);
   assert.equal(await page.locator('.lesson').count(),0);
   assert.equal(await page.locator('main').count(),1);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
   assert.equal(overflow,false,'page overflows horizontally at '+viewport.width);
   assert.deepEqual(errors,[],'unexpected browser exceptions');
   console.log('Browser smoke passed at '+viewport.width+'x'+viewport.height);
   await page.close();
 }
} finally {
 await browser.close();
}
