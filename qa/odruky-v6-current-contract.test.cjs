'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');
const studio=fs.readFileSync(path.join(__dirname,'..','odruky','studio.css'),'utf8');

test('primary navigation follows the current Odruky V6 journey',()=>{
  assert.match(app,/Co tvoříme/);
  assert.doesNotMatch(app,/desktop-nav[^\n]*Zakázková výroba/);
  assert.match(app,/link\('\/#o-nas','O nás'\)/);
  assert.match(app,/link\('\/#postup','Jak spolupracujeme'\)/);
  assert.match(app,/link\('\/#kontakt','Kontakt'\)/);
});

test('homepage and detail contact sections expose direct phone and email actions without a form',()=>{
  assert.match(app,/Začněme tím, co máte v hlavě\./);
  assert.match(app,/Pošlete nám svou představu\. I jednoduchý náčrt může být dobrý začátek\./);
  assert.match(app,/<strong>Zavolat<\/strong>\$\{phone\(\)\}/);
  assert.match(app,/<strong>Napsat e-mail<\/strong>\$\{mail\(\)\}/);
  assert.doesNotMatch(app,/<form\b/i);
});

test('current Odruky offer remains five woodworking categories and never reintroduces apartments',()=>{
  assert.match(app,/Pět cest\. Jedna vaše představa\./);
  assert.doesNotMatch(app,/Apartmány/);
});

test('studio does not crop non-wide source images to fake the required 3:2 derivatives',()=>{
  assert.doesNotMatch(studio,/\.catalog-media img\{[^}]*object-fit:cover/);
});
