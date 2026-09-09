(function (root) {
  'use strict';
  const categories = {all:'모든 스팟',cafe:'라이딩 · 카페',food:'맛집 · 시장',nature:'자연 · 전망',culture:'역사 · 마을'};
  const corridors = {north:'북부 횡단',central:'중부 횡단',south:'남부 횡단',west:'대천 접근'};
  const labels = {start:'출발지',finish:'도착지',spot:'스팟'};
  const paths = {search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',pin:'<path d="M12 21s7-6 7-12A7 7 0 0 0 5 9c0 6 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',external:'<path d="M14 4h6v6m0-6-9 9M10 5H5v14h14v-5"/>',reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',cafe:'<path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Zm12 1h2a3 3 0 0 1 0 6h-2M7 3v2m5-2v2"/>',food:'<path d="M4 10h16l-2-6H6l-2 6Zm1 0v10h14V10M9 20v-6h6v6"/>',nature:'<path d="m3 20 7-14 5 10 2-4 4 8H3Zm4-8 3 2 3-2"/>',culture:'<path d="m3 8 9-5 9 5H3Zm2 3v7m5-7v7m4-7v7m5-7v7M3 21h18"/>'};
  const icon = key => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[key]||paths.pin}</svg>`;
  const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value??'').toLowerCase().replace(/\s/g,'');
  function filterPlaces(places, state) {
    const query=normalize(state.search);
    return places.filter(p=>(state.kind==='all'||p.kind===state.kind)&&(state.category==='all'||p.category===state.category)&&(state.corridor==='all'||p.corridor===state.corridor)&&(!query||normalize([p.name,p.region,p.address,p.lead].join(' ')).includes(query)));
  }
  function clusterPlaces(places, project, size=54, selectedId='') {
    const cells=new Map();
    places.forEach(place=>{const p=project(place);const key=place.id===selectedId?place.id:Math.floor(p.x/size)+':'+Math.floor(p.y/size);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(place)});
    return [...cells.values()];
  }
  function mount(host, options={}) {
    const places=root.SSKR_SPOT_CATALOG||root.SSKR_PLACES||[];
    const aliases={pyeongchang:'daegwallyeong',goesan:'sanmagi',gunsan:'daecheon'};
    const initialId=aliases[options.id]||options.id;
    const initial=places.find(p=>p.id===initialId);
    const query=new URLSearchParams(location.search);
    const state={kind:initial?.kind||'spot',category:'all',corridor:'all',search:query.get('spotSearch')||'',inView:false};
    let selected=initial||places.find(p=>p.kind==='spot'),visible=[],displayed=[],map,layer,observer,disposed=false,searchTimer,resizeTimer;
    let markers=new Map(),tileFailure=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const events=new AbortController();
    host.classList.add('spots-main');
    host.innerHTML=`<section class="spot-workbench" aria-label="스팟 지도 탐색">
      <header class="spot-heading"><div><p>MY DAY, MY STOPS</p><h2>어디에 들를까요?</h2><span>동해의 출발점부터 대천까지, 나의 하루에 어울리는 장소를 골라보세요.</span></div><div class="spot-total"><strong>${places.filter(p=>p.kind==='spot').length}</strong><span>개의 경유 스팟<br>출발지 5곳 · 도착지 1곳</span></div></header>
      <div class="spot-toolbar"><label class="spot-search">${icon('search')}<span class="spot-sr">장소 이름 또는 지역 검색</span><input type="search" placeholder="장소 이름, 지역으로 검색" value="${esc(state.search)}" autocomplete="off"><button type="button" data-action="clear" aria-label="검색어 지우기">×</button></label><label class="spot-region"><span>탐색 권역</span><select><option value="all">모든 권역</option>${Object.entries(corridors).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label><div class="spot-kind" role="group" aria-label="장소 구분">${[['spot','스팟'],['start','출발지'],['finish','도착지'],['all','전체']].map(([key,label])=>`<button type="button" data-kind="${key}" aria-pressed="${key===state.kind}">${label}</button>`).join('')}</div></div>
      <div class="spot-categories" role="group" aria-label="스팟 주제">${Object.entries(categories).map(([key,label])=>`<button type="button" data-category="${key}" aria-pressed="${key==='all'}">${key==='all'?'':icon(key)}${label}<span data-count="${key}"></span></button>`).join('')}</div>
      <div class="spot-workspace"><aside class="spot-results" aria-label="장소 목록"><div class="spot-list-head"><h3>발견할 장소 <span data-result-count></span></h3><label><input type="checkbox" data-in-view> 지도 안에서만</label></div><div class="spot-list" aria-label="검색 결과"></div><div class="spot-list-foot">목록과 지도가 함께 선택됩니다.</div></aside><div class="spot-map-wrap"><div class="spot-map" tabindex="0" role="region" aria-label="출발지와 스팟 지도. 방향키로 이동, 더하기와 빼기로 확대 축소."></div><div class="spot-map-caption">EAST TO WEST <span>동해 → 대천</span></div><div class="spot-map-controls" role="group" aria-label="지도 제어"><button type="button" data-action="zoom-in" aria-label="지도 확대">+</button><button type="button" data-action="zoom-out" aria-label="지도 축소">−</button><button type="button" data-action="fit" aria-label="검색 결과 전체 보기">${icon('reset')}</button></div><div class="spot-map-key"><span><i class="start"></i>출발</span><span><i></i>스팟</span><span><i class="finish"></i>도착</span></div><p class="spot-map-status" role="status"></p></div></div>
      <section class="spot-detail" aria-label="선택한 장소 상세"></section>
      <p class="spot-map-note">지도 위치는 탐색용 근사 좌표입니다. 실제 입구·주차와 영업 여부는 방문 전 확인해 주세요. 장소 선택은 경로 안내나 출발지 확정으로 처리되지 않습니다.</p>
    </section>`;
    const $=selector=>host.querySelector(selector);
    const listen=(node,event,handler)=>node.addEventListener(event,handler,{signal:events.signal});
    function syncURL(place) {
      const url=new URL(location.href);url.pathname='/app/spots'+(place?'/'+encodeURIComponent(place.id):'');
      state.search?url.searchParams.set('spotSearch',state.search):url.searchParams.delete('spotSearch');
      history.replaceState(history.state,'',url.pathname+url.search);
    }
    function renderDetail(place) {
      const detail=$('.spot-detail');
      if(!place){detail.innerHTML='<div class="spot-detail-empty"><h3>조건에 맞는 장소가 없습니다.</h3><p>검색어를 줄이거나 다른 권역을 선택해 보세요.</p><button type="button" data-action="reset">검색 조건 초기화</button></div>';return;}
      const category=place.kind==='spot'?categories[place.category]||'자연 · 전망':labels[place.kind];
      const mapURL='https://map.naver.com/p/search/'+encodeURIComponent((place.address||place.region)+' '+place.name);
      detail.innerHTML=`<div class="spot-detail-visual ${place.image?'':'spot-location-visual'}">${place.image?`<img src="${esc(place.image)}" alt="${esc(place.name)}" decoding="async" referrerpolicy="no-referrer"><span>${esc(place.photoCredit||'장소 정보 사진')}</span>`:`${icon(place.category)}<strong>${esc(place.region)}</strong><span>${place.lat.toFixed(3)}° N · ${place.lng.toFixed(3)}° E</span><a href="${esc(mapURL)}" target="_blank" rel="noopener noreferrer">지도에서 장소 사진 확인 ${icon('external')}</a>`}</div><div class="spot-detail-copy"><div class="spot-detail-top"><span>${esc(category)} · ${esc(corridors[place.corridor])}</span><a href="${esc(place.source)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(place.name)} 정보 출처">출처 ${icon('external')}</a></div><h3>${esc(place.name)}</h3><p class="spot-detail-lead">${esc(place.lead)}</p><p>${esc(place.description)}</p><dl><div><dt>위치</dt><dd>${esc(place.address||place.region)}</dd></div><div><dt>방문 메모</dt><dd>${esc(place.note)}</dd></div></dl><div class="spot-detail-actions"><a href="${esc(mapURL)}" target="_blank" rel="noopener noreferrer">네이버 지도에서 확인 ${icon('external')}</a><button type="button" data-action="locate">지도에서 위치 보기 ${icon('pin')}</button></div><div class="spot-participant-note">${options.participation?'장소를 둘러보며 나의 경유 계획을 준비하세요.':'참가 확정되면 SSKR 관련 안내가 제공됩니다.'}</div></div>`;
      const img=detail.querySelector('img');
      if(img)listen(img,'error',()=>{const visual=detail.querySelector('.spot-detail-visual');visual.classList.add('spot-location-visual');visual.innerHTML=`${icon(place.category)}<strong>${esc(place.region)}</strong><a href="${esc(mapURL)}" target="_blank" rel="noopener noreferrer">장소 사진 확인 ${icon('external')}</a>`});
    }
    function choose(place,fly=true) {
      selected=place;syncURL(place);renderDetail(place);
      host.querySelectorAll('[data-place]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.place===place.id));});
      const active=host.querySelector('[data-place="'+place.id+'"]');
      if(active){const list=$('.spot-list'),rowBox=active.getBoundingClientRect(),listBox=list.getBoundingClientRect();if(rowBox.top<listBox.top||rowBox.bottom>listBox.bottom)list.scrollTop+=rowBox.top-listBox.top;}
      renderMarkers();
      if(map&&fly)map.flyTo([place.lat,place.lng],Math.max(map.getZoom(),11),{animate:!reduced.matches,duration:.45});
    }
    function renderList() {
      displayed=visible.filter(p=>!state.inView||!map||map.getBounds().contains([p.lat,p.lng]));
      $('[data-result-count]').textContent=`${displayed.length}곳`;
      $('.spot-list').innerHTML=displayed.length?displayed.map(p=>`<button type="button" class="spot-row" data-place="${esc(p.id)}" aria-pressed="${selected?.id===p.id}"><span class="spot-row-icon ${p.kind}">${icon(p.kind==='spot'?p.category:'pin')}</span><span><small>${esc(p.region)} · ${esc(p.kind==='spot'?categories[p.category]||'스팟':labels[p.kind])}</small><strong>${esc(p.name)}</strong><span>${esc(p.lead)}</span></span>${icon('arrow')}</button>`).join(''):`<div class="spot-list-empty">${state.inView?'현재 지도 안에는 결과가 없습니다. 지도를 옮기거나 지도 안에서만 선택을 해제해 주세요.':'일치하는 장소가 없습니다. 다른 검색어로 찾아보세요.'}<button type="button" data-action="reset">조건 초기화</button></div>`;
    }
    function renderMarkers() {
      if(!map||disposed)return;
      layer.clearLayers();markers.clear();
      const groups=clusterPlaces(visible,p=>map.project([p.lat,p.lng],map.getZoom()),50,selected?.id);
      groups.forEach(group=>{
        const place=group[0],isGroup=group.length>1;
        const point=isGroup?[group.reduce((n,p)=>n+p.lat,0)/group.length,group.reduce((n,p)=>n+p.lng,0)/group.length]:[place.lat,place.lng];
        const marker=root.L.marker(point,{icon:root.L.divIcon({className:'spot-pin '+(isGroup?'cluster':place.kind)+(selected?.id===place.id&&!isGroup?' is-selected':''),html:isGroup?`<span>${group.length}</span>`:`<span>${place.kind==='start'?'S':place.kind==='finish'?'F':icon(place.category)}</span>`,iconSize:[36,36],iconAnchor:[18,18]}),title:isGroup?`${group.length}개 장소 확대`:place.name,keyboard:true});
        const tip=document.createElement('div');tip.className='spot-tip-copy';
        if(!isGroup&&place.image){const photo=document.createElement('img');photo.alt='';photo.loading='lazy';photo.referrerPolicy='no-referrer';photo.src=place.image;photo.style.cssText='width:180px;height:100px;object-fit:cover;border-radius:4px;margin-bottom:8px';photo.onerror=()=>photo.remove();tip.append(photo);}
        const strong=document.createElement('strong');strong.textContent=isGroup?`${group.length}개 장소`:place.name;tip.append(strong);
        const small=document.createElement('span');small.textContent=isGroup?group.slice(0,3).map(p=>p.name).join(' · '):place.region;tip.append(small);
        marker.bindTooltip(tip,{direction:'top',offset:[0,-17],className:'spot-tooltip',opacity:1});
        marker.on('click',()=>{
          if(!isGroup){choose(place);return;}
          if(map.getZoom()>=16){choose(place,false);return;}
          map.fitBounds(group.map(p=>[p.lat,p.lng]),{padding:[70,70],maxZoom:Math.min(16,map.getZoom()+2),animate:!reduced.matches});
        });
        marker.addTo(layer);if(!isGroup)markers.set(place.id,marker);
      });
    }
    function fit() {if(map&&visible.length)map.fitBounds(visible.map(p=>[p.lat,p.lng]),{padding:[50,55],maxZoom:12,animate:!reduced.matches,duration:.35});}
    function applyFilters(autoFit=true) {
      visible=filterPlaces(places,state);
      if(!visible.some(p=>p.id===selected?.id))selected=visible[0];
      syncURL(selected);
      host.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===state.kind)));
      host.querySelectorAll('[data-category]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.category===state.category));b.disabled=state.kind==='start'||state.kind==='finish';});
      const countBase=filterPlaces(places,{...state,category:'all'});
      host.querySelectorAll('[data-count]').forEach(n=>n.textContent=countBase.filter(p=>n.dataset.count==='all'||p.category===n.dataset.count).length);
      $('[data-action="clear"]').hidden=!state.search;
      renderList();renderMarkers();renderDetail(selected);if(autoFit)fit();
    }
    if(root.L){
      map=root.L.map($('.spot-map'),{zoomControl:false,scrollWheelZoom:false,minZoom:6,maxZoom:16,zoomSnap:.25,maxBounds:[[32,123],[40,132]],maxBoundsViscosity:.8}).setView([36.5,127.8],7);
      layer=root.L.layerGroup().addTo(map);
      const tiles=root.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
      tiles.on('tileerror',()=>{if(++tileFailure>2)$('.spot-map-status').textContent='지도를 불러오지 못한 부분이 있습니다. 장소 목록은 계속 이용할 수 있습니다.'});
      map.on('moveend',()=>{renderMarkers();if(state.inView)renderList()});
      map.on('focus',()=>map.scrollWheelZoom.enable());map.on('blur',()=>map.scrollWheelZoom.disable());
      observer=new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!disposed)map.invalidateSize({pan:false})},100)});observer.observe($('.spot-map'));
    } else {
      $('.spot-map-status').textContent='지도 연결이 원활하지 않습니다. 목록에서 장소를 선택해 주세요.';
      host.querySelectorAll('.spot-map-controls button,[data-in-view]').forEach(b=>b.disabled=true);
    }
    listen(host,'click',event=>{
      const row=event.target.closest('[data-place]');if(row){choose(places.find(p=>p.id===row.dataset.place));return;}
      const kind=event.target.closest('[data-kind]');if(kind){state.kind=kind.dataset.kind;state.category='all';applyFilters();return;}
      const category=event.target.closest('[data-category]');if(category){state.category=category.dataset.category;applyFilters();return;}
      const action=event.target.closest('[data-action]')?.dataset.action;
      if(action==='zoom-in')map?.zoomIn();if(action==='zoom-out')map?.zoomOut();if(action==='fit')fit();
      if(action==='locate'&&selected){map?.flyTo([selected.lat,selected.lng],13,{animate:!reduced.matches,duration:.4});$('.spot-map').focus({preventScroll:true});}
      if(action==='clear'||action==='reset'){state.search='';$('.spot-search input').value='';if(action==='reset'){state.kind='spot';state.category='all';state.corridor='all';state.inView=false;$('.spot-region select').value='all';$('[data-in-view]').checked=false;}applyFilters();}
    });
    listen($('.spot-search input'),'input',event=>{state.search=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>applyFilters(),160)});
    listen($('.spot-region select'),'change',event=>{state.corridor=event.target.value;applyFilters()});
    listen($('[data-in-view]'),'change',event=>{state.inView=event.target.checked;renderList()});
    listen($('.spot-list'),'mouseover',event=>{const id=event.target.closest('[data-place]')?.dataset.place;if(id)markers.get(id)?.openTooltip()});
    listen($('.spot-list'),'mouseout',()=>markers.forEach(marker=>marker.closeTooltip()));
    applyFilters();
    if(initial&&map)map.setView([initial.lat,initial.lng],11,{animate:false});
    return ()=>{disposed=true;events.abort();clearTimeout(searchTimer);clearTimeout(resizeTimer);observer?.disconnect();map?.remove();host.classList.remove('spots-main');};
  }
  root.SSKR_APP_SPOTS={mount,filterPlaces,clusterPlaces};
  if(typeof module!=='undefined')module.exports={filterPlaces,clusterPlaces};
})(typeof window!=='undefined'?window:globalThis);
