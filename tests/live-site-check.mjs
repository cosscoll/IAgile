import assert from 'node:assert/strict';
const base = 'https://cosscoll.github.io/IAgile/';
const paths = ['','parcours.html','a-propos.html','faq.html','ouverture.html','formations/sites-web-3d.html','formations/agents-personnalises.html','formations/automatiser-tache.html','formations/ia-au-quotidien.html','chat-config.js','chatbot.js'];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
for (const path of paths) {
  let passed = false;
  let reason = 'no response';
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const response = await fetch(base + path + '?publication-check=' + encodeURIComponent(process.env.GITHUB_SHA || 'latest'), { headers: {'Cache-Control':'no-cache'}, signal:AbortSignal.timeout(15000) });
      if (!response.ok) throw Error('HTTP ' + response.status);
      const body = await response.text();
      if (!body || body.length < 30) throw Error('empty response');
      if (path.endsWith('.html') || path === '') {
        assert.match(body, /<html\b/i);
        assert.match(body, /<title>/i);
        assert.match(body, /chatbot\.js/);
      }
      if (path === 'chat-config.js') assert.match(body, /IAgileChatConfig/);
      if (path === 'chatbot.js') assert.match(body, /IAgile/);
      passed = true;
      break;
    } catch (error) { reason = String(error.message || error); await sleep(3000); }
  }
  assert(passed, 'PUBLIC SITE NOT VERIFIED: ' + path + ': ' + reason);
  console.log('ONLINE OK ' + base + path);
}
