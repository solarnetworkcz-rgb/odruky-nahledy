'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

test('public selector exposes only the two current demos and no old design comparison CTA',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/href="\.\/odruky\/"/);
 assert.match(html,/href="\.\/zoja\/"/);
 assert.match(html,/Apartmány \/ Zoja Krkonoše/);
 assert.doesNotMatch(html,/porovnani\/|Porovnat všech osm/i);
});

test('public demo is explicitly blocked from crawler indexing at robots level',()=>{
 const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
 assert.match(robots,/User-agent:\s*\*/i);
 assert.match(robots,/Disallow:\s*\//i);
});

test('public demo has a noindex 404 that returns visitors to the selector',()=>{
 const html=fs.readFileSync(path.join(root,'404.html'),'utf8');
 assert.match(html,/name="robots" content="noindex,nofollow"/i);
 assert.match(html,/href="\.\/"/);
 assert.match(html,/Zpět na rozcestník/);
});
