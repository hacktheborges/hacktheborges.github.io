(function(){
 'use strict';
 const root=document.documentElement,key='borges-language';
 const normalize=value=>value==='en'?'en':value==='pt'||value==='pt-BR'?'pt':null;
 let saved=null;try{saved=normalize(localStorage.getItem(key));}catch{}
 let language=normalize(new URLSearchParams(location.search).get('lang'))||saved||'pt';
 const text=(pt,en)=>language==='en'?en:pt;
 function updateLinks(){
  document.querySelectorAll('a[href]').forEach(a=>{
   const href=a.getAttribute('href');
   if(!href||href.startsWith('#')||a.hasAttribute('download')||/^[a-z][a-z\d+.-]*:/i.test(href)||href.startsWith('//'))return;
   try{const url=new URL(href,document.baseURI);if(!/\.html$/.test(url.pathname))return;
    const parts=href.split('#'),base=parts[0].split('?')[0],params=new URLSearchParams(parts[0].split('?')[1]||'');
    params.set('lang',language);a.setAttribute('href',base+'?'+params.toString()+(parts.length>1?'#'+parts.slice(1).join('#'):''));
   }catch{}
  });
 }
 function apply(next,writeURL=false){
  language=normalize(next)||'pt';root.lang=language==='en'?'en':'pt-BR';root.dataset.language=language;
  document.querySelectorAll('[data-pt][data-en]').forEach(el=>{el.textContent=el.getAttribute('data-'+language);if(el.hasAttribute('data-translate-lang'))el.lang=root.lang;});
  document.querySelectorAll('[data-i18n-attrs]').forEach(el=>el.getAttribute('data-i18n-attrs').split(' ').forEach(attr=>{const value=el.getAttribute('data-'+language+'-'+attr);if(value!==null)el.setAttribute(attr,value);}));
  document.querySelectorAll('[data-language-switch]').forEach(el=>el.setAttribute('aria-label',text('Idioma da página','Page language')));
  document.querySelectorAll('button[data-language]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.language===language));});
  try{localStorage.setItem(key,language);}catch{}
  if(writeURL){try{const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url.href);}catch{}}
  updateLinks();document.dispatchEvent(new CustomEvent('borges:languagechange',{detail:{language}}));
 }
 window.BorgesI18n={get language(){return language;},text,setLanguage:next=>apply(next,true)};
 document.querySelectorAll('button[data-language]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.language,true)));
 window.addEventListener('storage',e=>{if(e.key===key&&normalize(e.newValue))apply(e.newValue);});
 apply(language);
})();

(function(){
 'use strict';
 const shell=document.querySelector('.portfolio-shell');
 const menu=document.querySelector('.menu-toggle');
 const sidebar=document.getElementById('sidebar');
 function closeMenu(restoreFocus){
  const wasOpen=menu.getAttribute('aria-expanded')==='true';
  shell.dataset.menuOpen='false';
  menu.setAttribute('aria-expanded','false');
  if(wasOpen&&restoreFocus)menu.focus();
 }
 menu.addEventListener('click',()=>{
  const open=menu.getAttribute('aria-expanded')!=='true';
  shell.dataset.menuOpen=String(open);
  menu.setAttribute('aria-expanded',String(open));
 });
 sidebar.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMenu(false)));
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape')closeMenu(true);
 });
 const sideLinks=Array.from(document.querySelectorAll('[data-section]'));
 const tabs=Array.from(document.querySelectorAll('[data-tab-section]'));
 function markSection(){
  const id=location.hash.slice(1)||'perfil';
  sideLinks.forEach(link=>{
   if(link.dataset.section===id||(id==='inicio'&&link.dataset.section==='perfil'))link.setAttribute('aria-current','location');
   else link.removeAttribute('aria-current');
  });
  tabs.forEach(link=>{
   const active=link.dataset.tabSection===id||(id==='inicio'&&link.dataset.tabSection==='perfil');
   link.classList.toggle('is-active',active);
   if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
 }
 window.addEventListener('hashchange',markSection);
 markSection();
 document.getElementById('site-year').textContent=new Date().getFullYear();
})();

