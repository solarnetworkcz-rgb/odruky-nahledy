'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const js=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');
test('lightbox explicit home exit and Escape use the same return-to-home contract',()=>{
 assert.match(js,/const homeClose=\(\)=>\{[^}]*window\.location\.assign\(route\('\/#top'\)\)/s);
 assert.match(js,/\$\('#modal-close'\)\.addEventListener\('click',homeClose\)/);
 assert.match(js,/modal\.addEventListener\('cancel',e=>\{e\.preventDefault\(\);homeClose\(\);\}\)/);
 assert.match(js,/\$\('#modal-gallery-close'\)\.addEventListener\('click',galleryClose\)/);
});
