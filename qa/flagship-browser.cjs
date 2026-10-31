'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
process.env.PLAYWRIGHT_BROWSERS_PATH=process.env.PLAYWRIGHT_BROWSERS_PATH||'C:/Projekty/Odruky-browser-qa/browsers';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Projekty/Odruky-browser-qa/node_modules/playwright');
const root=path.resolve(__dirname,'..'),prefix='/odruky-nahledy/';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{
 const uri=new URL(req.url,'http://localhost'),uriPath=decodeURIComponent(uri.pathname);
 if(!uriPath.startsWith(prefix)||uriPath.includes('..')){res.writeHead(404);return res.end()}
 let rel=uriPath.slice(prefix.length);
 if(!rel||rel.endsWith('/'))rel+='index.html';
 const file=path.resolve(root,rel);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!mime[path.extname(file)]){res.writeHead(404);return res.end()}
 res.setHeader('content-type',mime[path.extname(file)]);
 if(path.extname(file)==='.mp4'&&req.headers.range){
  const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
  const sz=fs.statSync(file).size;if(!m){res.writeHead(416);return res.end()}
  const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),sz-1):sz-1;
  res.writeHead(206,{'Content-Range':'bytes '+start+'-'+end+'/'+sz,'Accept-Ranges':'bytes','Content-Length':end-start+1});
  return fs.createReadStream(file,{start,end}).pipe(res);
 }
 fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+server.address().port+prefix;
 const browser=await chromium.launch({headless:true}),records=[];
 try{
  for(const cfg of [{site:'odruky',concept:'studio',expectedImages:5,selector:'.catalog-item',count:5},{site:'zoja',concept:'retreat',expectedImages:16,selector:'.gallery-image-link',count:15}]){
   for(const width of [320,390,768,1280,1440]){
    const page=await browser.newPage({viewport:{width,height:860}}),errors=[],bad=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url())});
    const url=base+cfg.site+'/?concept='+cfg.concept;
    if(cfg.site==='zoja')await page.route('**/zoja/themes.js',async route=>{await new Promise(ok=>setTimeout(ok,320));await route.continue()});
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(response.status(),200,url);
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.concept),cfg.concept,'early concept');
    await page.evaluate(async()=>{await Promise.all([...document.images].map(async i=>{i.loading='eager';try{await i.decode()}catch{}}))});
    const info=await page.evaluate(sel=>{
      const hero=document.querySelector('.hero')||document.querySelector('.hero-story'),photo=hero.querySelector('img');
      const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
      return {overflow:document.documentElement.scrollWidth-innerWidth,concept:document.documentElement.dataset.concept,
       visibleImgs:[...document.images].filter(i=>i.complete&&i.naturalWidth>0).length,
       broken:[...document.images].filter(i=>i.hasAttribute('src')&&(!i.complete||i.naturalWidth===0)).map(i=>i.src),
       hero:rect(hero),photo:rect(photo),ctaCount:[...document.querySelectorAll('a[href]')].filter(x=>/kontakt|Poptat pobyt|Probrat projekt/i.test(x.textContent+' '+x.href)).length,
       contentCount:document.querySelectorAll(sel).length,activePicker:getComputedStyle(document.querySelector('.design-picker')||document.querySelector('.theme-picker')).display};
    },cfg.selector);
    assert.ok(info.overflow<=1,'horizontal overflow '+cfg.site+'/'+width+' '+info.overflow);
    assert.equal(info.visibleImgs,cfg.expectedImages,cfg.site+' photo count '+width);
    assert.deepEqual(info.broken,[],'broken images '+cfg.site+'/'+width);
    assert.equal(info.contentCount,cfg.count,'source content '+cfg.site+'/'+width);
    assert.ok(info.ctaCount>0,'missing inquiry '+cfg.site);
    assert.equal(info.activePicker,'none','baseline variant selector should be hidden in flagship');
    assert.ok(info.photo.w>160&&info.photo.h>140,'hero photograph invisible '+cfg.site+'/'+width);
    assert.deepEqual(errors,[],cfg.site+' JS error '+width);
    assert.deepEqual(bad,[],cfg.site+' HTTP failure '+width);
    const photoPath='C:/Projekty/Odruky-browser-qa/flagship-'+cfg.site+'-'+width+'.jpg';
    await page.screenshot({path:photoPath,type:'jpeg',quality:83,fullPage:false,timeout:15000});
    if(cfg.site==='zoja'){
     assert.equal(await page.locator('video').count(),1);
     assert.equal(await page.locator('.contact-call').getAttribute('href'),'tel:+420731989989');
     assert.equal(await page.locator('.practical-grid article').count(),3);
     if(width===390||width===1280){
       await page.locator('#prakticky').scrollIntoViewIfNeeded();
       await page.screenshot({path:'C:/Projekty/Odruky-browser-qa/p3-zoja-practical-'+width+'.jpg',type:'jpeg',quality:78});
     }
     if(width<=768){
      const menu=page.locator('nav .mobile-nav');
      assert.equal(await menu.isVisible(),true);
      await menu.locator('summary').click();
      await menu.locator('.mobile-nav-panel a[href="#galerie"]').click();
      assert.equal(await menu.evaluate(n=>n.open),false);
      assert.equal(new URL(page.url()).hash,'#galerie');
     }
     if(width===390){
      const plan=page.locator('.gallery--plans .gallery-image-link').first();
      await plan.click();
      const modal=page.locator('#zoja-lightbox');
      assert.equal(await modal.evaluate(d=>d.open),true);
      await page.screenshot({path:'C:/Projekty/Odruky-browser-qa/p3-zoja-lightbox-390.jpg',type:'jpeg',quality:80});
      assert.match(await page.locator('#zoja-lightbox-image').getAttribute('src'),/zoja-extra\.webp$/);
      await page.keyboard.press('ArrowRight');
      assert.match(await page.locator('#zoja-lightbox-image').getAttribute('src'),/zoja-render-6\.webp$/);
      await page.keyboard.press('Escape');
      assert.equal(await modal.evaluate(d=>d.open),false);
      assert.equal(await plan.evaluate(a=>document.activeElement===a),true);
     }
    }else{
     assert.equal(await page.locator('.catalog-item a').count(),5);
     const href=await page.locator('.catalog-item a').first().getAttribute('href');
     assert.match(href,/stromove-domy/);
     assert.equal((await page.request.get(href)).status(),200,'product detail accessible');
     assert.equal(await page.getByRole('heading',{name:'ODRUKY',exact:true}).count(),1);
    }
    if(width===390||width===1280){
      const detailSel=cfg.site==='odruky'?'#nabidka .catalog':'.gallery--interior';
      await page.locator(detailSel).scrollIntoViewIfNeeded();
      await page.screenshot({path:'C:/Projekty/Odruky-browser-qa/flagship-'+cfg.site+'-'+width+'-detail.jpg',type:'jpeg',quality:77});
    }
    records.push({site:cfg.site,concept:cfg.concept,width,heroHeight:Math.round(info.hero.h),photoTop:Math.round(info.photo.y),photoHeight:Math.round(info.photo.h),images:info.visibleImgs});
    await page.close();
   }
  }
  // P3: complete Studio customer journey for each canonical product.
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:860}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   for(const slug of ['stromove-domy','domecky','sauny','posedy','vceli-domy']){
    await page.goto(base+'odruky/?concept=studio',{waitUntil:'domcontentloaded'});
    const card=page.locator('.catalog-item a[href*="/odruky/'+slug+'/"]');
    assert.equal(await card.count(),1,'studio catalogue missing '+slug);
    assert.equal(new URL(await card.getAttribute('href')).searchParams.get('concept'),'studio','catalogue must keep concept '+slug);
    await card.click();
    assert.equal(new URL(page.url()).pathname,prefix+'odruky/'+slug+'/');
    assert.equal(new URL(page.url()).searchParams.get('concept'),'studio','detail URL keeps concept '+slug);
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.concept),'studio','detail stylesheet bootstrapped '+slug);
    const cover=page.locator('.product-cover');
    assert.equal(await cover.count(),1);
    assert.equal(await cover.isVisible(),true,'product cover rendered '+slug);
    assert.equal(await page.locator('.detail-action-row a').count(),2);
    if((slug==='stromove-domy'||slug==='vceli-domy')&&(width===390||width===1280)){
     await page.screenshot({path:'C:/Projekty/Odruky-browser-qa/p3-odruky-'+slug+'-'+width+'.jpg',type:'jpeg',quality:78,fullPage:false});
    }
    assert.equal(await page.locator('.gallery-item').count()>=1,true,'gallery content preserved '+slug);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,true,'overflow '+slug+'/'+width);
    const jump=slug==='vceli-domy'?'#podrobnosti':'#gallery';
    await page.locator('.detail-action-row a[href="'+jump+'"]').click();
    assert.equal(new URL(page.url()).hash,jump,'honest product detail jump '+slug);
    await page.locator('.detail-action-row a[href*="/kontakt/"]').click();
    assert.equal(new URL(page.url()).pathname,prefix+'odruky/kontakt/');
    assert.equal(new URL(page.url()).searchParams.get('concept'),'studio','inquiry keeps design '+slug);
    assert.equal(new URL(page.url()).searchParams.get('produkt'),slug,'inquiry keeps product '+slug);
    assert.equal(await page.locator('.contact-intent').count()>=1,true,'selected intent rendered '+slug);
   }
   assert.deepEqual(errors,[],'P3 studio user journey '+width);
   await page.close();
  }
  for(const site of ['odruky','zoja']){
   const page=await browser.newPage();
   await page.goto(base+site+'/?theme=b',{waitUntil:'domcontentloaded'});
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.concept||null),null,'default variant overwritten '+site);
   assert.equal(await page.locator(site==='odruky'?'.theme-picker':'.design-picker').isVisible(),true);
   await page.close();
  }
  for(const width of [390,1280]){
    const page=await browser.newPage({viewport:{width,height:860}});
    const response=await page.goto(base+'porovnani/',{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(response.status(),200);
    const cards=page.locator('a.flagship-card');
    assert.equal(await cards.count(),2);
    assert.equal(await page.locator('a.design-card').count(),8);
    for(const [site,concept] of [['odruky','studio'],['zoja','retreat']]){
      await page.locator('a.flagship-card[href="../'+site+'/?concept='+concept+'"]').click();
      assert.equal(new URL(page.url()).pathname,prefix+site+'/');
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.concept),concept);
      await page.goBack({waitUntil:'domcontentloaded'});
    }
    await page.close();
  }
  console.log('FLAGSHIP_BROWSER_PASS',JSON.stringify({checks:records.length,baselineChecks:2,comparisonChecks:4,results:records}));
 }finally{await browser.close()}
})().catch(e=>{console.error('FLAGSHIP_BROWSER_FAIL',e.stack);process.exitCode=1}).finally(()=>server.close());
