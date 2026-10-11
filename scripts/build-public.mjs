// Build an explicit public-only Pages artifact from the QA allowlist.
// Never copy the repository wholesale: lessons, tests and backend must remain private.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stage = path.join(root, 'public-site');
const sha = process.env.GITHUB_SHA || process.argv[2];
assert.match(sha || '', /^[a-f0-9]{40}$/, 'A 40-character Git commit SHA is required');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
const match = workflow.match(/files=\(([\s\S]*?)\)/);
assert(match, 'Explicit public allowlist is missing from CI');
const files = [...match[1].matchAll(/^\s*"([^"]+)"\s*$/gm)].map(hit => hit[1]);
assert(files.length >= 30, 'Public artifact allowlist is unexpectedly short');
assert.equal(new Set(files).size, files.length, 'Duplicate public paths');
assert(files.includes('index.html') && files.includes('sitemap.xml'), 'Essential pages missing from manifest');

fs.rmSync(stage, {recursive: true, force: true});
fs.mkdirSync(stage, {recursive: true});
for (const relative of files) {
  assert(!path.isAbsolute(relative) && !relative.split('/').includes('..'), 'Unsafe relative path ' + relative);
  const input = path.resolve(root, relative);
  const output = path.resolve(stage, relative);
  assert(input.startsWith(root + path.sep) && output.startsWith(stage + path.sep), 'Path escapes allowed directory: ' + relative);
  assert(fs.statSync(input).isFile() && !fs.lstatSync(input).isSymbolicLink(), 'Invalid public file: ' + relative);
  fs.mkdirSync(path.dirname(output), {recursive: true});
  if (relative.endsWith('.html')) {
    let html = fs.readFileSync(input, 'utf8');
    // Jekyll normally handles the homepage frontmatter and the site revision.
    // A controlled Pages artifact must do this explicitly before publishing.
    html = html.replace(/^---\r?\nlayout: null\r?\n---\r?\n/, '');
    html = html.replaceAll('{{ site.github.build_revision }}', sha);
    assert(!/\{\{\s*site\./.test(html), 'Unrendered Jekyll expression in ' + relative);
    if (relative === 'index.html') {
      assert(html.includes('<!-- iagile-release-sha:' + sha + ' -->'), 'Homepage release marker missing');
      assert(!html.startsWith('---'), 'Homepage Jekyll frontmatter was not removed');
    }
    fs.writeFileSync(output, html, 'utf8');
  } else {
    fs.copyFileSync(input, output);
  }
}
console.log('PASS: built public-only artifact with ' + files.length + ' assets for release ' + sha);
