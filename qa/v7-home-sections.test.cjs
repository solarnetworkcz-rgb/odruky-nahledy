'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');
test('V7 homepage contains selected-realizations layer between offer and about',()=>{
 const offer=app.indexOf('id="nabidka"');
 const realiz=app.indexOf('id="vybrane-realizace"');
 const about=app.indexOf('id="o-nas"');
 assert.ok(offer>=0 && realiz>offer && about>realiz);
 assert.match(app,/href="[^"]*realizace\//);
 assert.match(app,/Vybran[^<]*realiz/i);
});
test('V7 homepage contains explicit custom-production layer and safe CTA',()=>{
 const custom=app.indexOf('id="zakazkova-vyroba"');
 const process=app.indexOf('id="postup"');
 assert.ok(custom>=0 && process>custom);
 assert.match(app,/href="[^"]*zakazkova-vyroba\//);
 assert.match(app,/Zak[^<]*v[^<]*roba/i);
});
test('new homepage layers do not introduce unsupported commercial claims',()=>{
 assert.doesNotMatch(app,/certifikovan|záruk[a-z]*\s+\d|dodání\s+do|od\s+\d+[\s.]*(Kč|CZK)/i);
});
