'use strict';const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','.buildworker-tests.json'),'utf8'));
test('BWNG FAST permanently runs lightweight privacy regression',()=>{assert.ok(cfg.channels.FAST.some(x=>x.includes('v7-privacy-default-studio.test.cjs')))});
test('BWNG FULL permanently runs rendered WCAG and performance gates',()=>{const s=cfg.channels.FULL.join('\n');assert.match(s,/v7-wcag-semantic-browser\.cjs/);assert.match(s,/v7-performance-browser\.cjs/)});

test('BWNG FAST and FULL permanently run lightbox exit regression',()=>{for(const ch of ['FAST','FULL'])assert.ok(cfg.channels[ch].some(x=>x.includes('v7-lightbox-exit-contract.test.cjs')),ch+' must run lightbox exit regression')});
