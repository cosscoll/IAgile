import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/chat.js';

function invoke({ method='GET', origin='https://cosscoll.github.io', headers={}, body, ip='203.0.113.10' } = {}) {
  return new Promise((resolve, reject) => {
    const req = {
      method, headers: { origin, 'x-forwarded-for': ip, ...headers }, body,
      socket: { remoteAddress: ip },
      async *[Symbol.asyncIterator]() { if (body !== undefined) yield JSON.stringify(body); }
    };
    const res = {
      status: 0, headers: {},
      writeHead(code, h) { this.status = code; this.headers = h; },
      end(payload='') {
        try { resolve({ status: this.status, headers: this.headers, data: payload ? JSON.parse(payload) : null }); }
        catch (error) { reject(error); }
      }
    };
    Promise.resolve(handler(req, res)).catch(reject);
  });
}
const originalKey = process.env.OPENAI_API_KEY;
const originalOrigins = process.env.CHAT_ALLOWED_ORIGIN;
test.after(() => {
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalKey;
  if (originalOrigins === undefined) delete process.env.CHAT_ALLOWED_ORIGIN;
  else process.env.CHAT_ALLOWED_ORIGIN = originalOrigins;
});
test('health endpoint does not disclose secrets and declares readiness accurately', async () => {
  delete process.env.OPENAI_API_KEY;
  const a = await invoke();
  assert.equal(a.status, 200);
  assert.equal(a.data.ready, false);
  assert.equal(a.headers['Cache-Control'], 'no-store');
  process.env.OPENAI_API_KEY = 'dummy-test-key';
  const b = await invoke();
  assert.equal(b.data.ready, true);
  assert(!JSON.stringify(b).includes('dummy-test-key'));
});
test('unknown browser origins are rejected', async () => {
  const r = await invoke({ origin: 'https://attacker.example', method:'POST' });
  assert.equal(r.status, 403);
  assert.equal(r.headers['Access-Control-Allow-Origin'], undefined);
});
test('CORS preflight returns only allowed origin', async () => {
  const r = await invoke({ method: 'OPTIONS' });
  assert.equal(r.status, 204);
  assert.equal(r.headers['Access-Control-Allow-Origin'], 'https://cosscoll.github.io');
});
test('unconfigured AI endpoint fails closed', async () => {
  delete process.env.OPENAI_API_KEY;
  const r = await invoke({ method:'POST', headers: { 'content-type': 'application/json' }, body: { message: 'Bonjour' } });
  assert.equal(r.status, 503);
  assert(!r.data.answer);
});
test('invalid requests never reach a paid AI API', async () => {
  process.env.OPENAI_API_KEY = 'dummy-test-key';
  const badMethod = await invoke({ method:'DELETE' });
  assert.equal(badMethod.status, 405);
  const badFormat = await invoke({ method:'POST', headers: { 'content-type': 'text/plain' }, body:{message:'Bonjour'} });
  assert.equal(badFormat.status, 415);
  const empty = await invoke({ method:'POST', headers: { 'content-type':'application/json' }, body:{ message:'   ' } });
  assert.equal(empty.status, 400);
  const long = await invoke({ method:'POST', headers:{'content-type':'application/json'}, body:{ message:'x'.repeat(851) } });
  assert.equal(long.status, 400);
});
