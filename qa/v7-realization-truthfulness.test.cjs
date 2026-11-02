'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');

test('homepage does not label unverified public-review photos as customer realizations',()=>{
 assert.match(app,/id="vybrane-realizace"/);
 assert.match(app,/Možnosti vašeho projektu/);
 assert.doesNotMatch(app,/Vybrané realizace/);
 assert.doesNotMatch(app,/Prohlédnout realizace/);
 assert.match(app,/nejde o zákaznické reference ani produkční schválení fotografií/i);
});
