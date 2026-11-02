'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','odruky','app.js'),'utf8');

test('V7 realizations page contains a real working gallery built from existing public-review media',()=>{
  assert.match(app,/function realizationsPage\(\)/);
  assert.match(app,/id="realizace-galerie"/);
  for(const id of ['F04.jpg','F27.jpg','F20.jpg','F34.jpg']) assert.match(app,new RegExp(id.replace('.','\\.')));
  assert.match(app,/Pracovn[^<]*galer/i);
  assert.match(app,/href:'\/stromove-domy\/'/);
  assert.match(app,/href:'\/sauny\/'/);
});

test('realizations page keeps evidence boundaries explicit',()=>{
  assert.match(app,/nejde o zákaznické reference/i);
  assert.match(app,/produkční schválení/i);
  assert.doesNotMatch(app,/spokojených zákazníků|ověřená reference|realizovali jsme pro/i);
});
