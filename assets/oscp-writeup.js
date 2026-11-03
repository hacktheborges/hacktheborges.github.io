(function(){
 'use strict';
 const T=(pt,en)=>window.BorgesI18n?window.BorgesI18n.text(pt,en):pt;
 const root=document.documentElement,button=document.querySelector('[data-theme-toggle]');
 try{const value=localStorage.getItem('borges-reading-theme');if(['light','dark'].includes(value))root.dataset.theme=value;}catch{}
 function label(){button.textContent=root.dataset.theme==='light'?T('Escuro','Dark'):T('Claro','Light');document.querySelectorAll('.copy-code').forEach(b=>{b.textContent=T('Copiar','Copy');});const dlg=document.getElementById('image-lightbox');dlg.setAttribute('aria-label',T('Imagem ampliada','Enlarged image'));dlg.querySelector('.lb-close').setAttribute('aria-label',T('Fechar','Close'));}
 button.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';try{localStorage.setItem('borges-reading-theme',root.dataset.theme);}catch{}label();});
 document.querySelectorAll('.prose pre').forEach(pre=>{const code=pre.querySelector('code');if(!code||!navigator.clipboard)return;const copy=document.createElement('button');copy.type='button';copy.className='copy-code';copy.textContent=T('Copiar','Copy');copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code.textContent);copy.textContent=T('Copiado ✓','Copied ✓');}catch{copy.textContent=T('Selecione o comando para copiar','Select the command to copy');}});pre.prepend(copy);});
 document.addEventListener('borges:languagechange',label);label();
})();
(function(){
 'use strict';
 var button=document.getElementById('pwn-button'),party=document.getElementById('pwn3d'),status=document.getElementById('pwn-status');
 if(!button||!party||!status)return;
 var machine=party.dataset.machine||'ClamAV',access=party.dataset.access||'root';
 var canvas=null,frame=0,timer=0,celebrated=false;
 var motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 function label(){
  var en=window.BorgesI18n&&window.BorgesI18n.language==='en';
  status.textContent=celebrated?(en?machine+' Pwn3d! '+(access==='root'?'Root':access)+' access confirmed.':machine+' Pwn3d! Acesso '+access+' confirmado.'):(en?'Click to celebrate '+machine+'.':'Clique para comemorar a '+machine+'.');
 }
 function clearCanvas(){if(frame)cancelAnimationFrame(frame);frame=0;if(canvas)canvas.remove();canvas=null;}
 function finish(){clearCanvas();clearTimeout(timer);timer=0;party.classList.remove('is-celebrating');button.disabled=false;}
 function burst(){
  canvas=document.createElement('canvas');canvas.className='pwn-confetti';canvas.setAttribute('aria-hidden','true');document.body.appendChild(canvas);
  var ctx=canvas.getContext('2d');if(!ctx){clearCanvas();return;}
  var w=window.innerWidth,h=window.innerHeight,dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(h*dpr);ctx.scale(dpr,dpr);
  var rect=button.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2;
  var colors=['#91d8b3','#ae8eff','#8ed9f1','#e9b45c'];
  var particles=Array.from({length:w<600?70:110},function(_,i){var a=-Math.PI+Math.random()*Math.PI,speed=220+Math.random()*440;return {x:x,y:y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,spin:Math.random()*6-3,size:4+Math.random()*5,color:colors[i%colors.length],binary:i%5===0,text:i%2?'1':'0'};});
  var started=null,last=null;
  function draw(now){
   if(motion.matches){finish();return;}
   if(started===null){started=now;last=now;}
   var age=(now-started)/1000,dt=Math.min((now-last)/1000,.04);last=now;
   ctx.clearRect(0,0,w,h);ctx.globalAlpha=Math.min(1,Math.max(0,(2.4-age)/.65));
   particles.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=390*dt;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(age*p.spin);ctx.fillStyle=p.color;if(p.binary){ctx.font='bold 13px monospace';ctx.fillText(p.text,0,0);}else{ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.6);}ctx.restore();});
   if(age<2.4)frame=requestAnimationFrame(draw);else finish();
  }
  frame=requestAnimationFrame(draw);
 }
 button.addEventListener('click',function(){
  if(button.disabled)return;
  finish();celebrated=true;label();
  if(motion.matches)return;
  button.disabled=true;party.classList.add('is-celebrating');
  burst();timer=setTimeout(finish,2800);
 });
 document.addEventListener('borges:languagechange',label);
 window.addEventListener('pagehide',finish);
 window.addEventListener('resize',finish,{passive:true});
 document.addEventListener('visibilitychange',function(){if(document.hidden)finish();});
 label();
})();

