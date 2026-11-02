'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');

test('V7 custom-production page reuses verified principles and four-step process',()=>{
  assert.match(app,/function customProductionPage\(\)/);
  assert.match(app,/D\.principles\.map/);
  assert.match(app,/D\.steps\.map/);
  assert.match(app,/id="zakazkova-postup"/);
  assert.match(app,/Co si připravit/i);
  assert.match(app,/místo/i);
  assert.match(app,/rozměry/i);
  assert.match(app,/využití/i);
});

test('custom-production page keeps claims bounded and points to inquiry',()=>{
  assert.match(app,/inquiryHref\('zakazkova-vyroba'\)/);
  assert.doesNotMatch(app,/garantujeme|certifikovan|pevná cena|dodání do|na klíč/i);
});
