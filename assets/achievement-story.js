(function(){
 'use strict';
 const stage=document.getElementById('achievement-story');
 if(!stage)return;
 const gallery=document.getElementById('achievement-gallery');
 const cards=Array.from(gallery.querySelectorAll('[data-achievement]'));
 const narration=document.getElementById('story-narration');
 const chapter=document.getElementById('story-chapter');
 const hint=document.getElementById('story-hint');
 const clock=document.getElementById('story-time');
 const pause=document.getElementById('story-pause');
 const skip=document.getElementById('story-skip');
 const replay=document.getElementById('story-replay');
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const duration=12000,storageKey='borges-achievement-intro-v1';
 const t=(pt,en)=>window.BorgesI18n?window.BorgesI18n.text(pt,en):pt;
 const phases=[
  {at:0,key:'welcome',pt:'Uma trajetória se constrói com pequenas peças.',en:'A journey is built from small pieces.'},
  {at:1300,key:'security',pt:'Security+: uma base sólida para começar.',en:'Security+: solid foundations to begin.'},
  {at:3800,key:'crta',pt:'CRTA: mais uma conquista em segurança ofensiva.',en:'CRTA: another achievement in offensive security.'},
  {at:6300,key:'cpts',pt:'CPTS: o próximo capítulo está em construção.',en:'CPTS: the next chapter is under construction.'},
  {at:8800,key:'oscp',pt:'OSCP: a jornada continua. Try harder.',en:'OSCP: the journey continues. Try harder.'}
 ];
 let running=false,paused=false,offscreen=false,hidden=false,elapsed=0,lastTime=null,raf=null,phase=-1;
 function remember(){try{sessionStorage.setItem(storageKey,'done');}catch{}}
 function translate(){
  if(running){const p=phases[Math.max(phase,0)];narration.textContent=t(p.pt,p.en);hint.textContent=t('Duas conquistas. Dois próximos capítulos.','Two achievements. Two chapters ahead.');}
  else{narration.textContent=t('Cada conquista tem uma história. Explore a minha.','Every achievement has a story. Explore mine.');hint.textContent=t('Escolha um emblema para descobrir mais.','Choose a badge to discover more.');}
  pause.textContent=paused?t('Continuar','Resume'):t('Pausar','Pause');
 }
 function activity(){
  const playing=running&&!paused&&!hidden&&!offscreen;
  stage.dataset.playing=String(playing);
  cancelAnimationFrame(raf);lastTime=null;
  if(playing)raf=requestAnimationFrame(tick);
 }
 function finish(save=true){
  running=false;paused=false;cancelAnimationFrame(raf);lastTime=null;elapsed=duration;
  stage.dataset.scene='complete';stage.dataset.live='false';stage.dataset.playing='false';stage.style.setProperty('--story-progress','1');stage.setAttribute('aria-busy','false');gallery.inert=false;
  cards.forEach(c=>{c.dataset.built='true';c.removeAttribute('data-active');});
  chapter.textContent='04 / 04';pause.hidden=true;skip.hidden=true;clock.hidden=true;replay.hidden=reduce.matches;
  translate();if(save)remember();
 }
 function tick(time){
  if(!running||paused||hidden||offscreen)return;
  if(lastTime!==null)elapsed+=time-lastTime;
  lastTime=time;
  if(elapsed>=duration){finish();return;}
  const next=phases.reduce((last,p,i)=>elapsed>=p.at?i:last,0);
  if(next!==phase){
   phase=next;stage.dataset.scene=phases[phase].key;chapter.textContent=String(Math.max(phase,1)).padStart(2,'0')+' / 04';
   cards.forEach((card,i)=>{card.dataset.built=String(i+1<phase);card.dataset.active=String(i+1===phase);});translate();
  }
  stage.style.setProperty('--story-progress',String(elapsed/duration));
  clock.textContent='00:'+String(Math.floor(elapsed/1000)).padStart(2,'0')+' / 00:12';
  raf=requestAnimationFrame(tick);
 }
 function start(){
  if(reduce.matches){finish(false);return;}
  running=true;paused=false;elapsed=0;phase=-1;lastTime=null;
  stage.dataset.live='true';stage.dataset.scene='welcome';stage.setAttribute('aria-busy','true');gallery.inert=true;
  cards.forEach(c=>{c.dataset.built='false';c.removeAttribute('data-active');});
  stage.style.setProperty('--story-progress','0');pause.hidden=false;skip.hidden=false;clock.hidden=false;replay.hidden=true;clock.textContent='00:00 / 00:12';translate();activity();
 }
 pause.addEventListener('click',()=>{paused=!paused;translate();activity();});
 skip.addEventListener('click',()=>{finish();replay.focus({preventScroll:true});});
 replay.addEventListener('click',()=>{start();if(running)pause.focus({preventScroll:true});});
 document.addEventListener('visibilitychange',()=>{hidden=document.hidden;activity();});
 document.addEventListener('portfolio:viewchange',event=>{if(event.detail.view&&running)finish();});
 document.addEventListener('borges:languagechange',()=>{translate();if(dialog.open)populateCredential(activeCredential);});
 reduce.addEventListener('change',()=>{if(reduce.matches)finish(false);else replay.hidden=false;});
 if('IntersectionObserver' in window){new IntersectionObserver(entries=>{offscreen=!entries[0].isIntersecting;activity();},{threshold:.12}).observe(stage);}
 const dialog=document.getElementById('achievement-dialog');
 const close=document.getElementById('achievement-dialog-close');
 let activeCredential=null,opener=null;
 const credentials={
  security:{name:'CompTIA Security+',subtitle:'SY0-701',badge:'assets/img/home/cert-secplus.webp',pt:'Certificação conquistada em fundamentos de segurança da informação. Uma base para compreender riscos, proteger ambientes e evoluir na prática.',en:'An earned certification in information security fundamentals. A foundation for understanding risk, protecting environments and building practical skills.',url:'https://www.credly.com/badges/8da335bc-2437-4841-8bf9-838ec94d4391/public_url'},
  crta:{name:'CRTA',subtitle:'Certified Red Team Analyst · CyberWarFare Labs',badge:'assets/img/home/cert-crta.webp',pt:'Certificação conquistada pela CyberWarFare Labs. Parte da minha trajetória de aprendizado e desenvolvimento em segurança ofensiva.',en:'An earned CyberWarFare Labs certification. Part of my learning and development journey in offensive security.',url:'https://labs.cyberwarfare.live/credential/achievement/6a775867a8dc97c4c7dddcd0'}
 };
 function populateCredential(key){
  const item=credentials[key];if(!item)return;
  document.getElementById('achievement-dialog-title').textContent=item.name;
  document.getElementById('achievement-dialog-subtitle').textContent=item.subtitle;
  document.getElementById('achievement-dialog-description').textContent=t(item.pt,item.en);
  document.getElementById('achievement-dialog-badge').src=item.badge;
  document.getElementById('achievement-dialog-link').href=item.url;
 }
 gallery.querySelectorAll('[data-credential]').forEach(button=>button.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  if(running)finish();activeCredential=button.dataset.credential;opener=button;populateCredential(activeCredential);dialog.showModal();close.focus();
 }));
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{if(opener)opener.focus({preventScroll:true});});
 let seen=false;try{seen=sessionStorage.getItem(storageKey)==='done';}catch{}
 const params=new URLSearchParams(location.search);
 const deepLink=params.has('view')||!['','#inicio','#perfil'].includes(location.hash);
 if(!seen&&!deepLink&&!reduce.matches)start();else finish(false);
})();
