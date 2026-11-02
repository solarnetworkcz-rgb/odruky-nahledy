'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..'); const port=43119;
 const server=spawn(process.execPath,['-e',`require('http').createServer((q,s)=>{let p=require('path').join(process.argv[1],decodeURIComponent(q.url.split('?')[0]));if(require('fs').existsSync(p)&&require('fs').statSync(p).isDirectory())p=require('path').join(p,'index.html');require('fs').readFile(p,(e,b)=>{if(e){s.statusCode=404;return s.end()}s.end(b)})}).listen(process.argv[2])`,root,String(port)],{stdio:'ignore'});
 await new Promise(r=>setTimeout(r,500));
 const browser=await chromium.launch({headless:true});
 try{
  const pages=['odruky/','odruky/stromove-domy/','odruky/domecky/','odruky/sauny/','odruky/posedy/','odruky/vceli-domy/','odruky/realizace/','odruky/zakazkova-vyroba/','odruky/o-nas/','odruky/kontakt/'];
  for(const rel of pages){
   const p=await browser.newPage({viewport:{width:1280,height:900}});
   const errors=[];p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('pageerror',e=>errors.push(e.message));
   const res=await p.goto('http://127.0.0.1:'+port+'/'+rel,{waitUntil:'networkidle'});
   assert.equal(res.status(),200,rel);
   const sem=await p.evaluate(()=>({h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main').length,header:document.querySelectorAll('header').length,footer:document.querySelectorAll('footer').length,emptyLinks:[...document.querySelectorAll('a')].filter(a=>!((a.innerText||'').trim()||a.getAttribute('aria-label'))).length,imagesMissingAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).length}));
   assert.deepEqual(sem,{h1:1,main:1,header:1,footer:1,emptyLinks:0,imagesMissingAlt:0},rel+' semantic landmarks');
   assert.deepEqual(errors,[],rel+' console errors');
   await p.close();
  }
  const p=await browser.newPage({viewport:{width:1280,height:900}});
  await p.goto('http://127.0.0.1:'+port+'/odruky/',{waitUntil:'networkidle'});
  const low=await p.evaluate(()=>{
   function rgba(s){const m=s.match(/[\d.]+/g);return m?[+m[0],+m[1],+m[2],m[3]===undefined?1:+m[3]]:null}
   function lum(c){return c.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)}
   function blend(f,b){return f[3]>=1?f:[0,1,2].map(i=>f[i]*f[3]+b[i]*(1-f[3])).concat(1)}
   function bg(el){let out=[255,255,255,1];const chain=[];for(let n=el;n;n=n.parentElement)chain.push(n);for(const n of chain.reverse()){const c=rgba(getComputedStyle(n).backgroundColor);if(c&&c[3])out=blend(c,out)}return out}
   return [...document.querySelectorAll('body *')].filter(el=>el.children.length===0&&(el.textContent||'').trim()&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden').map(el=>{const s=getComputedStyle(el),fg=blend(rgba(s.color),bg(el)),b=bg(el),ratio=(Math.max(lum(fg),lum(b))+.05)/(Math.min(lum(fg),lum(b))+.05),large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&+s.fontWeight>=700);return {tag:el.tagName,cls:el.className,text:el.textContent.trim().slice(0,60),ratio,required:large?3:4.5}}).filter(x=>x.ratio+0.01<x.required);
  });
  assert.deepEqual(low,[],'WCAG AA text contrast failures: '+JSON.stringify(low.slice(0,12)));
  console.log('V7_WCAG_SEMANTIC_PASS',JSON.stringify({pages:pages.length,contrast:'AA'}));
  await p.close();
 } finally {await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exit(1)});
