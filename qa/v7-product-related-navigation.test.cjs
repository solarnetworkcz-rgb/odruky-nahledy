'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');

test('every product detail exposes explicit related-category and realizations navigation',()=>{
  assert.match(app,/const related=D\.categories\.filter/);
  assert.match(app,/class="related-links"/);
  assert.match(app,/aria-label="Další možnosti projektu"/);
  assert.match(app,/link\('\/realizace\/'/);
  assert.match(app,/x\.slug!==c\.slug/);
});

test('related navigation does not alter the five-category source contract',()=>{
  assert.doesNotMatch(app,/Apartmány|Zoja Krkonoše/);
});
