'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {verifyProtectedPixels}=require('./preserved-pixels.cjs');

const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const tmp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'odruky-protected-pixels-'));
let browser,fixtures;
test.before(async()=>{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage();
  fixtures=await page.evaluate(async()=>{
    const source=document.createElement('canvas');
    source.width=6;source.height=4;
    const s=source.getContext('2d',{willReadFrequently:true});
    for(let y=0;y<4;y++)for(let x=0;x<6;x++){
      s.fillStyle='rgb('+((x*39+y*7)%256)+','+((x*17+y*41)%256)+','+((x*13+y*23)%256)+')';
      s.fillRect(x,y,1,1);
    }
    const sourceJpeg=source.toDataURL('image/jpeg',1).split(',')[1];
    const sourceBytes=Uint8Array.from(atob(sourceJpeg),c=>c.charCodeAt(0));
    const original=await createImageBitmap(new Blob([sourceBytes],{type:'image/jpeg'}));
    const wide=document.createElement('canvas');wide.width=9;wide.height=6;
    const d=wide.getContext('2d',{willReadFrequently:true});
    d.fillStyle='#456d80';d.fillRect(0,0,9,6);
    d.drawImage(original,2,1);
    const wideGood=wide.toDataURL('image/png').split(',')[1];
    d.fillStyle='#ff0000';d.fillRect(0,0,1,1);
    const wideOutsideOnly=wide.toDataURL('image/png').split(',')[1];
    d.fillStyle='#456d80';d.fillRect(0,0,1,1);
    d.fillStyle='#ff0000';d.fillRect(4,2,1,1);
    const wideBad=wide.toDataURL('image/png').split(',')[1];
    const notWide=document.createElement('canvas');notWide.width=8;notWide.height=6;
    notWide.getContext('2d').drawImage(original,2,1);
    const wideWrongAspect=notWide.toDataURL('image/png').split(',')[1];
    original.close();
    return {sourceJpeg,wideGood,wideOutsideOnly,wideBad,wideWrongAspect};
  });
  await page.close();
});
test.after(async()=>{await browser?.close()});

