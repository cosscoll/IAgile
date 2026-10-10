import assert from 'node:assert/strict';
const base = 'https://cosscoll.github.io/IAgile/';
const expectedSha = process.env.GITHUB_SHA;
assert.match(expectedSha || '', /^[a-f0-9]{40}$/, 'GITHUB_SHA is required for publication verification');

const publicPaths = [
  '', 'parcours.html', 'a-propos.html', 'faq.html', 'ouverture.html',
  'formations/sites-web-3d.html', 'formations/agents-personnalises.html',
  'formations/automatiser-tache.html', 'formations/ia-au-quotidien.html',
  'chat-config.js', 'chatbot.js'
];
const forbiddenPaths = [
  'docs/ACADEMY-PLAN.md', 'docs/ACADEMY-PLAN.html',
  'backend-iagile/package.json',
  'backend-iagile/supabase/database.types.ts',
  'academy-private/index.html',
  'tests/site-check.mjs',
  'README.html'
];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const fetchLive = path => fetch(
  base + path + '?publication-check=' + encodeURIComponent(expectedSha),
  { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(15000) }
);

for (const path of publicPaths) {
  let passed = false;
  let reason = 'no response';
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const response = await fetchLive(path);
      if (!response.ok) throw Error('HTTP ' + response.status);
      const body = await response.text();
      if (!body || body.length < 30) throw Error('empty response');
      if (path.endsWith('.html') || path === '') {
        assert.match(body, /<html\b/i);
        assert.match(body, /<title>/i);
        assert.match(body, /chatbot\.js/);
      }
      if (path === '') {
        assert(body.includes('<!-- iagile-release-sha:' + expectedSha + ' -->'), 
          'Public homepage is not the intended checked release ' + expectedSha);
      }
      if (path === 'chat-config.js') assert.match(body, /IAgileChatConfig/);
      if (path === 'chatbot.js') assert.match(body, /IAgile/);
      passed = true;
      break;
    } catch (error) {
      reason = String(error.message || error);
      if (attempt < 4) await sleep(3000);
    }
  }
  assert(passed, 'PUBLIC SITE NOT VERIFIED: ' + path + ': ' + reason);
  console.log('ONLINE OK ' + base + path);
}

for (const path of forbiddenPaths) {
  let verified = false;
  let reason = 'no response';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchLive(path);
      if (![404, 410].includes(response.status)) {
        throw Error('HTTP ' + response.status + ' — potentially exposed internal path ' + path);
      }
      verified = true;
      break;
    } catch(error) {
      reason = String(error.message || error);
      if (attempt < 2) await sleep(2500);
    }
  }
  assert(verified, 'POSSIBLE PRIVATE SOURCE EXPOSURE OR UNVERIFIED PATH: ' + path + ': ' + reason);
  console.log('PRIVATE PATH NOT SERVED ' + path);
}
