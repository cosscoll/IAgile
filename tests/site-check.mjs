import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'parcours.html', 'a-propos.html', 'faq.html', '404.html','formations/sites-web-3d.html','formations/agents-personnalises.html','formations/automatiser-tache.html','formations/ia-au-quotidien.html'];
let links=0;let checked=0;
for (const page of pages) {
  const source = fs.readFileSync(path.join(root,page), 'utf8');
  assert.match(source, /<title>[^<]+<\/title>/i, page+' missing title');
  assert.match(source, /<meta[^>]+name="description"/i, page+' missing description');
  assert.match(source, /<html[^>]+lang="fr"/i, page+' missing fr lang');
  assert.match(source, /<main\b/i, page+' missing main');
  assert.match(source, /<h1\b/i, page+' missing h1');
  assert.match(source, /rel="canonical"/i, page+' missing canonical');
  let hits=[...source.matchAll(/\b(?:href|src)="([^"\r\n]+)"/g)].map(m=>m[1]);
  for (let h of hits) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/.test(h)) continue;
    if (!h || h==='#') continue;
    let [urlPath,fragment] = h.split('#');
    // URL query parameters change navigation, not the physical file path.
    const rel = urlPath.split('?')[0];
    if(!rel && fragment){
      assert(source.includes(`id="${fragment}"`) || source.includes(`name="${fragment}"`), `${page}: missing local anchor #${fragment}`);
      links++; continue;
    }
    let filename = path.resolve(path.dirname(path.join(root,page)),rel||page);
    assert(filename.startsWith(root+path.sep) || filename===root,`${page}: href escapes root ${h}`);
    assert(fs.existsSync(filename), `${page}: missing file ${h}`);
    if(fragment && /\.html?$/.test(rel)) {
      const target=fs.readFileSync(filename,'utf8');
      assert(target.includes(`id="${fragment}"`) || target.includes(`name="${fragment}"`), `${page}: missing target ${h}`);
    }
    links++;
  }
  checked++;
}
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for (const p of pages.filter(p=>p!=='404.html')) {
  const url='https://cosscoll.github.io/IAgile/'+(p==='index.html'?'':p);
  assert(sitemap.includes(`<loc>${url}</loc>`), `sitemap missing ${p}`);
}
assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'), /data-chapter="4"/);
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert((home.match(/data-chapter="[0-4]"/g)||[]).length===5,'home must have exactly 5 chapters');
assert(home.includes('id="universeCanvas"'),'3D canvas must be preserved');
for (const expected of ['a-propos.html','faq.html','parcours.html']) assert(home.includes(`href="${expected}"`));
assert(!fs.existsSync(path.join(root,'.env')),'no credentials in published root');

/* Validation des limites publiques des cours et de la livraison */
const trainingPages = pages.filter(p => p.startsWith('formations/'));
for (const page of trainingPages) {
  const source = fs.readFileSync(path.join(root, page), 'utf8');
  assert.equal((source.match(/id="cas-concret"/g) || []).length, 1, page + ' missing a single practical teaser');
  assert.equal((source.match(/class="case-teaser-card"/g) || []).length, 3, page + ' missing problem/method/outcome');
  assert(source.includes('href="#cas-concret"'), page + ' missing teaser link');
}
const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
assert(workflow.includes('node tests/site-check.mjs'), 'CI does not run site checks before publication');
const allowlist = workflow.match(/files=\(([\s\S]*?)\)/);
assert(allowlist, 'public asset allowlist not found');
const assets = [...allowlist[1].matchAll(/^\s*"([^"]+)"\s*$/gm)].map(m => m[1]);
assert(assets.length >= 25, 'public asset allowlist unexpectedly small');
assert.equal(new Set(assets).size, assets.length, 'duplicate files in public allowlist');
for (const entry of assets) {
  assert(fs.existsSync(path.join(root, entry)), 'public asset missing: ' + entry);
  assert(!/(^|\/)(?:formateur|corriges|modules|private|\.github|tests|docs)(?:\/|$)/i.test(entry), 'private/source file exposed: ' + entry);
  assert(!/(?:\.zip|\.env|\.pdf|\.map)$/i.test(entry), 'unapproved public file type: ' + entry);
}
assert(assets.includes('index.html') && assets.includes('formation.css'), 'essential public assets missing');

console.log(`PASS — ${checked} HTML pages, ${links} internal assets/links, 8 sitemap URLs, 5 cinematic chapters`);
