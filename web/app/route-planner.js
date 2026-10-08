(function(root){'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy=v=>JSON.parse(JSON.stringify(v));
  const km=v=>Number.isFinite(v)?`${(v/1000).toFixed(1)} km`:'계산 전';
  const time=v=>{if(!Number.isFinite(v))return '';const m=Math.round(v/60);return m>=60?`${Math.floor(m/60)}시간 ${m%60}분`:`${m}분`;};
  const roadMessage=error=>/[가-힣]/.test(error?.message||'')?error.message:'도로 정보를 불러오지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.';
  const SESSION='sskr.route-editor';
  const categories={cafe:'라이딩 · 카페',food:'맛집 · 시장',nature:'자연 · 전망',culture:'역사 · 마을'};
  const placeText=value=>root.SSKR_MAP.formatPlaceText(value);
  function mount(host,options){
    const domain=root.SSKR_ROUTE_PLAN,catalog=options.catalog,byId=new Map(catalog.map(p=>[p.id,p])),viewer=options.viewer;
    let storage,session;try{storage=root.localStorage;}catch{}try{session=root.sessionStorage;}catch{}
    const store=domain.createStore(storage,catalog),provider=root.SSKR_ROUTE_PROVIDER.create(),events=new AbortController();
    let account=options.getAccount?.()||{},plan=domain.createEmpty(catalog),active=false,tab='search',sheet='half',dirty=false,selected=null,anchorId=null;
    let providerStarted=false,ready=false,routeBusy=false,routeError='',providerError='',result=null,variant=0,preview=null,filterItems=[],candidateLimit=12,disposed=false,routeRequest=0,routeAbort=null,dialog=null,disposeDialog=null,flashTimer,scrollRestore=null;
    const undo=[];
    let detailId=null,detailScroll=0,returnTab='search',filterOpen=false,syncingSelection=false,noticeMessage='',noticeError=false,manualChoice=false;
    let layoutFrame=0,mobile=false,sticky=null,mapSummary=null,viewportHeight=root.innerHeight,viewportWidth=root.innerWidth;
    const area=host.parentElement,mapHost=area.querySelector('.spot-map-host'),filterNodes=options.filters||[],tabScroll=new Map();
    function mobilePosition(){return Math.max(0,root.scrollY-(area.getBoundingClientRect().top+root.scrollY));}
    function scrollList(position=0){if(mobile)root.scrollTo({top:area.getBoundingClientRect().top+root.scrollY+position,behavior:'instant'});}
    function revealMap(){if(!mobile)return;const box=mapHost.getBoundingClientRect(),height=root.visualViewport?.height||root.innerHeight;if(box.top<0||box.bottom>height)scrollList();}
    function layoutMode(){
      const next=active&&root.matchMedia('(max-width:800px)').matches,changed=mobile!==next;mobile=next;
      document.body.classList.toggle('route-editor-mobile',mobile);area.classList.toggle('is-mobile-editor',mobile);mapHost.classList.toggle('is-mobile-editor',mobile);
      if(mobile&&!sticky){sticky=document.createElement('div');sticky.className='rp-mobile-sticky';area.insertBefore(sticky,host);sticky.append(mapHost);mapSummary=document.createElement('div');mapSummary.className='rp-map-summary rp-summary';mapSummary.setAttribute('role','status');mapHost.querySelector('.spot-map-wrap').append(mapSummary);viewer.setInsets?.({bottom:32});}
      else if(!mobile&&sticky){const tabs=area.querySelector('.rp-tabs');if(tabs)host.querySelector('.rp-header')?.after(tabs);area.insertBefore(mapHost,host);mapSummary.remove();mapSummary=null;sticky.remove();sticky=null;area.classList.remove('has-keyboard');viewer.setInsets?.({});}
      return changed;
    }
    function workspaceLayout(){
      if(!active||disposed)return;
      if(mobile){
        area.style.removeProperty('height');area.style.removeProperty('--rp-sheet-height');area.style.removeProperty('--rp-half-height');area.classList.remove('is-landscape');
        const focused=document.activeElement?.matches('input,textarea')&&!dialog,visible=root.visualViewport?.height||root.innerHeight;
        if(viewportWidth!==root.innerWidth){viewportWidth=root.innerWidth;viewportHeight=root.innerHeight;}else viewportHeight=Math.max(viewportHeight,root.innerHeight);
        const keyboard=Boolean(focused&&visible<viewportHeight*.75),keyboardChanged=keyboard!==area.classList.contains('has-keyboard');area.classList.toggle('has-keyboard',keyboard);
        const tabs=area.querySelector('.rp-tabs');if(tabs&&tabs.parentElement!==(keyboard?area:sticky)){const focusedTab=tabs.contains(document.activeElement)?document.activeElement:null;if(keyboard)area.insertBefore(tabs,host);else sticky.append(tabs);focusedTab?.focus({preventScroll:true});}
        area.style.setProperty('--rp-sticky-height',(keyboard?tabs?.offsetHeight||44:sticky.offsetHeight)+'px');if(keyboardChanged&&focused){const input=document.activeElement;requestAnimationFrame(()=>{if(!disposed&&input.isConnected)input.scrollIntoView({block:'nearest',behavior:'instant'});});}selectionLayout();return;
      }
      const viewport=root.visualViewport, bottom=(viewport?.height||root.innerHeight)+(viewport?.offsetTop||0);
      const height=Math.max(180,Math.floor(bottom-area.getBoundingClientRect().top-8));
      const landscape=area.clientWidth>=640&&root.innerHeight<500;area.classList.toggle('is-landscape',landscape);
      if(landscape&&sheet!=='half'){sheet='half';host.dataset.sheet=sheet;}
      if(!landscape&&root.innerHeight<500&&document.activeElement?.matches('input,textarea')){sheet='full';host.dataset.sheet=sheet;}
      area.style.height=height+'px';
      const reserve=root.innerHeight<500?190:270;
      area.style.setProperty('--rp-half-height',Math.max(84,Math.min(Math.max(height*.45,330),height-reserve))+'px');
      selectionLayout();
    }
    function selectionLayout(){if(!mobile)area.style.setProperty('--rp-sheet-height',host.clientHeight+'px');viewer.getMap?.()?.invalidateSize({pan:false});}
    function scheduleLayout(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>{workspaceLayout();requestAnimationFrame(()=>{if(active&&!disposed&&selected)viewer.revealSelected?.(selected.id);});});}
    function selectOnMap(id,pan=false){
      const place=byId.get(id),map=viewer.getMap?.();
      if(place&&!mobile&&!area.classList.contains('is-wide')){sheet='half';render();selectionLayout();}
      if(pan)revealMap();
      syncingSelection=true;try{viewer.select?.(id,{reveal:!pan});}finally{syncingSelection=false;}
      if(pan&&place&&map){map.stop?.();map.setView([place.lat,place.lng],Math.max(map.getZoom(),8),{animate:false});viewer.revealSelected?.(id);requestAnimationFrame(()=>viewer.revealSelected?.(id));}
    }
    function resizeLayout(){const changed=layoutMode(),wide=area.clientWidth>=1100;if(changed||area.classList.contains('is-wide')!==wide){area.classList.toggle('is-wide',wide);if(wide&&tab==='route')tab=plan.startId?'places':'search';render();}scheduleLayout();}
    const resize=new ResizeObserver(resizeLayout);
    resize.observe(area);
    const panelResize=new ResizeObserver(()=>{if(active&&!mobile)selectionLayout();});panelResize.observe(host);root.addEventListener('resize',resizeLayout,{signal:events.signal});root.visualViewport?.addEventListener('resize',scheduleLayout,{signal:events.signal});
    host.addEventListener('focusin',scheduleLayout,{signal:events.signal});host.addEventListener('focusout',()=>requestAnimationFrame(scheduleLayout),{signal:events.signal});
    function recover(){try{const value=JSON.parse(session?.getItem(SESSION)||'null');if(value&&(value.ownerId===null||value.ownerId===(account.linked?account.id:null))){plan=domain.normalize(value.plan,catalog);active=value.active===true;dirty=value.dirty===true;anchorId=value.anchorId||plan.stopIds.at(-1)||plan.startId;selected=byId.get(value.selectedId)||byId.get(anchorId)||null;scrollRestore=value.viewport;}}catch{}}
    recover();
    function snapshot(){const map=viewer.getMap?.(),center=map?.getCenter();return center?{lat:center.lat,lng:center.lng,zoom:map.getZoom(),scrollY:root.scrollY}:scrollRestore;}
    function persist(){try{session?.setItem(SESSION,JSON.stringify({plan,active,dirty,anchorId,selectedId:selected?.id||null,ownerId:account.linked?account.id:null,viewport:snapshot()}));}catch{/* Restricted session storage must not interrupt editing. */}}
    function notify(message,error=false){noticeMessage=message;noticeError=error;clearTimeout(flashTimer);const el=host.querySelector('.rp-notice');if(el){el.textContent=message;el.classList.toggle('is-error',error);el.hidden=false;}flashTimer=setTimeout(()=>{noticeMessage='';const current=host.querySelector('.rp-notice');if(current)current.hidden=true;},3500);}
    function status(p=plan){return domain.status(p,catalog,ready?provider:null);}
    function distanceSummary(p=plan){const value=status(p);return Number.isFinite(value.distanceMeters)?`<strong>${km(value.distanceMeters)}</strong><span class="rp-drive-time">예상 주행 ${time(value.durationSeconds)} <small>정차·교통 제외</small></span>`:`<strong>${!p.startId?'출발지를 선택해 주세요':!ready?'도로 정보 준비 중':'경로 확인 필요'}</strong>`;}
    function mapPlan(p=plan,fit=false){if(!active)return;const ids=p.startId?domain.orderedIds(p):[];viewer.setRoute?.(preview?preview.result?.legs||[]:result?.legs||[],{selectedIds:ids,activeId:anchorId,places:ids.map(id=>byId.get(id)).filter(Boolean),fit});}
    function currentId(){return anchorId===plan.startId||plan.stopIds.includes(anchorId)?anchorId:plan.stopIds.at(-1)||plan.startId;}
    function recommendations(){if(!ready||!plan.startId||preview)return[];return domain.nextRecommendations(plan,currentId(),catalog,provider,{limit:3});}
    function syncMap(fit=false){if(!active)return;mapPlan(preview?.plan||plan,fit);viewer.setCandidates?.(recommendations().map(item=>byId.get(item.placeId)).filter(Boolean));}
    function setMode(value){active=value;document.body.classList.toggle('route-editor-active',value);layoutMode();host.hidden=!value;viewer.setEditing?.(value);options.onModeChange?.(value,plan.startId);if(value){render();root.scrollTo({top:0,behavior:'instant'});scheduleLayout();syncMap();if(selected)selectOnMap(selected.id);else if(mobile&&!plan.startId)requestAnimationFrame(()=>{if(active&&!disposed&&!plan.startId&&!selected)viewer.fitRoute?.();});if(!providerStarted)loadProvider();}persist();}
    async function calculate(fit=false){
      const request=++routeRequest;routeAbort?.abort();routeError='';
      const ids=domain.orderedIds(plan),pairs=new Set(ids.slice(1).map((id,i)=>ids[i]+'\u0000'+id));
      // Keep unchanged roads visible while replacing only the edited connections.
      result=result?{legs:result.legs.filter(leg=>pairs.has(leg.fromId+'\u0000'+leg.toId))}:null;
      if(!ready||!plan.startId){result=null;routeBusy=false;render();syncMap();return;}
      routeBusy=true;routeAbort=new AbortController();render();syncMap();
      try{const next=await provider.route(domain.orderedIds(plan),{signal:routeAbort.signal});if(disposed||request!==routeRequest)return;result=next;routeError=next.valid?'':'도로를 연결할 수 없는 구간이 있습니다. 장소를 바꾸거나 순서를 조정해 주세요.';}
      catch(error){if(disposed||request!==routeRequest||error?.name==='AbortError')return;routeError=roadMessage(error);}
      finally{if(!disposed&&request===routeRequest){routeBusy=false;render();syncMap(fit);}}
    }
    function change(next,message,fit=false){undo.push(copy(plan));if(undo.length>30)undo.shift();plan=domain.normalize(next,catalog);dirty=true;preview=null;persist();calculate(fit);if(message)notify(message);}
    function applyStart(id){anchorId=id;selected=byId.get(id);detailId=null;manualChoice=false;tab='places';sheet='half';change({...plan,startId:id},'출발지를 선택했습니다. 경유지를 직접 고르거나 10곳을 추천받으세요.');options.onStartChange?.(id);selectOnMap(id,true);host.querySelector('[data-scroll="places"]').scrollTop=0;}
    function changeSummary(value){const stats=status(value);return Number.isFinite(stats.distanceMeters)?`${km(stats.distanceMeters)} · 예상 주행 ${time(stats.durationSeconds)}`:'도로 정보를 확인한 뒤 계산합니다.';}
    function deltaSummary(before,after){
      const a=status(before),b=status(after);if(!Number.isFinite(a.distanceMeters)||!Number.isFinite(b.distanceMeters))return '';
      const distance=b.distanceMeters-a.distanceMeters,seconds=b.durationSeconds-a.durationSeconds;
      return `<p class="rp-change-delta">거리 ${distance>=0?'+':'−'}${km(Math.abs(distance))} · 주행 시간 ${seconds>=0?'+':'−'}${time(Math.abs(seconds))}</p>`;
    }
    function start(id){
      if(!byId.has(id)||byId.get(id).kind!=='start'||id===plan.startId)return;
      if(!plan.startId||!plan.stopIds.length){applyStart(id);return;}
      const next={...plan,startId:id};
      const modal=openDialog('출발지를 변경할까요?',`<p>기존 경유지 ${plan.stopIds.length}곳과 방문 순서를 유지합니다.</p><dl class="rp-start-impact"><dt>현재 · ${esc(placeText(byId.get(plan.startId)?.name))}</dt><dd>${changeSummary(plan)}</dd><dt>변경 · ${esc(placeText(byId.get(id)?.name))}</dt><dd>${changeSummary(next)}</dd></dl>${deltaSummary(plan,next)}<p class="rp-caption">예상 주행 시간은 정차와 실시간 교통을 포함하지 않습니다.</p><div class="rp-dialog-actions"><button type="button" data-cancel>취소</button><button type="button" class="rp-primary" data-confirm>변경 적용</button></div>`);
      modal.querySelector('[data-cancel]').onclick=closeDialog;modal.querySelector('[data-confirm]').onclick=()=>{closeDialog();applyStart(id);};
    }
    function add(id){const place=byId.get(id);if(!place)return;if(place.kind==='start'){start(id);return;}if(place.kind!=='spot')return;
      if(!plan.startId){tab='search';render();notify('먼저 출발지를 선택해 주세요.');return;}
      if(plan.stopIds.includes(id)){anchorId=id;render();notify('이미 경유지에 담긴 스팟입니다.');return;}
      const stops=plan.stopIds.slice(),index=anchorId===plan.startId?-1:stops.indexOf(anchorId);stops.splice(index>=0?index+1:anchorId===plan.startId?0:stops.length,0,id);
      anchorId=id;selected=place;detailId=null;change({...plan,stopIds:stops},`${placeText(place.name)} · 경유지에 추가했습니다.`);selectOnMap(id);
    }
    function select(place){if(syncingSelection||!active||!place||preview||(!plan.startId&&place.kind!=='start'))return;selected=byId.get(place.id)||place;if(plan.stopIds.includes(place.id)||plan.startId===place.id)anchorId=place.id;showDetail(place.id);syncMap();persist();}
    function card(place,{recommendation=null}={}){if(!place)return'';
      const position=plan.stopIds.indexOf(place.id),included=position>=0?`경로 포함 · ${position+1}번째`:place.id===plan.startId?'선택된 출발지':place.id===plan.finishId?'고정 도착지':'';
      return `<article class="rp-place${selected?.id===place.id?' is-selected':''}" data-place-id="${esc(place.id)}"><button type="button" class="rp-place-view" data-rp-action="select" data-id="${esc(place.id)}" aria-label="${esc(placeText(place.name))} 지도에서 확인">${place.image?`<img src="${esc(place.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'<span class="rp-photo-empty"></span>'}<span><small>${esc(placeText(place.region))}</small><strong>${esc(placeText(place.name))}</strong>${included?`<span class="rp-included">${included}</span>`:''}${recommendation?`<em>기준점부터 ${km(recommendation.fromDistanceMeters)} · ${time(recommendation.durationSeconds)}</em>`:`<em>${esc(place.kind==='start'?'출발지':place.kind==='finish'?'고정 도착지':categories[place.category]||'스팟')}</em>`}</span></button>${recommendation?`<p>이곳 추가 시 전체 경로 ${recommendation.addedDistanceMeters>=0?'+':'−'}${km(Math.abs(recommendation.addedDistanceMeters))} · ${recommendation.addedDurationSeconds>=0?'+':'−'}${time(Math.abs(recommendation.addedDurationSeconds))}</p>`:''}</article>`;
    }
    function pointRow(id,index,kind){const place=byId.get(id),name=placeText(place?.name||'더 이상 제공되지 않는 장소'),isStop=kind==='spot';
      return `<li class="rp-waypoint${anchorId===id?' is-active':''}${!place?' is-missing':''}" data-waypoint="${esc(id)}"${isStop&&!preview?' draggable="true"':''}><button type="button" class="rp-point-main" data-rp-action="anchor" data-id="${esc(id)}" aria-label="${esc(name)}${isStop?' 다음에 경유지 추가':''}"><span class="rp-point-number ${kind}">${isStop?index+1:kind==='start'?'출':'도'}</span><span><small>${kind==='start'?'출발지':kind==='finish'?'고정 도착지':esc(placeText(place?.region||'위치 확인 필요'))}</small><strong>${esc(name)}</strong>${preview?`<small class="rp-preview-origin">${plan.stopIds.includes(id)||kind!=='spot'?'기존 장소':'새 제안'}</small>`:''}</span></button>${kind==='start'&&!preview?'<button type="button" class="rp-start-change" data-rp-action="change-start" aria-label="출발지 변경">변경</button>':''}${!preview&&isStop&&anchorId===id?`<div class="rp-row-actions"><button type="button" class="rp-remove" data-rp-action="remove" data-id="${esc(id)}" aria-label="${esc(name)} 삭제">×</button><div class="rp-move"><button type="button" data-rp-action="up" data-id="${esc(id)}" aria-label="${esc(name)} 위로 이동" ${index===0?'disabled':''}>↑</button><button type="button" data-rp-action="down" data-id="${esc(id)}" aria-label="${esc(name)} 아래로 이동" ${index===plan.stopIds.length-1?'disabled':''}>↓</button></div></div>`:''}</li>`;
    }
    function anchorCaption(){return plan.startId?`<p class="rp-anchor">${esc(placeText(byId.get(currentId())?.name))} 다음에 추가</p>`:'';}
    function routeContent(){const displayed=preview?.plan||plan,stats=status(displayed);return `<div class="rp-route-selected"><div class="rp-route-heading"><h3>${preview?'미리보기 경로':'내 경로'}</h3><div class="rp-route-tools"><button type="button" data-rp-action="undo" ${undo.length&&!preview?'':'disabled'}>실행 취소</button><button type="button" data-rp-action="optimize" ${plan.stopIds.length<2||!ready||preview?'disabled':''}>순서 정리</button></div></div>
      <ol class="rp-waypoints">${displayed.startId?pointRow(displayed.startId,-1,'start'):'<li class="rp-start-empty"><button type="button" data-rp-action="change-start">출발지 선택</button></li>'}${displayed.stopIds.map((id,index)=>pointRow(id,index,'spot')).join('')}${pointRow(displayed.finishId,-1,'finish')}</ol>
      ${stats.issues.filter(issue=>issue.placeId||ready&&issue.code==='UNREACHABLE').map(issue=>`<p class="rp-error">${esc(issue.message)}</p>`).join('')}</div>`;}
    function routeFooter(){if(preview)return '';return status().spotCount>=10?'<p class="rp-complete">경유 10곳을 채웠습니다. 루트를 저장해 보세요.</p>':`<button class="rp-browse-button rp-primary" type="button" data-rp-action="autofill" ${!plan.startId||!ready?'disabled':''}>경유지 자동 완성</button>`;}
    function activateTab(next){if(mobile&&!detailId)tabScroll.set(tab,mobilePosition());detailId=null;tab=next;if(!mobile){if(sheet==='summary')sheet='half';if(next==='route'&&!area.classList.contains('is-wide')&&!area.classList.contains('is-landscape')&&root.innerHeight<760)sheet='full';}render();scheduleLayout();scrollList(tabScroll.get(next)||0);}
    function placesContent(){const starting=!plan.startId,items=filterItems.filter(p=>p.kind===(starting?'start':'spot')).sort((a,b)=>starting||!ready?0:(provider.summary(currentId(),a.id)?.distanceMeters??Infinity)-(provider.summary(currentId(),b.id)?.distanceMeters??Infinity)),rec=recommendations();return `
      ${tab==='places'&&!starting?`<section class="rp-next">${anchorCaption()}${!plan.stopIds.length&&!manualChoice?'<div class="rp-first-choice"><button type="button" data-rp-action="choose-stops">직접 고르기</button><button type="button" class="rp-primary" data-rp-action="auto-start">10곳 자동 완성</button></div>':'<div class="rp-section-title"><h3>다음 경유 추천</h3></div>'}${rec.map(r=>card(byId.get(r.placeId),{recommendation:r})).join('')||'<p class="rp-caption">현재 기준점에서 다음 구간에 어울리는 후보를 모두 살펴봤습니다. 다른 경유지를 기준으로 선택하거나 검색해 보세요.</p>'}</section>`:''}
      ${tab==='search'||starting?`${anchorCaption()}<div class="rp-search-slot"></div><details class="rp-filters" ${filterOpen?'open':''}><summary>카테고리</summary><div class="rp-filter-slot"></div></details><div class="rp-section-title"><h3>${starting?'출발지':'검색 결과'}</h3><span>${items.length}곳</span></div><div class="rp-place-results">${items.slice(0,candidateLimit).map(p=>card(p)).join('')||'<p class="rp-caption">조건에 맞는 장소가 없습니다. 검색 조건을 바꿔보세요.</p>'}</div>${items.length>candidateLimit?'<button type="button" class="rp-browse-button" data-rp-action="more">장소 더 보기</button>':''}`:''}`;}
    function detailContent(){const p=byId.get(detailId);if(!p)return '';return `<section class="rp-place-detail"><div class="rp-detail-head"><button type="button" data-rp-action="back-detail" aria-label="← 목록으로">←</button><div><h3>${esc(placeText(p.name))}</h3><p class="rp-detail-region">${esc(placeText(p.region))}</p></div></div>${plan.stopIds.includes(p.id)?`<p class="rp-included">경로 포함 · ${plan.stopIds.indexOf(p.id)+1}번째 경유지</p>`:''}${anchorCaption()}<p>${esc(p.description||p.lead)}</p>${p.image?`<figure class="rp-detail-visual"><img class="rp-detail-image" src="${esc(p.image)}" alt="${esc(placeText(p.name))}" referrerpolicy="no-referrer"><figcaption><a href="${esc(p.photoSource||p.source)}" target="_blank" rel="noopener noreferrer">${esc(p.photoCredit||'장소 사진 출처')}</a></figcaption></figure>`:''}<p>${esc(p.address||'')}</p><p class="rp-caption">${esc(p.note)}</p>${p.parking?`<p class="rp-caption">주차 위치 ${p.parking.lat.toFixed(6)}, ${p.parking.lng.toFixed(6)}</p>`:''}</section>`;}
    function savedContent(){if(!account.linked)return '<div class="rp-empty"><h3>다음에도 이어서 준비하세요</h3><p>로그인하면 참가 신청 없이도 루트를 저장하고 다시 불러올 수 있어요.</p><button type="button" class="rp-primary" data-rp-action="login">로그인</button></div>';let items;try{items=store.list(account);}catch(error){return `<p class="rp-error">${esc(error.message)}</p>`;}return `<div class="rp-section-title"><h3>내 루트</h3><button type="button" data-rp-action="new">새 루트</button></div>${items.length?items.map(item=>{const stats=status(item);return `<article class="rp-saved"><span>${stats.complete?'완성':'초안'} · 경유 ${item.stopIds.length}곳</span><h3>${esc(item.title)}</h3><p>${esc(placeText(byId.get(item.startId)?.name||'출발지 미정'))} → ${esc(placeText(byId.get(item.finishId)?.name))}</p><small>${km(stats.distanceMeters)} · ${time(stats.durationSeconds)}</small><div><button type="button" data-rp-action="load" data-id="${esc(item.id)}">불러오기</button><button type="button" data-rp-action="duplicate" data-id="${esc(item.id)}">복제해 편집</button><button type="button" data-rp-action="delete" data-id="${esc(item.id)}">삭제</button></div></article>`;}).join(''):'<div class="rp-empty"><h3>저장한 루트가 없어요</h3><p>경유지를 모두 고르기 전에도 초안으로 저장할 수 있어요.</p><button type="button" class="rp-primary" data-rp-action="route-tab">루트 만들기</button></div>'}`;}
    function previewContent(){const p=preview.plan,stats=status(p);return `<section class="rp-preview"><span class="rp-preview-tag">${preview.type==='optimize'?'방문 순서 제안':'추천 루트 미리보기'}</span><h3>${p.stopIds.length}곳을 잇는 하루</h3><div class="rp-preview-metrics">${distanceSummary(p)}</div><p>기존 ${km(status().distanceMeters)} · ${time(status().durationSeconds)}<br>변경 ${km(stats.distanceMeters)} · ${time(stats.durationSeconds)}</p>${deltaSummary(plan,p)}<p class="rp-theme-summary">${Object.entries(categories).map(([key,label])=>{const count=p.stopIds.filter(id=>byId.get(id)?.category===key).length;return count?`${label} ${count}곳`:null;}).filter(Boolean).join(' · ')}</p><p>직접 선택한 장소는 유지됩니다.</p>${p.stopIds.length<10?`<p class="rp-error">연결 가능한 후보를 ${p.stopIds.length}곳 찾았습니다. 적용 후 경유지를 더 골라주세요.</p>`:''}<ol>${p.stopIds.map(id=>`<li>${esc(placeText(byId.get(id)?.name||id))}</li>`).join('')}</ol></section>`;}
    function render(){if(disposed)return;if(!active){host.hidden=true;return;}
      const scrolls=[...host.querySelectorAll('[data-scroll]')].map(el=>[el.dataset.scroll,el.scrollTop]);
      const pageY=root.scrollY,focus=document.activeElement,focusId=area.contains(focus)?focus?.id:null,focusKey=focus?.dataset?.rpAction,focusPlace=focus?.dataset?.id;
      filterOpen=host.querySelector('.rp-filters')?.open??filterOpen;
      filterNodes.forEach(node=>node.remove());
      if(!plan.startId&&tab==='places'&&!preview)tab='search';
      const displayed=preview?.plan||plan,stats=status(displayed);
      host.className='route-planner';host.dataset.sheet=sheet;host.dataset.tab=tab;host.dataset.detail=String(Boolean(detailId));host.dataset.preview=String(Boolean(preview));host.hidden=!active;
      host.innerHTML=`<header class="rp-header">${mobile?`<div class="rp-mobile-actions">${preview?'<span>미리보기</span>':'<button type="button" class="rp-primary" data-rp-action="save">저장</button>'}<button type="button" data-rp-action="fit">전체 경로</button></div>`:`<button type="button" class="rp-sheet-toggle" data-rp-action="sheet" aria-label="패널 높이 변경 — 위아래로 끌기"><span></span></button><div class="rp-summary"><div><span>${preview?'미리보기 · ':''}${stats.spotCount>=10?`경유 ${stats.spotCount}곳 충족`:`경유 ${stats.spotCount}곳 · 최소 10곳`}<small class="rp-destination">도착 ${esc(placeText(byId.get(displayed.finishId)?.name))} · 고정</small></span><div>${distanceSummary(displayed)}</div></div><button type="button" class="rp-primary" data-rp-action="save" ${preview?'hidden':''}>저장</button><button type="button" class="rp-fit" data-rp-action="fit">전체 경로</button></div>`}</header>
      <nav class="rp-tabs" role="tablist" aria-label="장소 및 저장 메뉴">${[['places','추천'],['search','검색'],['route','내 경로'],['saved','저장 목록']].map(([key,label])=>`<button type="button" id="rp-tab-${key}" role="tab" data-rp-action="tab" data-tab="${key}" aria-selected="${tab===key}" aria-controls="rp-${key==='route'?'route':'places'}-pane" ${preview||key==='places'&&!plan.startId||key==='saved'&&!account.linked?'disabled':''}>${label}</button>`).join('')}${mobile?'':`<button type="button" data-rp-action="sheet" class="rp-expand" aria-label="패널 높이 변경">${sheet==='full'?'접기':'펼치기'}</button>`}</nav>
      <section class="rp-route-pane" ${preview?'inert':''} id="rp-route-pane" aria-label="내 경로"><div class="rp-route-scroll rp-scroll" data-scroll="route">${routeContent()}</div><footer class="rp-route-footer">${routeFooter()}</footer></section>
      <section class="rp-discovery-pane" id="rp-places-pane" aria-label="추천 및 장소 상세"><div class="rp-scroll" data-scroll="places">${preview?previewContent():detailId?detailContent():tab==='saved'?savedContent():placesContent()}</div><footer class="rp-footer">${preview?`<div class="rp-preview-actions"><button type="button" class="rp-primary" data-rp-action="apply-preview">적용</button>${preview.type==='auto'?'<button type="button" data-rp-action="another">다른 조합</button>':''}<button type="button" data-rp-action="cancel-preview">취소</button></div>`:''}<div class="rp-operation" role="status">${providerError?`<span class="rp-error">${esc(providerError)}</span><button type="button" data-rp-action="retry-provider">다시 시도</button>`:!ready?'도로 정보를 준비하고 있어요.':routeBusy?'도로 연결 중…':routeError?`<span class="rp-error">${esc(routeError)}</span><button type="button" data-rp-action="retry-route">다시 계산</button>`:''}</div></footer></section><p class="rp-notice${noticeError?' is-error':''}" role="status" ${noticeMessage?'':'hidden'}>${esc(noticeMessage)}</p>`;
      const slot=host.querySelector('.rp-filter-slot'),searchSlot=host.querySelector('.rp-search-slot');filterNodes.forEach(node=>((node.classList.contains('spot-toolbar')?searchSlot:slot)||options.filterParking)?.append(node));
      if(mobile){const tabs=host.querySelector('.rp-tabs');area.querySelectorAll('.rp-tabs').forEach(old=>{if(old!==tabs)old.remove();});sticky.append(tabs);mapSummary.innerHTML=`<span>${preview?'미리보기 · ':''}경유 ${stats.spotCount}곳${stats.spotCount>=10?' 충족':' · 최소 10곳'}</span><div>${distanceSummary(displayed)}</div>`;host.querySelector('.rp-header').prepend(host.querySelector('.rp-notice'));if(preview)host.querySelector('.rp-header').append(host.querySelector('.rp-preview-actions'));root.scrollTo({top:pageY,behavior:'instant'});workspaceLayout();}
      scrolls.forEach(([key,top])=>{const el=host.querySelector(`[data-scroll="${key}"]`);if(el)el.scrollTop=top;});
      if(focus?.isConnected&&filterNodes.some(n=>n.contains(focus)))focus.focus({preventScroll:true});
      else if(focusId)area.querySelector('#'+CSS.escape(focusId))?.focus({preventScroll:true});
      else if(focusKey){const target=[...host.querySelectorAll('[data-rp-action]')].find(el=>el.dataset.rpAction===focusKey&&el.dataset.id===focusPlace);target?.focus({preventScroll:true});}
      if(!mobile&&sheet==='full'&&!area.classList.contains('is-wide')&&!area.classList.contains('is-landscape'))viewer.clearSelection?.();
    }
    function closeDialog(){disposeDialog?.();disposeDialog=null;dialog?.close();dialog?.remove();dialog=null;}
    function openDialog(title,html){closeDialog();dialog=document.createElement('dialog');dialog.className='rp-dialog';dialog.innerHTML=`<div class="rp-dialog-head"><h2>${esc(title)}</h2><button type="button" data-close aria-label="닫기">×</button></div><div class="rp-dialog-body">${html}</div>`;document.body.append(dialog);dialog.querySelector('[data-close]').addEventListener('click',closeDialog);dialog.addEventListener('cancel',()=>setTimeout(closeDialog));dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog();});dialog.showModal();return dialog;}
    function confirmAction(title,message,action){const modal=openDialog(title,`<p>${esc(message)}</p><div class="rp-dialog-actions"><button type="button" data-cancel>취소</button><button type="button" class="rp-primary" data-confirm>확인</button></div>`);modal.querySelector('[data-cancel]').onclick=closeDialog;modal.querySelector('[data-confirm]').onclick=()=>{closeDialog();action();};}
    async function login(saveAfter=false){persist();const modal=openDialog('루트 저장을 위한 로그인','<div class="rp-auth"></div>');disposeDialog=root.SSKR_SOCIAL_AUTH.mount(modal.querySelector('.rp-auth'),{title:'나의 루트를 저장하세요',note:'참가 신청 없이도 이용할 수 있습니다.',onSelect:async loginProvider=>{account=await options.onLogin(loginProvider);persist();closeDialog();render();if(saveAfter)save();}});}
    function save(){if(!account.linked){login(true);return;}try{plan=store.save({...plan,routingVersion:ready?provider.version:plan.routingVersion},account);dirty=false;persist();render();notify(status().complete?'루트를 저장했습니다.':'초안을 저장했습니다. 다음에 이어서 편집할 수 있어요.');}catch(error){notify(error?.message||'저장하지 못했습니다. 다시 시도해 주세요.',true);}}
    async function showPreview(type){if(!ready||!plan.startId)return;const next=type==='auto'?domain.autoFill(plan,catalog,provider,{variant:variant++}):domain.optimize(plan,provider);const token=++routeRequest;routeAbort?.abort();routeAbort=new AbortController();routeBusy=false;preview={type,plan:next,result:null};detailId=null;tab='places';sheet='half';render();scheduleLayout();mapPlan(next,true);
      try{const previewResult=await provider.route(domain.orderedIds(next),{signal:routeAbort.signal});if(disposed||token!==routeRequest||!preview)return;preview.result=previewResult;syncMap(true);}catch(error){if(error?.name!=='AbortError'&&token===routeRequest)notify('미리보기 도로를 불러오지 못했습니다. 다시 시도해 주세요.',true);}}
    function editSaved(id,duplicate=false){let saved;try{saved=store.get(id,account);}catch(error){notify(error.message,true);return;}if(!saved)return;const action=()=>{if(duplicate)saved={...saved,id:null,title:`${saved.title.slice(0,57)} 복사`,createdAt:null,updatedAt:null};undo.length=0;plan=domain.normalize(saved,catalog);dirty=duplicate;anchorId=plan.stopIds.at(-1)||plan.startId;selected=byId.get(anchorId)||null;preview=null;detailId=null;tab=plan.startId?'places':'search';options.onStartChange?.(plan.startId);persist();calculate();if(anchorId)selectOnMap(anchorId);};dirty?confirmAction('루트를 불러올까요?','저장하지 않은 현재 변경사항은 바뀝니다.',action):action();}
    function newPlan(){const action=()=>{undo.length=0;plan=domain.createEmpty(catalog);dirty=false;anchorId=null;preview=null;detailId=null;selected=null;tab='search';options.onStartChange?.(null);persist();calculate();};dirty?confirmAction('새 루트를 만들까요?','저장하지 않은 현재 변경사항은 바뀝니다.',action):action();}
    function showDetail(id){if(!byId.has(id))return;if(!detailId){returnTab=tab;detailScroll=mobile?mobilePosition():host.querySelector('[data-scroll="places"]')?.scrollTop||0;}detailId=id;tab='places';const resizeSheet=!mobile&&(sheet==='summary'||sheet==='full'&&!area.classList.contains('is-wide'));if(resizeSheet)sheet='half';render();workspaceLayout();selectionLayout();host.querySelector('[data-scroll="places"]').scrollTop=0;}
    function openStartPicker(){
      const modal=openDialog('출발지 선택',`<div class="rp-start-options">${catalog.filter(p=>p.kind==='start').map(p=>`<button type="button" data-start-id="${esc(p.id)}" aria-pressed="${p.id===plan.startId}"><strong>${esc(placeText(p.name))}</strong><small>${esc(placeText(p.region))}</small></button>`).join('')}</div>`);
      modal.querySelectorAll('[data-start-id]').forEach(button=>button.onclick=()=>{closeDialog();start(button.dataset.startId);});
    }
    function promptSave(){const modal=openDialog(status().complete?'루트 저장':'초안 저장',`<p>경유 ${plan.stopIds.length}곳 · ${status().complete?'경유 10곳을 채웠습니다.':'10곳을 고르기 전에도 초안으로 저장할 수 있어요.'}</p><label class="rp-name">루트 이름<input id="rp-title" maxlength="60" value="${esc(plan.title)}" placeholder="나의 주행 루트"></label><p class="rp-caption">예상 시간은 정차와 실시간 교통을 포함하지 않습니다.</p><button type="button" class="rp-primary" data-save-confirm>${account.linked?'저장':'로그인하고 저장'}</button>`);modal.querySelector('#rp-title').addEventListener('input',e=>{plan.title=e.target.value;dirty=true;persist();});modal.querySelector('[data-save-confirm]').onclick=()=>{closeDialog();save();};}
    area.addEventListener('click',event=>{const button=event.target.closest('[data-rp-action]');if(!button||button.disabled)return;const action=button.dataset.rpAction,id=button.dataset.id;
      if(preview&&!['sheet','sheet-size','fit','apply-preview','cancel-preview','another'].includes(action))return;
      if(action==='change-start'){openStartPicker();return;}
      if(action==='sheet'||action==='sheet-size'){sheet=action==='sheet-size'?button.dataset.size:sheet==='summary'?'half':sheet==='half'?'full':'summary';host.dataset.sheet=sheet;render();return;}
      if(action==='back-detail'){detailId=null;tab=returnTab;render();if(mobile)scrollList(detailScroll);else host.querySelector('[data-scroll="places"]').scrollTop=detailScroll;return;}
      if(action==='tab'){activateTab(button.dataset.tab);return;}
      if(action==='choose-stops'){manualChoice=true;render();host.querySelector('.rp-next .rp-place-view')?.focus({preventScroll:true});return;}
      if(action==='select'){select(byId.get(id));selectOnMap(id,true);return;}
      if(action==='anchor'){detailId=null;anchorId=id===plan.finishId?plan.stopIds.at(-1)||plan.startId:id;selected=byId.get(anchorId);selectOnMap(anchorId,true);render();syncMap();persist();return;}
      if(action==='remove'){if(anchorId===id)anchorId=plan.startId;if(selected?.id===id){selected=byId.get(anchorId)||null;if(anchorId)selectOnMap(anchorId);}change({...plan,stopIds:plan.stopIds.filter(stop=>stop!==id)},'경유지를 삭제했습니다.');return;}
      if(action==='up'||action==='down'){const stops=plan.stopIds.slice(),index=stops.indexOf(id),target=index+(action==='up'?-1:1);if(index>=0&&target>=0&&target<stops.length){[stops[index],stops[target]]=[stops[target],stops[index]];change({...plan,stopIds:stops});}return;}
      if(action==='undo'&&undo.length){plan=undo.pop();dirty=true;preview=null;anchorId=plan.stopIds.at(-1)||plan.startId;selected=byId.get(anchorId)||null;detailId=null;if(!plan.startId){tab='search';manualChoice=false;}options.onStartChange?.(plan.startId);persist();calculate();if(anchorId)selectOnMap(anchorId);else viewer.clearSelection?.();return;}
      if(action==='more'){candidateLimit+=12;render();return;}
      if(action==='fit'){viewer.fitRoute?.();return;}
      if(action==='autofill'||action==='auto-start'||action==='another'){showPreview('auto');return;}
      if(action==='optimize'){showPreview('optimize');return;}
      if(action==='apply-preview'&&preview){const next=preview.plan;anchorId=next.stopIds.at(-1)||next.startId;selected=byId.get(anchorId);tab='places';change(next,'추천 루트를 적용했습니다.');return;}
      if(action==='cancel-preview'){preview=null;tab=plan.startId?'places':'search';calculate();return;}
      if(action==='retry-route'){calculate();return;}
      if(action==='retry-provider'){loadProvider();return;}
      if(action==='save'){promptSave();return;}
      if(action==='login'){login();return;}
      if(action==='new'){newPlan();return;}
      if(action==='route-tab'){tab=plan.startId?'places':'search';render();return;}
      if(action==='load'||action==='duplicate'){editSaved(id,action==='duplicate');return;}
      if(action==='delete'){confirmAction('저장한 루트를 삭제할까요?','삭제한 루트는 복구할 수 없습니다.',()=>{try{store.remove(id,account);if(plan.id===id){plan={...plan,id:null,createdAt:null,updatedAt:null};dirty=true;persist();}render();notify('저장한 루트를 삭제했습니다.');}catch(error){notify(error.message,true);}});return;}
      if(action==='detail')showDetail(id);
    },{signal:events.signal});
    area.addEventListener('keydown',event=>{const button=event.target.closest('[role="tab"]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...area.querySelectorAll('[role="tab"]:not(:disabled)')],i=tabs.indexOf(button),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activateTab(tabs[next].dataset.tab);area.querySelector('#rp-tab-'+tab)?.focus({preventScroll:true});},{signal:events.signal});
    let touchStart=null;
    host.addEventListener('pointerdown',e=>{if(mobile||!e.target.closest('.rp-sheet-toggle'))return;touchStart={y:e.clientY,id:e.pointerId};host.setPointerCapture(e.pointerId);},{signal:events.signal});
    host.addEventListener('pointerup',e=>{if(!touchStart)return;const delta=e.clientY-touchStart.y;touchStart=null;if(Math.abs(delta)<25){sheet=sheet==='summary'?'half':sheet==='half'?'full':'summary';render();return;}sheet=delta<0?(sheet==='summary'?'half':'full'):(sheet==='full'?'half':'summary');render();},{signal:events.signal});
    host.addEventListener('pointercancel',()=>{touchStart=null;},{signal:events.signal});
    let draggedId=null;host.addEventListener('dragstart',event=>{if(preview){event.preventDefault();return;}const row=event.target.closest('[data-waypoint][draggable]');if(!row)return;draggedId=row.dataset.waypoint;event.dataTransfer.setData('text/plain',draggedId);event.dataTransfer.effectAllowed='move';row.classList.add('is-dragging');},{signal:events.signal});
    host.addEventListener('dragover',event=>{if(draggedId&&event.target.closest('[data-waypoint][draggable]')){event.preventDefault();event.dataTransfer.dropEffect='move';}},{signal:events.signal});
    host.addEventListener('drop',event=>{const target=event.target.closest('[data-waypoint][draggable]')?.dataset.waypoint;if(!draggedId||!target||target===draggedId)return;event.preventDefault();const stops=plan.stopIds.slice(),from=stops.indexOf(draggedId),to=stops.indexOf(target);if(from>=0&&to>=0){stops.splice(from,1);stops.splice(to,0,draggedId);change({...plan,stopIds:stops});}draggedId=null;},{signal:events.signal});
    host.addEventListener('dragend',()=>{draggedId=null;host.querySelector('.is-dragging')?.classList.remove('is-dragging');},{signal:events.signal});
    async function loadProvider(){providerStarted=true;providerError='';render();try{await provider.ready();if(disposed)return;ready=true;options.onRoadReady?.();calculate();}catch(error){if(disposed)return;providerError=roadMessage(error);render();}}
    const map=viewer.getMap?.();map?.on('moveend',persist);root.addEventListener('pagehide',persist,{signal:events.signal});
    if(scrollRestore&&active&&map){map.setView([scrollRestore.lat,scrollRestore.lng],scrollRestore.zoom,{animate:false});requestAnimationFrame(()=>{if(!disposed)root.scrollTo({top:0,behavior:'instant'});scheduleLayout();});}
    setMode(active);
    return {isActive:()=>active,hasStart:()=>Boolean(plan.startId),distanceFromStart:id=>ready&&plan.startId?provider.summary(plan.startId,id)?.distanceMeters:null,startPlace:()=>byId.get(plan.startId),openSaved(){if(account.linked)activateTab("saved");},setMode,select,openPlace(place){if(!active||!place||!plan.startId&&place.kind!=='start')return;select(place);},addFromMap(place){if(active&&!preview&&place)add(place.id);},setFilters(items,filtered=false){filterItems=items;candidateLimit=12;if(active){if(filtered)tab='search';render();}},destroy(){persist();active=false;layoutMode();disposed=true;resize.disconnect();panelResize.disconnect();filterNodes.forEach(node=>options.filterParking?.append(node));document.body.classList.remove('route-editor-active');cancelAnimationFrame(layoutFrame);events.abort();routeAbort?.abort();map?.off('moveend',persist);clearTimeout(flashTimer);closeDialog();viewer.setEditing?.(false);}};
  }
  root.SSKR_ROUTE_PLANNER={mount};
})(typeof globalThis!=='undefined'?globalThis:this);
