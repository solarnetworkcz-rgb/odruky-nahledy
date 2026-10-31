/* Source-only V6.6 review build. Media remain publication-gated; private preview may overlay customer files without committing them. */
(()=>{
'use strict';
const D=window.ODRUKY;
const themes=[
 {id:'a',name:'A · Přírodní elegance',note:'Světlá, vzdušná'},
 {id:'b',name:'B · Moderní harmonie',note:'Střední zelené tóny'},
 {id:'c',name:'C · Teplý prémiový styl',note:'Medová a ořechová'},
 {id:'d',name:'D · Současný čistý styl',note:'Modrošedá a písková'}
];
const themePicker=()=>`<details class="theme-picker"><summary class="theme-summary"><span>Porovnat vzhled webu</span><strong class="theme-current">B · Moderní harmonie</strong><span class="theme-summary-chevron" aria-hidden="true">⌄</span></summary><div class="container theme-picker-inner"><div class="theme-picker-heading"><small>Čtyři grafické varianty stejného zákaznického obsahu</small></div><div class="theme-picker-options" role="group" aria-label="Vybrat grafickou verzi">${themes.map(t=>`<button type="button" class="theme-choice" data-theme-choice="${t.id}" aria-pressed="false"><span>${t.name}</span><small>${t.note}</small></button>`).join('')}</div></div></details>`;
const setTheme=(id)=>{
 if(!themes.some(t=>t.id===id))id='b';
 document.documentElement.dataset.theme=id;
 const currentLabel=document.querySelector('.theme-current');if(currentLabel)currentLabel.textContent=themes.find(t=>t.id===id).name;
 document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===id)));
 try{localStorage.setItem('odruky-demo-theme',id)}catch{}
};
let initialTheme='b';
try{initialTheme=localStorage.getItem('odruky-demo-theme')||'b'}catch{}
const reviewTheme=new URLSearchParams(location.search).get('theme');
if(themes.some(t=>t.id===reviewTheme))initialTheme=reviewTheme;
document.documentElement.dataset.theme=themes.some(t=>t.id===initialTheme)?initialTheme:'b';

const ROOT=new URL('./', document.currentScript.src);
const MEDIA=new URL('media/',ROOT).href;
const mayDisplayPhoto=D.config.mediaMode==='private-preview'||D.config.mediaMode==='approved';
const route=(u)=>{
 if(location.protocol!=='file:')return new URL(u.slice(1),ROOT).href;
 const target=new URL(u,'https://odruky.invalid');
 const local=target.pathname==='/'?'index.html':target.pathname.replace(/^\/+|\/+$/g,'')+'/index.html';
 return new URL(local+target.search+target.hash,ROOT).href;
};
const current=document.body.dataset.page||'home';
const category=D.categories.find(x=>x.slug===current);
const intentSlug=new URLSearchParams(location.search).get('produkt');
const selectedIntent=D.categories.find(x=>x.slug===intentSlug)||(intentSlug==='zakazkova-vyroba'?{name:'Zakázková výroba',slug:intentSlug}:null);
const inquiryHref=(slug)=>'/kontakt/'+(slug?'?produkt='+encodeURIComponent(slug):'');
const $=(sel,ctx=document)=>ctx.querySelector(sel);
const esc=(s)=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const link=(href,text,cl='')=>`<a href="${route(href)}"${cl?` class="${cl}"`:''}>${text}</a>`;
const categoriesLinks=()=>D.categories.map(x=>link('/'+x.slug+'/',esc(x.name))).join('');
const mail=()=>D.config.email?`<a href="mailto:${encodeURIComponent(D.config.email)}">${esc(D.config.email)}</a>`:'<span class="not-set">[DOPLNIT E-MAIL]</span>';
const phone=()=>D.config.phone?`<a href="tel:${D.config.phone.replace(/[^+\d]/g,'')}">${esc(D.config.phone)}</a>`:'<span class="not-set">[DOPLNIT TELEFON]</span>';
const nav=()=>`<a class="skip" href="#main">Přeskočit na obsah</a>
  <header class="site-header"><div class="container header-inner">
    ${link('/','ODRUKY','wordmark')}
    <nav class="desktop-nav" aria-label="Hlavní navigace"><div class="nav-group"><button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-dropdown">Produkty <span aria-hidden="true">⌄</span></button><div id="nav-dropdown" class="nav-dropdown" hidden><p class="subtle">Vyberte svůj výrobek</p>${categoriesLinks()}</div></div>
    ${link('/zakazkova-vyroba/','Zakázková výroba')}${link('/#postup','Jak spolupracujeme')}${link('/o-nas/','O nás')}${link('/kontakt/','Kontakt')}</nav>
    ${link(inquiryHref(category?.slug||(current==='zakazkova-vyroba'?'zakazkova-vyroba':null)),'Probrat projekt <span aria-hidden="true">→</span>','button button-ivory header-cta')}
    <button class="mobile-nav-toggle" id="mobile-toggle" aria-expanded="false" aria-controls="mobile-nav">Menu <span aria-hidden="true">☰</span></button>
  </div><nav class="container mobile-nav" id="mobile-nav" aria-label="Mobilní navigace" hidden><small>Produkty</small>${categoriesLinks()}${link('/zakazkova-vyroba/','Zakázková výroba')}${link('/#postup','Jak spolupracujeme')}${link('/o-nas/','O nás')}${link('/kontakt/','Kontakt')}${link(inquiryHref(category?.slug),'Probrat projekt')}</nav></header>`;
