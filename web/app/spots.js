(function(root){'use strict';
  const categories = {all:'모든 스팟',cafe:'라이딩 · 카페',food:'맛집 · 시장',nature:'자연 · 전망',culture:'역사 · 마을'};
  const labels = {start:'출발지',finish:'도착지',spot:'스팟'};
  const paths = {search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',pin:'<path d="M12 21s7-6 7-12A7 7 0 0 0 5 9c0 6 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',external:'<path d="M14 4h6v6m0-6-9 9M10 5H5v14h14v-5"/>',reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',cafe:'<path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Zm12 1h2a3 3 0 0 1 0 6h-2M7 3v2m5-2v2"/>',food:'<path d="M4 10h16l-2-6H6l-2 6Zm1 0v10h14V10M9 20v-6h6v6"/>',nature:'<path d="m3 20 7-14 5 10 2-4 4 8H3Zm4-8 3 2 3-2"/>',culture:'<path d="m3 8 9-5 9 5H3Zm2 3v7m5-7v7m4-7v7m5-7v7M3 21h18"/>'};
  const icon = key => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[key]||paths.pin}</svg>`;
  const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value??'').toLowerCase().replace(/\s/g,'');
  function filterPlaces(places, state) {
    const query=normalize(state.search);
    return places.filter(p=>(state.kind==='all'||p.kind===state.kind)&&(state.category==='all'||p.category===state.category)&&(!query||normalize([p.name,p.region,p.address,p.lead].join(' ')).includes(query)));
  }

  const shared=typeof module==='object'&&module.exports?require('../shared/map/map'):root.SSKR_MAP;
  const {clusterPlaces}=shared;
  function mount(host,options={}){
    const places=root.SSKR_SPOT_CATALOG||root.SSKR_PLACES||[],aliases={pyeongchang:'daegwallyeong',goesan:'sanmagi',gunsan:'daecheon'};
    const initial=places.find(p=>p.id===(aliases[options.id]||options.id)),query=new URLSearchParams(location.search);
    const kind=query.get('spotKind'),category=query.get('spotCategory');
    const state={kind:kind==='all'||Object.hasOwn(labels,kind)?kind:initial?.kind||'spot',category:Object.hasOwn(categories,category)?category:'all',search:query.get('spotSearch')||''};
    if(state.kind==='start'||state.kind==='finish')state.category='all';
    let selected=initial||places.find(p=>p.kind==='spot'),visible=[],searchTimer,viewer,planner,editing=false,browseFilters=null,routeStartId=null;
    const events=new AbortController(),reduced=matchMedia('(prefers-reduced-motion:reduce)');
    const numbers=new Map(places.filter(p=>p.kind==='spot').map((p,i)=>[p.id,i+1]));
    const entries=places.map(p=>({...p,number:p.kind==='start'?'출':p.kind==='finish'?'도':numbers.get(p.id)}));
    host.classList.add('spots-main');
    host.innerHTML=`<section class="spot-workbench" aria-label="스팟 지도 탐색">
      <header class="spot-heading"><div><p>MY DAY, MY STOPS</p><h2>어디에 들를까요?</h2><span>동해안과 부산의 출발점부터 대천까지, 나의 하루에 어울리는 장소를 골라보세요.</span></div></header>
      <div class="spot-mode-switch" role="group" aria-label="스팟 페이지 모드"><button type="button" data-spot-mode="browse" aria-pressed="true">스팟 탐색</button><button type="button" data-spot-mode="plan" aria-pressed="false">루트 만들기</button></div>
      <div class="spot-toolbar"><div class="spot-kind" role="group" aria-label="장소 구분">${[['spot','스팟'],['start','출발지'],['finish','도착지'],['all','전체']].map(([key,label])=>`<button type="button" data-kind="${key}" aria-pressed="${key===state.kind}">${label}</button>`).join('')}</div><label class="spot-search">${icon('search')}<input type="search" aria-label="장소 이름 또는 지역 검색" placeholder="장소 이름 또는 지역 검색" value="${esc(state.search)}" autocomplete="off"><button type="button" data-action="clear" aria-label="검색어 지우기">×</button></label></div>
      <div class="spot-categories" role="group" aria-label="스팟 주제">${Object.entries(categories).map(([key,label])=>`<button type="button" data-category="${key}" aria-pressed="${key==='all'}">${key==='all'?'':icon(key)}${label}<span data-count="${key}"></span></button>`).join('')}</div>
      <div class="spot-planning-area"><div class="spot-map-host"></div><aside class="route-planner" aria-label="주행 루트 편집" hidden></aside></div>
      <section class="spot-detail" aria-label="선택한 장소 상세"></section>
      <p class="spot-map-note">경유 스팟은 지도에 등록된 주차 구역을 가리킵니다. 현장 주차 운영과 이륜차 이용 조건은 방문 전 확인해 주세요.</p>
    </section>`;

    const $=selector=>host.querySelector(selector),listen=(node,event,handler)=>node.addEventListener(event,handler,{signal:events.signal});
    function syncURL(place) {
      const url=new URL(location.href);url.pathname='/app/spots'+(place?'/'+encodeURIComponent(place.id):'');
      state.search?url.searchParams.set('spotSearch',state.search):url.searchParams.delete('spotSearch');
      state.kind==='spot'?url.searchParams.delete('spotKind'):url.searchParams.set('spotKind',state.kind);
      state.category==='all'?url.searchParams.delete('spotCategory'):url.searchParams.set('spotCategory',state.category);
      history.replaceState(history.state,'',url.pathname+url.search);
    }
    function renderDetail(place) {
      const detail=$('.spot-detail');
      if(!place&&visible.length){detail.innerHTML='<div class="spot-detail-empty"><h3>장소를 선택해 주세요.</h3><p>지도 번호나 사진 카드를 누르면 장소 정보를 볼 수 있습니다.</p></div>';return;}
      if(!place){detail.innerHTML='<div class="spot-detail-empty"><h3>조건에 맞는 장소가 없습니다.</h3><p>검색어와 장소 유형을 바꿔 보세요.</p><button type="button" data-action="reset">검색 조건 초기화</button></div>';return;}
      const category=place.kind==='spot'?categories[place.category]||'자연 · 전망':labels[place.kind];
      const mapURL='https://map.naver.com/p/search/'+encodeURIComponent((place.address||place.region)+' '+place.name);
      detail.innerHTML=`<button type="button" class="spot-return" data-action="return-map">← 지도로 돌아가기</button><div class="spot-detail-visual ${place.image?'':'spot-location-visual'}">${place.image?`<img src="${esc(place.image)}" alt="${esc(place.name)}" decoding="async" referrerpolicy="no-referrer"><a class="spot-photo-credit" href="${esc(place.photoSource||place.source)}" target="_blank" rel="noopener noreferrer">${esc(place.photoCredit||'장소 정보 사진')}</a>`:`${icon(place.category)}<strong>${esc(place.region)}</strong><span>${place.lat.toFixed(3)}° N · ${place.lng.toFixed(3)}° E</span><a href="${esc(mapURL)}" target="_blank" rel="noopener noreferrer">지도에서 장소 사진 확인 ${icon('external')}</a>`}</div><div class="spot-detail-copy"><div class="spot-detail-top"><span>${esc(category)}</span><a href="${esc(place.source)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(place.name)} 정보 출처">출처 ${icon('external')}</a></div><h3>${esc(place.name)}</h3><p class="spot-detail-lead">${esc(place.lead)}</p><p>${esc(place.description)}</p><dl><div><dt>위치</dt><dd>${esc(place.address||place.region)}</dd></div><div><dt>방문 메모</dt><dd>${esc(place.note)}</dd></div></dl><div class="spot-detail-actions"><a href="${esc(mapURL)}" target="_blank" rel="noopener noreferrer">네이버 지도에서 확인 ${icon('external')}</a><button type="button" data-action="locate">지도에서 위치 보기 ${icon('pin')}</button></div><div class="spot-participant-note">${options.participation?'장소를 둘러보며 나의 경유 계획을 준비하세요.':'참가 확정되면 SSKR 관련 안내가 제공됩니다.'}</div></div>`;
      if(place.parking){
        const {lat,lng,osm}=place.parking;
        const gps=`${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        const parkingURL=`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        detail.querySelector('dl').insertAdjacentHTML('beforeend',`<div><dt>주차 구역 GPS</dt><dd><a href="${esc(parkingURL)}" target="_blank" rel="noopener noreferrer">${esc(gps)} ${icon('external')}</a> · <a href="${esc(osm)}" target="_blank" rel="noopener noreferrer">주차 구역 원본</a></dd></div>`);
      }
      const img=detail.querySelector('img');
      if(img)listen(img,'error',()=>{const visual=detail.querySelector('.spot-detail-visual');visual.classList.add('spot-location-visual');visual.innerHTML=`${icon(place.category)}<strong>${esc(place.region)}</strong><a href="${esc(mapURL)}" target="_blank" rel="noopener noreferrer">장소 사진 확인 ${icon('external')}</a>`});
    }

    const filterParking=document.createElement('div');filterParking.className='spot-filter-parking';
    $('.spot-planning-area').before(filterParking);
    const filters=[$('.spot-toolbar'),$('.spot-categories')];filters.forEach(node=>filterParking.append(node));
    viewer=shared.mount($('.spot-map-host'),{items:entries,catalog:entries,initialId:selected?.id,initialZoom:initial?11:undefined,inView:true,
      onRouteAdd:p=>planner?.addFromMap(p),onSelect:p=>{selected=p;if(editing){planner?.select(p);return;}syncURL(p);renderDetail(p)},onOpen:p=>{if(editing){planner?.openPlace(p);return;}$('.spot-detail').scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});},onDeselect:()=>{selected=null;if(!editing){syncURL(null);renderDetail(null);}}});
    planner=root.SSKR_ROUTE_PLANNER.mount($('.route-planner'),{catalog:entries,viewer,filters,filterParking,getAccount:options.getAccount,onLogin:options.onLogin,
      onModeChange:(value,startId)=>{clearTimeout(searchTimer);if(value&&!editing)browseFilters={...state};editing=value;if(!value)filters.forEach(node=>filterParking.append(node));routeStartId=value?startId:null;if(value){state.kind=startId?'spot':'start';state.category='all';state.search='';}else if(browseFilters){Object.assign(state,browseFilters);browseFilters=null;}$('.spot-search input').value=state.search;$('.spot-workbench').classList.toggle('is-planning',value);$('.spot-planning-area').classList.toggle('is-editing',value);host.querySelectorAll('[data-spot-mode]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.spotMode==='plan')===value)));if(viewer)applyFilters();},
      onStartChange:id=>{routeStartId=id;state.kind=id?'spot':'start';state.category='all';state.search='';$('.spot-search input').value='';applyFilters();},
      onRoadReady:()=>{if(editing&&routeStartId)applyFilters();},
      onFindPlaces:()=>{state.kind=routeStartId?'spot':'start';state.category='all';applyFilters();}
    });
    function applyFilters(reset=false){
      if(editing&&!routeStartId)state.kind='start';
      visible=filterPlaces(entries,state);if(editing&&routeStartId&&state.kind==='spot'){
        const origin=entries.find(p=>p.id===routeStartId),approx=p=>Math.hypot((p.lat-origin.lat)*111000,(p.lng-origin.lng)*90000);
        visible.sort((a,b)=>(planner?.distanceFromStart(a.id)??approx(a))-(planner?.distanceFromStart(b.id)??approx(b)));
      }
      if(!editing&&!visible.some(p=>p.id===selected?.id))selected=visible[0];if(!editing)syncURL(selected);
      host.querySelectorAll('[data-kind]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.kind===state.kind));b.disabled=editing&&b.dataset.kind!==(routeStartId?'spot':'start');});
      host.querySelectorAll('[data-category]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.category===state.category));b.disabled=state.kind==='start'||state.kind==='finish'});
      const counts=filterPlaces(entries,{...state,category:'all'});host.querySelectorAll('[data-count]').forEach(n=>n.textContent=counts.filter(p=>n.dataset.count==='all'||p.category===n.dataset.count).length);
      $('[data-action="clear"]').hidden=!state.search;viewer.setItems(visible,{selectedId:editing?undefined:selected?.id,reset,fit:!editing});planner?.setFilters(visible,Boolean(state.search||state.category!=='all'));if(!editing)renderDetail(selected);
    }
    listen(host,'click',event=>{
      const mode=event.target.closest('[data-spot-mode]');if(mode){planner.setMode(mode.dataset.spotMode==='plan');if(editing&&!routeStartId)viewer.fitRoute?.();return;}
      const kind=event.target.closest('[data-kind]');if(kind){if(editing&&kind.dataset.kind!==(routeStartId?'spot':'start'))return;state.kind=kind.dataset.kind;state.category='all';applyFilters();return;}
      const category=event.target.closest('[data-category]');if(category){state.category=category.dataset.category;applyFilters();return;}
      const action=event.target.closest('[data-action]')?.dataset.action;
      if(action==='return-map')viewer.returnToMap();if(action==='locate'&&selected)viewer.locate(selected.id);
      if(action==='clear'||action==='reset'){state.search='';$('.spot-search input').value='';if(action==='reset'){state.kind=editing&&!routeStartId?'start':'spot';state.category='all';}applyFilters(action==='reset');}
    });
    listen($('.spot-search input'),'input',event=>{state.search=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>applyFilters(),160)});
    applyFilters();if(initial&&!editing)viewer.getMap()?.setView([initial.lat,initial.lng],Math.max(11,viewer.getMap().getMinZoom()),{animate:false});
    return()=>{events.abort();clearTimeout(searchTimer);planner.destroy();viewer.destroy();host.classList.remove('spots-main')};
  }
  root.SSKR_APP_SPOTS={mount,filterPlaces,clusterPlaces};if(typeof module!=='undefined')module.exports={filterPlaces,clusterPlaces};
})(typeof globalThis!=='undefined'?globalThis:this);
