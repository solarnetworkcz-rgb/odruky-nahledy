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