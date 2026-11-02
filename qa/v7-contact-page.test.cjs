'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');

test('V7 contact page gives useful first-message guidance without a form',()=>{
  assert.match(app,/function contactPage\(\)/);
  assert.match(app,/Co poslat v první zprávě/i);
  assert.match(app,/místo/i);
  assert.match(app,/využití/i);
  assert.match(app,/rozměry/i);
  assert.match(app,/náčrt/i);
  assert.doesNotMatch(app,/<form\b/i);
});

test('contact page preserves selected product context and privacy boundary',()=>{
  assert.match(app,/selectedIntent/);
  assert.match(app,/Žádné údaje se v tomto pracovním náhledu neodesílají ani neukládají/i);
  assert.match(app,/contactContent\(\)/);
});
