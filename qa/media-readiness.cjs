#!/usr/bin/env node
'use strict';
// Read-only media-preflight inventory. Never rewrites originals or authorizes release.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const SOF=new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
function jpegDimensions(buffer){
  if(buffer.length<4||buffer[0]!==0xff||buffer[1]!==0xd8)throw Error('not a JPEG');
  let i=2;
  while(i<buffer.length){
    if(buffer[i++]!==0xff)throw Error('invalid JPEG marker');
    while(buffer[i]===0xff)i++;
    const marker=buffer[i++];
    if(marker===0xd9||marker===0xda)break;
    if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
    if(i+2>buffer.length)break;
    const length=buffer.readUInt16BE(i);
    if(length<2||i+length>buffer.length)throw Error('truncated JPEG segment');
    if(SOF.has(marker)){
      if(length<7)throw Error('invalid JPEG SOF');
      const height=buffer.readUInt16BE(i+3),width=buffer.readUInt16BE(i+5);
      if(!width||!height)throw Error('invalid JPEG dimensions');
      return {width,height};
    }
    i+=length;
  }
  throw Error('missing JPEG SOF dimensions');
}
function auditMedia({manifest,mediaDir}){
  if(!manifest||!Array.isArray(manifest.assets))throw Error('invalid manifest assets');
  if(!mediaDir||!fs.statSync(mediaDir).isDirectory())throw Error('media directory missing');
  const seen=new Set();
  const assets=manifest.assets.filter(asset=>{
    if(!asset||!/^F\d{2}$/.test(asset.id))throw Error('invalid media id');
    if(seen.has(asset.id))throw Error('duplicate media id '+asset.id);
    seen.add(asset.id);
    if(!/^[a-f0-9]{64}$/i.test(asset.sha256))throw Error('invalid SHA-256 for '+asset.id);
    return asset.required===true;
  });
  if(assets.length===0)throw Error('empty required media inventory');
  for(const asset of assets){
    if(asset.purpose!=='gallery'&&asset.purpose!=='poster')throw Error('invalid purpose for '+asset.id);
  }
  if(manifest.requiredCount!==undefined&&manifest.requiredCount!==assets.length)
    throw Error('required media count mismatch');
  const counts={required:assets.length,exact:0,changed:0,missing:0,invalid:0,wide32:0,notWide32:0};
  const records=[];
  for(const asset of assets){
    const filename=path.join(mediaDir,asset.id+'.jpg');
    if(!fs.existsSync(filename)){
      counts.missing++;
      records.push({id:asset.id,purpose:asset.purpose||null,integrity:'MISSING',aspect:'UNKNOWN'});
      continue;
    }
    const bytes=fs.readFileSync(filename);
    let dimensions;
    try{dimensions=jpegDimensions(bytes)}catch(error){
      counts.invalid++;
      records.push({id:asset.id,purpose:asset.purpose||null,integrity:'INVALID_JPEG',aspect:'UNKNOWN',error:error.message});
      continue;
    }
    const actualSha=crypto.createHash('sha256').update(bytes).digest('hex');
    const integrity=actualSha.toLowerCase()===asset.sha256.toLowerCase()?'EXACT_ORIGINAL_BYTES':'DIFFERENT_BYTES';
    counts[integrity==='EXACT_ORIGINAL_BYTES'?'exact':'changed']++;
    const wide32=dimensions.width*2===dimensions.height*3;
    counts[wide32?'wide32':'notWide32']++;
    records.push({id:asset.id,purpose:asset.purpose||null,integrity,aspect:wide32?'3:2':'NOT_3_2',width:dimensions.width,height:dimensions.height});
  }
  const publishApproval=manifest.policy?.publicationApproved===true?'approved':'not-approved';
  // This gate only establishes candidate media preflight, not pixel-preservation
  // of outpainted derivatives, customer sign-off, or production release approval.
  // Source integrity is independent of the geometry of a separately verified wide derivative.
  const eligible=counts.missing===0&&counts.changed===0&&counts.invalid===0&&
    publishApproval==='approved';
  const galleryNeedsWideDerivativeIds=records.filter(x=>x.purpose==='gallery'&&x.aspect==='NOT_3_2').map(x=>x.id);
  const posterIds=assets.filter(x=>x.purpose==='poster').map(x=>x.id);
  return {schemaVersion:2,status:eligible?'SOURCE_PREFLIGHT_ELIGIBLE':'BLOCKED',
    releaseReady:false,publishApproval,counts,
    missingIds:records.filter(x=>x.integrity==='MISSING').map(x=>x.id),
    changedIds:records.filter(x=>x.integrity==='DIFFERENT_BYTES').map(x=>x.id),
    nonWideIds:records.filter(x=>x.aspect==='NOT_3_2').map(x=>x.id),
    invalidIds:records.filter(x=>x.integrity==='INVALID_JPEG').map(x=>x.id),
    galleryNeedsWideDerivativeIds,posterIds,records,limitations:['Source geometry does not determine source-byte integrity',
      '3:2 dimensions are not proof of original-pixel preservation',
      'SHA mismatch may be an independently delivered customer version',
      'media preflight does not constitute customer or production release approval']};
}
function main(argv){
  let manifestPath=null,mediaDir=null,enforce=false;
  for(let i=0;i<argv.length;i++){
    if(argv[i]==='--manifest'&&argv[i+1])manifestPath=argv[++i];
    else if(argv[i]==='--media-dir'&&argv[i+1])mediaDir=argv[++i];
    else if(argv[i]==='--enforce')enforce=true;
    else throw Error('usage: node qa/media-readiness.cjs --manifest <source-manifest.json> --media-dir <odruky/media> [--enforce]');
  }
  if(!manifestPath||!mediaDir)throw Error('manifest and media-dir are required');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8').replace(/^\uFEFF/,''));
  const report=auditMedia({manifest,mediaDir});
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if(enforce&&report.status==='BLOCKED')process.exitCode=2;
}
if(require.main===module){
  try{main(process.argv.slice(2))}catch(error){console.error('MEDIA_PREFLIGHT_ERROR '+error.message);process.exitCode=2}
}
module.exports={auditMedia,jpegDimensions};
