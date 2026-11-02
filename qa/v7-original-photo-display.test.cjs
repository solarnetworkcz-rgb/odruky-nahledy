'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'..','odruky','studio.css'),'utf8');
const bodies=(selector)=>{
 const esc=selector.replace(/[.*+?^$()|[\]\\]/g,'\\$&');
 return [...css.matchAll(new RegExp(esc+'\\s*\\{([^}]*)\\}','g'))].map(m=>m[1]);
};
test('Studio preserves original photo color and framing instead of display-time filters/crops',()=>{
 const hero=bodies(':root[data-concept="studio"] .hero-photo img').join('\n');
 const product=bodies(':root[data-concept="studio"] .product-cover img').join('\n');
 const catalogHover=bodies(':root[data-concept="studio"] .catalog-item:hover .catalog-media img').join('\n');
 assert.doesNotMatch(hero,/filter\s*:/i,'hero must not recolor customer source');
 assert.doesNotMatch(hero,/object-fit\s*:\s*cover/i,'hero must not crop customer source');
 assert.match(hero,/height\s*:\s*auto/i,'hero must preserve intrinsic ratio');
 assert.doesNotMatch(product,/object-fit\s*:\s*cover/i,'product cover must not crop customer source');
 assert.doesNotMatch(product,/aspect-ratio\s*:/i,'product cover must not impose a synthetic aspect ratio');
 assert.match(product,/height\s*:\s*auto/i,'product cover must preserve intrinsic ratio');
 assert.doesNotMatch(catalogHover,/filter\s*:/i,'hover must not recolor customer source');
});
