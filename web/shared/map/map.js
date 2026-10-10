(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.SSKR_MAP=Object.freeze(api);})(typeof globalThis!=='undefined'?globalThis:this,root=>{
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function cardSlots(count,mobile){const first=count%4||4,split=Math.ceil(count/2);return Array.from({length:count},(_,i)=>mobile?{row:i<first?1:2+Math.floor((i-first)/4),column:i<first?i+1:1+(i-first)%4}:{side:i<split?0:1,row:i<split?i:i-split});}
 function clusterPlaces(places,project,size=50,selectedId='',pinnedIds=new Set()){
  const cells=new Map();places.forEach(place=>{const p=project(place),key=place.id===selectedId||pinnedIds.has(place.id)?place.id:Math.floor(p.x/size)+':'+Math.floor(p.y/size);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(place)});return [...cells.values()];
 }
 const formatPlaceText=value=>String(value??'').replace(/\s*·\s*/g,' ').replace(/\s+/g,' ').trim();
 const photoCard=(p,editing=false)=>`${p.image?`<img src="${esc(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:''}<b class="spot-mini-number ${esc(p.kind)}">${esc(p.number)}</b><span class="spot-photo-caption"><small>${esc(editing?formatPlaceText(p.region):p.region)}</small><strong>${esc(editing?formatPlaceText(p.name):p.name)}</strong></span>`;
 const routeFailures=new Set(['pending','loading','unavailable','unreachable','error','failed','invalid']);
 function routeCoordinates(legs){return (Array.isArray(legs)?legs:[]).filter(leg=>!routeFailures.has(leg?.status)&&Array.isArray(leg?.coordinates)&&leg.coordinates.length>1&&leg.coordinates.every(p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Number.isFinite(p[1])&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180)).map(leg=>leg.coordinates);}
 function routePlaces(catalog,ids=[]){let stop=0;return [...new Set(ids)].map(id=>catalog.get(id)).filter(Boolean).map(p=>({...p,number:p.kind==='start'?'출':p.kind==='finish'?'도':++stop}));}
 function safePadding({width,height,mobile,cardHeight,editing=false,compact=false,insets={}}){
  const side=editing?20:Math.min(172,Math.max(88,cardHeight*1.85))+20;
  const base=editing?(compact?[20,10,20,10]:[20,height<230?10:60,20,height<230?10:30]):mobile?[20,Math.min(90,height*.14),20,Math.min(cardHeight*3+96,height*.43)]:[side,Math.min(115,height*.2),side,60];
  const values=['left','top','right','bottom'].map((key,i)=>base[i]+Math.max(0,Number(insets[key])||0));
  for(const [a,b,size] of [[0,2,width],[1,3,height]]){const max=Math.max(0,size-64),sum=values[a]+values[b];if(sum>max){values[a]*=max/sum;values[b]*=max/sum;}}
  return {paddingTopLeft:values.slice(0,2),paddingBottomRight:values.slice(2)};
 }
 function mount(host,options={}){
  const events=new AbortController(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let items=options.items||[],selected=items.find(p=>p.id===options.initialId)||null,inView=options.inView??true,page=0,pageItems=[],map,layer,routeLayer,highlight,landLayer,observer,resizeTimer,revealTimer,creditTimer,creditObserver,creditPinned=false,disposed=false,returnY=0;
  let markers=new Map(),landRings=[],correctingPan=false,editing=false,plannerLegs=[],routeIds=[],activeId='',candidates=[],insets={};
  const catalog=new Map((options.catalog||items).map(p=>[p.id,p])),remember=places=>places.forEach(p=>catalog.set(p.id,p));remember(items);
  host.classList.add('sskr-map');
  host.innerHTML=`<div class="spot-workspace"><div class="spot-map-wrap"><div class="spot-map" tabindex="0" role="region" aria-label="대한민국 SSKR 장소 지도"></div><div class="spot-list-head"><h3><span data-result-label></span> <span data-result-count></span></h3>${options.inViewControl===false?'':`<label><input type="checkbox" data-in-view ${inView?'checked':''}> 지도 안에서만</label>`}</div><div class="spot-map-controls" role="group" aria-label="지도 제어"><button type="button" data-action="zoom-in" aria-label="지도 확대">+</button><button type="button" data-action="zoom-out" aria-label="지도 축소">−</button><button type="button" data-action="fit" aria-label="${options.route?'전체 경로':'전체 장소'} 보기">↺</button></div><div class="spot-list" aria-label="지도 장소 목록"></div><div class="spot-card-pages"><button type="button" data-action="previous-cards" aria-label="이전 장소 목록">‹</button><span data-card-page aria-live="polite"></span><button type="button" data-action="next-cards" aria-label="다음 장소 목록">›</button></div><p class="spot-map-status" role="status"></p><details class="spot-attribution" open><summary>지도 출처</summary><div><a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> · <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a><br>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a><br>남북한 육지 윤곽: <a href="https://www.geoboundaries.org/" target="_blank" rel="noopener">geoBoundaries</a> (남한 Natural Earth, 북한 WFP·OCHA / CC BY 3.0 IGO)<br>도로·지역: <a href="https://www.openstreetmap.org/relation/307756" target="_blank" rel="noopener">OpenStreetMap</a></div></details></div></div>`;
  const $=s=>host.querySelector(s),listen=(node,type,fn)=>node?.addEventListener(type,fn,{signal:events.signal});
  const credits=$('.spot-attribution'),collapse=()=>{if(!creditPinned&&!credits.contains(document.activeElement))credits.open=false;};
  listen(credits.querySelector('summary'),'click',()=>{creditPinned=!credits.open;clearTimeout(creditTimer)});
  listen($('.spot-map'),'pointerdown',collapse);listen($('.spot-map'),'wheel',collapse);
  creditObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){creditTimer=setTimeout(collapse,5000);creditObserver.disconnect();}},{threshold:.25});creditObserver.observe($('.spot-map-wrap'));
  root.SSKR_MAP_INTERACTION.bindWheel({getMap:()=>map,panel:()=>$('.spot-map'),signal:events.signal});
  function sizing(){const height=$('.spot-map-wrap').clientHeight,mobile=matchMedia('(max-width:700px)').matches,cardHeight=mobile?Math.min(74,Math.max(34,height*.105)):Math.min(104,Math.max(24,(height-146)/6));$('.spot-map-wrap').style.setProperty('--spot-card-height',cardHeight+'px');return {height,mobile,cardHeight};}
  function padding(){return safePadding({...sizing(),width:$('.spot-map-wrap').clientWidth,editing,compact:host.classList.contains('is-mobile-editor'),insets});}
  function limits(){
   const wasOverview=Math.abs(map.getZoom()-map.getMinZoom())<.26;
   // Disable the old moveend bounds handler before stopping its animation.
   // Otherwise stop() can restart that pan with the previous viewport size.
   map.setMaxBounds(null);
   map.stop();
   map.setMinZoom(4);
   const overview=root.L.latLngBounds([[34.58,126.4],[37.9,129.52]]),pad=padding();
   const minimum=Math.max(4,map.getBoundsZoom(overview,false,root.L.point(pad.paddingTopLeft).add(pad.paddingBottomRight)));
   const bounds=root.L.latLngBounds([[33.05,124.26],[43.07,131.96]]);
   // Apply layout-driven zoom before raising the limit: Leaflet's setMinZoom
   // otherwise starts an animation that invalidates the selected card position.
   if(wasOverview||map.getZoom()<minimum)map.setZoom(minimum,{animate:false});
   map.setMinZoom(minimum);
   map.panInsideBounds(bounds,{animate:false});
   map.setMaxBounds(bounds);
  }
  function clampPan(){
   if(!landRings.length||correctingPan||disposed)return false;
   const size=map.getSize(),pad=padding();
   const box={left:pad.paddingTopLeft[0],top:pad.paddingTopLeft[1],right:size.x-pad.paddingBottomRight[0],bottom:size.y-pad.paddingBottomRight[1]};
   if(box.left>=box.right||box.top>=box.bottom)return false;
   const corners=[{x:box.left,y:box.top},{x:box.right,y:box.top},{x:box.right,y:box.bottom},{x:box.left,y:box.bottom}];
   const midpoint={x:(box.left+box.right)/2,y:(box.top+box.bottom)/2};
   let nearest={distance:Infinity,dx:0,dy:0};
   const offer=p=>{const x=Math.max(box.left,Math.min(box.right,p.x)),y=Math.max(box.top,Math.min(box.bottom,p.y)),dx=x-p.x,dy=y-p.y,distance=dx*dx+dy*dy;if(distance<nearest.distance)nearest={distance,dx,dy};};
   const contains=(point,ring)=>{let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;};
   const crosses=(a,b)=>{const dx=b.x-a.x,dy=b.y-a.y;let lo=0,hi=1;for(const [p,q] of [[-dx,a.x-box.left],[dx,box.right-a.x],[-dy,a.y-box.top],[dy,box.bottom-a.y]]){if(!p){if(q<0)return false;continue;}const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}return true;};
   for(const ring of landRings){
    const points=ring.map(([lng,lat])=>map.latLngToContainerPoint([lat,lng]));
    if(contains(midpoint,points))return false;
    for(let i=0;i<points.length;i++){
     const a=points[i],b=points[(i+1)%points.length];
     if(crosses(a,b))return false;
     offer(a);
     const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
     if(length)for(const corner of corners){const t=Math.max(0,Math.min(1,((corner.x-a.x)*dx+(corner.y-a.y)*dy)/length));offer({x:a.x+t*dx,y:a.y+t*dy});}
    }
   }
   const dokdo=map.latLngToContainerPoint([37.24078,131.86956]);
   if(dokdo.x>=box.left&&dokdo.x<=box.right&&dokdo.y>=box.top&&dokdo.y<=box.bottom)return false;
   offer(dokdo);
   if(nearest.distance<=1)return false;
   correctingPan=true;map.panBy([-nearest.dx,-nearest.dy],{animate:false});correctingPan=false;
   return true;
  }
  function renderCards(focus=false){
   const list=editing?(selected?[selected]:[]):items.filter(p=>!inView||!map||map.getBounds().contains([p.lat,p.lng]));const {mobile}=sizing();
   if(focus){const i=list.findIndex(p=>p.id===selected?.id);if(i>=0)page=Math.floor(i/12);}
   page=Math.max(0,Math.min(page,Math.ceil(list.length/12)-1));pageItems=list.slice(page*12,page*12+12);
   const slots=cardSlots(pageItems.length,mobile),card=(p,i)=>`<div class="spot-mini-card"${mobile?` style="grid-row:${slots[i].row};grid-column:${slots[i].column}"`:''}><button type="button" class="spot-mini-select spot-photo-card" data-place="${esc(p.id)}" aria-label="${esc(p.name)} ${esc(p.meta||'')} 상세 보기" aria-pressed="${p.id===selected?.id}">${photoCard(p,editing)}</button></div>`;
   const cards=pageItems.map(card),split=Math.ceil(cards.length/2);
   $('.spot-list').innerHTML=cards.length?(mobile?cards.join(''):`<div class="spot-card-column">${cards.slice(0,split).join('')}</div><div class="spot-card-column">${cards.slice(split).join('')}</div>`):`<div class="spot-list-empty">${items.length?'현재 지도 안에는 장소가 없습니다.<button type="button" data-action="fit">전체 장소 보기</button>':'조건에 맞는 장소가 없습니다.'}</div>`;
   $('.spot-list').style.setProperty('--spot-rows',Math.max(1,Math.ceil(cards.length/4)));
   const countItems=editing?[...new Map([...items,...candidates,...routePlaces(catalog,routeIds)].map(p=>[p.id,p])).values()].filter(p=>map?.getBounds().contains([p.lat,p.lng])):list;
   $('[data-result-label]').textContent=editing?'화면 안 장소':inView?'지도 안':options.route?'방문 장소':'검색 결과';$('[data-result-count]').textContent=countItems.length+'곳';const filterLabel=$('[data-in-view]')?.closest('label');if(filterLabel)filterLabel.hidden=editing;
   $('.spot-card-pages').hidden=list.length<=12;$('.spot-map-wrap').classList.toggle('has-pages',list.length>12);
   $('[data-card-page]').textContent=list.length?`${page*12+1}–${page*12+cards.length} / ${list.length}`:'0 / 0';
   $('[data-action="previous-cards"]').disabled=page===0;$('[data-action="next-cards"]').disabled=(page+1)*12>=list.length;
   $('.spot-list').querySelectorAll('img').forEach(img=>img.onerror=()=>img.remove());
  }
  function revealSelected(id,settle=true){
   if(!map||disposed||selected?.id!==id)return;
   if(settle){clearTimeout(revealTimer);revealTimer=setTimeout(()=>revealSelected(id,false),180);}
   const marker=markers.get(id),tooltip=marker?.getTooltip?.()?.getElement?.(),panel=$('.spot-map');
   if(!tooltip||!panel)return;
   const bounds=panel.getBoundingClientRect(),pad=padding(),margin=10;
   const compact=host.classList.contains('is-mobile-editor');
   const safe={left:bounds.left+(compact?8:pad.paddingTopLeft[0]+margin),top:bounds.top+(compact?8:pad.paddingTopLeft[1]+margin),right:bounds.right-(compact?8:pad.paddingBottomRight[0]+margin),bottom:bounds.bottom-(compact?(insets.bottom||0)+8:pad.paddingBottomRight[1]+margin)};
   const photo=tooltip.getBoundingClientRect(),button=tooltip.querySelector('.spot-route-add,.spot-route-state')?.getBoundingClientRect();
   const card={left:Math.min(photo.left,button?.left??photo.left),top:Math.min(photo.top,button?.top??photo.top),right:Math.max(photo.right,button?.right??photo.right),bottom:Math.max(photo.bottom,button?.bottom??photo.bottom)};
   const width=card.right-card.left,height=card.bottom-card.top;
   const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
   let target={left:clamp(card.left,safe.left,safe.right-width),top:clamp(card.top,safe.top,safe.bottom-height)};
   const obstacles=['.spot-map-controls','.spot-list-head'].map(selector=>$(selector)?.getBoundingClientRect()).filter(r=>r&&r.width&&r.height);
   const clear=position=>obstacles.every(r=>position.left+width<=r.left-6||position.left>=r.right+6||position.top+height<=r.top-6||position.top>=r.bottom+6);
   if(!clear(target)){
    const xs=[target.left,safe.left,safe.right-width,...obstacles.flatMap(r=>[r.left-width-6,r.right+6])];
    const ys=[target.top,safe.top,safe.bottom-height,...obstacles.flatMap(r=>[r.top-height-6,r.bottom+6])];
    const slots=xs.flatMap(left=>ys.map(top=>({left,top}))).filter(p=>p.left>=safe.left&&p.left+width<=safe.right&&p.top>=safe.top&&p.top+height<=safe.bottom&&clear(p));
    slots.sort((a,b)=>Math.hypot(a.left-card.left,a.top-card.top)-Math.hypot(b.left-card.left,b.top-card.top));
    if(slots.length)target=slots[0];
   }
   const dx=target.left-card.left,dy=target.top-card.top;
   if(Math.abs(dx)>.5||Math.abs(dy)>.5)map.panBy([-dx,-dy],{animate:false});
  }
  function select(item,{open=false,fly=false,reveal=true}={}){
   selected=item;renderCards(true);renderMarkers();options.onSelect?.(item);
   if(fly&&map){if(reveal)map.once('moveend',()=>requestAnimationFrame(()=>revealSelected(item.id)));map.flyTo([item.lat,item.lng],Math.max(map.getZoom(),11),{animate:!reduced,duration:.4});}
   else if(reveal)requestAnimationFrame(()=>revealSelected(item.id));
   if(open){returnY=scrollY;options.onOpen?.(item);}
  }
  function renderMarkers(){
   if(!map||disposed)return;layer.eachLayer(marker=>{marker.getTooltip?.()?.getElement?.()?.remove();marker.unbindTooltip();});layer.clearLayers();markers.clear();
   const ordered=editing?routePlaces(catalog,routeIds):[],chosen=new Set(ordered.map(p=>p.id)),candidateIds=new Set(editing?candidates.map(p=>p.id):[]);
   const visible=new Map(items.map(p=>[p.id,p]));if(editing){candidates.forEach(p=>visible.set(p.id,p));ordered.forEach(p=>visible.set(p.id,p));}
   const pinned=editing?new Set([...chosen,...candidateIds]):new Set(pageItems.map(p=>p.id));
   const groups=options.cluster===false?[...visible.values()].map(p=>[p]):clusterPlaces([...visible.values()],p=>map.project([p.lat,p.lng],map.getZoom()),50,selected?.id,pinned);
   groups.forEach(group=>{
    const p=group[0],multiple=group.length>1,point=multiple?[group.reduce((n,p)=>n+p.lat,0)/group.length,group.reduce((n,p)=>n+p.lng,0)/group.length]:[p.lat,p.lng];
    const planned=!multiple&&chosen.has(p.id),candidate=!multiple&&!planned&&candidateIds.has(p.id),active=planned&&activeId===p.id;
    const marker=root.L.marker(point,{keyboard:true,autoPanOnFocus:false,title:multiple?group.length+'개 장소 확대':p.name,zIndexOffset:active?1000:planned?600:candidate?400:0,icon:root.L.divIcon({className:'spot-pin '+(multiple?'cluster':p.kind)+(selected?.id===p.id&&!multiple?' is-selected':'')+(planned?' is-route-stop':'')+(candidate?' is-route-candidate':'')+(active?' is-route-active':''),html:`<span>${esc(multiple?group.length+'곳':p.number??'·')}</span>`,iconSize:multiple?[36,36]:[18,18],iconAnchor:multiple?[18,18]:[9,9]})});
    const tip=document.createElement('div');tip.className=multiple?'spot-tip-copy':'spot-route-tooltip';
    if(multiple)tip.innerHTML=`<strong>${group.length}개 장소</strong><span>${group.slice(0,3).map(p=>esc(editing?formatPlaceText(p.name):p.name)).join(' · ')}</span>`;
    else{
      const photo=document.createElement('button');photo.type='button';photo.className='spot-photo-card';photo.setAttribute('aria-label',formatPlaceText(p.name)+' 상세 보기');photo.innerHTML=photoCard(p,editing);photo.addEventListener('click',()=>select(p,{open:true}));tip.append(photo);
      if(editing&&selected?.id===p.id&&options.onRouteAdd&&(p.kind==='start'&&!planned||p.kind==='spot'&&!planned)){
        const state=options.routeActionState?.(p)||{},wrap=document.createElement('div');wrap.className='spot-route-action-wrap';
        const add=document.createElement('button');add.type='button';add.className='spot-route-add';add.disabled=Boolean(state.disabled);add.textContent=state.label||(p.kind==='start'?'출발지 설정':'경유지 추가');add.setAttribute('aria-label',`${formatPlaceText(p.name)} ${add.textContent}`);add.addEventListener('click',event=>{event.stopPropagation();options.onRouteAdd?.(p);});wrap.append(add);
        if(state.description){const context=document.createElement('span');context.className='spot-route-context';context.title=state.description;state.description.split('\n').forEach(line=>{const row=document.createElement('span');row.textContent=line;context.append(row);});wrap.append(context);}tip.prepend(wrap);
      }
      if(editing&&selected?.id===p.id&&p.kind==='start'&&planned){const status=document.createElement('span');status.className='spot-route-state';status.textContent='선택된 출발지';tip.prepend(status);}
      root.L.DomEvent.disableClickPropagation(tip);const img=tip.querySelector('img');if(img)img.onerror=()=>img.remove();
    }
    marker.bindTooltip(tip,{direction:'top',offset:[0,-10],className:'spot-tooltip'+(multiple?' spot-tooltip-group':'')+(editing?' is-route-tooltip':''),opacity:1,interactive:!multiple,permanent:!multiple&&selected?.id===p.id});
    marker.on('click keypress',event=>{if(event.type==='keypress'){if(!['Enter',' '].includes(event.originalEvent?.key))return;root.L.DomEvent.preventDefault(event.originalEvent);}if(event.originalEvent)root.L.DomEvent.stopPropagation(event.originalEvent);if(!multiple){requestAnimationFrame(()=>{if(!disposed)select(p)});return;}if(map.getZoom()>=16){select(p);return;}map.fitBounds(group.map(p=>[p.lat,p.lng]),{padding:[70,70],maxZoom:Math.min(16,map.getZoom()+2),animate:!reduced});});
    marker.addTo(layer);marker.getElement()?.setAttribute('aria-label',multiple?group.length+'개 장소 확대':`${formatPlaceText(p.name)} · ${p.kind==='start'?'출발지':p.kind==='finish'?'도착지':`${p.number}번 스팟`}${planned?' · 경로 포함':''}${selected?.id===p.id?' · 선택됨':''}`);if(!multiple)markers.set(p.id,marker);
   });
  }
  function renderRoute(){
   if(!map||disposed)return;
   if(!routeLayer)routeLayer=root.L.featureGroup().addTo(map);
   routeLayer.clearLayers();
   const coordinates=editing?routeCoordinates(plannerLegs):options.route||[];
   coordinates.forEach(coords=>root.L.polyline(coords,{pane:'sskr-routes',color:'#47695b',weight:4,opacity:.95,interactive:false}).addTo(routeLayer));
   if(!highlight)highlight=root.L.polyline([],{pane:'sskr-routes',color:'#b47a36',weight:5,opacity:0,interactive:false}).addTo(map);
   highlight.setLatLngs([]).setStyle({opacity:0});
   $('[data-action="fit"]').setAttribute('aria-label',editing||options.route?'전체 경로 보기':'전체 장소 보기');
  }
  function clearSelection(){selected=null;clearTimeout(revealTimer);renderCards();renderMarkers();}
  function fit(){if(!map||disposed)return;map.invalidateSize({pan:false});limits();if(editing)clearSelection();const bounds=routeLayer?.getBounds(),places=editing&&routeIds.length?routePlaces(catalog,routeIds):items;if(bounds?.isValid()){places.forEach(p=>bounds.extend([p.lat,p.lng]));map.fitBounds(bounds,{...padding(),maxZoom:12,animate:!reduced,duration:.35});}else if(places.length)map.fitBounds(places.map(p=>[p.lat,p.lng]),{...padding(),maxZoom:12,animate:!reduced,duration:.35});}
  if(root.L){
   map=root.L.map($('.spot-map'),{zoomControl:false,attributionControl:false,scrollWheelZoom:false,minZoom:4,maxZoom:16,zoomSnap:.25,maxBoundsViscosity:1}).setView([36.5,127.8],7);
   // Leaflet also enforces bounds from moveend, including stop() during selection.
   // Keep those corrections synchronous so an old pan cannot finish after reveal.
   const panInsideBounds=map.panInsideBounds;
   map.panInsideBounds=function(bounds,options){return panInsideBounds.call(this,bounds,{animate:false,...options});};
   layer=root.L.layerGroup().addTo(map);limits();
   // Keep terrain beneath the WebGL details, including below their minimum zoom
   // and while tiles load or fail. The vector background must stay transparent.
   const baseLandPane=map.createPane('sskr-base-land');baseLandPane.style.zIndex=190;baseLandPane.style.pointerEvents='none';
   const landPane=map.createPane('sskr-land');landPane.style.zIndex=450;landPane.style.pointerEvents='none';
   const routePane=map.createPane('sskr-routes');routePane.style.zIndex=460;routePane.style.pointerEvents='none';
   const landStyle=feature=>{const north=feature.properties.iso==='PRK',overview=map.getZoom()<6.5;return {color:north?'#94aa99':'#a6b9a7',weight:north||overview?1:0,opacity:north||overview?1:0,fillColor:'#d7e2d6',fillOpacity:north||overview?1:0};};
   fetch('/web/shared/map/land.geojson',{signal:events.signal}).then(response=>{if(!response.ok)throw Error('Land silhouette unavailable');return response.json()}).then(data=>{
    if(disposed)return;
    root.L.geoJSON(data,{pane:'sskr-base-land',interactive:false,filter:feature=>feature.properties.iso==='KOR',style:{stroke:false,fillColor:'#eff0e9',fillOpacity:1}}).addTo(map);
    landRings=data.features.flatMap(feature=>feature.geometry.coordinates.map(polygon=>polygon[0]));landLayer=root.L.geoJSON(data,{pane:'sskr-land',interactive:false,style:landStyle}).addTo(map);map.on('zoomend',()=>landLayer?.setStyle(landStyle));
    const islands=[['제주도',33.38,126.53],['울릉도',37.5,130.88],['독도',37.24078,131.86956]];islands.forEach(([name,lat,lng])=>root.L.marker([lat,lng],{interactive:false,keyboard:false,icon:root.L.divIcon({className:'sskr-land-label'+(name==='독도'?' is-dokdo':''),html:`${name==='독도'?'<i aria-hidden="true"></i>':''}<span>${name}</span>`,iconSize:name==='독도'?[48,24]:[48,18],iconAnchor:name==='독도'?[24,3]:[24,9]})}).addTo(map));clampPan();
   }).catch(error=>{if(error.name!=='AbortError'&&!disposed)console.warn(error);});
   if(root.L.maplibreGL&&root.maplibregl){try{
    const backdrop=root.L.maplibreGL({style:'/web/shared/map/style.json',transformRequest:url=>({url:new URL(url,location.href).href}),interactive:false,attributionControl:false}).addTo(map),details=backdrop.getMaplibreMap();let failed=false;
    details.on('error',()=>{failed=true;if(!disposed)$('.spot-map-status').textContent='상세 지도를 불러오지 못해 기본 지형을 표시하고 있습니다.';});
    details.on('idle',()=>{if(disposed)return;const source=details.getStyle()?.sources?.openmaptiles,loaded=source&&details.querySourceFeatures('openmaptiles',{sourceLayer:'sskr_land'}).length>0;if(loaded)failed=false;if(!failed||details.getZoom()<(source?.minzoom??6))$('.spot-map-status').textContent='';});
    // Failed tiles may stay cached as errors; explicitly retry after reconnection.
    listen(root,'online',()=>{if(!disposed&&failed&&details.getSource('openmaptiles')){failed=false;details.refreshTiles('openmaptiles');}});
   }catch{$('.spot-map-status').textContent='지도 배경을 표시할 수 없습니다. 장소 카드는 계속 이용할 수 있습니다.';}}
   else $('.spot-map-status').textContent='지도 배경을 불러오지 못했습니다. 장소 카드는 계속 이용할 수 있습니다.';
   if(options.route?.length)renderRoute();
   map.on('dragstart',()=>clearTimeout(revealTimer));
   map.on('moveend',()=>{if(clampPan())return;renderCards();renderMarkers()});map.on('click',()=>{if(editing)return;selected=null;highlight?.setStyle({opacity:0});renderCards();renderMarkers();options.onDeselect?.();});
   observer=new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(disposed)return;map.invalidateSize({pan:false});limits();if(!clampPan()){renderCards();renderMarkers();if(selected){const id=selected.id;requestAnimationFrame(()=>revealSelected(id));}}},100)});observer.observe($('.spot-map'));
  }else{$('.spot-map-status').textContent='지도 연결을 확인해 주세요. 장소 카드는 계속 이용할 수 있습니다.';host.querySelectorAll('.spot-map-controls button,[data-in-view]').forEach(b=>b.disabled=true);}
  listen(host,'click',e=>{const id=e.target.closest('[data-place]')?.dataset.place,p=items.find(p=>p.id===id)||(editing?catalog.get(id):null);if(p){select(p,{open:true});return;}const action=e.target.closest('[data-action]')?.dataset.action;if(action==='zoom-in')map?.zoomIn();if(action==='zoom-out')map?.zoomOut();if(action==='fit')fit();if(action==='previous-cards'||action==='next-cards'){page+=action==='next-cards'?1:-1;renderCards();renderMarkers();}});
  listen($('[data-in-view]'),'change',e=>{inView=e.target.checked;page=0;renderCards();renderMarkers();});
  renderCards();renderMarkers();fit();if(selected&&options.initialZoom&&map)map.setView([selected.lat,selected.lng],Math.max(map.getMinZoom(),options.initialZoom),{animate:false});
  return {getMap:()=>map,setItems(next,{selectedId,reset=false,fit:refit=true}={}){if(disposed)return;items=next;remember(items);page=0;if(reset){inView=true;if($('[data-in-view]'))$('[data-in-view]').checked=true;}const id=selectedId??selected?.id;selected=items.find(p=>p.id===id)||(editing?catalog.get(id):null)||null;renderCards(true);renderMarkers();if(refit)fit();},
   setRoute(legs,{selectedIds=[],activeId:nextActiveId='',places=[],fit:refit=false}={}){if(disposed)return;remember(places);plannerLegs=Array.isArray(legs)?legs:[];routeIds=[...new Set(selectedIds)];activeId=nextActiveId;renderRoute();renderMarkers();if(refit)fit();},
   setCandidates(next=[]){if(disposed)return;candidates=next;remember(candidates);renderMarkers();},
   setEditing(value){if(disposed||editing===Boolean(value))return;editing=Boolean(value);host.classList.toggle('is-route-editing',editing);if(editing)credits.open=false;selected=null;renderRoute();renderCards();renderMarkers();if(map){limits();clampPan();}},
   setInsets(next={}){if(disposed)return;insets=Object.fromEntries(['left','top','right','bottom'].map(key=>[key,Math.max(0,Number(next[key])||0)]));for(const [key,value] of Object.entries(insets))host.style.setProperty('--map-inset-'+key,value+'px');if(map){limits();clampPan();}},
   fitRoute:fit,clearSelection,select(id,opts){if(disposed)return;const p=items.find(p=>p.id===id)||(editing?catalog.get(id):null);if(p)select(p,opts)},revealSelected,highlight(coords){if(!disposed)highlight?.setLatLngs(coords).setStyle({opacity:1});},returnToMap(){if(disposed)return;scrollTo({top:returnY,behavior:reduced?'auto':'smooth'});$('.spot-map').focus({preventScroll:true});},locate(id){if(disposed)return;host.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});this.select(id,{fly:true});},destroy(){disposed=true;events.abort();clearTimeout(resizeTimer);clearTimeout(revealTimer);clearTimeout(creditTimer);observer?.disconnect();creditObserver?.disconnect();map?.remove();markers.clear();catalog.clear();plannerLegs=[];routeIds=[];candidates=[];host.classList.remove('sskr-map','is-route-editing');for(const key of ['left','top','right','bottom'])host.style.removeProperty('--map-inset-'+key);}};
 }
 return {mount,cardSlots,clusterPlaces,photoCard,formatPlaceText,routeCoordinates,routePlaces,safePadding};
});
