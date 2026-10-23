/* Soft decorative commit field: independent of content, no pointer capture. */
(function(){
 'use strict';
 const canvas=document.getElementById('ambient-commits'),ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let W=0,H=0,dpr=1,cells=[],rings=[],mx=-9999,my=-9999,raf=0,last=0;
 function build(){
  W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  cells=[];let seed=107;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const pitch=W<600?32:30;
  for(let y=18;y<H;y+=pitch)for(let x=18;x<W;x+=pitch){
   if(random()>.27)continue;
   cells.push({hx:x,hy:y,x,y,vx:0,vy:0,heat:0,size:random()<.12?5:3,phase:random()*Math.PI*2,base:.055+random()*.065,cyan:random()<.25});
  }
  draw(performance.now(),0);start();
 }
 function draw(now,dt){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  rings=rings.filter(r=>now-r.t<1800);
  const step=Math.min(2,dt/33.333),damp=Math.pow(.78,step);
  for(const c of cells){
   let heat=0;
   if(!reduced.matches){
    let dx=c.x-mx,dy=c.y-my,dist=Math.hypot(dx,dy),f=Math.max(0,1-dist/125);
    const tx=c.hx+(dx/(dist||1))*f*4,ty=c.hy+(dy/(dist||1))*f*4;
    c.vx=(c.vx+(tx-c.x)*.12*step)*damp;c.vy=(c.vy+(ty-c.y)*.12*step)*damp;
    c.x+=c.vx*step;c.y+=c.vy*step;heat=f*.18;
    for(const r of rings){const age=now-r.t,band=Math.abs(Math.hypot(c.hx-r.x,c.hy-r.y)-age*.28);if(band<34)heat=Math.max(heat,(1-band/34)*(1-age/1800)*.23);}
    c.heat+=(heat-c.heat)*Math.min(1,.18*step);
   }else{c.x=c.hx;c.y=c.hy;c.heat=0;}
   const breathe=reduced.matches?1:.88+.12*Math.sin(now*.00045+c.phase);
   // Slightly quieter behind the central reading column.
   const edge=Math.abs(c.hx-W/2)/(W/2),alpha=c.base*breathe*(.65+.35*edge)+c.heat;
   const size=c.size*(1+c.heat*.6);
   ctx.fillStyle=c.cyan?'rgba(56,189,248,'+alpha+')':'rgba(139,92,255,'+alpha+')';
   ctx.beginPath();ctx.roundRect(c.x-size/2,c.y-size/2,size,size,.8);ctx.fill();
  }
 }
 function tick(now){raf=0;if(document.hidden||reduced.matches)return;
  if(now-last>=32){draw(now,last?now-last:33);last=now;}
  raf=requestAnimationFrame(tick);
 }
 function start(){if(!raf&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(tick);}
 addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){mx=e.clientX;my=e.clientY;}},{passive:true});
 const forget=()=>{mx=my=-9999;};
 document.addEventListener('pointerleave',forget);addEventListener('blur',forget);
 addEventListener('click',e=>{if(reduced.matches||e.target.closest('a,button,input,textarea,select'))return;rings.push({x:e.clientX,y:e.clientY,t:performance.now()});if(rings.length>3)rings.shift();},{passive:true});
 let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(build,100);},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(!document.hidden)start();});
 reduced.addEventListener('change',()=>{if(raf)cancelAnimationFrame(raf);raf=0;rings=[];forget();draw(performance.now(),0);start();});
 build();
})();

