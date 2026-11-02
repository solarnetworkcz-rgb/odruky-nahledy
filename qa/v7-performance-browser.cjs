'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..'),port=43120;
 const server=spawn(process.execPath,['-e',`require('http').createServer((q,s)=>{let p=require('path').join(process.argv[1],decodeURIComponent(q.url.split('?')[0]));if(require('fs').existsSync(p)&&require('fs').statSync(p).isDirectory())p=require('path').join(p,'index.html');require('fs').readFile(p,(e,b)=>{if(e){s.statusCode=404;return s.end()}s.end(b)})}).listen(process.argv[2])`,root,String(port)],{stdio:'ignore'});
 await new Promise(r=>setTimeout(r,500));const browser=await chromium.launch({headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:900}});
  const failed=[];p.on('requestfailed',r=>failed.push(r.url()));
  await p.goto('http://127.0.0.1:'+port+'/odruky/',{waitUntil:'networkidle'});
  const m=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0],res=performance.getEntriesByType('resource');return {dom:n.domContentLoadedEventEnd-n.startTime,load:n.loadEventEnd-n.startTime,transfer:res.reduce((a,x)=>a+(x.transferSize||0),0),resources:res.length,hero:document.querySelector('.hero-photo img')?.complete,images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length}});
  assert.equal(failed.length,0,'failed requests '+failed.join(','));
  assert.equal(m.hero,true);assert.equal(m.images,0);
  assert.ok(m.resources<=20,'resource count '+m.resources);
  assert.ok(m.transfer<=8*1024*1024,'homepage transfer '+m.transfer);
  assert.ok(m.dom<3000,'local DOMContentLoaded '+m.dom);
  assert.ok(m.load<5000,'local load '+m.load);
  console.log('V7_PERFORMANCE_GATE_PASS',JSON.stringify(m));
 }finally{await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exit(1)});