const status=()=>mayDisplayPhoto ? `<div class="status-strip"><div class="container"><p><strong>Pracovní zákaznický náhled</strong> · Některé fotografie a kontaktní údaje ještě čekají na doplnění.</p></div></div>` : `<div class="status-strip"><div class="container"><p><strong>Pracovní vizualizace V6.6</strong> · Obrazové podklady zůstávají publikačně uzamčené; kontaktní údaje čekají na ověření.</p></div></div>`;
const footer=()=>`<footer class="site-footer"><div class="container"><div class="footer-grid"><div>${link('/','ODRUKY','wordmark')}<p>Zakázková práce se dřevem podle vašich představ.</p><p class="subtle">Provozovatel: [DOPLNIT NÁZEV / IČO / SÍDLO]</p></div><div><div class="eyebrow">Co tvoříme</div><nav class="footer-links" aria-label="Produkty">${categoriesLinks()}${link('/zakazkova-vyroba/','Zakázková výroba')}</nav></div><div><div class="eyebrow">Informace</div><nav class="footer-links" aria-label="Další stránky">${link('/o-nas/','O nás')}${link('/realizace/','Možnosti vašeho projektu')}${link('/kontakt/','Kontakt')}${link('/ochrana-osobnich-udaju/','Ochrana osobních údajů')}</nav></div></div><div class="footer-bottom"><span>© ODRUKY · Koncept V7 · otevřený fotografický náhled</span><span>Bez měření návštěvnosti a bez kontaktního formuláře</span></div></div></footer>`;
const contactContent=()=>current==='kontakt'
 ? `<section id="kontakt" class="section contact-section"><div class="container contact-grid"><div><div class="eyebrow">Kontakt a nezávazná poptávka</div><h2>Začněme vaší představou.</h2>${selectedIntent?`<p class="contact-intent" role="status">Vybraný výrobek: <strong>${esc(selectedIntent.name)}</strong></p>`:''}<p>Stačí první představa nebo jednoduchý náčrt. Konkrétní možnosti výroby a další postup se domlouvají individuálně.</p></div><div class="contact-options"><div class="contact-option"><div><strong>Zavolat</strong>${phone()}</div></div><div class="contact-option"><div><strong>Napsat e-mail</strong>${mail()}</div></div><p class="subtle">Kontaktní údaje čekají na ověření. Tento pracovní náhled zatím neumí odeslat poptávku; žádné údaje návštěvníka neukládá.</p></div></div></section>`
 : `<section id="kontakt" class="section contact-section"><div class="container contact-grid"><div><div class="eyebrow">Máte vlastní představu?</div><h2>Proberme váš projekt.</h2><p>Vyberte výrobek nebo nám popište, co chcete vytvořit. Možnosti, rozměry i způsob dodání upřesníme podle zadání.</p></div><div class="contact-options"><p>Na kontaktní stránce najdete informace k poptávce a případně i právě vybraný výrobek.</p><p>${link(inquiryHref(category?.slug||(current==='zakazkova-vyroba'?'zakazkova-vyroba':null)),'Přejít na kontakt →','button button-ivory')}</p><p class="subtle">Telefon a e-mail budou zpřístupněny po ověření údajů provozovatele.</p></div></div></section>`;
