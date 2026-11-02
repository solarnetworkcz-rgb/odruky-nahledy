'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','zoja','index.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'..','zoja','retreat.css'),'utf8');
const bootstrap=html.match(/<script data-concept-bootstrap>([\s\S]*?)<\/script>/);
test('latest P2 redesign is default on canonical Zoja URL, before first paint',()=>{
 assert.ok(bootstrap,'concept bootstrap');
 assert.ok(html.indexOf('data-concept-bootstrap')<html.indexOf('<style>'));
 const root={dataset:{}};
 vm.runInNewContext(bootstrap[1],{document:{documentElement:root},location:{search:''},URLSearchParams});
 assert.equal(root.dataset.concept,'retreat');
 assert.match(css,/:root\[data-concept="retreat"\] \.gallery/);
});
test('classic remains explicitly accessible without breaking redesign',()=>{
 const root={dataset:{}};
 vm.runInNewContext(bootstrap[1],{document:{documentElement:root},location:{search:'?concept=classic'},URLSearchParams});
 assert.notEqual(root.dataset.concept,'retreat');
});
test('gallery keeps customer-approved semantic order, groups and 15 media links',()=>{
 const names=[...html.matchAll(/class="gallery-image-link" href="\.\/media\/([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(names,[
 'apartmany-alt.webp','apt-pravy.webp','apt-zadni.webp',
 'apt-obyvak.webp','apt-kuchyn.webp','apt-alpine5.webp','apt-chodba1.webp','apt-interier17.webp','apt-interier20.webp','apt-koupelna.webp',
 'zoja-extra.webp','zoja-render-6.webp','zoja-render-7.webp','zoja-render-8.webp','zoja-render-9.webp']);
 assert.match(html,/Budova a okolí \(3\)/);
 assert.match(html,/Interiéry \(7\)/);
 assert.match(html,/Dispozice a půdorysy \(5\)/);
});
