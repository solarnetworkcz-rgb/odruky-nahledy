/* Source-only V6.6 review build. Media remain publication-gated; private preview may overlay customer files without committing them. */
(()=>{
'use strict';
const D=window.ODRUKY;
const themes=[
 {id:'a',name:'A · Ateliér v přírodě',note:'Světlý obrazový magazín'},
 {id:'b',name:'B · Moderní harmonie',note:'Střední zelené tóny'},
 {id:'c',name:'C · Řemeslná dílna',note:'Tmavé dřevo a měď'},
 {id:'d',name:'D · Technický atlas',note:'Architektonická modrošedá'}
];
const themePicker=()=>`<details class="theme-picker"><summary class="theme-summary"><span>Porovnat vzhled webu</span><strong class="theme-current">B · Moderní harmonie</strong><span class="theme-summary-chevron" aria-hidden="true">⌄</span></summary><div class="container theme-picker-inner"><div class="theme-picker-heading"><small>Čtyři grafické varianty stejného zákaznického obsahu</small></div><div class="theme-picker-options" role="group" aria-label="Vybrat grafickou verzi">${themes.map(t=>`<button type="button" class="theme-choice" data-theme-choice="${t.id}" aria-pressed="false"><span>${t.name}</span><small>${t.note}</small></button>`).join('')}</div></div></details>`;
const setTheme=(id,share=false)=>{
 if(!themes.some(t=>t.id===id))id='b';
 document.documentElement.dataset.theme=id;
 const currentLabel=document.querySelector('.theme-current');if(currentLabel)currentLabel.textContent=themes.find(t=>t.id===id).name;
 document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===id)));
 try{localStorage.setItem('odruky-demo-theme',id)}catch{}
 if(share){const u=new URL(location.href);u.searchParams.set('theme',id);try{history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch{}}
};
let initialTheme='b';
try{initialTheme=localStorage.getItem('odruky-demo-theme')||'b'}catch{}
const reviewTheme=new URLSearchParams(location.search).get('theme');
if(themes.some(t=>t.id===reviewTheme))initialTheme=reviewTheme;
document.documentElement.dataset.theme=themes.some(t=>t.id===initialTheme)?initialTheme:'b';

