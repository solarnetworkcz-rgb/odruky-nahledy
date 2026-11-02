'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'odruky','app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'odruky','studio.css'),'utf8');

test('all currently published Odruky JPEGs have intrinsic dimensions in the renderer map',()=>{
 const files=fs.readdirSync(path.join(root,'odruky','media')).filter(x=>/^F\d+\.jpg$/i.test(x)).sort();
 const map=app.match(/const mediaDimensions=({[\s\S]*?});/);
 assert.ok(map,'mediaDimensions map missing');
 for(const file of files){
   const id=file.replace(/\.jpg$/i,'');
   assert.match(map[1],new RegExp(id+':\\[\\d+,\\d+\\]'),id+' dimensions missing');
 }
});

test('studio navigation and footer links provide mobile-friendly target height without changing inline prose links',()=>{
 assert.match(css,/\.desktop-nav a,[\s\S]*?\.nav-toggle\{[^}]*min-height:44px/);
 assert.match(css,/\.mobile-nav a\{[^}]*min-height:44px/);
 assert.match(css,/\.footer-links a\{[^}]*min-height:44px/);
 assert.match(css,/\.wordmark\{[^}]*min-height:44px/);
});
