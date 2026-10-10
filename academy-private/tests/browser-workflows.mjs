import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';

const base='http://127.0.0.1:8123/academy-private/';
const replacement=await fs.readFile(new URL('./mock-supabase-browser.js',import.meta.url),'utf8');
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 await context.route('https://esm.sh/**',async route=>{
   if(route.request().url().includes('@supabase/supabase-js@2.79.0')){
     await route.fulfill({status:200,contentType:'text/javascript',headers:{'access-control-allow-origin':'*'},body:replacement});
   }else await route.continue();
 });
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.locator('#dashboard').waitFor({state:'visible',timeout:20000});
 await page.locator('.course-card').first().waitFor();
 assert.equal(await page.locator('.course-card').count(),1,'Only one enrolled course may appear');
 assert(!(await page.locator('#courses').innerText()).includes('Automatisation'));
 await page.getByRole('button',{name:'Ouvrir la formation'}).click();
 await page.locator('#courseTitle').waitFor({state:'visible'});
 assert.match(await page.locator('#courseTitle').innerText(),/Créer des agents/);
 await page.getByRole('button',{name:'Lire le module'}).click();
 await page.locator('.course-markdown').first().waitFor();
 assert.match(await page.locator('.course-markdown').first().innerText(),/Exercice/);
 await page.getByRole('button',{name:'Marquer comme terminé'}).click();
 await page.getByText('1 module(s) sur 1 terminés').waitFor();
 assert.equal(await page.locator('#progressMeter').evaluate(el=>el.value),1);
 await page.locator('#module-notes-agents-0').fill('Notes privées du cours');
 await page.getByRole('button',{name:'Enregistrer mes notes'}).click();
 await page.getByText('Notes enregistrées.').waitFor();
 await page.locator('#prompts textarea').fill('Mon projet final');
 await page.getByRole('button',{name:'Enregistrer ma réponse'}).click();
 await page.getByText('Votre réponse est enregistrée.').waitFor();
 const state=await page.evaluate(()=>window.__academyTestState);
 assert.equal(state.academy_module_progress[0].notes,'Notes privées du cours');
 assert.equal(state.academy_deliverable_answers[0].content,'Mon projet final');
 await page.getByRole('button',{name:'Préparer un accès temporaire'}).click();
 await page.locator('.asset-link a').waitFor();
 assert.match(await page.locator('.asset-link a').getAttribute('href'),/expires=60$/);
 console.log('Learner journey: enrollment, lesson, progress, notes, submission and private resource OK');
 await page.goto(base+'?formation=automatisation',{waitUntil:'domcontentloaded'});
 await page.locator('.course-card').first().waitFor();
 assert.equal(await page.locator('#courseView').isVisible(),false,'Unauthorized course link must never open');
 await page.goto(base+'?formation=agents',{waitUntil:'domcontentloaded'});
 await page.locator('#courseView').waitFor({state:'visible'});
 assert.match(await page.locator('#courseTitle').innerText(),/Créer des agents/);
 await page.getByRole('button',{name:/Retour aux formations/}).click();
 await page.locator('#courses').waitFor({state:'visible'});
 assert(!page.url().includes('formation='),'Back button must clear direct course link');
 console.log('Direct course routes: allowed and rejected links OK');
 await page.getByRole('button',{name:'Déconnexion'}).click();
 await page.locator('#auth').waitFor({state:'visible'});
 assert.equal(await page.locator('#dashboard').isVisible(),false);
 for(const id of ['modules','prompts','courseAssets']){
   assert.equal(await page.locator('#'+id).evaluate(e=>e.children.length),0,
     'Private content remains in DOM after sign-out: '+id);
 }
 assert.equal(await page.locator('#courseView').isVisible(),false);
 console.log('Logout purges loaded private learner course data');

 await page.goto(base+'instructor.html',{waitUntil:'domcontentloaded'});
 await page.locator('#teacherDashboard').waitFor({state:'visible',timeout:20000});
 await page.getByRole('button',{name:'Voir les apprenants'}).click();
 await page.getByRole('button',{name:'Consulter le suivi'}).click();
 await page.getByText('Projet de démonstration').waitFor();
 await page.locator('#learnerDetails details summary').click();
 await page.getByText('Présenter votre démarche').waitFor();
 await page.getByLabel('Retour pédagogique (20 caractères minimum)').fill('La démarche doit préciser les risques et les critères.');
 await page.getByRole('button',{name:'Enregistrer le retour'}).click();
 await page.getByText('Retour pédagogique enregistré.').waitFor();
 const feedbackState=await page.evaluate(()=>window.__academyTestState.academy_deliverable_feedback);
 assert.equal(feedbackState[0].status,'needs_revision');
 assert.equal(feedbackState[0].instructor_id,'FORMATEUR');
 assert.equal(feedbackState[0].answer_updated_at,'2026-10-10T16:50:00.000Z');
 assert.match(await page.locator('#learnerDetails').innerText(),/1 module\(s\) terminés/);
 assert.deepEqual(errors,[],'Unexpected browser exceptions');
 console.log('Instructor journey: assigned students, read-only progress and work review OK');
 await context.close();
}finally{await browser.close();}
