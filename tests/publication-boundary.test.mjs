import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

// Separate guard for IAgile's public, marketing-only GitHub Pages artifact.
// This cannot control GitHub Pages "Deploy from a branch"; Settings > Pages
// must independently be configured to publish via GitHub Actions only.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
const listMatch = workflow.match(/files=\(([\s\S]*?)\)/);
assert(listMatch, 'Missing explicit public artifact allowlist');
const approved = [...listMatch[1].matchAll(/^\s*"([^"]+)"\s*$/gm)].map(m => m[1]);
assert(approved.length >= 25, 'Public allowlist unexpectedly short');
assert.equal(new Set(approved).size, approved.length, 'Duplicate public artifact names');

const forbiddenPath = /(?:^|\/)(?:\.github|docs|tests|api|backend-iagile|node_modules|private|formateur|corriges|corrigés|modules|academy|cours-payants)(?:\/|$)/i;
const forbiddenExt = /(?:\.env(?:\..*)?|\.zip|\.pdf|\.sql|\.py|\.json|\.csv|\.md|\.map|\.pem|\.key)$/i;
const sensitiveValue = /(?:sk-(?:proj-)?[A-Za-z0-9_-]{20,}|sb_secret_[A-Za-z0-9_-]{10,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;

for (const rel of approved) {
  assert(!path.isAbsolute(rel) && !rel.split('/').includes('..'), 'Unsafe public path: ' + rel);
  assert(!forbiddenPath.test(rel) && !forbiddenExt.test(rel), 'Reserved/private file in public allowlist: ' + rel);
  const file = path.resolve(root, rel);
  assert(file.startsWith(root + path.sep), 'Public asset escapes repository: ' + rel);
  assert(fs.existsSync(file) && fs.statSync(file).isFile(), 'Missing public file: ' + rel);
  assert(!fs.lstatSync(file).isSymbolicLink(), 'Public symlink is forbidden: ' + rel);
  if (/\.(?:html|js|css|svg|txt|xml)$/i.test(rel)) {
    assert(!sensitiveValue.test(fs.readFileSync(file, 'utf8')), 'Possible secret included in public file: ' + rel);
  }
}

assert(!approved.some(p => /^(?:learning-engine|api\/|backend-iagile\/)/.test(p)), 'Non-marketing code in public artifact');
assert(approved.includes('index.html') && approved.includes('chat-config.js'), 'Missing essential public pages');

function listStage(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    const name = prefix ? prefix + '/' + item.name : item.name;
    const full = path.join(dir, item.name);
    assert(!item.isSymbolicLink(), 'Staged symlink forbidden: ' + name);
    if (item.isDirectory()) return listStage(full, name);
    assert(item.isFile(), 'Unsupported staged asset: ' + name);
    return [name];
  });
}

if (process.argv[2]) {
  const stage = path.resolve(process.argv[2]);
  assert(fs.statSync(stage).isDirectory(), 'Public staging directory missing');
  const actual = listStage(stage).sort();
  assert.deepEqual(actual, [...approved].sort(), 'Published artifact does not match the precise allowlist');
  for (const rel of actual) {
    const full = path.join(stage, rel);
    if (/\.(?:html|js|css|svg|txt|xml)$/i.test(rel)) {
      assert(!sensitiveValue.test(fs.readFileSync(full, 'utf8')), 'Potential secret in staged file: ' + rel);
    }
  }
}
console.log('PASS — public marketing artifact boundary (' + approved.length + ' approved files' + (process.argv[2] ? ', staged tree verified' : '') + ')');
