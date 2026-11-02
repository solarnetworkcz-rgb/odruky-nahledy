'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

function readBoxHeader(buf,offset,end){
  if(offset+8>end)return null;
  let size=buf.readUInt32BE(offset);
  const type=buf.toString('ascii',offset+4,offset+8);
  let header=8;
  if(size===1){
    if(offset+16>end)return null;
    const big=buf.readBigUInt64BE(offset+8);
    if(big>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('MP4 box too large');
    size=Number(big);header=16;
  }else if(size===0){
    size=end-offset;
  }
  if(size<header||offset+size>end)return null;
  return {type,start:offset,data:offset+header,end:offset+size,size};
}
function findBox(buf,start,end,target){
  for(let off=start;off+8<=end;){
    const box=readBoxHeader(buf,off,end);
    if(!box)break;
    if(box.type===target)return box;
    if(box.type==='moov'){
      const nested=findBox(buf,box.data,box.end,target);
      if(nested)return nested;
    }
    off=box.end;
  }
  return null;
}
function mp4DurationSeconds(file){
  const buf=fs.readFileSync(file);
  const mvhd=findBox(buf,0,buf.length,'mvhd');
  assert.ok(mvhd,'mvhd box must exist');
  const version=buf[mvhd.data];
  if(version===0){
    const timescale=buf.readUInt32BE(mvhd.data+12);
    const duration=buf.readUInt32BE(mvhd.data+16);
    assert.ok(timescale>0,'mvhd timescale must be positive');
    return duration/timescale;
  }
  if(version===1){
    const timescale=buf.readUInt32BE(mvhd.data+20);
    const duration=buf.readBigUInt64BE(mvhd.data+24);
    assert.ok(timescale>0,'mvhd timescale must be positive');
    return Number(duration)/timescale;
  }
  throw new Error('Unsupported mvhd version '+version);
}

test('Zoja page uses the complete customer video with safe playback controls',()=>{
  const html=fs.readFileSync(path.join(root,'zoja','index.html'),'utf8');
  assert.equal((html.match(/<video\b/g)||[]).length,1,'exactly one Zoja video');
  assert.match(html,/<video[^>]*\bcontrols\b[^>]*\bplaysinline\b[^>]*preload="metadata"[^>]*poster="\.\/media\/zoja-video-poster\.webp"/);
  assert.doesNotMatch(html,/<video[^>]*\bautoplay\b/,'video must not autoplay');
  assert.match(html,/<source src="\.\/media\/zoja-web\.mp4" type="video\/mp4">/);
});

test('Zoja web MP4 keeps the full 4.042 second duration',()=>{
  const file=path.join(root,'zoja','media','zoja-web.mp4');
  assert.ok(fs.existsSync(file),'zoja-web.mp4 must exist');
  const seconds=mp4DurationSeconds(file);
  assert.ok(Math.abs(seconds-4.042)<=0.001,`expected 4.042 s, got ${seconds}`);
});

test('BWNG FAST and FULL permanently execute the Zoja full-video integrity gate',()=>{
  const cfg=JSON.parse(fs.readFileSync(path.join(root,'.buildworker-tests.json'),'utf8'));
  for(const channel of ['FAST','FULL']){
    assert.ok(cfg.channels[channel].some(cmd=>cmd.includes('qa/zoja-video-integrity.test.cjs')),`${channel} must run Zoja video integrity`);
  }
});
