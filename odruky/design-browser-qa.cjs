'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
process.env.PLAYWRIGHT_BROWSERS_PATH=process.env.PLAYWRIGHT_BROWSERS_PATH||'C:/Projekty/Odruky-browser-qa/browsers';
const {chromium}=require('C:/Projekty/Odruky-browser-qa/node_modules/playwright');
const root=path.resolve(__dirname,'..'),prefix='/odruky-nahledy/';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost').pathname;
 if(!u.startsWith(prefix)){res.writeHead(404);return res.end()}
 let rel=u.slice(prefix.length);if(!rel||rel.endsWith('/'))rel+='index.html';
 if(rel.includes('..')){res.writeHead(403);return res.end()}
 const f=path.join(root,rel);
 if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!Object.hasOwn(mime,path.extname(f))){res.writeHead(404);return res.end()}
 res.setHeader('content-type',mime[path.extname(f)]);fs.createReadStream(f).pipe(res);
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+server.address().port+prefix+'odruky/';
 const browser=await chromium.launch({headless:true}),out=[];
 try{
 for(const width of [390,1280]){
  const signatures=new Set(),imagesByTheme=new Set();
  for(const theme of ['a','b','c','d']){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[],bad=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url()+' '+r.status())});
   const r=await page.goto(base+'?theme='+theme,{waitUntil:'networkidle',timeout:30000});
   assert.equal(r.status(),200);
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),theme,'theme not selected '+theme);
   assert.equal(await page.locator('[data-theme-choice][aria-pressed="true"]').count(),1);
   const state=await page.evaluate(()=>{
    const hero=document.querySelector('.hero-story'),layout=document.querySelector('.hero-layout'),photo=document.querySelector('.hero-photo'),copy=layout.firstElementChild,body=document.body,cat=document.querySelector('.catalog');
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
    return {overflow:document.documentElement.scrollWidth-innerWidth,display:getComputedStyle(layout).display,cols:getComputedStyle(layout).gridTemplateColumns,
      heroBg:getComputedStyle(hero).backgroundColor,brandBg:getComputedStyle(document.querySelector('.brand-block')).backgroundColor,
      photo:rect(photo),copy:rect(copy),catalogDisplay:getComputedStyle(cat).display,catCols:getComputedStyle(cat).gridTemplateColumns,
      photos:[...document.images].map(x=>x.getAttribute('src')),catalogItems:document.querySelectorAll('.catalog-item').length,
      categoryLinks:document.querySelectorAll('.catalog-item a').length};
   });
   assert.ok(state.overflow<=1,'overflow '+theme+'/'+width+' '+state.overflow);
   assert.equal(state.photos.length,5,'media count '+theme);
   assert.equal(state.catalogItems,5);assert.equal(state.categoryLinks,5);
   assert.deepEqual(errors,[],'js '+theme+'/'+width);assert.deepEqual(bad,[],'requests '+theme+'/'+width);
   assert.ok(state.photo.w>100&&state.copy.w>120);
   if(width===1280&&theme==='c')assert.ok(state.photo.x<state.copy.x,'C must reverse photo and copy');
   if(width===1280&&theme==='d')assert.ok(state.photo.x<state.copy.x,'D must use architectural photo-first split');
   if(width===1280&&theme==='a')assert.ok(state.photo.x>state.copy.x,'A must use editorial copy-first split');
   signatures.add([state.display,state.cols,state.heroBg,state.brandBg,state.catalogDisplay,state.catCols].join('|'));
   imagesByTheme.add(state.photos.join('|'));
   const shot='C:/Projekty/Odruky-browser-qa/odruky-variant-'+theme+'-'+width+'.jpg';
   await page.screenshot({path:shot,type:'jpeg',quality:72,timeout:16000});
   if(width===390&&theme==='a'){
    await page.locator('.theme-picker summary').click();
    await page.locator('[data-theme-choice="d"]').click();
    assert.equal(new URL(page.url()).searchParams.get('theme'),'d','shareable theme URL');
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'d');
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'d','persist via query');
   }
   out.push({width,theme,heroBg:state.heroBg,copyX:Math.round(state.copy.x),photoX:Math.round(state.photo.x),shot});
   await page.close();
  }
  assert.equal(signatures.size,4,'themes visually identical at '+width);
  assert.equal(imagesByTheme.size,1,'changing theme changed actual photos at '+width);
 }
 for(const width of [390,1280]){
  for(const theme of ['a','b','c','d']){
   const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(base+'sauny/?theme='+theme,{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200);
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),theme);
   assert.ok(await page.locator('.gallery-item').count()>=1,'sauna gallery '+theme);
   const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,cta:[...document.querySelectorAll('a[href]')].some(a=>a.href.includes('produkt=sauny'))}));
   assert.ok(state.overflow<=1,'detail overflow '+theme+' '+width);
   assert.ok(state.cta,'product intent '+theme);
   await page.locator('.gallery-item').first().click();
   assert.equal(await page.locator('#lightbox').evaluate(d=>d.open),true,'modal open');
   await page.locator('#modal-gallery-close').click();
   assert.equal(await page.locator('#lightbox').evaluate(d=>d.open),false,'modal close');
   assert.deepEqual(errors,[],'detail JS errors');
   await page.close();
  }
 }
 console.log('ODRUKY_FOUR_THEMES_BROWSER_PASS',JSON.stringify({home:out,detailChecks:8}));
 }finally{await browser.close()}
})().catch(e=>{console.error('ODRUKY_FOUR_THEMES_BROWSER_FAIL',e.stack);process.exitCode=1}).finally(()=>server.close());
