(() => {
  'use strict';
  const root=document.documentElement;
  const chapters=[...document.querySelectorAll('.chapter')];
  const links=[...document.querySelectorAll('.chapter-nav a')];
  const toggle=document.getElementById('motionToggle');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let userReading=false,frame=0;
  function configure(){root.classList.toggle('motion-enabled',!reduced.matches&&!userReading);root.classList.toggle('reading-mode',userReading);toggle.hidden=reduced.matches;toggle.textContent=userReading?'모션 켜기':'모션 줄이기';toggle.setAttribute('aria-pressed',String(userReading));}
  function update(){frame=0;const line=innerHeight*.35;let active=0;chapters.forEach((s,i)=>{if(s.getBoundingClientRect().top<=line)active=i;});links.forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('not-yet-visible');observer.unobserve(entry.target);}}),{threshold:.08});
  chapters.forEach(chapter=>{if(chapter.getBoundingClientRect().top>innerHeight)chapter.classList.add('not-yet-visible');observer.observe(chapter);});
  links.forEach(link=>link.addEventListener('click',()=>{const chapter=document.querySelector(link.hash);chapter?.classList.remove('not-yet-visible');}));
  toggle.addEventListener('click',()=>{userReading=!userReading;configure();});
  reduced.addEventListener('change',configure);
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  addEventListener('resize',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  addEventListener('pageshow',update);
  configure();update();
})();