const mediaDimensions={};
function imageTag(image,alt,cl=''){
 if(!mayDisplayPhoto || !image) return `<div role="img" class="image-placeholder ${esc(cl)}" aria-label="${esc(alt)}"><span>Fotografie zatím není k dispozici</span></div>`;
 const dims=mediaDimensions[image.replace(/\.[^.]+$/,'')];
 const intrinsic=dims?`width="${dims[0]}" height="${dims[1]}"`:'';
 return `<img ${cl?`class="${cl}"`:''} ${intrinsic} src="${MEDIA}${esc(image)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
}
function home(){
 const cards=D.categories.map((c,i)=>`<article class="catalog-item ${i===0?'catalog-item-featured':''}"><a href="${route('/'+c.slug+'/')}" aria-label="${esc(c.name)} – otevřít stránku"><div class="catalog-media">${imageTag(c.image,c.name+' – zákaznická fotografie / otevřený náhled')}</div><div class="catalog-copy"><div class="catalog-copy-top"><span class="catalog-index">0${i+1}</span><h3>${esc(c.name)}</h3><span class="catalog-arrow" aria-hidden="true">↗</span></div><p>${esc(c.tagline)}</p><span class="catalog-note">Fotografický pracovní náhled</span></div></a></article>`).join('');
 const principles=D.principles.map((p,i)=>`<div class="principle"><button type="button" aria-expanded="${i===0}" aria-controls="principle-${i}" data-principle="${i}"><span>${esc(p.title)}</span><span aria-hidden="true">${i===0?'−':'+'}</span></button><div class="detail" id="principle-${i}" ${i===0?'':'hidden'}>${esc(p.description)}</div></div>`).join('');
 const steps=D.steps.map((s,i)=>`<button type="button" class="step" aria-expanded="${i===0}" aria-controls="step-detail" data-step="${i}"><span class="step-n">0${i+1}</span><strong>${esc(s.title)}</strong></button>`).join('');
 return `<main id="main">
 <section class="brand-block"><div class="container"><h1 tabindex="-1" id="brand-h1">ODRUKY</h1><p class="eyebrow">Tvorba ze dřeva na míru</p></div></section>
 <section class="hero-story"><div class="container hero-layout"><div><p class="eyebrow">Od nápadu ke skutečnému prostoru</p><h2>Vašim <em>snům</em> dáváme skutečnou podobu.</h2><p>Vyrábíme sauny, domečky, posedy a stromové domy na míru. Tvoříme také včelí domy podle vašich představ.</p><div class="hero-actions">${link('/#nabidka','Objevit naši tvorbu <span aria-hidden="true">→</span>','button button-ivory')}${link('/kontakt/','Probrat projekt <span aria-hidden="true">→</span>','button button-outline')}</div></div><figure class="hero-photo">${imageTag('F04.jpg','Titulní fotografie stromového domu v lese – podklad zákazníka F04')}<figcaption><span class="hero-feature-label"><strong>01 / Prostor mezi stromy</strong>${link('/stromove-domy/','Prohlédnout stromové domy <span aria-hidden="true">↗</span>')}</span><small>Fotografie ze schválených podkladů</small></figcaption></figure></div></section>
 <section class="section"><div class="container intro-grid"><div class="eyebrow">Odruky / naše tvorba</div><div><h2>Od první představy k vlastnímu prostoru.</h2><p>Dřevo nabízí mnoho podob. Někdy je to místo pro odpočinek, jindy promyšlené zázemí mezi stromy. V Odruky vycházíme z toho, co chcete vytvořit a jak má prostor sloužit.</p></div></div></section>
 <section class="section offer" id="nabidka"><div class="container"><div class="offer-title"><div><p class="eyebrow">Co tvoříme</p><h2>Pět cest. Jedna vaše představa.</h2></div><p>Vyberte si směr. Konkrétní podobu projektu probereme společně.</p></div><div class="catalog">${cards}</div></div></section>
 <div class="editorial-break"><div class="container"><p>Ze dřeva. Podle vás.</p></div></div>
 <section class="section inverse" id="o-nas"><div class="container about-grid"><div><p class="eyebrow">O nás / Váš nápad je začátek</p><h2>Dřevo dává charakter. Vy určujete směr.</h2><p>Odruky propojuje zakázkovou práci se dřevem a představu o prostoru, který má smysl pro svého uživatele. Začínáme rozhovorem o vašem místě, potřebách a způsobu využití.</p><div class="about-actions">${link('/o-nas/','Více o Odruky →')}</div></div><div><div class="principles">${principles}</div></div></div></section>
 <section class="section steps-section" id="postup"><div class="container"><div class="steps-intro"><p class="eyebrow">Jak spolupracujeme</p><h2>Od první myšlenky k vašemu projektu.</h2></div><div class="steps-list" role="group" aria-label="Čtyři kroky spolupráce">${steps}</div><div class="step-detail" id="step-detail" aria-live="polite">${esc(D.steps[0].description)}</div></div></section>
 ${contactContent()}</main>`;
}
function detail(c){
 const slides=c.gallery.map((s,i)=>`<button class="gallery-item" data-slide="${i}" aria-label="Otevřít obrázek ${i+1} z ${c.gallery.length}: ${esc(s.title)}">${imageTag(s.image,s.title+' – zákaznický obrazový podklad')}<span>${esc(s.title)}</span><small>${s.image ? `Zákaznický podklad ${esc(s.source)} · otevřený náhled` : `Pracovní koncept · obrazový podklad skryt`}</small></button>`).join('');
 const topics=c.topics.map(s=>`<li>${esc(s)}</li>`).join('');
 const faqs=c.faq.map(([q,a])=>`<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
 return `<main id="main"><section class="detail-hero"><div class="container"><nav class="breadcrumb" aria-label="Drobečková navigace">${link('/','Úvod')} <span aria-hidden="true">/</span> ${esc(c.name)}</nav><p class="eyebrow">Tvorba ze dřeva na míru / ${esc(c.name)}</p><h1>${esc(c.heading)}</h1><p>${esc(c.intro)}</p></div></section><section class="gallery-section"><div class="container"><div class="gallery-controls"><p class="eyebrow">Podoby vašeho projektu / fotografie</p><div class="gallery-buttons"><button type="button" id="gallery-prev" aria-label="Posunout galerii vlevo">←</button><button type="button" id="gallery-pause" aria-pressed="false">Pozastavit pohyb</button><button type="button" id="gallery-next" aria-label="Posunout galerii vpravo">→</button></div></div><div class="gallery" id="gallery" aria-label="Fotografie – ${esc(c.name)}">${slides}</div><p class="subtle muted">Dostupné fotografie byly schváleny pro veřejné zobrazení zadavatelem. Část původních souborů dosud chybí; nejde o finální produkční katalog.</p></div></section>
 ${c.slug==='vceli-domy'?`<section class="section bee-poster"><div class="container"><p class="eyebrow">Samostatný plakát F12</p><h2>Koncept včelího domu</h2>${imageTag(null,'Podklad F12 dosud nebyl dodán') }<p class="subtle">Plakát není náhledem na homepage ani položkou automatického pásu.</p></div></section>`:''}
 <section class="section detail-info"><div class="container info-grid"><div><p class="eyebrow">Co společně upřesníme</p><h2>Každý prostor začíná zadáním.</h2><ul>${topics}</ul><div style="margin-top:30px">${link(inquiryHref(c.slug),esc(c.cta)+' →','button button-green')}</div></div><div><p class="eyebrow">Časté dotazy</p><div class="faqs">${faqs}</div></div></div></section>${contactContent()}</main>`;
}
function otherPage(){
 const data={
 'o-nas':{title:'O nás',text:'Odruky vytváří dřevěné prostory podle individuálního zadání. Na začátku je rozhovor o místě, využití a vašich představách. Potvrzený příběh firmy, tým a zkušenosti čekají na doplnění.'},
 'kontakt':{title:'Proberme váš projekt',text:'Pošlete nám svou představu, popis místa a způsob zamýšleného využití. Telefonické a e-mailové spojení doplníme po ověření kontaktních údajů.'},
 'zakazkova-vyroba':{title:'Máte vlastní nápad ze dřeva?',text:'Vedle uvedených kategorií lze probrat i jiné dřevěné řešení. Konkrétní proveditelnost a rozsah zakázky je potřeba společně ověřit.'},
 'realizace':{title:'Možnosti vašeho projektu',text:'Ověřené fotografie realizací, autorská práva a zákaznické reference zatím nejsou doloženy. Proto zde nevystavujeme smyšlené zakázky ani hodnocení.'},
 'ochrana-osobnich-udaju':{title:'Ochrana osobních údajů',text:'Právní informace k provozovateli, účelu a způsobu případného zpracování údajů budou doplněny podle skutečného provozu. V této pracovní ukázce není kontaktní formulář ani analytika.'}
 }[current]||{title:'Stránka nenalezena',text:'Požadovaná stránka není v pracovním náhledu k dispozici.'};
 return `<main id="main"><section class="section subpage-content"><div class="container"><p class="eyebrow">Odruky / informace</p><h1>${esc(data.title)}</h1>${current==='kontakt'&&selectedIntent?`<p class="contact-intent" role="status">Vybraný výrobek: <strong>${esc(selectedIntent.name)}</strong></p>`:''}<p>${esc(data.text)}</p>${current==='ochrana-osobnich-udaju'?'<div class="pending">PRACOVNÍ STAV: Toto není finální právní dokument určený ke zveřejnění.</div>':''}${current==='kontakt'?'<p class="subtle">Níže najdete dostupné možnosti spojení. Kontakty čekají na ověření.</p>':`<p>${link(inquiryHref(current==='zakazkova-vyroba'?current:null),'Přejít na kontakt →','button button-green')}</p>`}</div></section>${contactContent()}</main>`;
}
const dialog=()=>`<dialog class="modal" id="lightbox" aria-labelledby="modal-title"><div class="modal-shell"><div class="modal-top"><h2 id="modal-title">Prohlížení fotografií</h2><button class="modal-close" id="modal-close" type="button" aria-label="Zavřít a zpět na úvod">Zavřít a zpět na úvod ✕</button></div><div class="modal-stage"><button class="modal-prev" type="button" id="modal-prev" aria-label="Předchozí fotografie">←</button><img id="modal-image" alt="" hidden><div id="modal-missing" class="modal-placeholder">Fotografie zatím nebyla dodána</div><button class="modal-next" type="button" id="modal-next" aria-label="Následující fotografie">→</button></div><div class="modal-caption"><h3 id="modal-image-title"></h3><p id="modal-desc"></p><p id="modal-counter" class="subtle"></p></div><div class="modal-footer"><button type="button" id="modal-gallery-close">Zpět do galerie</button></div></div></dialog>`;
document.getElementById('app').innerHTML=nav()+status()+themePicker()+(category?detail(category):current==='home'?home():otherPage())+footer()+(category?dialog():'');
setTheme(initialTheme);
// Anchor targets are inserted by JS; adjust the initial fragment after layout and font/image metrics settle.
const alignInitialFragment=()=>{
 if(current!=='home')return;
 const id=location.hash.slice(1);
 if(!['postup','nabidka','o-nas','kontakt'].includes(id))return;
 document.getElementById(id)?.scrollIntoView({block:'start',behavior:'instant'});
};
if(current==='home'&&location.hash&&location.hash!=='#top'){
 requestAnimationFrame(()=>requestAnimationFrame(alignInitialFragment));
 window.addEventListener('load',alignInitialFragment,{once:true});
 document.fonts?.ready?.then(alignInitialFragment);
}
window.addEventListener('hashchange',()=>requestAnimationFrame(alignInitialFragment));
document.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.themeChoice)));
// Menu navigation, both click and keyboard. Escape closes menu without route change.
const navToggle=$('#nav-toggle'),dropdown=$('#nav-dropdown');
navToggle?.addEventListener('click',()=>{const open=navToggle.getAttribute('aria-expanded')==='true';navToggle.setAttribute('aria-expanded',String(!open));dropdown.hidden=open;});
document.addEventListener('click',ev=>{if(navToggle&&!ev.target.closest('.nav-group')){navToggle.setAttribute('aria-expanded','false');dropdown.hidden=true;}});
const mobileToggle=$('#mobile-toggle'),mobile=$('#mobile-nav');
const closeMobileMenu=(restoreFocus=false)=>{if(!mobileToggle||!mobile)return;const wasOpen=mobileToggle.getAttribute('aria-expanded')==='true';mobileToggle.setAttribute('aria-expanded','false');mobile.hidden=true;if(restoreFocus&&wasOpen)mobileToggle.focus();};
mobileToggle?.addEventListener('click',()=>{const open=mobileToggle.getAttribute('aria-expanded')==='true';mobileToggle.setAttribute('aria-expanded',String(!open));mobile.hidden=open;});
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 if(mobileToggle?.getAttribute('aria-expanded')==='true'){
  e.preventDefault();closeMobileMenu(true);return;
 }
 if(navToggle?.getAttribute('aria-expanded')==='true'){
  e.preventDefault();navToggle.setAttribute('aria-expanded','false');dropdown.hidden=true;navToggle.focus();
 }
});
// An open mobile panel is dismissed when leaving the mobile breakpoint.
const desktopBreakpoint=window.matchMedia('(min-width:1091px)');
desktopBreakpoint.addEventListener?.('change',e=>{if(e.matches)closeMobileMenu();});
document.querySelectorAll('[data-principle]').forEach(btn=>btn.addEventListener('click',()=>{
 const i=Number(btn.dataset.principle);document.querySelectorAll('[data-principle]').forEach((b,j)=>{b.setAttribute('aria-expanded',String(i===j));b.lastElementChild.textContent=i===j?'−':'+';document.getElementById('principle-'+j).hidden=i!==j;});
}));
document.querySelectorAll('[data-step]').forEach(btn=>btn.addEventListener('click',()=>{
 const i=Number(btn.dataset.step);document.querySelectorAll('[data-step]').forEach((b,j)=>b.setAttribute('aria-expanded',String(i===j)));$('#step-detail').textContent=D.steps[i].description;
}));
if(category){
 const gallery=$('#gallery'),items=[...gallery.querySelectorAll('.gallery-item')],pause=$('#gallery-pause'),prev=$('#gallery-prev'),next=$('#gallery-next'),modal=$('#lightbox');
 let manualPaused=false,hovered=false,focusInside=false,viewVisible=true,direction=1,last=0,edgeTime=0,raf=0,dragStart=null,lastDrag=0,dialogOpen=false,index=0,focusBefore=null;const motionStart=performance.now()+2000;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const canMove=()=>performance.now()>=motionStart&&!manualPaused&&!reduced.matches&&!hovered&&!focusInside&&viewVisible&&!document.hidden&&!dialogOpen&&gallery.scrollWidth>gallery.clientWidth+2&&items.length>2;
 const movement=(ts)=>{if(!last)last=ts;const dt=Math.min(80,ts-last);last=ts;
  if(canMove()){
   const max=Math.max(0,gallery.scrollWidth-gallery.clientWidth);
   if(edgeTime){if(ts-edgeTime>=1000){edgeTime=0;direction*=-1;}}
   else{gallery.scrollLeft+=direction*12*dt/1000;if(gallery.scrollLeft<=0||gallery.scrollLeft>=max-1){gallery.scrollLeft=Math.min(max,Math.max(0,gallery.scrollLeft));edgeTime=ts;}}
  }
  raf=requestAnimationFrame(movement);
 };raf=requestAnimationFrame(movement);
 const updatePause=()=>{pause.textContent=manualPaused||reduced.matches?'Spustit pohyb':'Pozastavit pohyb';pause.setAttribute('aria-pressed',String(manualPaused));pause.disabled=items.length<3||gallery.scrollWidth<=gallery.clientWidth+2;prev.disabled=items.length<2;next.disabled=items.length<2;};
 updatePause();window.addEventListener('resize',updatePause);reduced.addEventListener?.('change',updatePause);
 pause.addEventListener('click',()=>{manualPaused=!manualPaused;updatePause();});
 const scrollCard=delta=>{manualPaused=true;updatePause();const gap=parseFloat(getComputedStyle(gallery).gap)||12;gallery.scrollBy({left:delta*(items[0].getBoundingClientRect().width+gap),behavior:reduced.matches?'auto':'smooth'});};
 prev.addEventListener('click',()=>scrollCard(-1));next.addEventListener('click',()=>scrollCard(1));
 gallery.addEventListener('mouseenter',()=>hovered=true);gallery.addEventListener('mouseleave',()=>hovered=false);
 gallery.addEventListener('focusin',()=>focusInside=true);gallery.addEventListener('focusout',()=>focusInside=gallery.contains(document.activeElement));
 const obs=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{viewVisible=entries[0]?.isIntersecting??false;},{threshold:.04}):null;obs?.observe(gallery);
 gallery.addEventListener('pointerdown',e=>{dragStart={x:e.clientX,y:e.clientY,left:gallery.scrollLeft};lastDrag=0;},{passive:true});
 gallery.addEventListener('pointermove',e=>{if(dragStart&&e.buttons){lastDrag=Math.max(lastDrag,Math.abs(e.clientX-dragStart.x));if(lastDrag>8){manualPaused=true;updatePause();gallery.scrollLeft=dragStart.left-(e.clientX-dragStart.x);}}},{passive:true});
 gallery.addEventListener('pointerup',()=>{dragStart=null;setTimeout(()=>{lastDrag=0},0);});
 function renderModal(){const s=category.gallery[index];const modalImage=$('#modal-image'),missing=$('#modal-missing');if(mayDisplayPhoto&&s.image){modalImage.hidden=false;missing.hidden=true;modalImage.src=MEDIA+s.image;modalImage.alt=s.title;}else{modalImage.hidden=true;modalImage.removeAttribute('src');missing.hidden=false;missing.textContent='Motiv '+s.source+' · fotografie zatím nebyla dodána';}$('#modal-image-title').textContent=s.title;$('#modal-desc').textContent=s.description;$('#modal-counter').textContent=(index+1)+' / '+category.gallery.length;$('#modal-prev').disabled=index===0;$('#modal-next').disabled=index===category.gallery.length-1;
  if(mayDisplayPhoto)for(let near of [index-1,index+1])if(near>=0&&near<category.gallery.length&&category.gallery[near].image){const img=new Image();img.src=MEDIA+category.gallery[near].image;}
 }
 const openModal=(i,button)=>{if(lastDrag>8)return;manualPaused=true;updatePause();dialogOpen=true;index=i;focusBefore=button;renderModal();modal.showModal();document.body.classList.add('modal-open');$('#modal-close').focus();};
 const galleryClose=()=>{dialogOpen=false;modal.close();document.body.classList.remove('modal-open');focusBefore?.focus();};
 const homeClose=()=>{dialogOpen=false;modal.close();document.body.classList.remove('modal-open');window.location.assign(route('/#top'));};
 items.forEach((b,i)=>b.addEventListener('click',()=>openModal(i,b)));
 $('#modal-prev').addEventListener('click',()=>{if(index>0){index--;renderModal();}});
 $('#modal-next').addEventListener('click',()=>{if(index<category.gallery.length-1){index++;renderModal();}});
 $('#modal-close').addEventListener('click',homeClose);$('#modal-gallery-close').addEventListener('click',galleryClose);
 modal.addEventListener('cancel',e=>{e.preventDefault();galleryClose();});
 document.addEventListener('keydown',e=>{if(!modal.open){if(e.key==='Escape'&&navToggle){dropdown.hidden=true;navToggle.setAttribute('aria-expanded','false');}return;}
  if(e.key==='ArrowLeft'){e.preventDefault();if(index>0){index--;renderModal();}}
  if(e.key==='ArrowRight'){e.preventDefault();if(index<category.gallery.length-1){index++;renderModal();}}
 });
 let touchStart=0;modal.addEventListener('touchstart',e=>touchStart=e.touches[0]?.clientX??0,{passive:true});modal.addEventListener('touchend',e=>{const diff=(e.changedTouches[0]?.clientX??0)-touchStart;if(Math.abs(diff)>55){if(diff>0&&index>0)index--;if(diff<0&&index<category.gallery.length-1)index++;renderModal();}},{passive:true});
 // Browser handles native dialog focus containment; this additional trap accounts for Chromium variants.
 modal.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const controls=[...modal.querySelectorAll('button:not([disabled])')];const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);obs?.disconnect();});
}
// The demo home-return focus target is the ODRUKY H1.
if(current==='home'&&location.hash==='#top'){$('#brand-h1')?.focus({preventScroll:true});scrollTo(0,0);}
})();