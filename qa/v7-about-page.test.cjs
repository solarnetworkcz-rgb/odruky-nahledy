'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');

test('V7 about page reuses current category and principle data rather than inventing company history',()=>{
  assert.match(app,/function aboutPage\(\)/);
  assert.match(app,/D\.categories\.map/);
  assert.match(app,/D\.principles\.map/);
  assert.match(app,/Pět hlavních oblastí/i);
  assert.match(app,/Jak přemýšlíme o projektu/i);
});

test('about page explicitly leaves unverified company facts pending',()=>{
  assert.match(app,/příběh firmy/i);
  assert.match(app,/tým/i);
  assert.match(app,/identifikační údaje/i);
  assert.doesNotMatch(app,/založen[oa]\s+v|let zkušeností|rodinná firma|náš tým tvoří/i);
});
