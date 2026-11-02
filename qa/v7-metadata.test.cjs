'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..','odruky');
const pages=[];
for(const entry of fs.readdirSync(root,{withFileTypes:true})){
 if(entry.isFile()&&entry.name==='index.html')pages.push(path.join(root,'index.html'));
 if(entry.isDirectory()){
  const f=path.join(root,entry.name,'index.html');
  if(fs.existsSync(f))pages.push(f);
 }
}
test('all public Odruky HTML metadata is current and does not advertise obsolete V6',()=>{
 assert.ok(pages.length>=10);
 for(const file of pages){
  const html=fs.readFileSync(file,'utf8');
  const title=html.match(/<title>(.*?)<\/title>/)?.[1]||'';
  const desc=html.match(/<meta name="description" content="([^"]*)">/)?.[1]||'';
  assert.ok(title.trim(),path.relative(root,file)+' title');
  assert.ok(desc.trim(),path.relative(root,file)+' description');
  assert.doesNotMatch(title,/\bV6(?:\.6)?\b/i,path.relative(root,file)+' stale title');
  assert.doesNotMatch(desc,/\bV6(?:\.6)?\b/i,path.relative(root,file)+' stale description');
  assert.match(html,/<meta name="robots" content="noindex,nofollow">/,path.relative(root,file)+' staging indexing policy');
 }
});
test('Odruky titles remain distinct across pages',()=>{
 const titles=pages.map(file=>fs.readFileSync(file,'utf8').match(/<title>(.*?)<\/title>/)?.[1]||'');
 assert.equal(new Set(titles).size,titles.length);
});
