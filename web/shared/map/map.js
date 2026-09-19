(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.SSKR_MAP=Object.freeze(api);})(typeof globalThis!=='undefined'?globalThis:this,root=>{
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function cardSlots(count,mobile){const first=count%4||4,split=Math.ceil(count/2);return Array.from({length:count},(_,i)=>mobile?{row:i<first?1:2+Math.floor((i-first)/4),column:i<first?i+1:1+(i-first)%4}:{side:i<split?0:1,row:i<split?i:i-split});}
 function clusterPlaces(places,project,size=50,selectedId='',pinnedIds=new Set()){
  const cells=new Map();places.forEach(place=>{const p=project(place),key=place.id===selectedId||pinnedIds.has(place.id)?place.id:Math.floor(p.x/size)+':'+Math.floor(p.y/size);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(place)});return [...cells.values()];
 }
 const photoCard=p=>`${p.image?`<img src="${esc(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:''}<b class="spot-mini-number ${esc(p.kind)}">${esc(p.number)}</b><span class="spot-photo-caption"><small>${esc(p.region)}</small><strong>${esc(p.name)}</strong></span>`;
 function mount(host,options={}){
  const events=new AbortController(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let items=options.items||[],selected=items.find(p=>p.id===options.initialId)||null,inView=options.inView??true,page=0,pageItems=[],map,layer,routeLayer,highlight,observer,resizeTimer,creditTimer,creditObserver,creditPinned=false,disposed=false,returnY=0;
  const catalog=options.catalog||items;let markers=new Map();
  host.classList.add('sskr-map');
  host.innerHTML=`<div class="spot-workspace"><div class="spot-map-wrap"><div class="spot-map" tabindex="0" role="region" aria-label="대한민국 SSKR 장소 지도"></div><div class="spot-list-head"><h3><span data-result-label></span> <span data-result-count></span></h3>${options.inViewControl===false?'':`<label><input type="checkbox" data-in-view ${inView?'checked':''}> 지도 안에서만</label>`}</div><div class="spot-map-controls" role="group" aria-label="지도 제어"><button type="button" data-action="zoom-in" aria-label="지도 확대">+</button><button type="button" data-action="zoom-out" aria-label="지도 축소">−</button><button type="button" data-action="fit" aria-label="${options.route?'전체 경로':'전체 장소'} 보기">↺</button></div><div class="spot-list" aria-label="지도 장소 목록"></div><div class="spot-card-pages"><button type="button" data-action="previous-cards" aria-label="이전 장소 목록">‹</button><span data-card-page aria-live="polite"></span><button type="button" data-action="next-cards" aria-label="다음 장소 목록">›</button></div><p class="spot-map-status" role="status"></p><details class="spot-attribution" open><summary>지도 출처</summary><div><a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> · <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a><br>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a><br>대한민국 경계: <a href="https://www.openstreetmap.org/relation/307756" target="_blank" rel="noopener">OpenStreetMap</a></div></details></div></div>`;
  const $=s=>host.querySelector(s),listen=(node,type,fn)=>node?.addEventListener(type,fn,{signal:events.signal});
  const credits=$('.spot-attribution'),collapse=()=>{if(!creditPinned&&!credits.contains(document.activeElement))credits.open=false;};
  listen(credits.querySelector('summary'),'click',()=>{creditPinned=!credits.open;clearTimeout(creditTimer)});
  listen($('.spot-map'),'pointerdown',collapse);listen($('.spot-map'),'wheel',collapse);
  creditObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){creditTimer=setTimeout(collapse,5000);creditObserver.disconnect();}},{threshold:.25});creditObserver.observe($('.spot-map-wrap'));
  root.SSKR_MAP_INTERACTION.bindWheel({getMap:()=>map,panel:()=>$('.spot-map'),signal:events.signal});
  function sizing(){const height=$('.spot-map-wrap').clientHeight,mobile=matchMedia('(max-width:700px)').matches,cardHeight=mobile?Math.min(74,Math.max(34,height*.105)):Math.min(104,Math.max(24,(height-146)/6));$('.spot-map-wrap').style.setProperty('--spot-card-height',cardHeight+'px');return {height,mobile,cardHeight};}
  function padding(){const {height,mobile,cardHeight}=sizing();if(mobile)return {paddingTopLeft:[20,Math.min(90,height*.14)],paddingBottomRight:[20,Math.min(cardHeight*3+96,height*.43)]};const side=Math.min(172,Math.max(88,cardHeight*1.85))+20;return {paddingTopLeft:[side,Math.min(115,height*.2)],paddingBottomRight:[side,60]};}
  function limits(){if(!catalog.length)return;const wasOverview=Math.abs(map.getZoom()-map.getMinZoom())<.26;map.setMinZoom(6);const bounds=root.L.latLngBounds(catalog.map(p=>[p.lat,p.lng])),pad=padding(),minimum=map.getBoundsZoom(bounds,false,root.L.point(pad.paddingTopLeft).add(pad.paddingBottomRight));const ne=map.project(bounds.getNorthEast(),minimum),sw=map.project(bounds.getSouthWest(),minimum),offset=root.L.point(pad.paddingBottomRight).subtract(pad.paddingTopLeft).divideBy(2),center=ne.add(sw).divideBy(2).add(offset),half=map.getSize().divideBy(2);map.setMaxBounds(root.L.latLngBounds(map.unproject(center.subtract(half),minimum),map.unproject(center.add(half),minimum)));map.setMinZoom(minimum);if(wasOverview)map.setZoom(minimum,{animate:false});}
  function renderCards(focus=false){
   const list=items.filter(p=>!inView||!map||map.getBounds().contains([p.lat,p.lng]));const {mobile}=sizing();
   if(focus){const i=list.findIndex(p=>p.id===selected?.id);if(i>=0)page=Math.floor(i/12);}
   page=Math.max(0,Math.min(page,Math.ceil(list.length/12)-1));pageItems=list.slice(page*12,page*12+12);
   const slots=cardSlots(pageItems.length,mobile),card=(p,i)=>`<div class="spot-mini-card"${mobile?` style="grid-row:${slots[i].row};grid-column:${slots[i].column}"`:''}><button type="button" class="spot-mini-select spot-photo-card" data-place="${esc(p.id)}" aria-label="${esc(p.name)} ${esc(p.meta||'')} 상세 보기" aria-pressed="${p.id===selected?.id}">${photoCard(p)}</button></div>`;
   const cards=pageItems.map(card),split=Math.ceil(cards.length/2);
   $('.spot-list').innerHTML=cards.length?(mobile?cards.join(''):`<div class="spot-card-column">${cards.slice(0,split).join('')}</div><div class="spot-card-column">${cards.slice(split).join('')}</div>`):'<div class="spot-list-empty">현재 지도 안에는 장소가 없습니다.</div>';
   $('.spot-list').style.setProperty('--spot-rows',Math.max(1,Math.ceil(cards.length/4)));
   $('[data-result-label]').textContent=inView?'지도 안':options.route?'방문 장소':'검색 결과';$('[data-result-count]').textContent=list.length+'곳';
   $('.spot-card-pages').hidden=list.length<=12;$('.spot-map-wrap').classList.toggle('has-pages',list.length>12);
   $('[data-card-page]').textContent=list.length?`${page*12+1}–${page*12+cards.length} / ${list.length}`:'0 / 0';
   $('[data-action="previous-cards"]').disabled=page===0;$('[data-action="next-cards"]').disabled=(page+1)*12>=list.length;
   $('.spot-list').querySelectorAll('img').forEach(img=>img.onerror=()=>img.remove());
  }
  function select(item,{open=false,fly=false}={}){
   selected=item;renderCards(true);renderMarkers();options.onSelect?.(item);
   if(fly&&map)map.flyTo([item.lat,item.lng],Math.max(map.getZoom(),11),{animate:!reduced,duration:.4});
   if(open){returnY=scrollY;options.onOpen?.(item);}
  }
  function renderMarkers(){
   if(!map||disposed)return;layer.clearLayers();markers.clear();
   const groups=options.cluster===false?items.map(p=>[p]):clusterPlaces(items,p=>map.project([p.lat,p.lng],map.getZoom()),50,selected?.id,new Set(pageItems.map(p=>p.id)));
   groups.forEach(group=>{
    const p=group[0],multiple=group.length>1,point=multiple?[group.reduce((n,p)=>n+p.lat,0)/group.length,group.reduce((n,p)=>n+p.lng,0)/group.length]:[p.lat,p.lng];
    const marker=root.L.marker(point,{keyboard:true,title:multiple?group.length+'개 장소 확대':p.name,icon:root.L.divIcon({className:'spot-pin '+(multiple?'cluster':p.kind)+(selected?.id===p.id&&!multiple?' is-selected':''),html:`<span>${esc(multiple?group.length+'곳':p.number)}</span>`,iconSize:multiple?[36,36]:[18,18],iconAnchor:multiple?[18,18]:[9,9]})});
    const tip=document.createElement(multiple?'div':'button');tip.className=multiple?'spot-tip-copy':'spot-photo-card';
    if(multiple)tip.innerHTML=`<strong>${group.length}개 장소</strong><span>${group.slice(0,3).map(p=>esc(p.name)).join(' · ')}</span>`;
    else{tip.type='button';tip.setAttribute('aria-label',p.name+' 상세 보기');tip.innerHTML=photoCard(p);root.L.DomEvent.disableClickPropagation(tip);tip.addEventListener('click',()=>select(p,{open:true}));const img=tip.querySelector('img');if(img)img.onerror=()=>img.remove();}
    marker.bindTooltip(tip,{direction:'top',offset:[0,-10],className:'spot-tooltip'+(multiple?' spot-tooltip-group':''),opacity:1,interactive:!multiple,permanent:!multiple&&selected?.id===p.id});
    marker.on('click',event=>{if(event.originalEvent)root.L.DomEvent.stopPropagation(event.originalEvent);if(!multiple){requestAnimationFrame(()=>{if(!disposed)select(p)});return;}if(map.getZoom()>=16){select(p);return;}map.fitBounds(group.map(p=>[p.lat,p.lng]),{padding:[70,70],maxZoom:Math.min(16,map.getZoom()+2),animate:!reduced});});
    marker.addTo(layer);if(!multiple)markers.set(p.id,marker);
   });
  }
  function fit(){if(!map)return;const bounds=routeLayer?.getBounds();if(bounds?.isValid())map.fitBounds(bounds,{...padding(),maxZoom:12,animate:!reduced,duration:.35});else if(items.length)map.fitBounds(items.map(p=>[p.lat,p.lng]),{...padding(),maxZoom:12,animate:!reduced,duration:.35});}
  if(root.L){
   map=root.L.map($('.spot-map'),{zoomControl:false,attributionControl:false,scrollWheelZoom:false,minZoom:6,maxZoom:16,zoomSnap:.25,maxBoundsViscosity:1}).setView([36.5,127.8],7);layer=root.L.layerGroup().addTo(map);limits();
   if(root.L.maplibreGL&&root.maplibregl){try{const backdrop=root.L.maplibreGL({style:'/web/shared/map/style.json',transformRequest:url=>({url:new URL(url,location.href).href}),interactive:false,attributionControl:false}).addTo(map);backdrop.getMaplibreMap().on('error',()=>{if(!disposed)$('.spot-map-status').textContent='지도 배경을 불러오지 못했습니다. 장소 카드는 계속 이용할 수 있습니다.';});backdrop.getMaplibreMap().on('idle',()=>{if(!disposed)$('.spot-map-status').textContent='';});}catch{$('.spot-map-status').textContent='지도 배경을 표시할 수 없습니다. 장소 카드는 계속 이용할 수 있습니다.';}}
   else $('.spot-map-status').textContent='지도 배경을 불러오지 못했습니다. 장소 카드는 계속 이용할 수 있습니다.';
   if(options.route?.length){routeLayer=root.L.featureGroup().addTo(map);options.route.forEach(coords=>root.L.polyline(coords,{color:'#47695b',weight:4,opacity:.95}).addTo(routeLayer));highlight=root.L.polyline([],{color:'#b47a36',weight:5,opacity:0}).addTo(map);}
   map.on('moveend',()=>{renderCards();renderMarkers()});map.on('click',()=>{selected=null;highlight?.setStyle({opacity:0});renderCards();renderMarkers();options.onDeselect?.();});
   observer=new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(disposed)return;map.invalidateSize({pan:false});limits();renderCards();renderMarkers();},100)});observer.observe($('.spot-map'));
  }else{$('.spot-map-status').textContent='지도 연결을 확인해 주세요. 장소 카드는 계속 이용할 수 있습니다.';host.querySelectorAll('.spot-map-controls button,[data-in-view]').forEach(b=>b.disabled=true);}
  listen(host,'click',e=>{const p=items.find(p=>p.id===e.target.closest('[data-place]')?.dataset.place);if(p){select(p,{open:true});return;}const action=e.target.closest('[data-action]')?.dataset.action;if(action==='zoom-in')map?.zoomIn();if(action==='zoom-out')map?.zoomOut();if(action==='fit')fit();if(action==='previous-cards'||action==='next-cards'){page+=action==='next-cards'?1:-1;renderCards();renderMarkers();}});
  listen($('[data-in-view]'),'change',e=>{inView=e.target.checked;page=0;renderCards();renderMarkers();});
  renderCards();renderMarkers();fit();if(selected&&options.initialZoom&&map)map.setView([selected.lat,selected.lng],Math.max(map.getMinZoom(),options.initialZoom),{animate:false});
  return {getMap:()=>map,setItems(next,{selectedId,reset=false}={}){items=next;page=0;if(reset){inView=true;if($('[data-in-view]'))$('[data-in-view]').checked=true;}selected=items.find(p=>p.id===(selectedId??selected?.id))||null;renderCards(true);renderMarkers();fit();},select(id,opts){const p=items.find(p=>p.id===id);if(p)select(p,opts)},highlight(coords){highlight?.setLatLngs(coords).setStyle({opacity:1});},returnToMap(){scrollTo({top:returnY,behavior:reduced?'auto':'smooth'});$('.spot-map').focus({preventScroll:true});},locate(id){host.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});this.select(id,{fly:true});},destroy(){disposed=true;events.abort();clearTimeout(resizeTimer);clearTimeout(creditTimer);observer?.disconnect();creditObserver?.disconnect();map?.remove();host.classList.remove('sskr-map');}};
 }
 return {mount,cardSlots,clusterPlaces,photoCard};
});
