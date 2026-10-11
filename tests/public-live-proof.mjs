// Real public production verification after GitHub Pages publishes.
// No authentication, paid content, or customer data are requested or logged.
import assert from 'node:assert/strict';
const base='https://cosscoll.github.io/IAgile/';
const revision=process.env.GITHUB_SHA;
assert.match(revision||'',/^[a-f0-9]{40}$/,'Missing checked-out main revision');
const allow=[
  '', 'parcours.html', 'a-propos.html', 'faq.html', 'ouverture.html',
  'formations/sites-web-3d.html','formations/agents-personnalises.html',
  'formations/automatiser-tache.html','formations/ia-au-quotidien.html',
  'ressources/index.html','ressources/diagnostic-ia.html',
  'ressources/diagnostic-10-questions.html','ressources/demo-processus.html',
  'ressources/incident-lab.html','ressources/agent-readiness.html',
  'ressources/brief-site-3d.html',
  'ressources/ressources.css','ressources/ressources.js',
  'ressources/demo-processus.js','ressources/diagnostic-10.js',
  'robots.txt','sitemap.xml'
];
const deny=[
  'academy-private/index.html','academy-private/import.html',
  'backend-iagile/package.json','backend-iagile/api/chat.js',
  'docs/ACADEMY-PLAN.md','docs/ACADEMY-PLAN.html',
  'tests/site-check.mjs','tests/resource-browser.mjs',
  'ressources/README.md','README.md','README.html','api/chat.js'
];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function load(path,tries=4){
  let failure;
  for(let i=0;i<tries;i++){
    try{
      const response=await fetch(base+path+'?audit='+revision.slice(0,12),{
        signal:AbortSignal.timeout(15000),
        headers:{'Cache-Control':'no-cache'}
      });
      return {status:response.status,body:await response.text()};
    }catch(e){failure=e;if(i<tries-1)await sleep(1500);}
  }
  throw Error('Public resource request failed: '+path+' ('+String(failure?.message)+')');
}
let matched=false;
for(let i=0;i<15;i++){
  const home=await load('');
  if(home.status===200 && home.body.includes('<!-- iagile-release-sha:'+revision+' -->')){
    matched=true;break;
  }
  if(i<14)await sleep(4000);
}
assert(matched,'Public homepage does not match current main revision '+revision);
console.log('PASS: LIVE main SHA matches '+revision);
for(const path of allow){
  const r=await load(path);
  assert.equal(r.status,200,'Expected public content at '+path);
  if(path.endsWith('.html') || !path){
    assert.match(r.body,/<html\b/i);
    assert.match(r.body,/<title>/i);
    assert.match(r.body,/<main\b/i);
  }
  console.log('200 PUBLIC '+path);
}
const sitemap=(await load('sitemap.xml')).body;
for(const path of allow.filter(x=>x.startsWith('ressources/')&&x.endsWith('.html'))){
  assert(sitemap.includes('<loc>'+base+path+'</loc>'),'Missing indexed resource '+path);
}
assert(!sitemap.includes(base+'ouverture.html</loc>'),'noindex opening page in XML sitemap');
for(const path of deny){
  const r=await load(path);
  assert([404,410].includes(r.status),'Private/internal source unexpectedly public: '+path+' HTTP '+r.status);
  console.log(r.status+' PROTECTED '+path);
}
console.log('PASS: actual production verified; '+allow.length+' public paths, '+deny.length+' internal paths');
