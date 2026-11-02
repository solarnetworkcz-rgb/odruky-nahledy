'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');

test('above-fold Odruky hero and product cover request image priority',()=>{
 assert.match(app,/function imageTag\(image,alt,cl='',priority=false\)/);
 assert.match(app,/priority\?'eager':'lazy'/);
 assert.match(app,/priority\?'high':'low'/);
 assert.match(app,/imageTag\('F04\.jpg',[^\n]*,'',true\)/);
 assert.match(app,/imageTag\(c\.image,c\.name\+' — úvodní fotografie z dodaných podkladů','',true\)/);
});

test('below-fold and gallery images remain truly deferred by default',()=>{
 assert.match(app,/sourceAttr=priority\?`src=/);
 assert.match(app,/:`data-src=/);
 assert.match(app,/fetchPriority=priority\?'high':'low'/);
 assert.match(app,/IntersectionObserver/);
 assert.match(app,/\$\{imageTag\(s\.image,s\.title\+' – zákaznický obrazový podklad'\)\}/);
});
