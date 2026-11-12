import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page=fs.readFileSync(new URL('../import.html',import.meta.url),'utf8');
const script=fs.readFileSync(new URL('../import.js',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../migrations/20261011_instructor_storage_upload.sql',import.meta.url),'utf8');

test('import interface requires account and is not indexed',()=>{
  assert(page.includes('noindex,nofollow,noarchive'));
  assert(page.includes('id="loginForm"'));
  assert(script.includes("profile?.account_status!=='active'"));
  assert(script.includes('!assignments?.length'));
});

test('ZIP integrity must match twelve records before transfer',()=>{
  assert(script.includes('unzipSync'));
  assert(script.includes('files.length!==12'));
  assert(script.includes('remoteMetadata.length!==12'));
  assert(script.includes("crypto.subtle.digest('SHA-256'"));
  assert(script.includes('record.content_sha256'));
  assert(script.includes('record.content_bytes'));
  assert(script.includes('MAX_ZIP_BYTES=100000'));
  assert(script.includes('draft_unpublished'));
});

test('upload never overwrites resources and always verifies remote digest',()=>{
  assert(script.includes("addEventListener('click',upload)"));
  assert(script.includes('upsert:false'));
  assert(script.includes('await store.download(asset.path)'));
  assert(script.includes('await sha256(await remote.arrayBuffer())!==asset.digest'));
});

test('SQL upload policy restricts paths and instructor privileges',()=>{
  assert(sql.includes('can_manage_draft_asset'));
  assert(sql.includes('academy_instructor_courses'));
  assert(sql.includes('academy_profiles'));
  assert(sql.includes('a.storage_path=path'));
  assert(sql.includes('a.published=false'));
  assert(sql.includes("bucket_id='iagile-course-files'"));
  assert(sql.includes('for insert to authenticated'));
});
