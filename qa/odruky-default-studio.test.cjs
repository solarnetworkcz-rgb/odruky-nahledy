'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const pages=['odruky/index.html','odruky/stromove-domy/index.html','odruky/domecky/index.html','odruky/sauny/index.html','odruky/posedy/index.html','odruky/vceli-domy/index.html','odruky/kontakt/index.html'];
function run(page,search=''){
 const html=fs.readFileSync(path.join(root,page),'utf8');
 const m=html.match(/<script data-concept-bootstrap>([\s\S]*?)<\/script>/);
 assert.ok(m,page+' bootstrap');
 const document={documentElement:{dataset:{}}};
 vm.runInNewContext(m[1],{document,location:{search},URLSearchParams});
 return {html,dataset:document.documentElement.dataset};
}
test('latest Studio redesign is the default on every canonical Odruky page before first paint',()=>{
 for(const page of pages){
  const {html,dataset}=run(page,'');
  assert.equal(dataset.concept,'studio',page);
  assert.ok(html.indexOf('data-concept-bootstrap')<html.indexOf('<link rel="stylesheet" href="./style.css"') || page!=='odruky/index.html');
 }
});
test('classic remains explicitly available for comparison',()=>{
 for(const page of pages) assert.notEqual(run(page,'?concept=classic').dataset.concept,'studio',page);
});
