'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','odruky','ochrana-osobnich-udaju','index.html'),'utf8');
test('privacy/legal page defaults to Studio and keeps classic opt-in',()=>{
 assert.match(html,/get\('concept'\)!=='classic'/,'privacy page must default to Studio');
 assert.doesNotMatch(html,/get\('concept'\)==='studio'/,'old opt-in-only Studio bootstrap must be removed');
});
