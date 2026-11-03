(function(){
 'use strict';
 const T=(pt,en)=>window.BorgesI18n?window.BorgesI18n.text(pt,en):pt;
 const tabs=Array.from(document.querySelectorAll('[data-oscp-tab]'));
 function select(id,writeHash){
  if(!tabs.some(t=>t.dataset.oscpTab===id))id=null;
  tabs.forEach((t,i)=>{const active=t.dataset.oscpTab===id;t.setAttribute('aria-selected',String(active));t.tabIndex=active||(!id&&i===0)?0:-1;document.getElementById(t.dataset.oscpTab).hidden=!active;});
  if(writeHash)history.replaceState(null,'','#'+id);
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>select(tab.dataset.oscpTab,true));
  tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();select(tabs[next].dataset.oscpTab,true);});
 });
 select(location.hash.slice(1),false);
 window.addEventListener('hashchange',()=>select(location.hash.slice(1),false));
 const root=document.documentElement,themeButton=document.querySelector('[data-theme-toggle]');
 try{const saved=localStorage.getItem('borges-reading-theme');if(saved==='dark'||saved==='light')root.dataset.theme=saved;}catch{}
 function themeLabel(){themeButton.textContent=root.dataset.theme==='light'?T('Escuro','Dark'):T('Claro','Light');}
 themeButton.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';try{localStorage.setItem('borges-reading-theme',root.dataset.theme);}catch{}themeLabel();});
 themeLabel();
 let records=[];
 try{const data=JSON.parse(document.getElementById('oscp-labs-data').textContent);if(Array.isArray(data))records=data.filter(l=>l&&typeof l.name==='string'&&typeof l.slug==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(l.slug));}catch{}
 const grid=document.getElementById('lab-grid'),search=document.getElementById('lab-search'),filters=Array.from(document.querySelectorAll('[data-lab-filter]'));
 const counter=document.getElementById('lab-count');const requestedOS=new URLSearchParams(location.search).get('os');let filter=['Linux','Windows'].includes(requestedOS)?requestedOS:'all';
 filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.labFilter===filter)));
 function normalize(text){return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
 function element(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
 function render(){
  const en=window.BorgesI18n&&window.BorgesI18n.language==='en';
  const total=records.length,label=total===1?T('1 write-up publicado','1 published write-up'):total+T(' write-ups publicados',' published write-ups');
  document.querySelectorAll('[data-published-count]').forEach(el=>{el.textContent=label;});
  document.getElementById('lab-tools').hidden=!total;counter.hidden=!total;document.getElementById('labs-empty').hidden=!!total;
  const query=normalize(search.value||'');
  const shown=records.filter(l=>(filter==='all'||l.os===filter)&&normalize([l.name,l.os,l.platform,...(Array.isArray(l.tags)?l.tags:[])].join(' ')).includes(query));
  grid.replaceChildren();
  const systems=filter==='all'?['Linux','Windows']:[filter];
  systems.forEach(os=>{
   const groupRecords=shown.filter(l=>l.os===os);
   if(query&&!groupRecords.length)return;
   const group=element('section',undefined,'lab-os-group');
   group.setAttribute('aria-label',os);
   const head=element('div',undefined,'lab-os-head');head.appendChild(element('h3',os));head.appendChild(element('span',groupRecords.length===1?T('1 publicado','1 published'):groupRecords.length+T(' publicados',' published')));group.appendChild(head);
   const cards=element('div',undefined,'lab-group-grid');
   groupRecords.forEach(l=>{
    const card=element('a',undefined,'lab-card');card.href=l.slug+'.html?lang='+(en?'en':'pt');
    const mark=element('div',undefined,'lab-card-mark');const icon=element('span','>_','lab-card-terminal');icon.setAttribute('aria-hidden','true');mark.appendChild(icon);if(l.completed)mark.appendChild(element('span',T('✓ Concluída','✓ Completed'),'lab-done'));card.appendChild(mark);
    card.appendChild(element('span',[l.platform,l.os].filter(Boolean).join(' / '),'lab-meta'));
    card.appendChild(element('h4',l.name));
    const summary=l.summary&&(en?l.summary.en:l.summary.pt);if(typeof summary==='string')card.appendChild(element('p',summary));
    if(Array.isArray(l.tags)&&l.tags.length)card.appendChild(element('span',l.tags.join(' · '),'lab-meta'));
    card.appendChild(element('span',T('Ler write-up →','Read write-up →'),'lab-read'));cards.appendChild(card);
   });
   if(groupRecords.length)group.appendChild(cards);
   else group.appendChild(element('p',T('Os write-ups de '+os+' aparecerão aqui.','The '+os+' write-ups will appear here.'),'os-group-empty'));
   grid.appendChild(group);
  });
  counter.textContent=T('Exibindo ','Showing ')+shown.length+T(' de ',' of ')+total;
  document.getElementById('no-results').hidden=!total||!!shown.length||!query;
 }
 search.addEventListener('input',render);
 filters.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.labFilter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
 document.addEventListener('borges:languagechange',()=>{themeLabel();render();});
 render();
})();
