(()=>{'use strict';
  const $=id=>document.getElementById(id),catalog=window.SSKR_SPOT_CATALOG,ids=new Set(window.SSKR_PLACES.map(p=>p.id));
  const numbers=new Map(catalog.filter(p=>p.kind==='spot').map((p,i)=>[p.id,i+1]));
  const places=catalog.filter(p=>ids.has(p.id)).map(p=>({...p,code:p.kind==='start'?'출':p.kind==='finish'?'도':numbers.get(p.id),number:p.kind==='start'?'출':p.kind==='finish'?'도':numbers.get(p.id)}));
  const kindLabels={start:'STARTING POINT',spot:'LOCAL SPOT',finish:'FINISH POINT'},corridorLabels={north:'북부 횡단',central:'중부 횡단',south:'남부 횡단',west:'대천 접근'},reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let kind='all',corridor='all',selected=places.find(p=>p.id===location.hash.slice(1))||places[0],visible=places;
  function setDetail(place, animate=true) {
    selected=place;
    $('detail-label').textContent=kindLabels[place.kind]+' / '+place.code+' · '+corridorLabels[place.corridor];
    $('detail-name').textContent=place.name; $('detail-lead').textContent=place.lead;
    $('detail-description').textContent=place.description; $('detail-region').textContent=place.region;
    $('detail-note').textContent=place.note; $('detail-source').href=place.source;
    $('detail-map').href='https://map.naver.com/p/search/'+encodeURIComponent(place.region.split(' · ')[1]+' '+place.name);
    $('photo-source').href=place.source;
    const img=$('detail-image');
    img.onload=()=>{$('photo-unavailable').hidden=true;img.hidden=false};
    img.onerror=()=>{$('photo-unavailable').hidden=false;img.hidden=true;$('image-credit').textContent=''};
    img.alt=place.name+'의 풍경';
    if(place.image){img.hidden=false;img.src=place.image;$('photo-unavailable').hidden=true;}else{img.removeAttribute('src');img.hidden=true;$('photo-unavailable').hidden=false;}
    $('image-credit').textContent=place.image?place.photoCredit:'';
    $('image-credit').href=place.photoSource||place.source;
    $('detail-index').textContent=String(visible.indexOf(place)+1).padStart(2,'0')+' / '+String(visible.length).padStart(2,'0');
    if(animate&&!reduced){const panel=$('place-detail');panel.classList.remove('entering');void panel.offsetWidth;panel.classList.add('entering');}
  }

  const viewer=SSKR_MAP.mount($('explore-map'),{items:places,catalog,initialId:selected.id,inView:true,onSelect:p=>{setDetail(p);history.replaceState(null,'','#'+p.id);},onOpen:()=>{$('place-detail').scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});}});
  function render(){visible=places.filter(p=>(kind==='all'||p.kind===kind)&&(corridor==='all'||p.corridor===corridor));selected=visible.includes(selected)?selected:visible[0];viewer.setItems(visible,{selectedId:selected?.id});$('place-detail').hidden=!visible.length;$('previous-place').disabled=$('next-place').disabled=visible.length<2;if(selected)setDetail(selected,false);}
  document.querySelectorAll('[data-kind]').forEach(button=>button.addEventListener('click',()=>{kind=button.dataset.kind;document.querySelectorAll('[data-kind]').forEach(n=>{n.classList.toggle('active',n===button);n.setAttribute('aria-pressed',String(n===button));});render();}));
  $('corridor').addEventListener('change',e=>{corridor=e.target.value;render();});
  function cycle(direction){if(!visible.length)return;const i=visible.indexOf(selected);viewer.select(visible[(i+direction+visible.length)%visible.length].id);}
  $('previous-place').addEventListener('click',()=>cycle(-1));$('next-place').addEventListener('click',()=>cycle(1));
  $('explore-return').addEventListener('click',()=>viewer.returnToMap());
  window.addEventListener('hashchange',()=>{const p=places.find(p=>p.id===location.hash.slice(1));if(p){kind='all';corridor='all';$('corridor').value='all';selected=p;document.querySelectorAll('[data-kind]').forEach(n=>{n.classList.toggle('active',n.dataset.kind==='all');n.setAttribute('aria-pressed',String(n.dataset.kind==='all'))});render();}});
  render();
})();
