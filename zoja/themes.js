(()=>{
'use strict';
const variants=[
 {id:'a',name:'A · Horský klid',note:'Původní přírodní styl'},
 {id:'b',name:'B · Alpine Editorial',note:'Filmové panorama a elegance'},
 {id:'c',name:'C · U krbu',note:'Teplá zem, dřevo a setkávání'},
 {id:'d',name:'D · Nordic Studio',note:'Minimalistická architektura'}
];
const valid=id=>variants.some(x=>x.id===id);
let active='a';
try{const stored=localStorage.getItem('zoja-design');if(valid(stored))active=stored}catch{}
const param=new URLSearchParams(location.search).get('theme');
if(valid(param))active=param;
const label=document.querySelector('.design-current');
const choose=(id,updateUrl)=>{
 if(!valid(id))id='a';
 document.documentElement.dataset.design=id;
 if(label)label.textContent=variants.find(v=>v.id===id).name;
 document.querySelectorAll('[data-design-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.designChoice===id)));
 try{localStorage.setItem('zoja-design',id)}catch{}
 if(updateUrl){
  const u=new URL(location.href);u.searchParams.set('theme',id);
  try{history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch{}
 }
};
document.querySelectorAll('[data-design-choice]').forEach(el=>el.addEventListener('click',()=>choose(el.dataset.designChoice,true)));
choose(active,false);
const mobileMenu=document.querySelector('.mobile-nav');
if(mobileMenu){
 mobileMenu.querySelectorAll('.mobile-nav-panel a').forEach(link=>link.addEventListener('click',()=>{mobileMenu.open=false}));
 mobileMenu.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileMenu.open){mobileMenu.open=false;mobileMenu.querySelector('summary').focus()}});
}
})();

/* P3 enhancement: in-page gallery lightbox. Original links remain valid if JS is off. */
(()=>{
'use strict';
const dialog=document.querySelector('#zoja-lightbox');
const links=Array.from(document.querySelectorAll('.gallery-image-link'));
if(!dialog||links.length===0||typeof dialog.showModal!=='function')return;
const image=dialog.querySelector('#zoja-lightbox-image');
const title=dialog.querySelector('#zoja-lightbox-title');
const group=dialog.querySelector('#zoja-lightbox-group');
const counter=dialog.querySelector('#zoja-lightbox-counter');
const original=dialog.querySelector('#zoja-lightbox-original');
const prev=dialog.querySelector('#zoja-lightbox-prev');
const next=dialog.querySelector('#zoja-lightbox-next');
const close=dialog.querySelector('#zoja-lightbox-close');
if(!image||!title||!group||!counter||!original||!prev||!next||!close)return;
let index=0,focusBefore=null;
function render(){
 const anchor=links[index];
 const caption=anchor.closest('figure')?.querySelector('figcaption')?.textContent.trim()||'Fotografie Zoja';
 const section=anchor.closest('.gallery-group')?.querySelector('h3')?.textContent.trim()||'Galerie';
 image.src=anchor.href;
 original.href=anchor.href;
 image.alt=anchor.querySelector('img')?.alt||caption;
 title.textContent=caption;
 group.textContent=section;
 counter.textContent='Obrázek '+(index+1)+' z '+links.length;
 prev.disabled=index===0;
 next.disabled=index===links.length-1;
}
function open(i,anchor){
 if(dialog.open)return;
 index=i;focusBefore=anchor;render();dialog.showModal();close.focus();
}
function move(delta){
 const to=index+delta;
 if(to<0||to>=links.length)return;
 index=to;render();
}
links.forEach((anchor,i)=>anchor.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 open(i,anchor);
}));
prev.addEventListener('click',()=>move(-1));
next.addEventListener('click',()=>move(1));
close.addEventListener('click',()=>dialog.close());
dialog.addEventListener('keydown',event=>{
 if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}
 if(event.key==='ArrowRight'){event.preventDefault();move(1)}
});
dialog.addEventListener('close',()=>{
 image.removeAttribute('src');
 focusBefore?.focus({preventScroll:true});
 focusBefore=null;
});
})();
