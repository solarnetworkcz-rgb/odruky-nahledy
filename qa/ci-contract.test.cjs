'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'.buildworker-tests.json'),'utf8'));
const required=[
 'qa/zoja-default-redesign.test.cjs',
 'qa/odruky-default-studio.test.cjs',
 'qa/odruky-v6-current-contract.test.cjs',
 'qa/odruky-clean-urls.test.cjs',
 'qa/single-demo-selector.test.cjs',
 'qa/odruky-a11y-layout.test.cjs',
 'qa/odruky-image-priority.test.cjs',
 'qa/v7-home-sections.test.cjs',
 'qa/v7-metadata.test.cjs',
 'qa/v7-contrast.test.cjs',
 'qa/v7-about-page.test.cjs',
 'qa/v7-contact-page.test.cjs',
 'qa/v7-custom-production-page.test.cjs',
 'qa/v7-product-related-navigation.test.cjs',
 'qa/v7-realizations-gallery.test.cjs',
 'qa/ci-contract.test.cjs'
];
test('BWNG FAST and FULL permanently execute every lightweight post-cutover regression',()=>{
 for(const channel of ['FAST','FULL']){
  const joined=manifest.channels[channel].join('\n');
  for(const file of required) assert.ok(joined.includes(file),channel+' missing '+file);
 }
});
test('FULL retains the real browser gate while FAST remains lightweight',()=>{
 const fast=manifest.channels.FAST.join('\n'),full=manifest.channels.FULL.join('\n');
 assert.ok(!fast.includes('bwng-browser-runner.ps1'));
 assert.ok(full.includes('bwng-browser-runner.ps1'));
 assert.ok(full.includes('media-readiness.test.cjs'));
});

test('generated browser QA screenshots never dirty a BWNG exact-source workspace',()=>{
 const ignore=fs.readFileSync(path.join(root,'.gitignore'),'utf8');
 assert.match(ignore,/(^|\r?\n)qa-artifacts\/(\r?\n|$)/);
});
