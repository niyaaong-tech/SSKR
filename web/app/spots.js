(function(root){'use strict';
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

  const shared=typeof module==='object'&&module.exports?require('../shared/map/map'):root.SSKR_MAP;
  const {clusterPlaces}=shared;
  function mount(host,options={}){
    const places=root.SSKR_SPOT_CATALOG||root.SSKR_PLACES||[],aliases={pyeongchang:'daegwallyeong',goesan:'sanmagi',gunsan:'daecheon'};
    const initial=places.find(p=>p.id===(aliases[options.id]||options.id)),query=new URLSearchParams(location.search);
    const state={kind:initial?.kind||'spot',category:'all',corridor:'all',search:query.get('spotSearch')||''};
    let selected=initial||places.find(p=>p.kind==='spot'),visible=[],searchTimer,viewer;
    const events=new AbortController(),reduced=matchMedia('(prefers-reduced-motion:reduce)');
    const numbers=new Map(places.filter(p=>p.kind==='spot').map((p,i)=>[p.id,i+1]));
    const entries=places.map(p=>({...p,number:p.kind==='start'?'출':p.kind==='finish'?'도':numbers.get(p.id)}));
    host.classList.add('spots-main');
    host.innerHTML=`<section class="spot-workbench" aria-label="스팟 지도 탐색">
      <header class="spot-heading"><div><p>MY DAY, MY STOPS</p><h2>어디에 들를까요?</h2><span>동해의 출발점부터 대천까지, 나의 하루에 어울리는 장소를 골라보세요.</span></div><div class="spot-total"><strong>${places.filter(p=>p.kind==='spot').length}</strong><span>개의 경유 스팟<br>출발지 5곳 · 도착지 1곳</span></div></header>
      <div class="spot-toolbar"><label class="spot-search">${icon('search')}<span class="spot-sr">장소 이름 또는 지역 검색</span><input type="search" placeholder="장소 이름, 지역으로 검색" value="${esc(state.search)}" autocomplete="off"><button type="button" data-action="clear" aria-label="검색어 지우기">×</button></label><label class="spot-region"><span>탐색 권역</span><select><option value="all">모든 권역</option>${Object.entries(corridors).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label><div class="spot-kind" role="group" aria-label="장소 구분">${[['spot','스팟'],['start','출발지'],['finish','도착지'],['all','전체']].map(([key,label])=>`<button type="button" data-kind="${key}" aria-pressed="${key===state.kind}">${label}</button>`).join('')}</div></div>
      <div class="spot-categories" role="group" aria-label="스팟 주제">${Object.entries(categories).map(([key,label])=>`<button type="button" data-category="${key}" aria-pressed="${key==='all'}">${key==='all'?'':icon(key)}${label}<span data-count="${key}"></span></button>`).join('')}</div>
      <div class="spot-map-host"></div>
      <section class="spot-detail" aria-label="선택한 장소 상세"></section>
      <p class="spot-map-note">지도 위치는 탐색용 근사 좌표입니다. 실제 입구·주차와 영업 여부는 방문 전 확인해 주세요. 장소 선택은 경로 안내나 출발지 확정으로 처리되지 않습니다.</p>
    </section>`;

    const $=selector=>host.querySelector(selector),listen=(node,event,handler)=>node.addEventListener(event,handler,{signal:events.signal});
    function syncURL(place) {
      const url=new URL(location.href);url.pathname='/app/spots'+(place?'/'+encodeURIComponent(place.id):'');
      state.search?url.searchParams.set('spotSearch',state.search):url.searchParams.delete('spotSearch');
      history.replaceState(history.state,'',url.pathname+url.search);
    }
    function renderDetail(place) {
      const detail=$('.spot-detail');
      if(!place&&visible.length){detail.innerHTML='<div class="spot-detail-empty"><h3>장소를 선택해 주세요.</h3><p>지도 번호나 사진 카드를 누르면 장소 정보를 볼 수 있습니다.</p></div>';return;}
      if(!place){detail.innerHTML='<div class="spot-detail-empty"><h3>조건에 맞는 장소가 없습니다.</h3><p>검색어를 줄이거나 다른 권역을 선택해 보세요.</p><button type="button" data-action="reset">검색 조건 초기화</button></div>';return;}
      const category=place.kind==='spot'?categories[place.category]||'자연 · 전망':labels[place.kind];
      const mapURL='https://map.naver.com/p/search/'+encodeURIComponent((place.address||place.region)+' '+place.name);
      detail.innerHTML=`<button type="button" class="spot-return" data-action="return-map">← 지도로 돌아가기</button><div class="spot-detail-visual ${place.image?'':'spot-location-visual'}">${place.image?`<img src="${esc(place.image)}" alt="${esc(place.name)}" decoding="async" referrerpolicy="no-referrer"><span>${esc(place.photoCredit||'장소 정보 사진')}</span>`:`${icon(place.category)}<strong>${esc(place.region)}</strong><span>${place.lat.toFixed(3)}° N · ${place.lng.toFixed(3)}° E</span><a href="${esc(mapURL)}" target="_blank" rel="noopener noreferrer">지도에서 장소 사진 확인 ${icon('external')}</a>`}</div><div class="spot-detail-copy"><div class="spot-detail-top"><span>${esc(category)} · ${esc(corridors[place.corridor])}</span><a href="${esc(place.source)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(place.name)} 정보 출처">출처 ${icon('external')}</a></div><h3>${esc(place.name)}</h3><p class="spot-detail-lead">${esc(place.lead)}</p><p>${esc(place.description)}</p><dl><div><dt>위치</dt><dd>${esc(place.address||place.region)}</dd></div><div><dt>방문 메모</dt><dd>${esc(place.note)}</dd></div></dl><div class="spot-detail-actions"><a href="${esc(mapURL)}" target="_blank" rel="noopener noreferrer">네이버 지도에서 확인 ${icon('external')}</a><button type="button" data-action="locate">지도에서 위치 보기 ${icon('pin')}</button></div><div class="spot-participant-note">${options.participation?'장소를 둘러보며 나의 경유 계획을 준비하세요.':'참가 확정되면 SSKR 관련 안내가 제공됩니다.'}</div></div>`;
      const img=detail.querySelector('img');
      if(img)listen(img,'error',()=>{const visual=detail.querySelector('.spot-detail-visual');visual.classList.add('spot-location-visual');visual.innerHTML=`${icon(place.category)}<strong>${esc(place.region)}</strong><a href="${esc(mapURL)}" target="_blank" rel="noopener noreferrer">장소 사진 확인 ${icon('external')}</a>`});
    }

    viewer=shared.mount($('.spot-map-host'),{items:entries,catalog:entries,initialId:selected?.id,initialZoom:initial?11:undefined,inView:true,
      onSelect:p=>{selected=p;syncURL(p);renderDetail(p)},onOpen:()=>$('.spot-detail').scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'}),onDeselect:()=>{selected=null;syncURL(null);renderDetail(null)}});
    function applyFilters(reset=false){
      visible=filterPlaces(entries,state);if(!visible.some(p=>p.id===selected?.id))selected=visible[0];syncURL(selected);
      host.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===state.kind)));
      host.querySelectorAll('[data-category]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.category===state.category));b.disabled=state.kind==='start'||state.kind==='finish'});
      const counts=filterPlaces(entries,{...state,category:'all'});host.querySelectorAll('[data-count]').forEach(n=>n.textContent=counts.filter(p=>n.dataset.count==='all'||p.category===n.dataset.count).length);
      $('[data-action="clear"]').hidden=!state.search;viewer.setItems(visible,{selectedId:selected?.id,reset});renderDetail(selected);
    }
    listen(host,'click',event=>{
      const kind=event.target.closest('[data-kind]');if(kind){state.kind=kind.dataset.kind;state.category='all';applyFilters();return;}
      const category=event.target.closest('[data-category]');if(category){state.category=category.dataset.category;applyFilters();return;}
      const action=event.target.closest('[data-action]')?.dataset.action;
      if(action==='return-map')viewer.returnToMap();if(action==='locate'&&selected)viewer.locate(selected.id);
      if(action==='clear'||action==='reset'){state.search='';$('.spot-search input').value='';if(action==='reset'){state.kind='spot';state.category='all';state.corridor='all';$('.spot-region select').value='all';}applyFilters(action==='reset');}
    });
    listen($('.spot-search input'),'input',event=>{state.search=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>applyFilters(),160)});
    listen($('.spot-region select'),'change',event=>{state.corridor=event.target.value;applyFilters()});
    applyFilters();if(initial)viewer.getMap()?.setView([initial.lat,initial.lng],Math.max(11,viewer.getMap().getMinZoom()),{animate:false});
    return()=>{events.abort();clearTimeout(searchTimer);viewer.destroy();host.classList.remove('spots-main')};
  }
  root.SSKR_APP_SPOTS={mount,filterPlaces,clusterPlaces};if(typeof module!=='undefined')module.exports={filterPlaces,clusterPlaces};
})(typeof globalThis!=='undefined'?globalThis:this);
