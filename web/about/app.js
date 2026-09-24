(() => {
  'use strict';
  const root = document.documentElement;
  const story = document.getElementById('story');
  const screen = document.getElementById('storyScreen');
  const scenes = [...document.querySelectorAll('.scene')];
  const controls = document.getElementById('storyControls');
  const links = [...document.querySelectorAll('.chapter-nav a')];
  const previous = document.getElementById('previousScene');
  const next = document.getElementById('nextScene');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 900px) and (min-height: 700px)');
  const clamp = (n, a=0, b=1) => Math.max(a,Math.min(b,n));
  const ease = n => { n=clamp(n);return n*n*(3-2*n); };
  const lerp = (a,b,t) => a+(b-a)*t;
  let cinematic = false, current = 0, target = 0, active = 0;
  let frame = 0, lastTime = 0, step = 1, top = 0, resizeTimer;
  const live = new Set();

  function clip(type, progress) {
    const p=ease(progress), remain=(1-p)*100;
    if(type==='horizon')return `inset(${remain*.5}% 0 ${remain*.5}% 0)`;
    if(type==='aperture')return `inset(${remain*.11}% ${remain*.36}% ${remain*.11}% ${remain*.36}%)`;
    if(type==='dissolve')return 'inset(0)';
    return `inset(0 0 0 ${remain}%)`;
  }
  function paintScene(index, phase, incoming, reveal) {
    const scene=scenes[index];if(!scene)return;
    live.add(index);scene.classList.add('is-visible');scene.style.zIndex=incoming?'2':'1';
    scene.style.clipPath=incoming?clip(scene.dataset.transition,reveal):'inset(0)';
    scene.style.opacity=incoming&&scene.dataset.transition==='dissolve'?String(ease(reveal)):'1';
    const imageScale=incoming?lerp(1.07,1.035,ease(reveal)):lerp(1.035,1.005,clamp(phase/.85));
    scene.style.setProperty('--camera-scale',imageScale.toFixed(4));
    scene.style.setProperty('--camera-y',`${lerp(5,-7,clamp(phase))}px`);
    scene.style.setProperty('--camera-x',`${lerp(-3,3,clamp(phase))}px`);
    const copyIn=incoming?ease(clamp((reveal-.22)/.78)):1;
    scene.style.setProperty('--copy-y',`${(1-copyIn)*26}px`);
    scene.style.setProperty('--copy-opacity',copyIn.toFixed(3));
    scene.style.setProperty('--inset-y',`${lerp(40,-6,incoming?ease(reveal):ease(clamp(phase*2+.55)))}px`);
    scene.style.setProperty('--inset-rotation',`${lerp(-2,0,incoming?ease(reveal):1)}deg`);
    scene.style.setProperty('--inset-scale',lerp(1.05,1,clamp(phase)).toFixed(3));
    scene.style.setProperty('--word-x',`${-phase*26}px`);
    scene.style.setProperty('--line-progress',String(ease(clamp(phase*2+.25))));
  }
  const routeFigures=[...document.querySelectorAll('.route-inset')];
  const spotFigures=[...document.querySelectorAll('.spot-insets figure')];
  const memorialInset=document.querySelector('.memorial-inset');
  const cancelAnimations=element=>element.getAnimations().forEach(animation=>animation.cancel());
  function resetEntrance(index){
    if(index===2)routeFigures.forEach(figure=>{figure.classList.remove('is-entered');cancelAnimations(figure);});
    if(index===3)spotFigures.forEach(figure=>{figure.classList.remove('is-entered');cancelAnimations(figure);cancelAnimations(figure.querySelector('figcaption'));});
    if(index===4){memorialInset.classList.remove('is-entered');cancelAnimations(memorialInset);}
  }
  function playRouteCross(){
    resetEntrance(2);
    routeFigures.forEach(figure=>{
      figure.classList.add('is-entered');
      if(reduced.matches)return;
      const direction=figure.classList.contains('route-inset--right')?-1:1;
      figure.animate([{transform:'translateX('+direction*innerWidth*1.3+'px)',opacity:0},{transform:'translateX(0)',opacity:1}],{duration:1100,easing:'cubic-bezier(.22,.72,.16,1)',fill:'backwards'});
    });
  }
  function playSpotEntrance(){
    resetEntrance(3);
    spotFigures.forEach((figure,index)=>{
      figure.classList.add('is-entered');
      if(reduced.matches)return;
      const delay=index*140;
      const distance=figure.getBoundingClientRect().right+24;
      figure.animate([
        {transform:`translateX(${-distance}px)`,opacity:0},
        {transform:'translateX(0)',opacity:1}
      ],{duration:700,delay,easing:'cubic-bezier(.22,.72,.16,1)',fill:'backwards'});
      figure.querySelector('figcaption').animate([{opacity:0},{opacity:1}],{
        duration:320,delay:delay+700,easing:'ease-out',fill:'backwards'
      });
    });
  }
  function playMemorialEntrance(){
    resetEntrance(4);
    memorialInset.classList.add('is-entered');
    if(reduced.matches)return;
    memorialInset.animate([
      {clipPath:'inset(0 0 100% 0)',opacity:0},
      {clipPath:'inset(0 0 88% 0)',opacity:1,offset:.15},
      {clipPath:'inset(0)',opacity:1}
    ],{duration:1100,easing:'cubic-bezier(.22,.72,.16,1)',fill:'backwards'});
  }
  function setActive(index, fraction) {
    if(index!==active&&index===2)playRouteCross();
    if(index!==active&&index===3)playSpotEntrance();
    if(index!==active&&index===4)playMemorialEntrance();
    active=index;
    document.getElementById('chapterCount').textContent=`${String(index+1).padStart(2,'0')} / 08`;
    document.getElementById('chapterLabel').textContent=scenes[index].dataset.title;
    links.forEach((link,i)=>{
      if(i===index){link.setAttribute('aria-current','step');link.style.setProperty('--chapter-progress',String(clamp(fraction,.04,1)));}
      else link.removeAttribute('aria-current');
      link.classList.toggle('is-complete',i<index);
    });
    scenes.forEach((scene,i)=>{
      scene.inert=i!==index;
      scene.setAttribute('aria-hidden',String(i!==index));
    });
    previous.disabled=index===0;next.disabled=index===scenes.length-1;
  }
  function render() {
    if(!cinematic)return;
    const unit=clamp(current,0,scenes.length-1+.72);
    const base=Math.min(scenes.length-1,Math.floor(unit));
    const phase=unit-base;
    const reveal=clamp((phase-.72)/.28);
    const former=[...live];live.clear();
    paintScene(base,phase,false,1);
    if(reveal>0&&base<scenes.length-1)paintScene(base+1,0,true,reveal);
    former.forEach(index=>{if(!live.has(index)){scenes[index].classList.remove('is-visible');scenes[index].style.opacity='0';resetEntrance(index);}});
    const chosen=reveal>.55&&base<scenes.length-1?base+1:base;
    setActive(chosen,chosen===base?phase/.72:0);
    screen.dataset.scene=String(chosen+1);
  }
  function tick(time) {
    frame=0;if(!cinematic)return;
    const delta=lastTime?Math.min(50,time-lastTime):16.67;lastTime=time;
    current=lerp(current,target,1-Math.exp(-delta/65));
    if(Math.abs(target-current)<.0005)current=target;
    render();
    if(current!==target)frame=requestAnimationFrame(tick);
  }
  function onScroll() {
    if(!cinematic)return;
    target=clamp((window.scrollY-top)/step,0,scenes.length-1+.72);
    if(!frame){lastTime=0;frame=requestAnimationFrame(tick);}
  }
  function measure() {
    if(!cinematic)return;
    const height=screen.clientHeight;
    step=height*1.08;
    story.style.setProperty('--story-height',`${height+step*(scenes.length-1+.72)}px`);
    top=story.getBoundingClientRect().top+window.scrollY;
  }
  function goTo(index, smooth=true) {
    index=clamp(index,0,scenes.length-1);
    if(cinematic){
      window.scrollTo({top:top+(index+.14)*step,behavior:smooth&&!reduced.matches?'smooth':'instant'});
    }else{
      scenes[index].scrollIntoView({behavior:smooth&&!reduced.matches?'smooth':'instant',block:'start'});
    }
  }
  function resetStyles() {
    [2,3,4].forEach(resetEntrance);
    scenes.forEach(scene=>{scene.removeAttribute('style');scene.classList.remove('is-visible');scene.inert=false;scene.removeAttribute('aria-hidden');});
    live.clear();
  }
  function configure(keepPosition=false) {
    const desired=desktop.matches&&!reduced.matches;
    const old=cinematic;
    const saved=old?active:scenes.reduce((best,scene,i)=>Math.abs(scene.getBoundingClientRect().top)<Math.abs(scenes[best].getBoundingClientRect().top)?i:best,0);
    if(frame)cancelAnimationFrame(frame);frame=0;
    cinematic=desired;root.classList.toggle('is-cinematic',cinematic);
    resetStyles();active=-1;controls.hidden=!cinematic;
    if(cinematic){measure();current=target=keepPosition?(saved+.14):clamp((window.scrollY-top)/step,0,scenes.length-1+.72);render();}
    else story.style.removeProperty('--story-height');
    if(keepPosition&&old!==cinematic)requestAnimationFrame(()=>goTo(saved,false));
  }
  document.querySelectorAll('a[href^="#chapter-"]').forEach(link=>link.addEventListener('click',event=>{
    const index=scenes.findIndex(scene=>'#'+scene.id===link.getAttribute('href'));
    if(index<0)return;
    if(cinematic){event.preventDefault();history.replaceState(null,'','#'+scenes[index].id);goTo(index);}
  }));
  previous.addEventListener('click',()=>goTo(active-1));next.addEventListener('click',()=>goTo(active+1));
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{
    const was=cinematic;if(was=== (desktop.matches&&!reduced.matches)){if(cinematic){const position=current;measure();window.scrollTo({top:top+position*step,behavior:'instant'});onScroll();}}
    else configure(true);
  },120);},{passive:true});
  reduced.addEventListener('change',()=>configure(true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else onScroll();});
  window.addEventListener('hashchange',()=>{const i=scenes.findIndex(s=>'#'+s.id===location.hash);if(i>=0)goTo(i,false)});
  window.addEventListener('pageshow',()=>{if(cinematic){measure();onScroll();}});
  const previews=[['sskr_web1.webp','SSKR 참가 안내 화면','SSKR 참가 페이지'],['sskr_web2.webp','SSKR 스팟 지도 화면','스팟 지도 페이지'],['sskr_web3.webp','SSKR 공개 메모리얼 화면','메모리얼 페이지']];
  const preview=document.querySelector('.service-preview');
  const previewCaption=document.getElementById('service-preview-caption');
  let currentImage=document.getElementById('servicePreview');
  let spareImage=currentImage.cloneNode(false);
  currentImage.classList.add('is-current');
  spareImage.removeAttribute('id');spareImage.removeAttribute('src');spareImage.alt='';spareImage.setAttribute('aria-hidden','true');
  currentImage.after(spareImage);
  let previewRequest=0;
  const previewLinks=[...document.querySelectorAll('[data-preview]')];
  function hidePreview(event){
    if(event.relatedTarget?.closest?.('[data-preview]')||previewLinks.includes(document.activeElement))return;
    previewRequest++;
    preview.classList.remove('is-active');
  }
  previewLinks.forEach(link=>{
    const show=async()=>{
      const request=++previewRequest;
      const [file,alt,caption]=previews[Number(link.dataset.preview)-1];
      const src='/about/assets/'+file;
      if(currentImage.getAttribute('src')!==src){
        const loaded=new Image();loaded.src=src;
        try{await loaded.decode();}catch{return;}
        if(request!==previewRequest)return;
        spareImage.src=src;spareImage.alt=alt;spareImage.removeAttribute('aria-hidden');
        currentImage.removeAttribute('id');spareImage.id='servicePreview';
        currentImage.setAttribute('aria-hidden','true');
        currentImage.classList.remove('is-current');spareImage.classList.add('is-current');
        [currentImage,spareImage]=[spareImage,currentImage];
      }
      if(request!==previewRequest)return;
      previewCaption.textContent=caption;
      preview.classList.add('is-active');
    };
    link.addEventListener('pointerenter',show);link.addEventListener('focus',show);
    link.addEventListener('pointerleave',hidePreview);link.addEventListener('blur',hidePreview);
  });
  const routeObserver=new IntersectionObserver(entries=>{if(!cinematic&&entries.some(entry=>entry.isIntersecting))playRouteCross();},{threshold:.2});
  routeObserver.observe(scenes[2]);
  const spotObserver=new IntersectionObserver(entries=>{
    if(!cinematic&&entries.some(entry=>entry.isIntersecting))playSpotEntrance();
  },{threshold:.2});
  spotObserver.observe(document.querySelector('.spot-insets'));
  const memorialObserver=new IntersectionObserver(entries=>{
    if(!cinematic&&entries.some(entry=>entry.isIntersecting))playMemorialEntrance();
  },{threshold:.2});
  memorialObserver.observe(memorialInset);
  configure();
  if(location.hash){const i=scenes.findIndex(s=>'#'+s.id===location.hash);if(i>=0)requestAnimationFrame(()=>goTo(i,false));}
})();
