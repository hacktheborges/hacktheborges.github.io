(function(){
 'use strict';
 const shell=document.querySelector('.portfolio-shell');
 const dashboard=document.querySelector('.content-wrap');
 const workspace=document.getElementById('track-workspace');
 const frame=document.getElementById('track-content');
 const status=document.getElementById('workspace-status');
 const statusText=document.getElementById('workspace-status-text');
 const retry=document.getElementById('workspace-retry');
 const trackLink=document.getElementById('workspace-track');
 const pageName=document.getElementById('workspace-page');
 const backLink=document.getElementById('workspace-back');
 const homeTitle=document.title;
 const styleURL=new URL('panel-content.css?v=4fedd85c1a6e',document.currentScript.src).href;
 const T=(pt,en)=>window.BorgesI18n?window.BorgesI18n.text(pt,en):pt;
 const language=()=>window.BorgesI18n?window.BorgesI18n.language:'pt';
 const homePath=location.pathname;
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let current=null,ready=false,loadTimer=null,loadingTimer=null;
 let navigationVersion=0,frameAnimation=null;

 function cancelFrameMotion(){
  if(frameAnimation){frameAnimation.cancel();frameAnimation=null;}
 }
 function enterContent(element){
  if(reducedMotion.matches||!element.animate)return;
  element.getAnimations().forEach(animation=>animation.cancel());
  const animation=element.animate([
   {opacity:0,transform:'translateY(5px)'},
   {opacity:1,transform:'translateY(0)'}
  ],{duration:210,easing:'cubic-bezier(.2,.7,.25,1)'});
  if(element===frame)frameAnimation=animation;
  animation.finished.catch(()=>{});
 }

 // Only the two existing, same-origin collections can open in the reader.
 function routeFor(value,base){
  try{
   const url=new URL(value,base||location.href);
   if(url.origin!==location.origin)return null;
   if(/^\/(cpts|oscp)\/$/.test(url.pathname))url.pathname+='index.html';
   const match=url.pathname.match(/^\/(cpts|oscp)\/[a-z0-9]+(?:-[a-z0-9]+)*\.html$/);
   if(!match)return null;
   url.searchParams.delete('lang');
   url.searchParams.delete('view');
   const isIndex=url.pathname.endsWith('/index.html');
   if(isIndex&&!url.hash)url.hash='#labs';
   return {track:match[1],path:url.pathname.slice(1),query:url.search,hash:url.hash,key:url.pathname+url.search,isIndex};
  }catch{return null;}
 }
 function frameURL(route){
  const url=new URL('/'+route.path+route.query,location.origin);
  url.searchParams.set('lang',language());
  url.hash=route.hash;
  return url;
 }
 function saveLocation(route,mode){
  if(mode==='none')return;
  const url=new URL(location.href);
  if(route){url.searchParams.set('view',route.path+route.query);url.hash=route.hash;}
  else url.searchParams.delete('view');
  if(url.href!==location.href)history[mode==='replace'?'replaceState':'pushState'](null,'',url.href);
 }
 function notify(){
  document.dispatchEvent(new CustomEvent('portfolio:viewchange',{detail:{view:current&&current.track}}));
 }
 function selectTrack(){
  document.querySelectorAll('.sidebar a').forEach(link=>{
   if(current){
    link.removeAttribute('aria-current');
    const route=routeFor(link.getAttribute('href'));
    if(route&&route.track===current.track)link.setAttribute('aria-current','page');
   }else if(!link.hasAttribute('data-section'))link.removeAttribute('aria-current');
  });
 }
 function chrome(){
  if(!current)return;
  const track=current.track.toUpperCase();
  const destination=current.track+'/index.html?lang='+language()+'#labs';
  trackLink.textContent=track;
  trackLink.href=destination;
  backLink.href=destination;
  backLink.hidden=current.isIndex;
  pageName.hidden=current.isIndex;
  frame.title=current.isIndex?T('Trilha ','Study path ')+track:T('Write-up da trilha ','Write-up from the ')+track;
  if(!ready)statusText.textContent=T('Carregando conteúdo…','Loading content…');
 }
 function error(){
  navigationVersion++;
  clearTimeout(loadTimer);
  clearTimeout(loadingTimer);
  cancelFrameMotion();
  ready=false;
  frame.style.visibility='hidden';
  status.hidden=false;
  retry.hidden=false;
  statusText.textContent=T('Não foi possível carregar este conteúdo.','This content could not be loaded.');
  workspace.setAttribute('aria-busy','false');
 }
 function scrollToAnchor(smooth){
  if(!ready||!current||!current.hash)return;
  const doc=frame.contentDocument;
  let id;try{id=decodeURIComponent(current.hash.slice(1));}catch{return;}
  const target=doc.getElementById(id);
  if(target&&!target.hidden)target.scrollIntoView({block:'start',behavior:smooth&&!reducedMotion.matches?'smooth':'instant'});
 }
 function replaceChildHash(smooth){
  const win=frame.contentWindow;
  const url=new URL(win.location.href);
  if(url.hash!==current.hash){
   const oldURL=url.href;url.hash=current.hash;
   win.history.replaceState(null,'',url.href);
   win.dispatchEvent(new win.HashChangeEvent('hashchange',{oldURL,newURL:url.href}));
  }
  win.requestAnimationFrame(()=>scrollToAnchor(smooth));
 }
 function open(route,mode){
  const same=current&&current.key===route.key;
  current=route;
  saveLocation(route,mode||'push');
  dashboard.hidden=true;workspace.hidden=false;shell.dataset.view='track';
  document.querySelector('.skip-link').setAttribute('href','#track-workspace');
  selectTrack();chrome();notify();
  if(same&&ready){replaceChildHash(mode!=='none');return;}
  const animateExit=ready&&!reducedMotion.matches&&!!frame.animate;
  const version=++navigationVersion;
  cancelFrameMotion();
  ready=false;
  pageName.textContent='';
  workspace.setAttribute('aria-busy','true');
  status.hidden=true;retry.hidden=true;
  statusText.textContent=T('Carregando conteúdo…','Loading content…');
  clearTimeout(loadingTimer);
  // Cached pages can appear before the loading message needs to be shown.
  loadingTimer=setTimeout(()=>{if(version===navigationVersion&&!ready)status.hidden=false;},140);
  clearTimeout(loadTimer);loadTimer=setTimeout(error,25000);
  const navigate=()=>{
   if(version!==navigationVersion)return;
   frame.style.visibility='hidden';
   cancelFrameMotion();
   frame.contentWindow.location.replace(frameURL(route).href);
  };
  if(animateExit){
   frameAnimation=frame.animate([
    {opacity:1,transform:'translateY(0)'},
    {opacity:0,transform:'translateY(-3px)'}
   ],{duration:90,easing:'ease-out',fill:'forwards'});
   // A history restoration may already have revealed the requested document.
   // Cancelling its outgoing effect must not hide that document again.
   frameAnimation.finished.then(navigate,()=>{});
  }else navigate();
 }
 function home(hash,mode){
  const returning=!!current;
  navigationVersion++;
  clearTimeout(loadingTimer);cancelFrameMotion();
  clearTimeout(loadTimer);current=null;ready=false;
  const url=new URL(location.href);url.searchParams.delete('view');url.hash=hash||'';
  if(mode!=='none'&&url.href!==location.href)history[mode==='replace'?'replaceState':'pushState'](null,'',url.href);
  shell.dataset.view='home';dashboard.hidden=false;workspace.hidden=true;
  document.querySelector('.skip-link').setAttribute('href','#main');
  frame.contentWindow.location.replace('about:blank');
  const title=document.querySelector('title');
  document.title=title.getAttribute('data-'+language())||homeTitle;
  selectTrack();notify();
  let target;try{target=document.getElementById(decodeURIComponent((hash||'#perfil').slice(1)));}catch{}
  if(returning)enterContent(dashboard);
  if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:mode!=='none'&&!reducedMotion.matches?'smooth':'instant'}));
 }
 function fromLocation(){
  const selected=new URLSearchParams(location.search).get('view');
  if(selected){
   const route=routeFor('/'+selected,location.origin);
   if(route){route.hash=location.hash||route.hash;open(route,'none');return;}
   home(location.hash,'replace');
  }else home(location.hash,'none');
 }
 function ordinaryClick(event){return event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey;}
 function handleLink(event,base){
  if(!ordinaryClick(event)||event.defaultPrevented)return false;
  const link=event.target.closest('a[href]');
  if(!link||link.hasAttribute('download'))return false;
  const value=link.getAttribute('href');
  let url;try{url=new URL(value,base);}catch{return false;}
  if(current&&url.origin===location.origin&&url.pathname===homePath&&url.hash==='#track-workspace'){
   event.preventDefault();workspace.focus();return true;
  }
  const route=routeFor(url.href);
  if(route){event.preventDefault();open(route,'push');return true;}
  if(current&&url.origin===location.origin&&(url.pathname===homePath||url.pathname==='/index.html'||url.pathname==='/')){
   event.preventDefault();home(url.hash,'push');return true;
  }
  return false;
 }
 document.addEventListener('click',event=>handleLink(event,location.href));

 frame.addEventListener('load',async()=>{
  if(!current)return;
  let doc,win,loaded;
  try{doc=frame.contentDocument;win=frame.contentWindow;loaded=routeFor(win.location.href);}catch{error();return;}
  if(!loaded||loaded.key!==current.key)return;
  if(!doc.querySelector('main')){error();return;}
  const version=navigationVersion;
  const expected=doc;
  doc.documentElement.dataset.panel='true';
  doc.documentElement.dataset.theme='dark';
  const style=doc.createElement('link');style.rel='stylesheet';style.href=styleURL;
  try{await new Promise((resolve,reject)=>{style.onload=resolve;style.onerror=reject;doc.head.appendChild(style);});}catch{if(version===navigationVersion)error();return;}
  if(version!==navigationVersion||frame.contentDocument!==expected||!current)return;
  doc.addEventListener('click',event=>{
   if(handleLink(event,win.location.href))event.stopPropagation();
   else if(ordinaryClick(event))win.queueMicrotask(()=>{
    if(!current)return;
    const selected=routeFor(win.location.href);
    if(selected&&selected.key===current.key&&selected.hash!==current.hash){current.hash=selected.hash;saveLocation(current,'replace');}
   });
  });
  win.addEventListener('hashchange',()=>{
   if(!current)return;
   const selected=routeFor(win.location.href);
   if(selected&&selected.key===current.key){current.hash=selected.hash;saveLocation(current,'replace');}
  });
  clearTimeout(loadTimer);clearTimeout(loadingTimer);ready=true;
  workspace.setAttribute('aria-busy','false');status.hidden=true;retry.hidden=true;
  const heading=doc.querySelector('main h1');
  pageName.textContent=heading?heading.textContent.trim().replace(/\s+/g,' '):'';
  document.title=doc.title;
  frame.style.visibility='visible';chrome();replaceChildHash(false);enterContent(frame);
 });
 retry.addEventListener('click',()=>{if(current)open(current,'none');});
 window.addEventListener('popstate',fromLocation);
 window.addEventListener('hashchange',()=>{if(!current)fromLocation();});
 document.addEventListener('borges:languagechange',()=>{
  if(!current)return;
  if(ready){
   const i18n=frame.contentWindow.BorgesI18n;
   if(i18n&&i18n.language!==language())i18n.setLanguage(language());
   document.title=frame.contentDocument.title;
  }
  chrome();
 });
 fromLocation();
})();
