#!/usr/bin/env node
'use strict';
// Read-only, browser-decoded pixel comparison of source and wide PNG derivative.
// A successful subset comparison NEVER means media approval or release readiness.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

function validatePair(pair,seen){
  if(!pair||typeof pair!=='object'||!/^F\d{2}$/.test(pair.id))throw Error('invalid media id');
  if(seen.has(pair.id))throw Error('duplicate media id '+pair.id);
  seen.add(pair.id);
  if(!/^[a-f0-9]{64}$/i.test(pair.originalSha256||''))throw Error('invalid SHA-256 for '+pair.id);
  if(!/^[-\w.]+\.(jpe?g|png)$/i.test(pair.originalFile||'')||
     pair.originalFile.includes('..'))throw Error('unsafe original file '+pair.id);
  if(!/^[-\w.]+\.png$/i.test(pair.wideFile||'')||
     pair.wideFile.includes('..'))throw Error('unsafe wide file '+pair.id);
  if(!Number.isSafeInteger(pair.x)||pair.x<0||
     !Number.isSafeInteger(pair.y)||pair.y<0)throw Error('invalid placement for '+pair.id);
}
function getFile(dir,name){
  const file=path.join(dir,name);
  if(!fs.existsSync(file))return null;
  const stat=fs.lstatSync(file);
  if(!stat.isFile()||stat.isSymbolicLink())throw Error('unsafe file type '+name);
  if(stat.size>40*1024*1024||stat.size<16)throw Error('invalid image file size '+name);
  return fs.readFileSync(file);
}
async function comparePixels(page,sourceBytes,wideBytes,x,y,sourceMime){
  return page.evaluate(async args=>{
    const bytes=b64=>Uint8Array.from(atob(b64),ch=>ch.charCodeAt(0));
    const img=async(b64,mime)=>{
      const bmp=await createImageBitmap(new Blob([bytes(b64)],{type:mime}));
      const canvas=document.createElement('canvas');
      canvas.width=bmp.width;canvas.height=bmp.height;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      if(!ctx)throw Error('2D canvas unavailable');
      ctx.drawImage(bmp,0,0);bmp.close();
      return {width:canvas.width,height:canvas.height,data:ctx.getImageData(0,0,canvas.width,canvas.height).data};
    };
    const source=await img(args.source,args.sourceMime),wide=await img(args.wide,'image/png');
    if(wide.width*2!==wide.height*3)
      return {ok:false,reason:'NOT_3_2',sourceWidth:source.width,sourceHeight:source.height,
        wideWidth:wide.width,wideHeight:wide.height};
    if(args.x+source.width>wide.width||args.y+source.height>wide.height)
      return {ok:false,reason:'SOURCE_OUTSIDE_WIDE',sourceWidth:source.width,sourceHeight:source.height,
        wideWidth:wide.width,wideHeight:wide.height};
    for(let row=0;row<source.height;row++){
      for(let col=0;col<source.width;col++){
        const a=(row*source.width+col)*4;
        const b=((row+args.y)*wide.width+(col+args.x))*4;
        for(let channel=0;channel<4;channel++){
          if(source.data[a+channel]!==wide.data[b+channel])
            return {ok:false,reason:'PIXEL_MISMATCH',sourceWidth:source.width,sourceHeight:source.height,
              wideWidth:wide.width,wideHeight:wide.height,firstMismatch:{x:col,y:row,channel}};
        }
      }
    }
    return {ok:true,reason:'PIXELS_IDENTICAL',sourceWidth:source.width,
      sourceHeight:source.height,wideWidth:wide.width,wideHeight:wide.height};
  },{source:sourceBytes.toString('base64'),wide:wideBytes.toString('base64'),x,y,sourceMime});
}
async function verifyProtectedPixels({pairs,originalDir,wideDir,browser}){
  if(!Array.isArray(pairs)||pairs.length===0)throw Error('empty pair inventory');
  const seen=new Set();for(const pair of pairs)validatePair(pair,seen);
  if(!browser)throw Error('browser is required');
  if(!fs.existsSync(originalDir)||!fs.statSync(originalDir).isDirectory())throw Error('missing original directory');
  if(!fs.existsSync(wideDir)||!fs.statSync(wideDir).isDirectory())throw Error('missing wide directory');
  const page=await browser.newPage({viewport:{width:100,height:100}});
  const records=[];
  try{
    for(const p of pairs){
      const base={id:p.id,source:p.originalFile,wide:p.wideFile,x:p.x,y:p.y};
      const original=getFile(originalDir,p.originalFile);
      if(!original){records.push({...base,reason:'MISSING_ORIGINAL'});continue}
      const actual=crypto.createHash('sha256').update(original).digest('hex');
      if(actual.toLowerCase()!==p.originalSha256.toLowerCase()){
        records.push({...base,reason:'SOURCE_HASH_MISMATCH'});continue
      }
      const wide=getFile(wideDir,p.wideFile);
      if(!wide){records.push({...base,reason:'MISSING_WIDE_IMAGE'});continue}
      const pngSignature=Buffer.from([137,80,78,71,13,10,26,10]);
      if(!wide.subarray(0,8).equals(pngSignature)){
        records.push({...base,reason:'INVALID_WIDE_FORMAT'});continue
      }
      let result;
      try{result=await comparePixels(page,original,wide,p.x,p.y,
        /\.png$/i.test(p.originalFile)?'image/png':'image/jpeg')}
      catch(e){result={ok:false,reason:'DECODE_FAILED',error:String(e.message).slice(0,140)}}
      records.push({...base,...result});
    }
  }finally{await page.close()}
  const verified=records.filter(x=>x.ok===true).length;
  return {schemaVersion:1,status:verified===records.length?'PIXEL_SUBSET_VERIFIED':'BLOCKED',
    releaseReady:false,counts:{total:records.length,verified,failed:records.length-verified},
    records,limitations:[
      'This only verifies declared pairs; it does not establish completeness of 27 required media',
      'Pixel equality does not confer customer publication approval or production release readiness',
      'Wide PNG must retain the browser-decoded RGBA pixels of the original JPEG/PNG at recorded placement'
    ]};
}
async function main(argv){
  let manifestPath=null,originalDir=null,wideDir=null;
  for(let i=0;i<argv.length;i++){
    if(argv[i]==='--pairs'&&argv[i+1])manifestPath=argv[++i];
    else if(argv[i]==='--original-dir'&&argv[i+1])originalDir=argv[++i];
    else if(argv[i]==='--wide-dir'&&argv[i+1])wideDir=argv[++i];
    else throw Error('usage: node qa/preserved-pixels.cjs --pairs <pairs.json> --original-dir <source> --wide-dir <derivatives>');
  }
  if(!manifestPath||!originalDir||!wideDir)throw Error('pairs, original-dir, wide-dir required');
  const pairs=JSON.parse(fs.readFileSync(manifestPath,'utf8').replace(/^\uFEFF/,'')).pairs;
  const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
  const browser=await chromium.launch({headless:true});
  try{
    const report=await verifyProtectedPixels({pairs,originalDir,wideDir,browser});
    process.stdout.write(JSON.stringify(report,null,2)+'\n');
    if(report.status==='BLOCKED')process.exitCode=2;
  }finally{await browser.close()}
}
if(require.main===module){
  main(process.argv.slice(2)).catch(e=>{console.error('PIXEL_AUDIT_ERROR '+e.message);process.exitCode=2});
}
module.exports={verifyProtectedPixels};
