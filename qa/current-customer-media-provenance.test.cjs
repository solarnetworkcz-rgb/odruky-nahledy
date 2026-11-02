'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'current-customer-media-provenance.json'),'utf8'));

test('current Drive provenance covers all 15 historical V6 SHA mismatches',()=>{
  const expected=['F01','F02','F03','F04','F06','F09','F13','F14','F16','F17','F20','F21','F22','F23','F25'];
  assert.deepEqual(manifest.assets.map(x=>x.id).sort(),expected.sort());
  assert.equal(manifest.schemaVersion,1);
  assert.equal(manifest.source,'current-customer-google-drive');
});

test('repo media bytes are exactly the verified current Drive source bytes',()=>{
  for(const asset of manifest.assets){
    const file=path.join(root,asset.repoPath);
    const bytes=fs.readFileSync(file);
    const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
    const gitBlob=crypto.createHash('sha1').update(Buffer.concat([
      Buffer.from('blob '+bytes.length+'\0'),bytes
    ])).digest('hex');
    assert.equal(bytes.length,asset.size,asset.id+' size');
    assert.equal(sha256,asset.sha256,asset.id+' SHA-256');
    assert.equal(gitBlob,asset.gitBlobSha1,asset.id+' Git blob SHA-1');
    assert.equal(asset.status,'BYTE_IDENTICAL_TO_CURRENT_DRIVE');
  }
});
