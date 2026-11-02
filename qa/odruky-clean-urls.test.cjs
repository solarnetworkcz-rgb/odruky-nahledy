'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');

test('default Studio navigation uses clean canonical-looking URLs without concept query noise',()=>{
  assert.doesNotMatch(app,/dataset\.concept==='studio'.*searchParams\.set\('concept','studio'\)/s);
  assert.match(app,/requestedConcept==='classic'.*searchParams\.set\('concept','classic'\)/s);
});