const ROOT=new URL('./', document.currentScript.src);
const MEDIA=new URL('media/',ROOT).href;
const mayDisplayPhoto=D.config.mediaMode==='private-preview'||D.config.mediaMode==='approved';
const requestedConcept=new URLSearchParams(location.search).get('concept');
const route=(u)=>{
 let url;
 if(location.protocol!=='file:')url=new URL(u.slice(1),ROOT);
 else{
  const target=new URL(u,'https://odruky.invalid');
  const local=target.pathname==='/'?'index.html':target.pathname.replace(/^\/+|\/+$/g,'')+'/index.html';
  url=new URL(local+target.search+target.hash,ROOT);
 }
 if(requestedConcept==='classic'&&url.pathname.startsWith(ROOT.pathname))url.searchParams.set('concept','classic');
 return url.href;
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
const mail=()=>D.config.email?`<a href="mailto:${encodeURIComponent(D.config.email)}">${esc(D.config.email)}</a>`:'<span class="not-set">E-mail zatím není potvrzen</span>';
const phone=()=>D.config.phone?`<a href="tel:${D.config.phone.replace(/[^+\d]/g,'')}">${esc(D.config.phone)}</a>`:'<span class="not-set">Telefon zatím není potvrzen</span>';
const nav=()=>`<a class="skip" href="#main">Přeskočit na obsah</a>
  <header class="site-header"><div class="container header-inner">
    ${link('/','ODRUKY','wordmark')}
    <nav class="desktop-nav" aria-label="Hlavní navigace"><div class="nav-group"><button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-dropdown">Co tvoříme <span aria-hidden="true">⌄</span></button><div id="nav-dropdown" class="nav-dropdown" hidden><p class="subtle">Vyberte směr svého projektu</p>${categoriesLinks()}</div></div>
    ${link('/#o-nas','O nás')}${link('/#postup','Jak spolupracujeme')}${link('/#kontakt','Kontakt')}</nav>
    ${link(inquiryHref(category?.slug||(current==='zakazkova-vyroba'?'zakazkova-vyroba':null)),'Probrat projekt <span aria-hidden="true">→</span>','button button-ivory header-cta')}
    <button class="mobile-nav-toggle" id="mobile-toggle" aria-expanded="false" aria-controls="mobile-nav">Menu <span aria-hidden="true">☰</span></button>
  </div><nav class="container mobile-nav" id="mobile-nav" aria-label="Mobilní navigace" hidden><small>Co tvoříme</small>${categoriesLinks()}${link('/#o-nas','O nás')}${link('/#postup','Jak spolupracujeme')}${link('/#kontakt','Kontakt')}${link(inquiryHref(category?.slug),'Probrat projekt')}</nav></header>`;
const status=()=>mayDisplayPhoto ? `<div class="status-strip"><div class="container"><p><strong>Pracovní zákaznický náhled</strong> · Některé fotografie a kontaktní údaje ještě čekají na doplnění.</p></div></div>` : `<div class="status-strip"><div class="container"><p><strong>Pracovní vizualizace V6.6</strong> · Obrazové podklady zůstávají publikačně uzamčené; kontaktní údaje čekají na ověření.</p></div></div>`;
const footer=()=>`<footer class="site-footer"><div class="container"><div class="footer-grid"><div>${link('/','ODRUKY','wordmark')}<p>Zakázková práce se dřevem podle vašich představ.</p><p class="subtle">Provozní a identifikační údaje čekají na ověření</p></div><div><div class="eyebrow">Co tvoříme</div><nav class="footer-links" aria-label="Produkty">${categoriesLinks()}${link('/zakazkova-vyroba/','Zakázková výroba')}</nav></div><div><div class="eyebrow">Informace</div><nav class="footer-links" aria-label="Další stránky">${link('/o-nas/','O nás')}${link('/realizace/','Možnosti vašeho projektu')}${link('/kontakt/','Kontakt')}${link('/ochrana-osobnich-udaju/','Ochrana osobních údajů')}</nav></div></div><div class="footer-bottom"><span>© ODRUKY · Koncept V7 · otevřený fotografický náhled</span><span>Bez měření návštěvnosti a bez kontaktního formuláře</span></div></div></footer>`;
const contactContent=()=>`<section id="kontakt" class="section contact-section"><div class="container contact-grid"><div><div class="eyebrow">Kontakt a nezávazná poptávka</div><h2>Začněme tím, co máte v hlavě.</h2>${selectedIntent?`<p class="contact-intent" role="status">Vybraný výrobek: <strong>${esc(selectedIntent.name)}</strong></p>`:''}<p>Pošlete nám svou představu. I jednoduchý náčrt může být dobrý začátek.</p></div><div class="contact-options"><div class="contact-option"><div><strong>Zavolat</strong>${phone()}</div><span aria-hidden="true">→</span></div><div class="contact-option"><div><strong>Napsat e-mail</strong>${mail()}</div><span aria-hidden="true">→</span></div><p class="subtle">Kontaktní údaje čekají na ověření. Žádný formulář ani údaje návštěvníka se zde neukládají.</p></div></div></section>`;
const mediaDimensions={
 F01:[1536,1024],F02:[1312,1199],F03:[1028,1530],F04:[1536,1024],F06:[1536,1024],
 F08:[1121,1403],F09:[1028,1530],F13:[1536,1024],F14:[1138,1382],F16:[1028,1530],
 F17:[1024,1536],F20:[1312,1199],F21:[1137,1383],F22:[1028,1530],F23:[1086,1448],
 F25:[1536,1024],F27:[1080,1440],F28:[1200,1500],F29:[1200,900],F30:[1200,800],
 F31:[1200,1500],F33:[749,1332],F34:[1199,1500]
};
function imageTag(image,alt,cl='',priority=false){
 if(!mayDisplayPhoto || !image) return `<div role="img" class="image-placeholder ${esc(cl)}" aria-label="${esc(alt)}"><span>Fotografie zatím není k dispozici</span></div>`;
 const dims=mediaDimensions[image.replace(/\.[^.]+$/,'')];
 const intrinsic=dims?`width="${dims[0]}" height="${dims[1]}"`:'';
 const source=`${MEDIA}${esc(image)}`;
 const sourceAttr=priority?`src="${source}"`:`data-src="${source}"`;
 const loading=priority?'eager':'lazy',fetchPriority=priority?'high':'low';
 return `<img ${cl?`class="${cl}"`:''} ${intrinsic} ${sourceAttr} alt="${esc(alt)}" loading="${loading}" fetchpriority="${fetchPriority}" decoding="async">`;
}
function home(){
 const cards=D.categories.map((c,i)=>`<article class="catalog-item ${i===0?'catalog-item-featured':''}"><a href="${route('/'+c.slug+'/')}" aria-label="${esc(c.name)} – otevřít stránku"><div class="catalog-media">${imageTag(c.image,c.name+' – zákaznická fotografie / otevřený náhled')}</div><div class="catalog-copy"><div class="catalog-copy-top"><span class="catalog-index">0${i+1}</span><h3>${esc(c.name)}</h3><span class="catalog-arrow" aria-hidden="true">↗</span></div><p>${esc(c.tagline)}</p><span class="catalog-note">Fotografický pracovní náhled</span></div></a></article>`).join('');
 const principles=D.principles.map((p,i)=>`<div class="principle"><button type="button" aria-expanded="${i===0}" aria-controls="principle-${i}" data-principle="${i}"><span>${esc(p.title)}</span><span aria-hidden="true">${i===0?'−':'+'}</span></button><div class="detail" id="principle-${i}" ${i===0?'':'hidden'}>${esc(p.description)}</div></div>`).join('');
 const steps=D.steps.map((s,i)=>`<button type="button" class="step" aria-expanded="${i===0}" aria-controls="step-detail" data-step="${i}"><span class="step-n">0${i+1}</span><strong>${esc(s.title)}</strong></button>`).join('');
 return `<main id="main">
 <section class="brand-block"><div class="container"><h1 tabindex="-1" id="brand-h1">ODRUKY</h1><p class="eyebrow">Tvorba ze dřeva na míru</p></div></section>
 <section class="hero-story"><div class="container hero-layout"><div><p class="eyebrow">Od nápadu ke skutečnému prostoru</p><h2>Vašim <em>snům</em> dáváme skutečnou podobu.</h2><p>Vyrábíme sauny, domečky, posedy a stromové domy na míru. Tvoříme také včelí domy podle vašich představ.</p><div class="hero-actions">${link('/#nabidka','Objevit naši tvorbu <span aria-hidden="true">→</span>','button button-ivory')}${link('/kontakt/','Probrat projekt <span aria-hidden="true">→</span>','button button-outline')}</div></div><figure class="hero-photo">${imageTag('F04.jpg','Titulní fotografie stromového domu v lese – podklad zákazníka F04','',true)}<figcaption><span class="hero-feature-label"><strong>01 / Prostor mezi stromy</strong>${link('/stromove-domy/','Prohlédnout stromové domy <span aria-hidden="true">↗</span>')}</span><small>Fotografie ze schválených podkladů</small></figcaption></figure></div></section>
 <section class="section"><div class="container intro-grid"><div class="eyebrow">Odruky / naše tvorba</div><div><h2>Od první představy k vlastnímu prostoru.</h2><p>Dřevo nabízí mnoho podob. Někdy je to místo pro odpočinek, jindy promyšlené zázemí mezi stromy. V Odruky vycházíme z toho, co chcete vytvořit a jak má prostor sloužit.</p></div></div></section>
 <section class="section offer" id="nabidka"><div class="container"><div class="offer-title"><div><p class="eyebrow">Co tvoříme</p><h2>Pět cest. Jedna vaše představa.</h2></div><p>Vyberte si směr. Konkrétní podobu projektu probereme společně.</p></div><div class="catalog">${cards}</div></div></section>
 <section class="section" id="vybrane-realizace"><div class="container"><div class="offer-title"><div><p class="eyebrow">Možnosti vašeho projektu</p><h2>Dřevo v různých podobách.</h2></div><p>Prohlédněte si výběr fotografií z podkladů Odruky a další možnosti jednotlivých projektů.</p></div><div class="catalog"><article class="catalog-item"><a href="${route('/realizace/')}"><div class="catalog-media">${imageTag('F04.jpg','Stromový dům v lese - zákaznická fotografie F04')}</div><div class="catalog-copy"><div class="catalog-copy-top"><span class="catalog-index">01</span><h3>Mezi stromy</h3><span class="catalog-arrow" aria-hidden="true">↗</span></div><p>Prostor, terasa a výhled v přímém vztahu k místu.</p></div></a></article><article class="catalog-item"><a href="${route('/realizace/')}"><div class="catalog-media">${imageTag('F27.jpg','Interiér sauny s výhledem do lesa - zákaznická fotografie F27')}</div><div class="catalog-copy"><div class="catalog-copy-top"><span class="catalog-index">02</span><h3>Sauny</h3><span class="catalog-arrow" aria-hidden="true">↗</span></div><p>Interiér, prosklení a místo pro klid.</p></div></a></article><article class="catalog-item"><a href="${route('/realizace/')}"><div class="catalog-media">${imageTag('F20.jpg','Vyvýšený dřevěný objekt mezi stromy - zákaznická fotografie F20')}</div><div class="catalog-copy"><div class="catalog-copy-top"><span class="catalog-index">03</span><h3>V krajině</h3><span class="catalog-arrow" aria-hidden="true">↗</span></div><p>Vyvýšené stavby a jiná perspektiva okolí.</p></div></a></article></div><div class="about-actions">${link('/realizace/','Prohlédnout možnosti →')}</div></div></section>
 <div class="editorial-break"><div class="container"><p>Ze dřeva. Podle vás.</p></div></div>
 <section class="section inverse" id="o-nas"><div class="container about-grid"><div><p class="eyebrow">O nás / Váš nápad je začátek</p><h2>Dřevo dává charakter. Vy určujete směr.</h2><p>Odruky propojuje zakázkovou práci se dřevem a představu o prostoru, který má smysl pro svého uživatele. Začínáme rozhovorem o vašem místě, potřebách a způsobu využití.</p><div class="about-actions">${link('/o-nas/','Více o Odruky →')}</div></div><div><div class="custom-principles">${principles}</div></div></div></section>
 <section class="section" id="zakazkova-vyroba"><div class="container intro-grid"><div><p class="eyebrow">Zakázková výroba</p><h2>Nejdřív představa. Potom řešení pro konkrétní místo.</h2></div><div><p>Nepracujeme s jedním univerzálním výrobkem. Zadání vychází z toho, co chcete vytvořit, kde má projekt vzniknout a jak má sloužit.</p><div class="about-actions">${link('/zakazkova-vyroba/','Jak přistupujeme k zakázkové výrobě →')}</div></div></div></section>
 <section class="section steps-section" id="postup"><div class="container"><div class="steps-intro"><p class="eyebrow">Jak spolupracujeme</p><h2>Od první myšlenky k vašemu projektu.</h2></div><div class="steps-list" role="group" aria-label="Čtyři kroky spolupráce">${steps}</div><div class="step-detail" id="step-detail" aria-live="polite">${esc(D.steps[0].description)}</div></div></section>
 ${contactContent()}</main>`;
}
function detail(c){
 const slides=c.gallery.map((s,i)=>`<button class="gallery-item" data-slide="${i}" aria-label="Otevřít obrázek ${i+1} z ${c.gallery.length}: ${esc(s.title)}">${imageTag(s.image,s.title+' – zákaznický obrazový podklad')}<span>${esc(s.title)}</span><small>${s.image ? `Zákaznický podklad ${esc(s.source)} · otevřený náhled` : `Pracovní koncept · obrazový podklad skryt`}</small></button>`).join('');
 const topics=c.topics.map(s=>`<li>${esc(s)}</li>`).join('');
 const faqs=c.faq.map(([q,a])=>`<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
 const related=D.categories.filter(x=>x.slug!==c.slug).map(x=>link('/'+x.slug+'/',esc(x.name))).join('');
 return `<main id="main"><section class="detail-hero"><div class="container detail-hero-grid"><div class="detail-copy"><nav class="breadcrumb" aria-label="Drobečková navigace">${link('/','Úvod')} <span aria-hidden="true">/</span> ${esc(c.name)}</nav><p class="eyebrow">Tvorba ze dřeva na míru / ${esc(c.name)}</p><h1>${esc(c.heading)}</h1><p>${esc(c.intro)}</p>${document.documentElement.dataset.concept==='studio'?`<div class="detail-action-row">${c.gallery.some(s=>s.image)?'<a class="button button-green" href="#gallery">Prohlédnout fotografie ↓</a>':'<a class="button button-green" href="#podrobnosti">Jak stavbu navrhnout ↓</a>'}${link(inquiryHref(c.slug),'Nezávazně poptat →','button button-outline')}</div>`:''}</div>${document.documentElement.dataset.concept==='studio'?`<figure class="product-cover">${imageTag(c.image,c.name+' — úvodní fotografie z dodaných podkladů','',true)}<figcaption>${c.image?'Fotografie z pracovního náhledu':'Obrazový podklad zatím není k dispozici'} · ${esc(c.name)}</figcaption></figure>`:''}</div></section><section class="gallery-section"><div class="container"><div class="gallery-controls"><p class="eyebrow">Podoby vašeho projektu / fotografie</p><div class="gallery-buttons"><button type="button" id="gallery-prev" aria-label="Posunout galerii vlevo">←</button><button type="button" id="gallery-pause" aria-pressed="false">Pozastavit pohyb</button><button type="button" id="gallery-next" aria-label="Posunout galerii vpravo">→</button></div></div><div class="gallery" id="gallery" aria-label="Fotografie – ${esc(c.name)}">${slides}</div><p class="subtle muted">Dostupné fotografie byly schváleny pro veřejné zobrazení zadavatelem. Část původních souborů dosud chybí; nejde o finální produkční katalog.</p></div></section>
 ${c.slug==='vceli-domy'?`<section class="section bee-poster"><div class="container"><p class="eyebrow">Samostatný plakát F12</p><h2>Koncept včelího domu</h2>${imageTag(null,'Podklad F12 dosud nebyl dodán') }<p class="subtle">Plakát není náhledem na homepage ani položkou automatického pásu.</p></div></section>`:''}
 <section class="section detail-info" id="podrobnosti"><div class="container info-grid"><div><p class="eyebrow">Co společně upřesníme</p><h2>Každý prostor začíná zadáním.</h2><ul>${topics}</ul><div style="margin-top:30px">${link(inquiryHref(c.slug),esc(c.cta)+' →','button button-green')}</div></div><div><p class="eyebrow">Časté dotazy</p><div class="faqs">${faqs}</div></div></div></section><section class="section related-section"><div class="container"><p class="eyebrow">Další možnosti</p><h2>Pokračujte podle toho, co chcete vytvořit.</h2><nav class="related-links" aria-label="Další možnosti projektu">${related}${link('/realizace/','Pracovní galerie →')}</nav></div></section>${contactContent()}</main>`;
}
function realizationsPage(){
 const items=[
  {image:'F04.jpg',title:'Stromový dům mezi stromy',text:'Prosklení, terasa a vztah stavby k lesnímu místu.',href:'/stromove-domy/'},
  {image:'F27.jpg',title:'Sauna s výhledem do lesa',text:'Interiér, lavice a velké okno směrem do okolní krajiny.',href:'/sauny/'},
  {image:'F20.jpg',title:'Vyvýšený dřevěný prostor',text:'Stavba nad terénem a jiná perspektiva místa.',href:'/posedy/'},
  {image:'F34.jpg',title:'Domeček s pobytovou terasou',text:'Kompaktní dřevěný prostor propojený s venkovním místem.',href:'/domecky/'}
 ];
 const cards=items.map((x,i)=>`<article class="catalog-item"><a href="${route(x.href)}"><div class="catalog-media">${imageTag(x.image,x.title+' – zákaznický obrazový podklad / pracovní náhled')}</div><div class="catalog-copy"><div class="catalog-copy-top"><span class="catalog-index">0${i+1}</span><h3>${esc(x.title)}</h3><span class="catalog-arrow" aria-hidden="true">↗</span></div><p>${esc(x.text)}</p><span class="catalog-note">Pracovní obrazový podklad</span></div></a></article>`).join('');
 return `<main id="main"><section class="section subpage-content"><div class="container"><p class="eyebrow">Odruky / realizace</p><h1>Pracovní galerie</h1><h2>Výběr dostupných obrazových podkladů</h2><p>Výběr dostupných fotografií ukazuje různé typy dřevěných prostorů, které jsou v pracovním náhledu přiřazené k nabídce Odruky.</p><p class="pending">Jde o veřejný pracovní obrazový náhled; nejde o zákaznické reference ani produkční schválení fotografií pro finální web.</p><div class="catalog" id="realizace-galerie">${cards}</div></div></section>${contactContent()}</main>`;
}

function customProductionPage(){
 const principles=D.principles.map((p,i)=>`<article class="custom-principle"><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p></article>`).join('');
 const steps=D.steps.map((s,i)=>`<button type="button" class="step" aria-expanded="${i===0}" aria-controls="step-detail" data-step="${i}"><span class="step-n">0${i+1}</span><strong>${esc(s.title)}</strong></button>`).join('');
 return `<main id="main">
 <section class="section subpage-content"><div class="container"><p class="eyebrow">Odruky / zakázková výroba</p><h1>Zakázková výroba podle vašeho zadání</h1><p>Vedle pěti hlavních kategorií lze probrat i jiné dřevěné řešení. Konkrétní proveditelnost, rozsah a podobu je potřeba ověřit podle místa a zadání.</p><div class="principles">${principles}</div></div></section>
 <section class="section steps-section" id="zakazkova-postup"><div class="container"><div class="steps-intro"><p class="eyebrow">Jak postupujeme</p><h2>Od první představy k upřesněnému zadání.</h2></div><div class="steps-list" role="group" aria-label="Čtyři kroky zakázkové výroby">${steps}</div><div class="step-detail" id="step-detail" aria-live="polite">${esc(D.steps[0].description)}</div></div></section>
 <section class="section custom-checklist"><div class="container intro-grid"><div><p class="eyebrow">Co si připravit</p><h2>Stačí základní informace.</h2></div><div><ul><li>Místo, kde má projekt vzniknout.</li><li>Zamýšlené využití a to, co je pro vás důležité.</li><li>Orientační rozměry nebo prostorové omezení.</li><li>Představu o rozsahu další práce.</li></ul><p>${link(inquiryHref('zakazkova-vyroba'),'Probrat zakázkovou výrobu →','button button-green')}</p></div></div></section>
 ${contactContent()}</main>`;
}

function contactPage(){
 return `<main id="main">
 <section class="section subpage-content"><div class="container"><p class="eyebrow">Odruky / kontakt</p><h1>Proberme váš projekt</h1><p>První zpráva nemusí být technické zadání. Stačí popsat, co chcete vytvořit a kde má projekt vzniknout.</p></div></section>
 <section class="section custom-checklist"><div class="container intro-grid"><div><p class="eyebrow">Co poslat v první zprávě</p><h2>Stačí stručný začátek.</h2></div><div><ul><li>Typ projektu nebo vlastní představu.</li><li>Místo, kde má projekt vzniknout.</li><li>Zamýšlené využití a hlavní požadavky.</li><li>Orientační rozměry nebo prostorové omezení.</li><li>Jednoduchý náčrt nebo fotografii místa, pokud je máte k dispozici.</li></ul><p class="pending">Žádné údaje se v tomto pracovním náhledu neodesílají ani neukládají. Kontaktní formulář zde není aktivní.</p></div></div></section>
 ${contactContent()}</main>`;
}

function aboutPage(){
 const categories=D.categories.map((x,i)=>`<article class="custom-principle"><span class="catalog-index">0${i+1}</span><h2>${link('/'+x.slug+'/',esc(x.name))}</h2><p>${esc(x.tagline)}</p></article>`).join('');
 const principles=D.principles.map(p=>`<article class="custom-principle"><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></article>`).join('');
 return `<main id="main">
 <section class="section subpage-content"><div class="container"><p class="eyebrow">Odruky / o nás</p><h1>Prostor ze dřeva podle konkrétní představy.</h1><p>Odruky v tomto pracovním návrhu představuje zakázkovou práci se dřevem a pět hlavních oblastí, které lze dále přizpůsobovat konkrétnímu místu a zadání.</p><h2>Pět hlavních oblastí</h2><div class="custom-principles">${categories}</div></div></section>
 <section class="section steps-section"><div class="container"><div class="steps-intro"><p class="eyebrow">Jak přemýšlíme o projektu</p><h2>Nejdřív místo, využití a jasné zadání.</h2></div><div class="custom-principles">${principles}</div></div></section>
 <section class="section"><div class="container"><p class="pending">Příběh firmy, konkrétní tým a identifikační údaje zatím nejsou ověřené podklady pro veřejnou prezentaci. Do finálního webu patří až po potvrzení zadavatelem.</p></div></section>
 ${contactContent()}</main>`;
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
document.getElementById('app').innerHTML=nav()+status()+themePicker()+(category?detail(category):current==='home'?home():current==='realizace'?realizationsPage():current==='zakazkova-vyroba'?customProductionPage():current==='kontakt'?contactPage():current==='o-nas'?aboutPage():otherPage())+footer()+(category?dialog():'');
setTheme(initialTheme);
const loadDeferredImage=img=>{const src=img.dataset.src;if(!src)return;img.src=src;delete img.dataset.src;};
const deferredImages=[...document.querySelectorAll('img[data-src]')];
let deferredImageObserver=null;
if(deferredImages.length){
 if(typeof IntersectionObserver==='function'){
  deferredImageObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){loadDeferredImage(entry.target);deferredImageObserver.unobserve(entry.target)}},{rootMargin:'360px 0px',threshold:.01});
  deferredImages.forEach(img=>deferredImageObserver.observe(img));
 }else deferredImages.forEach(loadDeferredImage);
}
window.addEventListener('pagehide',()=>deferredImageObserver?.disconnect(),{once:true});
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
document.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.themeChoice,true)));
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