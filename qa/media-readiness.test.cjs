'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {auditMedia,jpegDimensions}=require('./media-readiness.cjs');

const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const jpeg=(w,h)=>{
  // Minimal SOF0-bearing JPEG fixture: tests header parsing, not image decoding.
  const bytes=Buffer.from([0xff,0xd8,0xff,0xc0,0x00,0x0b,0x08,0,0,0,0,0x01,0x01,0x11,0,0xff,0xd9]);
  bytes.writeUInt16BE(h,7);bytes.writeUInt16BE(w,9);return bytes;
};
const fixture=()=>fs.mkdtempSync(path.join(os.tmpdir(),'odruky-media-audit-'));

test('detects true 3:2 JPEG dimensions from SOF0 and rejects non-JPEG',()=>{
  assert.deepEqual(jpegDimensions(jpeg(1500,1000)),{width:1500,height:1000});
  assert.throws(()=>jpegDimensions(Buffer.from('not a jpeg')),/JPEG/);
});
test('reports exact bytes, missing required files, and ignores excluded entries',()=>{
  const dir=fixture();
  try{
    const image=jpeg(1500,1000);fs.writeFileSync(path.join(dir,'F01.jpg'),image);
    const manifest={policy:{publicationApproved:false},assets:[
      {id:'F01',required:true,purpose:'gallery',sha256:hash(image)},
      {id:'F12',required:true,purpose:'poster',sha256:hash(Buffer.from('absent'))},
      {id:'F18',required:false,purpose:'excluded',sha256:hash(Buffer.from('excluded'))}]};
    const report=auditMedia({manifest,mediaDir:dir});
    assert.equal(report.counts.required,2);
    assert.deepEqual(report.counts,{required:2,exact:1,changed:0,missing:1,invalid:0,wide32:1,notWide32:0});
    assert.equal(report.status,'BLOCKED');
    assert.deepEqual(report.missingIds,['F12']);
    assert.equal(report.publishApproval,'not-approved');
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('detects differing bytes, non-3:2 JPEG, corrupt JPEG, and does not mark release ready',()=>{
  const dir=fixture();
  try{
    const wrong=jpeg(1080,1440),expected=jpeg(1500,1000);
    fs.writeFileSync(path.join(dir,'F01.jpg'),wrong);
    fs.writeFileSync(path.join(dir,'F02.jpg'),Buffer.from('broken'));
    const manifest={policy:{publicationApproved:true},assets:[
      {id:'F01',required:true,purpose:'gallery',sha256:hash(expected)},
      {id:'F02',required:true,purpose:'gallery',sha256:hash(Buffer.from('broken'))}]};
    const report=auditMedia({manifest,mediaDir:dir});
    assert.equal(report.counts.changed,1);
    assert.equal(report.counts.invalid,1);
    assert.equal(report.counts.notWide32,1);
    assert.equal(report.status,'BLOCKED');
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('a complete syntactically conforming inventory is still only a media preflight',()=>{
  const dir=fixture();
  try{
    const image=jpeg(1500,1000);
    fs.writeFileSync(path.join(dir,'F01.jpg'),image);
    const report=auditMedia({manifest:{policy:{publicationApproved:true},assets:[
      {id:'F01',required:true,purpose:'gallery',sha256:hash(image)}]},mediaDir:dir});
    assert.equal(report.status,'SOURCE_PREFLIGHT_ELIGIBLE');
    assert.notEqual(report.status,'RELEASE_READY');
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('rejects unsafe or duplicate manifest IDs fail closed',()=>{
  const dir=fixture();
  try{
    assert.throws(()=>auditMedia({manifest:{assets:[{id:'../x',required:true,sha256:'a'.repeat(64)}]},mediaDir:dir}),/invalid.*id/i);
    assert.throws(()=>auditMedia({manifest:{assets:[{id:'F01',required:true,sha256:'a'.repeat(64)},{id:'F01',required:true,sha256:'a'.repeat(64)}]},mediaDir:dir}),/duplicate/i);
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});

test('source inventory accepts byte-exact portrait originals without requiring 3:2',()=>{
  const dir=fixture();
  try{
    const portrait=jpeg(1080,1440);
    fs.writeFileSync(path.join(dir,'F01.jpg'),portrait);
    const report=auditMedia({manifest:{policy:{publicationApproved:true},assets:[
      {id:'F01',required:true,purpose:'gallery',sha256:hash(portrait)}]},mediaDir:dir});
    assert.equal(report.status,'SOURCE_PREFLIGHT_ELIGIBLE');
    assert.deepEqual(report.galleryNeedsWideDerivativeIds,['F01']);
    assert.equal(report.counts.notWide32,1);
    assert.equal(report.releaseReady,false);
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('poster F12 is reported independently and never treated as a gallery derivative',()=>{
  const dir=fixture();
  try{
    const portrait=jpeg(800,1200);
    fs.writeFileSync(path.join(dir,'F12.jpg'),portrait);
    const report=auditMedia({manifest:{policy:{publicationApproved:true},assets:[
      {id:'F12',required:true,purpose:'poster',sha256:hash(portrait)}]},mediaDir:dir});
    assert.equal(report.status,'SOURCE_PREFLIGHT_ELIGIBLE');
    assert.deepEqual(report.galleryNeedsWideDerivativeIds,[]);
    assert.deepEqual(report.posterIds,['F12']);
    assert.equal(report.counts.notWide32,1);
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('non-3:2 originals never override missing source or denied publication approval',()=>{
  const dir=fixture();
  try{
    const portrait=jpeg(800,1200);
    fs.writeFileSync(path.join(dir,'F01.jpg'),portrait);
    const assets=[{id:'F01',required:true,purpose:'gallery',sha256:hash(portrait)},
      {id:'F10',required:true,purpose:'gallery',sha256:hash(portrait)}];
    const report=auditMedia({manifest:{policy:{publicationApproved:false},assets},mediaDir:dir});
    assert.equal(report.status,'BLOCKED');
    assert.deepEqual(report.missingIds,['F10']);
    assert.deepEqual(report.galleryNeedsWideDerivativeIds,['F01']);
    assert.equal(report.publishApproval,'not-approved');
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});

test('an approved but empty inventory is not a valid source preflight',()=>{
  const dir=fixture();
  try{
    assert.throws(()=>auditMedia({manifest:{policy:{publicationApproved:true},assets:[]},
      mediaDir:dir}),/empty.*required|no required/i);
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('an unexpected required-media purpose is rejected rather than silently ignored',()=>{
  const dir=fixture();
  try{
    const image=jpeg(800,1200);
    fs.writeFileSync(path.join(dir,'F01.jpg'),image);
    assert.throws(()=>auditMedia({manifest:{policy:{publicationApproved:true},assets:[
      {id:'F01',required:true,purpose:'unrecognized',sha256:hash(image)}]},
      mediaDir:dir}),/invalid purpose/i);
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
