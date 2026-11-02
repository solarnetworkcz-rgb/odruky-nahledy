'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');

test('above-fold Odruky hero and product cover request image priority',()=>{
 assert.match(app,/function imageTag\(image,alt,cl='',priority=false\)/);
 assert.match(app,/priority\?'eager':'lazy'/);
 assert.match(app,/priority\?'high':'auto'/);
 assert.match(app,/imageTag\('F04\.jpg',[^\n]*,'',true\)/);
 assert.match(app,/imageTag\(c\.image,c\.name\+' — úvodní fotografie z dodaných podkladů','',true\)/);
});

test('gallery images remain lazy by default',()=>{
 assert.match(app,/\$\{imageTag\(s\.image,s\.title\+' – zákaznický obrazový podklad'\)\}/);
});