function createPair(){
  const dir=tmp(),originalDir=path.join(dir,'originals'),wideDir=path.join(dir,'wide');
  fs.mkdirSync(originalDir);fs.mkdirSync(wideDir);
  const original=Buffer.from(fixtures.sourceJpeg,'base64');
  fs.writeFileSync(path.join(originalDir,'F02.jpeg'),original);
  fs.writeFileSync(path.join(wideDir,'F02-wide.png'),Buffer.from(fixtures.wideGood,'base64'));
  return {dir,originalDir,wideDir,pairs:[{id:'F02',originalFile:'F02.jpeg',
    originalSha256:sha(original),wideFile:'F02-wide.png',x:2,y:1}]};
}
test('genuine JPEG original + PNG 3:2 outpaint passes a pixel-exact subset check',async()=>{
  const f=createPair();
  try{
    const out=await verifyProtectedPixels({...f,browser});
    assert.equal(out.status,'PIXEL_SUBSET_VERIFIED');
    assert.equal(out.releaseReady,false);
    assert.deepEqual(out.counts,{total:1,verified:1,failed:0});
    assert.equal(out.records[0].sourceWidth,6);
    assert.equal(out.records[0].wideWidth,9);
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});
test('a changed pixel within the protected original rectangle is rejected',async()=>{
  const f=createPair();
  try{
    fs.writeFileSync(path.join(f.wideDir,'F02-wide.png'),Buffer.from(fixtures.wideBad,'base64'));
    const out=await verifyProtectedPixels({...f,browser});
    assert.equal(out.status,'BLOCKED');
    assert.match(out.records[0].reason,/PIXEL_MISMATCH/);
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});
test('a source hash mismatch is never silently accepted',async()=>{
  const f=createPair();
  try{
    f.pairs[0].originalSha256='a'.repeat(64);
    const out=await verifyProtectedPixels({...f,browser});
    assert.equal(out.status,'BLOCKED');
    assert.equal(out.records[0].reason,'SOURCE_HASH_MISMATCH');
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});
test('missing wide image, invalid placements and unsafe paths fail closed',async()=>{
  const f=createPair();
  try{
    fs.rmSync(path.join(f.wideDir,'F02-wide.png'));
    const out=await verifyProtectedPixels({...f,browser});
    assert.equal(out.status,'BLOCKED');
    assert.equal(out.records[0].reason,'MISSING_WIDE_IMAGE');
    await assert.rejects(verifyProtectedPixels({...f,browser,
      pairs:[{...f.pairs[0],wideFile:'../outside.png'}]}),/unsafe.*file/i);
    await assert.rejects(verifyProtectedPixels({...f,browser,
      pairs:[{...f.pairs[0],x:-1}]}),/invalid.*placement/i);
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});
test('the 3:2 shape is mandatory independently of content equality',async()=>{
  const f=createPair();
  try{
    fs.writeFileSync(path.join(f.wideDir,'F02-wide.png'),Buffer.from(fixtures.wideWrongAspect,'base64'));
    const out=await verifyProtectedPixels({...f,browser});
    assert.equal(out.status,'BLOCKED');
    assert.equal(out.records[0].reason,'NOT_3_2');
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});
test('empty and duplicate pair inventories never report success',async()=>{
  const f=createPair();
  try{
    await assert.rejects(verifyProtectedPixels({...f,browser,pairs:[]}),/empty/);
    await assert.rejects(verifyProtectedPixels({...f,browser,
      pairs:[f.pairs[0],f.pairs[0]]}),/duplicate/);
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});

test('changes outside the protected original rectangle are permitted',async()=>{
  const f=createPair();
  try{
    fs.writeFileSync(path.join(f.wideDir,'F02-wide.png'),
      Buffer.from(fixtures.wideOutsideOnly,'base64'));
    const out=await verifyProtectedPixels({...f,browser});
    assert.equal(out.status,'PIXEL_SUBSET_VERIFIED');
    assert.equal(out.records[0].reason,'PIXELS_IDENTICAL');
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});
test('a false PNG extension must not pass using JPEG image bytes',async()=>{
  const f=createPair();
  try{
    fs.writeFileSync(path.join(f.wideDir,'F02-wide.png'),
      Buffer.from(fixtures.sourceJpeg,'base64'));
    const out=await verifyProtectedPixels({...f,browser});
    assert.equal(out.status,'BLOCKED');
    assert.equal(out.records[0].reason,'INVALID_WIDE_FORMAT');
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});
test('a wrong pixel-placement coordinate is rejected',async()=>{
  const f=createPair();
  try{
    f.pairs[0].x=1;
    const out=await verifyProtectedPixels({...f,browser});
    assert.equal(out.status,'BLOCKED');
    assert.equal(out.records[0].reason,'PIXEL_MISMATCH');
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});
test('source outside declared wide bounds is rejected',async()=>{
  const f=createPair();
  try{
    f.pairs[0].x=5;
    const out=await verifyProtectedPixels({...f,browser});
    assert.equal(out.status,'BLOCKED');
    assert.equal(out.records[0].reason,'SOURCE_OUTSIDE_WIDE');
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});

test('CLI returns a machine-readable status and enforces blocked exit code',async()=>{
  const f=createPair();
  try{
    const {spawnSync}=require('node:child_process');
    const pairsFile=path.join(f.dir,'pairs.json');
    fs.writeFileSync(pairsFile,JSON.stringify({pairs:f.pairs}));
    const args=[path.join(__dirname,'preserved-pixels.cjs'),
      '--pairs',pairsFile,'--original-dir',f.originalDir,'--wide-dir',f.wideDir];
    const good=spawnSync(process.execPath,args,{encoding:'utf8',env:process.env,timeout:45000});
    assert.equal(good.status,0,good.stderr);
    const data=JSON.parse(good.stdout);
    assert.equal(data.status,'PIXEL_SUBSET_VERIFIED');
    assert.equal(data.releaseReady,false);
    fs.writeFileSync(path.join(f.wideDir,'F02-wide.png'),Buffer.from(fixtures.wideBad,'base64'));
    const bad=spawnSync(process.execPath,args,{encoding:'utf8',env:process.env,timeout:45000});
    assert.equal(bad.status,2,bad.stderr);
    assert.equal(JSON.parse(bad.stdout).status,'BLOCKED');
  }finally{fs.rmSync(f.dir,{recursive:true,force:true})}
});
