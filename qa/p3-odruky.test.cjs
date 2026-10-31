'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const categories=['stromove-domy','domecky','sauny','posedy','vceli-domy'];
test('P3 studio concept loads before paint on all five product detail pages and contact',()=>{
 for(const slug of [...categories,'kontakt']){
  const page=read('odruky/'+slug+'/index.html');
  assert.match(page,/<script data-concept-bootstrap>/,slug);
  assert.match(page,/documentElement\.dataset\.concept='studio'/,slug);
  assert.match(page,/href="\.\.\/studio\.css"/,slug);
 }
});
test('P3 studio links keep the concept through category and inquiry navigation',()=>{
 const app=read('odruky/app.js');
 assert.match(app,/url\.searchParams\.set\('concept','studio'\)/);
 assert.match(app,/documentElement\.dataset\.concept==='studio'/);
 assert.match(app,/class="product-cover"/);
 assert.match(app,/class="detail-action-row"/);
 assert.match(app,/href="#gallery"/);
 assert.match(app,/inquiryHref\(c\.slug\)/);
 const css=read('odruky/studio.css');
 assert.match(css,/\.detail-hero/);
 assert.match(css,/\.product-cover/);
 assert.match(css,/@media\(max-width:720px\)/);
});

test('P3 missing bee image never creates a misleading photo CTA',()=>{
 const app=read('odruky/app.js');
 assert.match(app,/c\.gallery\.some\(s=>s\.image\)/);
 assert.match(app,/href="#podrobnosti"/);
 assert.match(app,/Obrazový podklad zatím není k dispozici/);
});
