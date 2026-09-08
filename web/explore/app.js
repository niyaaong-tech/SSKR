(() => {
  'use strict';
  const places = window.SSKR_PLACES;
  const $ = id => document.getElementById(id);
  const kindLabels = {start:'STARTING POINT',spot:'LOCAL SPOT',finish:'FINISH POINT'};
  const corridorLabels = {north:'북부 횡단',central:'중부 횡단',south:'남부 횡단',west:'대천 접근'};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let kind = 'all', corridor = 'all', selected = places.find(p=>p.id===location.hash.slice(1)) || places[0];
  let map, layer, markers = new Map(), visible = places;
  const counts = {start:0,spot:0,finish:0};
  places.forEach(p=>p.code=p.kind==='finish'?'F':(p.kind==='start'?'S':'')+String(++counts[p.kind]).padStart(2,'0'));
  function el(tag, className, text) { const n=document.createElement(tag); if(className)n.className=className;if(text!==undefined)n.textContent=text;return n; }
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
    $('detail-index').textContent=String(visible.indexOf(place)+1).padStart(2,'0')+' / '+String(visible.length).padStart(2,'0');
    document.querySelectorAll('.place-row').forEach(n=>{const active=n.dataset.id===place.id;n.classList.toggle('selected',active);n.setAttribute('aria-pressed',String(active));});
    markers.forEach((m,id)=>{m.getElement()?.classList.toggle('selected',id===place.id);m.setZIndexOffset(id===place.id?1000:0)});
    if(animate&&!reduced){const panel=$('place-detail');panel.classList.remove('entering');void panel.offsetWidth;panel.classList.add('entering');}
  }
  function selectPlace(place,fly=true) {
    setDetail(place);history.replaceState(null,'','#'+place.id);
    if(map&&fly)map.flyTo([place.lat,place.lng],Math.max(map.getZoom(),9),{animate:!reduced,duration:.85});
  }
  function tooltip(place) {
    const box=el('section');
    if(place.image){const img=el('img');img.src=place.image;img.alt='';img.loading='lazy';img.onerror=()=>img.remove();box.append(img)}
    const copy=el('div');copy.append(el('small','',place.region+' · '+place.code),el('strong','',place.name));box.append(copy);return box;
  }
  function fitVisible() {
    if(!map||!visible.length)return;
    map.fitBounds(visible.map(p=>[p.lat,p.lng]),{paddingTopLeft:[65,85],paddingBottomRight:[45,70],maxZoom:10,animate:!reduced,duration:.7});
  }
  function render() {
    visible=places.filter(p=>(kind==='all'||p.kind===kind)&&(corridor==='all'||p.corridor===corridor));
    $('result-count').textContent=visible.length+'곳';
    const list=$('place-list');list.replaceChildren();
    if(!visible.length)list.append(el('p','empty-list','이 권역에는 해당 유형의 장소가 없습니다.'));
    visible.forEach(place=>{
      const button=el('button','place-row');button.type='button';button.dataset.id=place.id;
      button.setAttribute('aria-label',place.name+' 상세 정보');button.setAttribute('aria-pressed','false');
      const copy=el('span');copy.append(el('strong','',place.name),el('small','',place.region+' · '+(place.kind==='start'?'출발 후보':place.kind==='finish'?'도착 후보':corridorLabels[place.corridor])));
      button.append(el('span','number',place.code),copy,el('span','arrow','↗'));
      button.addEventListener('click',()=>selectPlace(place));
      button.addEventListener('mouseenter',()=>markers.get(place.id)?.openTooltip());button.addEventListener('mouseleave',()=>markers.get(place.id)?.closeTooltip());
      button.addEventListener('focus',()=>markers.get(place.id)?.openTooltip());button.addEventListener('blur',()=>markers.get(place.id)?.closeTooltip());
      list.append(button);
    });
    if(map){layer.clearLayers();markers.clear();visible.forEach(place=>{
      const size=place.kind==='spot'?26:32;
      const marker=L.marker([place.lat,place.lng],{icon:L.divIcon({className:'place-marker '+place.kind,html:'<span class="marker-disc">'+place.code+'</span>',iconSize:[size,size],iconAnchor:[size/2,size/2]}),title:place.name,alt:place.name+' 상세 정보',keyboard:true,riseOnHover:true});
      marker.bindTooltip(tooltip(place),{direction:'top',offset:[0,-15],className:'place-tooltip',opacity:1});
      marker.on('click',()=>selectPlace(place));marker.addTo(layer);marker.getElement()?.setAttribute('aria-label',place.name+' 상세 정보');markers.set(place.id,marker);
    });}
    $('previous-place').disabled=$('next-place').disabled=visible.length<2;
    $('place-detail').hidden=!visible.length;
    if(visible.length)setDetail(visible.includes(selected)?selected:visible[0],false);
    fitVisible();
  }
  if(window.L){
    map=L.map('map',{zoomControl:false,scrollWheelZoom:false,zoomSnap:.25,zoomDelta:.5,minZoom:6,maxZoom:15,maxBounds:[[32,123],[40,132]],maxBoundsViscosity:.75}).setView([36.5,127.8],7);
    let tileFailed=false;
    const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
    tiles.on('tileerror',()=>{tileFailed=true;$('map-status').textContent='일부 지도 타일을 불러오지 못했습니다. 목록에서 장소를 선택할 수 있습니다.'});
    tiles.on('load',()=>{if(!tileFailed)$('map-status').textContent=''});
    layer=L.layerGroup().addTo(map);
    map.on('focus',()=>map.scrollWheelZoom.enable());map.on('blur',()=>map.scrollWheelZoom.disable());
    let resizeTimer;
    new ResizeObserver(()=>{map.invalidateSize({pan:false});clearTimeout(resizeTimer);resizeTimer=setTimeout(fitVisible,150)}).observe($('map'));
  }else{$('map-status').textContent='지도 연결이 원활하지 않습니다. 장소 목록과 상세 정보는 계속 이용할 수 있습니다.';['zoom-in','zoom-out','reset-map'].forEach(id=>$(id).disabled=true);}
  document.querySelectorAll('[data-kind]').forEach(button=>button.addEventListener('click',()=>{
    kind=button.dataset.kind;document.querySelectorAll('[data-kind]').forEach(n=>{n.classList.toggle('active',n===button);n.setAttribute('aria-pressed',String(n===button))});render();
  }));
  $('corridor').addEventListener('change',e=>{corridor=e.target.value;render()});
  $('zoom-in').addEventListener('click',()=>map?.zoomIn());$('zoom-out').addEventListener('click',()=>map?.zoomOut());$('reset-map').addEventListener('click',fitVisible);
  function cycle(direction){if(!visible.length)return;const i=visible.indexOf(selected);selectPlace(visible[(i+direction+visible.length)%visible.length]);}
  $('previous-place').addEventListener('click',()=>cycle(-1));$('next-place').addEventListener('click',()=>cycle(1));
  window.addEventListener('hashchange',()=>{const p=places.find(p=>p.id===location.hash.slice(1));if(p){kind='all';corridor='all';$('corridor').value='all';document.querySelectorAll('[data-kind]').forEach(n=>{n.classList.toggle('active',n.dataset.kind==='all');n.setAttribute('aria-pressed',String(n.dataset.kind==='all'))});selected=p;render();selectPlace(p)}});
  render();
})();
