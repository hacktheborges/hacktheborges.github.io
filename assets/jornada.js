(function(){
 'use strict';
 const slug=document.body.dataset.story,story=(window.CERTIFICATION_STORIES||{})[slug]||{};
 let language='pt';try{language=localStorage.getItem('htb-pf-lang')==='en'?'en':'pt';}catch(e){}
 const dictionary={pt:{back:'← Todas as certificações',eyebrow:'CERTIFICAÇÕES / MINHA JORNADA',credential:'Ver credencial ↗',earned:'Certificação obtida',authorLabel:'POR',pending:'RELATO EM BREVE',pendingTitle:'Uma conquista, uma história.',pendingCopy:'Este espaço será dedicado à minha preparação, aos desafios e aos aprendizados ao obter esta certificação.',pendingNote:'O relato ainda não foi publicado.'},en:{back:'← All certifications',eyebrow:'CERTIFICATIONS / MY JOURNEY',credential:'View credential ↗',earned:'Certification earned',authorLabel:'BY',pending:'STORY COMING SOON',pendingTitle:'An achievement, a story.',pendingCopy:'This space will cover my preparation, the challenges and what I learned while earning this certification.',pendingNote:'The story has not been published yet.'}};
 function ready(data){return !!(data&&typeof data.introduction==='string'&&data.introduction.trim()&&Array.isArray(data.sections)&&data.sections.some(s=>s.heading&&Array.isArray(s.paragraphs)&&s.paragraphs.some(p=>typeof p==='string'&&p.trim())));}
 function render(){
  document.documentElement.lang=language==='pt'?'pt-BR':'en';
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=dictionary[language][el.dataset.i18n]);
  document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===language)));
  document.querySelectorAll('[data-date]').forEach(el=>el.textContent=new Date(el.dataset.date+'-15T12:00:00Z').toLocaleDateString(language==='pt'?'pt-BR':'en-US',{month:'short',year:'numeric',timeZone:'UTC'}));
  const local=story[language],fallback=story.pt,data=ready(local)?local:fallback,published=story.published===true&&ready(data);
  const pending=document.getElementById('pending-story'),article=document.getElementById('published-story'),toc=document.getElementById('story-toc');
  pending.hidden=published;article.hidden=!published;toc.hidden=!published;article.replaceChildren();toc.replaceChildren();
  document.getElementById('story-article').setAttribute('aria-labelledby',published?'story-title':'story-state-title');
  if(!published)return;
  article.lang=ready(local)?(language==='pt'?'pt-BR':'en'):'pt-BR';
  const intro=document.createElement('p');intro.className='story-intro';intro.textContent=data.introduction;article.append(intro);
  data.sections.forEach((section,index)=>{
   if(!section.heading||!Array.isArray(section.paragraphs)||!section.paragraphs.some(p=>typeof p==='string'&&p.trim()))return;
   const block=document.createElement('section');block.id='relato-'+(index+1);
   const heading=document.createElement('h2');heading.textContent=section.heading;block.append(heading);
   section.paragraphs.forEach(value=>{if(typeof value!=='string'||!value.trim())return;const p=document.createElement('p');p.textContent=value;block.append(p);});
   article.append(block);const link=document.createElement('a');link.href='#'+block.id;link.textContent=section.heading;toc.append(link);
  });
 }
 document.querySelectorAll('[data-lang]').forEach(el=>el.addEventListener('click',()=>{language=el.dataset.lang;try{localStorage.setItem('htb-pf-lang',language);}catch(e){}render();}));
 document.getElementById('story-year').textContent=new Date().getFullYear();render();
})();
