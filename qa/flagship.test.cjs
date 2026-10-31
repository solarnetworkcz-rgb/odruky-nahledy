'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Odruky P2 studio prototype activates before paint and reuses canonical catalogue',()=>{
 const html=read('odruky/index.html'),css=fs.existsSync(path.join(root,'odruky/studio.css'))?read('odruky/studio.css'):'';
 const data=read('odruky/site-data.js');
 assert.match(html,/<script data-concept-bootstrap>/);
 assert.match(html,/documentElement\.dataset\.concept='studio'/);
 assert.match(html,/href="\.\/studio\.css"/);
 assert.match(css,/\[data-concept="studio"\]/);
 assert.match(css,/\.hero-layout/);assert.match(css,/\.catalog-item-featured/);
 assert.match(css,/\.steps-list/);assert.match(css,/\.contact-section/);
 assert.match(css,/@media\(max-width:720px\)/);assert.match(css,/prefers-reduced-motion/);
 assert.match(html,/\.\/site-data\.js/);assert.match(html,/\.\/app\.js/);
 assert.doesNotMatch(data,/apartm[aá]ny/i,'apartments forbidden for Odruky');
 assert.equal((data.match(/"slug":/g)||[]).length,5);
});
test('Zoja P2 retreat uses existing one-page content, original photo/video and accessible inquiry',()=>{
 const html=read('zoja/index.html'),css=fs.existsSync(path.join(root,'zoja/retreat.css'))?read('zoja/retreat.css'):'';
 assert.match(html,/<script data-concept-bootstrap>/);
 assert.match(html,/documentElement\.dataset\.concept='retreat'/);
 assert.match(html,/href="\.\/retreat\.css"/);
 assert.match(css,/\[data-concept="retreat"\]/);
 assert.match(css,/\.hero/);assert.match(css,/\.gallery--interior/);
 assert.match(css,/\.facts/);assert.match(css,/\.motion/);
 assert.match(css,/@media\(max-width:720px\)/);assert.match(css,/prefers-reduced-motion/);
 assert.equal((html.match(/class="gallery-image-link"/g)||[]).length,15);
 assert.equal((html.match(/<video\b/g)||[]).length,1);
 assert.match(html,/tel:\+420731989989/);
 assert.match(html,/základní kapacita 55 lůžek/);
});
test('flagship prototypes do not replace the existing A-D theme selectors',()=>{
 const o=read('odruky/app.js'),z=read('zoja/themes.js');
 for(const id of ['a','b','c','d']){assert.match(o,new RegExp("id:'"+id+"'"));assert.match(z,new RegExp("id:'"+id+"'"));}
 assert.match(o,/theme-picker/);assert.match(z,/data-design-choice/);
});

test('comparison preserves eight A-D cards and offers exactly two P2 prototypes',()=>{
 const html=read('porovnani/index.html');
 assert.equal((html.match(/class="design-card"/g)||[]).length,8,'baseline A–D comparison must remain');
 assert.equal((html.match(/class="flagship-card"/g)||[]).length,2,'two new flagships only');
 assert.match(html,/href="\.\.\/odruky\/\?concept=studio"/);
 assert.match(html,/href="\.\.\/zoja\/\?concept=retreat"/);
 for(const file of ['odruky-studio.jpg','zoja-retreat.jpg']){
  const p=path.join(root,'porovnani','media',file);
  assert.ok(fs.existsSync(p),'missing screenshot '+p);
  const bytes=fs.readFileSync(p);
  assert.ok(bytes.length>25000,'blank thumbnail');
  assert.equal(bytes.subarray(0,2).toString('hex'),'ffd8','must use genuine JPEG screenshots');
 }
});
