'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'style.css'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
test('Odruky alternatives A C D each differ from unchanged B in page composition',()=>{
 assert.match(css,/V8 ARCHITECTURAL THEME OVERRIDES/);
 for(const id of ['a','c','d']){
  assert.match(css,new RegExp('data-theme='+id+'\\] \\.hero-layout\\{'));
  assert.match(css,new RegExp('data-theme='+id+'\\] \\.catalog\\{'));
  assert.match(css,new RegExp('data-theme='+id+'\\] \\.brand-block\\{'));
 }
 assert.match(css,/data-theme=c\] \.hero-photo\{order:-1/);
 assert.match(css,/data-theme=d\] \.hero-layout\{display:grid/);
 assert.match(css,/data-theme=a\] \.catalog-item:nth-child\(4\)/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(app,/id:'b',name:/);
 assert.match(app,/setTheme/);
 assert.doesNotMatch(css,/url\(['"]?data:/);
});
test('Odruky retains five legitimate product categories and owner-approved media strategy',()=>{
 const data=fs.readFileSync(path.join(__dirname,'site-data.js'),'utf8');
 assert.match(data,/stromove-domy/);assert.match(data,/domecky/);assert.match(data,/sauny/);assert.match(data,/posedy/);assert.match(data,/vceli-domy/);
 assert.doesNotMatch(data,/apartm[aá]ny/i);
 assert.match(app,/mediaMode/);assert.match(app,/imageTag/);
});
