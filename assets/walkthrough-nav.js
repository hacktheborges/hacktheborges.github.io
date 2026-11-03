(function(){
 'use strict';
 var toc=document.querySelector('.walkthrough-toc');
 if(!toc)return;
 var details=toc.querySelector('details'),links=Array.from(toc.querySelectorAll('a[href^="#"]'));
 var items=links.map(function(link){return {link:link,section:document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)))};}).filter(function(item){return item.section;});
 if(!items.length)return;
 var desktop=window.matchMedia('(min-width: 1001px)'),topbar=document.querySelector('.topbar');
 var frame=0,offset=100,active=null,focusFrame=0;
 function syncLayout(){
  details.open=desktop.matches;
  toc.querySelector('summary').setAttribute('tabindex',desktop.matches?'-1':'0');
  offset=topbar?Math.ceil(topbar.getBoundingClientRect().height)+16:16;
  document.documentElement.style.setProperty('--walkthrough-offset',offset+'px');
  schedule();
 }
 function update(){
  frame=0;
  var threshold=offset+(desktop.matches?20:80),current=items[0];
  items.forEach(function(item){if(item.section.getBoundingClientRect().top<=threshold)current=item;});
  var root=document.documentElement;
  if(window.scrollY>0&&window.innerHeight+window.scrollY>=root.scrollHeight-3)current=items[items.length-1];
  if(active===current)return;
  active=current;
  items.forEach(function(item){if(item===current)item.link.setAttribute('aria-current','location');else item.link.removeAttribute('aria-current');});
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 toc.addEventListener('click',function(event){
  if(desktop.matches&&event.target.closest('summary')){event.preventDefault();return;}
  var link=event.target.closest('a[href^="#"]');
  if(!link||!toc.contains(link)||event.defaultPrevented||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  var item=items.find(function(x){return x.link===link;});
  if(!item)return;
  if(!desktop.matches)details.open=false;
  var heading=item.section.querySelector('h2');
  if(heading){
   heading.setAttribute('tabindex','-1');
   if(focusFrame)cancelAnimationFrame(focusFrame);
   focusFrame=requestAnimationFrame(function(){focusFrame=0;heading.focus({preventScroll:true});});
  }
  schedule();
 });
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',syncLayout,{passive:true});
 window.addEventListener('hashchange',schedule);
 window.addEventListener('load',syncLayout);
 document.addEventListener('borges:languagechange',syncLayout);
 if(desktop.addEventListener)desktop.addEventListener('change',syncLayout);
 if(window.ResizeObserver&&topbar)new ResizeObserver(syncLayout).observe(topbar);
 window.addEventListener('pagehide',function(){if(frame)cancelAnimationFrame(frame);if(focusFrame)cancelAnimationFrame(focusFrame);frame=0;focusFrame=0;});
 syncLayout();
})();
