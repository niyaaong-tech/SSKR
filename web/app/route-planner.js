(function(root){'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy=v=>JSON.parse(JSON.stringify(v));
  const km=v=>Number.isFinite(v)?`${(v/1000).toFixed(1)} km`:'계산 전';
  const time=v=>{if(!Number.isFinite(v))return '';const m=Math.round(v/60);return m>=60?`${Math.floor(m/60)}시간 ${m%60}분`:`${m}분`;};
  const roadMessage=error=>/[가-힣]/.test(error?.message||'')?error.message:'도로 정보를 불러오지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.';
  const SESSION='sskr.route-editor';
  const categories={cafe:'라이딩 · 카페',food:'맛집 · 시장',nature:'자연 · 전망',culture:'역사 · 마을'};
  const placeText=value=>root.SSKR_MAP.formatPlaceText(value);
  const iconPaths={pin:'<path d="M8 3h8v6l3 3v2H5v-2l3-3Z"/><path d="M12 14v7"/>',folder:'<path d="M3 7V5h7l2 2h9v13H3Z"/>',undo:'<path d="m8 4-5 5 5 5M3 9h10a7 7 0 0 1 0 14"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 0-1 1-1 2m0 3h.01"/>',drag:'<path d="M8 5h.01M8 12h.01M8 19h.01M16 5h.01M16 12h.01M16 19h.01"/>'};
  const icon=key=>`<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[key]}</svg>`;
  function mount(host,options){
    const domain=root.SSKR_ROUTE_PLAN,catalog=options.catalog,byId=new Map(catalog.map(p=>[p.id,p])),viewer=options.viewer;
    const legacyById=new Map((root.SSKR_SPOT_LEGACY||[]).map(p=>[p.id,p]));
    const issueText=issue=>issue.placeId&&!byId.has(issue.placeId)&&legacyById.has(issue.placeId)?issue.message.replace(issue.placeId+':',placeText(legacyById.get(issue.placeId).name)+':'):issue.message;
    const event=()=>options.getEvent?.()||{},minimum=()=>domain.minimumStops(event());
    let storage,session;try{storage=root.localStorage;}catch{}try{session=root.sessionStorage;}catch{}
    const store=domain.createStore(storage,catalog),provider=root.SSKR_ROUTE_PROVIDER.create(),events=new AbortController();
    let account=options.getAccount?.()||{},plan=domain.createEmpty(catalog),active=false,tab='search',dirty=false,selected=null,anchorId=null;
    let providerStarted=false,ready=false,routeBusy=false,routeError='',providerError='',result=null,variant=0,filterItems=[],candidateLimit=12,disposed=false,routeRequest=0,routeAbort=null,dialog=null,disposeDialog=null,flashTimer,scrollRestore=null;
    const undo=[],identities=new Map();let schedule=defaultSchedule(),autoDeparture=true,incomingCandidate=null,pendingAdd=null;
    let revision=0,context=0,contextSerial=0,generation=null,operationError='',failedOperation=null,queryText='',filterCategory='all',filterActive=false,dialogFocus=null;
    let titleEditing=false,draggedId=null,dropIndex=null,dropSlot=null;
    let detailId=null,detailScroll=0,returnTab='search',syncingSelection=false,noticeMessage='',noticeError=false;
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
        area.style.removeProperty('height');area.classList.remove('is-landscape');
        const focused=document.activeElement?.matches('input,textarea')&&!dialog,visible=root.visualViewport?.height||root.innerHeight;
        if(viewportWidth!==root.innerWidth){viewportWidth=root.innerWidth;viewportHeight=root.innerHeight;}else viewportHeight=Math.max(viewportHeight,root.innerHeight);
        const keyboard=Boolean(focused&&visible<viewportHeight*.75),keyboardChanged=keyboard!==area.classList.contains('has-keyboard');area.classList.toggle('has-keyboard',keyboard);
        const tabs=area.querySelector('.rp-tabs');if(tabs&&tabs.parentElement!==(keyboard?area:sticky)){const focusedTab=tabs.contains(document.activeElement)?document.activeElement:null;if(keyboard)area.insertBefore(tabs,host);else sticky.append(tabs);focusedTab?.focus({preventScroll:true});}
        area.style.setProperty('--rp-sticky-height',(keyboard?tabs?.offsetHeight||44:sticky.offsetHeight)+'px');if(keyboardChanged&&focused){const input=document.activeElement;requestAnimationFrame(()=>{if(!disposed&&input.isConnected)input.scrollIntoView({block:'nearest',behavior:'instant'});});}selectionLayout();return;
      }
      const header=host.querySelector('.rp-header');if(header){const height=String(Math.ceil(header.getBoundingClientRect().height))+'px';if(area.style.getPropertyValue('--rp-header-height')!==height)area.style.setProperty('--rp-header-height',height);}
      const viewport=root.visualViewport, bottom=(viewport?.height||root.innerHeight)+(viewport?.offsetTop||0);
      const height=Math.max(180,Math.floor(bottom-area.getBoundingClientRect().top-8));
      area.style.height=height+'px';
      selectionLayout();
    }
    function selectionLayout(){viewer.getMap?.()?.invalidateSize({pan:false});}
    function scheduleLayout(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>{workspaceLayout();requestAnimationFrame(()=>{if(active&&!disposed&&selected)viewer.revealSelected?.(selected.id);});});}
    function selectOnMap(id,pan=false){
      const place=byId.get(id),map=viewer.getMap?.();
      if(pan)revealMap();
      syncingSelection=true;try{viewer.select?.(id,{reveal:!pan});}finally{syncingSelection=false;}
      if(pan&&place&&map){map.stop?.();map.setView([place.lat,place.lng],Math.max(map.getZoom(),8),{animate:false});viewer.revealSelected?.(id);requestAnimationFrame(()=>viewer.revealSelected?.(id));}
    }
    function resizeLayout(){const changed=layoutMode(),wide=!mobile;if(changed||area.classList.contains('is-wide')!==wide){area.classList.toggle('is-wide',wide);if(wide&&tab==='route')tab='search';render();}scheduleLayout();}
    const resize=new ResizeObserver(resizeLayout);
    resize.observe(area);
    const panelResize=new ResizeObserver(()=>{if(active&&!mobile)selectionLayout();});panelResize.observe(host);const headerResize=new ResizeObserver(scheduleLayout);root.addEventListener('resize',resizeLayout,{signal:events.signal});root.visualViewport?.addEventListener('resize',scheduleLayout,{signal:events.signal});
    host.addEventListener('focusin',scheduleLayout,{signal:events.signal});host.addEventListener('focusout',()=>requestAnimationFrame(scheduleLayout),{signal:events.signal});
    function recover(){try{const value=JSON.parse(session?.getItem(SESSION)||'null');if(value&&(value.ownerId===null||value.ownerId===(account.linked?account.id:null))){plan=domain.normalize(value.plan,catalog);autoDeparture=value.autoDeparture??!value.schedule?.departureTime;schedule=readSchedule(value.schedule,autoDeparture,value.autoDeparture===undefined);active=value.active===true;dirty=value.dirty===true;anchorId=Object.hasOwn(value,'anchorId')?value.anchorId:plan.stopIds.at(-1)||plan.startId;selected=byId.get(value.selectedId)||null;scrollRestore=value.viewport;}}catch{}}
    recover();
    const identity=p=>({id:p.id,ownerUserId:p.ownerUserId,createdAt:p.createdAt,updatedAt:p.updatedAt});
    identities.set(context,identity(plan));
    function remember(){undo.push({context,plan:copy(plan),schedule:copy(schedule),autoDeparture,dirty});if(undo.length>30)undo.shift();}
    function invalidateGeneration(){revision++;generation?.controller.abort();generation=null;operationError='';failedOperation=null;}
    function snapshot(){const map=viewer.getMap?.(),center=map?.getCenter();return center?{lat:center.lat,lng:center.lng,zoom:map.getZoom(),scrollY:root.scrollY}:scrollRestore;}
    function persist(){try{session?.setItem(SESSION,JSON.stringify({plan,schedule,autoDeparture,active,dirty,anchorId,selectedId:selected?.id||null,ownerId:account.linked?account.id:null,browseFilters:options.getBrowseFilters?.()||null,viewport:snapshot()}));}catch{/* Restricted session storage must not interrupt editing. */}}
    function notify(message,error=false){noticeMessage=message;noticeError=error;clearTimeout(flashTimer);const el=host.querySelector('.rp-notice');if(el){el.textContent=message;el.classList.toggle('is-error',error);el.hidden=false;}flashTimer=setTimeout(()=>{noticeMessage='';const current=host.querySelector('.rp-notice');if(current)current.hidden=true;},3500);}
    function status(p=plan){return domain.status(p,catalog,ready?provider:null,event());}
    function distanceSummary(p=plan){const value=status(p);return Number.isFinite(value.distanceMeters)?`<strong>${km(value.distanceMeters)}</strong><span class="rp-drive-time">예상 주행 ${time(value.durationSeconds)}</span>`:`<span>${!p.startId?'출발지를 선택해 주세요':!ready?'도로 정보 준비 중':'경로 확인 필요'}</span>`;}
    function mapPlan(p=plan,fit=false){if(!active)return;const ids=p.startId?domain.orderedIds(p):[];viewer.setRoute?.(result?.legs||[],{selectedIds:ids,activeId:selected?.id||null,pinnedIds:p.pinnedStopIds,places:ids.map(id=>byId.get(id)).filter(Boolean),fit});}
    function currentId(){return anchorId===plan.startId||plan.stopIds.includes(anchorId)?anchorId:plan.stopIds.at(-1)||plan.startId;}
    function insertionFor(id){return ready?domain.bestInsertion(plan,id,catalog,provider):null;}
    function insertionSignature(){return JSON.stringify([context,revision,domain.orderedIds(plan)]);}
    function cancelAdd(){pendingAdd?.controller.abort();pendingAdd=null;}
    function insertionDelta(value){return `전체 경로 ${value.addedDistanceMeters>=0?'+':'−'}${km(Math.abs(value.addedDistanceMeters))} · ${value.addedDurationSeconds>=0?'+':'−'}${time(Math.abs(value.addedDurationSeconds))}`;}
    function routeActionState(place){
      if(place.kind==='start')return {disabled:Boolean(pendingAdd),label:plan.startId&&plan.startId!==place.id?'출발지 변경':'출발지 설정',description:''};
      if(pendingAdd)return {disabled:true,label:'도로 확인 중…',description:'연결을 확인한 뒤 추가합니다.'};
      if(!plan.startId)return {disabled:true,description:'먼저 출발지를 선택해 주세요.'};
      if(!ready||routeBusy)return {disabled:true,description:'도로 연결을 확인하고 있습니다.'};
      if(routeError)return {disabled:true,description:'현재 경로의 도로를 확인하지 못했습니다. 다시 계산해 주세요.'};
      const value=insertionFor(place.id);
      return value?{disabled:false,description:''}:{disabled:true,description:plan.stopIds.includes(place.id)?'이미 경로에 포함된 장소입니다.':'이 구간의 도로를 연결할 수 없습니다.'};
    }
    function recommendations(){if(!ready||!plan.startId)return[];const allowed=new Set(filterItems.map(p=>p.id));return domain.insertionRecommendations(plan,catalog,provider,{limit:filterActive?catalog.length:3,event:event()}).filter(r=>allowed.has(r.placeId)).slice(0,3);}
    function syncMap(fit=false){if(!active)return;mapPlan(plan,fit);viewer.setCandidates?.(recommendations().map(item=>byId.get(item.placeId)).filter(Boolean));}
    function setMode(value){if(!value){cancelAdd();invalidateGeneration();}active=value;document.body.classList.toggle('route-editor-active',value);layoutMode();area.classList.toggle('is-wide',value&&!mobile);host.hidden=!value;viewer.setEditing?.(value);options.onModeChange?.(value,plan.startId);if(value){render();root.scrollTo({top:0,behavior:'instant'});scheduleLayout();syncMap();if(selected)selectOnMap(selected.id);else if(mobile&&!plan.startId)requestAnimationFrame(()=>{if(active&&!disposed&&!plan.startId&&!selected)viewer.fitRoute?.();});if(!providerStarted)loadProvider();}persist();}
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
    function change(next,message,fit=false){cancelAdd();invalidateGeneration();remember();plan=domain.normalize(next,catalog);if(autoDeparture)schedule.departureTime=defaultSchedule().departureTime;dirty=true;persist();calculate(fit);if(message)notify(message);}
    function applyStart(id){const changed=Boolean(plan.startId&&plan.startId!==id);anchorId=id;selected=byId.get(id);detailId=null;tab='search';change({...plan,startId:id},changed?'출발지를 변경했습니다.':`출발지를 선택했습니다. 경유지를 직접 고르거나 ${minimum()}곳을 추천받으세요.`);options.onStartChange?.(id);selectOnMap(id,true);host.querySelector('[data-scroll="places"]').scrollTop=0;if(incomingCandidate){const candidate=incomingCandidate;incomingCandidate=null;select(candidate);selectOnMap(candidate.id,true);}}
    function start(id){
      if(!byId.has(id)||byId.get(id).kind!=='start'||id===plan.startId)return;
      applyStart(id);
    }
    async function add(id){const place=byId.get(id);if(!place||pendingAdd)return;if(place.kind==='start'){start(id);return;}if(place.kind!=='spot')return;
      if(!plan.startId){tab='search';render();notify('먼저 출발지를 선택해 주세요.');return;}
      if(plan.stopIds.includes(id)){notify('이미 경유지에 담긴 스팟입니다.');return;}
      const action=routeActionState(place),position=insertionFor(id);if(action.disabled||!position){notify(action.description,true);return;}
      invalidateGeneration();const request={controller:new AbortController(),signature:insertionSignature()};pendingAdd=request;render();syncMap();
      try{
        const roads=await provider.route([position.fromId,id,position.toId],{signal:request.controller.signal});
        if(disposed||pendingAdd!==request||!active||request.signature!==insertionSignature())return;
        if(!validRoads(roads,[position.fromId,id,position.toId]))throw new Error('추가할 구간의 도로를 확인하지 못했습니다. 기존 경로는 유지됩니다.');
        const latest=insertionFor(id);if(!latest||latest.at!==position.at||latest.fromId!==position.fromId||latest.toId!==position.toId)throw new Error('추가 위치를 다시 확인해 주세요.');
        pendingAdd=null;const stops=plan.stopIds.slice();stops.splice(latest.at,0,id);
        const reveal=selected?.id===id;if(reveal){anchorId=id;selected=place;detailId=null;}
        change({...plan,stopIds:stops},`${placeText(place.name)} · 경유지에 담았습니다. 실행 취소로 되돌릴 수 있어요.`);if(reveal)selectOnMap(id);
      }catch(error){if(!disposed&&pendingAdd===request&&error?.name!=='AbortError')notify(roadMessage(error),true);}
      finally{if(pendingAdd===request){pendingAdd=null;render();syncMap();}}
    }
    function revealRoutePoint(id){
      requestAnimationFrame(()=>{
        if(!active||disposed||selected?.id!==id)return;
        const row=host.querySelector('[data-waypoint="'+CSS.escape(id)+'"]'),scroll=host.querySelector('[data-scroll="route"]');
        if(!row||!scroll)return;
        const box=row.getBoundingClientRect();if(!box.height)return;
        const top=mobile?sticky.getBoundingClientRect().bottom+8:scroll.getBoundingClientRect().top+8;
        const bottom=mobile?(root.visualViewport?.height||root.innerHeight)-8:scroll.getBoundingClientRect().bottom-8;
        const delta=box.top<top?box.top-top:box.bottom>bottom?box.bottom-bottom:0;
        if(delta){if(mobile)root.scrollBy({top:delta,behavior:'instant'});else scroll.scrollTop+=delta;}
      });
    }
    function deselect({closeDetail=false,renderUI=true}={}){
      const changed=Boolean(selected||anchorId||closeDetail&&detailId);
      selected=null;anchorId=null;if(closeDetail)detailId=null;
      viewer.clearSelection?.();options.onSelectionClear?.();
      if(!changed)return;
      persist();if(active&&renderUI){render();syncMap();}
    }
    function select(place){
      if(syncingSelection||!active||!place||(!plan.startId&&place.kind!=='start'))return;
      selected=byId.get(place.id)||place;
      const included=domain.orderedIds(plan).includes(place.id);
      if(plan.stopIds.includes(place.id)||plan.startId===place.id)anchorId=place.id;
      if(mobile&&included)activateTab('route');else showDetail(place.id);
      if(included)revealRoutePoint(place.id);
      syncMap();persist();
    }
    function card(place,{recommendation=null}={}){if(!place)return'';
      const position=plan.stopIds.indexOf(place.id),included=position>=0?`경로 포함 · ${position+1}번째`:place.id===plan.startId?'선택된 출발지':place.id===plan.finishId?'고정 도착지':'';
      return `<article class="rp-place${selected?.id===place.id?' is-selected':''}" data-place-id="${esc(place.id)}"><button type="button" class="rp-place-view" data-rp-action="select" data-id="${esc(place.id)}" aria-label="${esc(placeText(place.name))} 지도에서 확인">${place.image?`<img src="${esc(place.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'<span class="rp-photo-empty"></span>'}<span><small>${esc(placeText(place.region))}</small><strong>${esc(placeText(place.name))}</strong>${included?`<span class="rp-included">${included}</span>`:''}<em>${esc(place.kind==='start'?'출발지':place.kind==='finish'?'고정 도착지':categories[place.category]||'스팟')}</em></span></button>${recommendation?`<p>${esc(insertionDelta(recommendation))}</p>`:''}</article>`;
    }
    function pointRow(id,index,kind){
      const currentPlace=byId.get(id),place=currentPlace||legacyById.get(id),name=placeText(place?.name||'더 이상 제공되지 않는 장소'),isStop=kind==='spot',pinned=plan.pinnedStopIds.includes(id);
      return `<li class="rp-waypoint${selected?.id===id?' is-active':''}${!currentPlace?' is-missing':''}${pinned?' is-pinned':''}" data-waypoint="${esc(id)}"${isStop?' draggable="true"':''}>
        ${isStop?`<button type="button" class="rp-drag rp-icon" data-drag-handle="${esc(id)}" aria-label="${esc(name)} 순서 이동, 위아래 방향키 사용" title="끌어서 순서 이동">${icon('drag')}</button>`:''}
        <button type="button" class="rp-point-main" data-rp-action="anchor" data-id="${esc(id)}" ${!currentPlace?'disabled':''} aria-label="${esc(name)} 지도에서 확인"><span class="rp-point-number ${kind}">${isStop?index+1:kind==='start'?'출':'도'}</span><span><small>${kind==='start'?'출발지':kind==='finish'?'고정 도착지':esc(placeText(place?.region||'위치 확인 필요'))}</small><strong>${esc(name)}</strong></span></button>
        ${kind==='start'?'<button type="button" class="rp-start-change" data-rp-action="change-start" aria-label="출발지 변경">변경</button>':''}
        ${isStop?`<div class="rp-row-actions"><button type="button" class="rp-remove rp-icon" data-rp-action="remove" data-id="${esc(id)}" aria-label="${esc(name)} 경유지 삭제" title="경유지 삭제"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button><button type="button" class="rp-pin rp-icon" data-rp-action="pin" data-id="${esc(id)}" aria-pressed="${pinned}" aria-label="${esc(name)} ${pinned?'핀고정 해제':'핀고정'}" title="${pinned?'핀고정 해제':'핀고정 · 자동 구성 시 유지'}" ${!currentPlace?'disabled':''}>${icon('pin')}</button></div>`:''}</li>`;
    }
    function insertionCaption(place){if(place.kind!=='spot'||plan.stopIds.includes(place.id))return '';const value=insertionFor(place.id);return `<p class="rp-insertion-preview" role="status">${value?`추가 예정 · ${esc(insertionDelta(value))}`:esc(routeActionState(place).description)}</p>`;}
    function eventCaption(){
      const official=options.getParticipation?.()?.selectedStartLocationId,review=reviewFor(),warnings=[];
      if(official&&plan.startId&&official!==plan.startId)warnings.push('<p class="rp-error">공식 참가 출발지와 다른 루트입니다. <a href="/app/preparation#start" data-app-link>공식 출발지 확인·변경 →</a></p>');
      if(plan.startId&&ready){
        if(['LATE','EARLY','EARLY_LATE'].includes(review.state))warnings.push(review.warnings.map(text=>'<p class="rp-schedule-warning rp-error">'+esc(text)+'</p>').join(''));
        else if(review.state!=='WITHIN')warnings.push('<p class="rp-schedule-note">'+esc(review.state==='UNREVIEWED'?'출발 시각과 0~1440분 휴게시간을 입력해 주세요.':review.label)+'</p>');
      }
      return '<div class="rp-event-context" aria-live="polite" '+(warnings.length?'':'hidden')+'>'+warnings.join('')+'</div>';
    }
    function arrivalText(review){
      if(!review.arrivalAt)return '';
      const timezone=event().timezone||'Asia/Seoul',solar=root.SSKR_SOLAR_TIMES;
      const days=Math.round((Date.parse(solar.dateKey(review.arrivalAt,timezone))-Date.parse(solar.dateKey(review.departureAt,timezone)))/86400000);
      const clock=new Intl.DateTimeFormat('ko-KR',{timeZone:timezone,hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(review.arrivalAt));
      return (days===1?'다음 날 ':days>1?days+'일 후 ':'')+clock+' 도착 예상';
    }
    function routeSummary(){
      const count=plan.stopIds.length,missing=Math.max(0,minimum()-count),arrival=plan.startId&&ready?arrivalText(reviewFor()):'';
      return '<div class="rp-route-summary" role="status"><div class="rp-route-count"><span>'+count+' 스팟 경유</span>'+(arrival?'<span class="rp-route-arrival">· '+esc(arrival)+'</span>':'')+'</div>'+(missing?'<p class="rp-stop-shortage">스팟 '+missing+'개 부족</p>':'')+'</div>';
    }
    function reviewFor(p=plan,drivingSeconds=status(p).durationSeconds){return root.SSKR_EVENT_RULES.reviewSchedule({event:event(),...schedule,drivingSeconds,start:byId.get(p.startId),finish:byId.get(p.finishId)});}
    function defaultSchedule(){
      const e=event(),start=byId.get(plan.startId)||byId.get(e.startLocationIds?.[0])||catalog.find(p=>p.kind==='start');
      return root.SSKR_EVENT_RULES.scheduleDefaults({event:e,start,finish:byId.get(plan.finishId)});
    }
    function readSchedule(value,automatic=true,legacy=false){
      const defaults=defaultSchedule();return {departureTime:automatic?defaults.departureTime:String(value?.departureTime||''),breakMinutes:value?.breakMinutes==null||legacy&&value.breakMinutes===''?defaults.breakMinutes:String(value.breakMinutes)};
    }
    function scheduleFields(){return `<div class="rp-schedule-fields" role="group" aria-label="하루 일정 설정"><label class="rp-schedule-field"><span>출발 시각</span><input id="rp-departure-time" type="time" name="departureTime" data-schedule-input aria-label="예상 출발 시각" value="${esc(schedule.departureTime)}" required title="일출 이후, 행사에서 정한 출발 시각부터 시작할 수 있어요"></label><div class="rp-schedule-field"><label for="rp-break-minutes">휴게시간 (분)</label><span class="rp-break-control"><button type="button" class="rp-break-adjust" data-rp-action="schedule-step" data-step="-15" aria-label="휴게시간 15분 줄이기">−</button><input id="rp-break-minutes" type="number" name="breakMinutes" data-schedule-input aria-label="휴게시간(분)" min="0" max="1440" step="1" value="${esc(schedule.breakMinutes)}" required><button type="button" class="rp-break-adjust" data-rp-action="schedule-step" data-step="15" aria-label="휴게시간 15분 늘리기">+</button></span></div></div>`;}
    function updateSchedule(key,value){
      if(!['departureTime','breakMinutes'].includes(key))return;invalidateGeneration();cancelAdd();schedule[key]=String(value);if(key==='departureTime')autoDeparture=false;
      persist();const saved=saveSchedule(),context=host.querySelector('.rp-event-context');if(context)context.outerHTML=eventCaption();const summary=host.querySelector('.rp-route-summary');if(summary)summary.outerHTML=routeSummary();
      const footer=host.querySelector('.rp-route-footer,.rp-footer');if(footer)footer.innerHTML=routeFooter();host.querySelector('[data-rp-action="save"]').disabled=false;
      if(!saved)notify('일정 변경을 저장하지 못했습니다. 저장 공간을 확인해 주세요.',true);
    }
    function saveSchedule(){if(!plan.id||!account.linked)return true;try{if(!storage)throw new Error('Storage unavailable');storage.setItem('sskr.route.schedule.'+account.id+'.'+plan.id,JSON.stringify({...schedule,autoDeparture}));return true;}catch{return false;}}
    function routeContent(){const stats=status();return `<div class="rp-route-selected"><div class="rp-route-heading"><h3>내 경로</h3><button type="button" class="rp-reset" data-rp-action="reset-spots" aria-label="스팟 초기화" ${plan.stopIds.length?'':'disabled'}>스팟 초기화</button></div>${routeSummary()}${eventCaption()}<ol class="rp-waypoints">${plan.startId?pointRow(plan.startId,-1,'start'):'<li class="rp-start-empty"><button type="button" class="rp-start-select" data-rp-action="change-start"><span class="rp-start-select-icon" aria-hidden="true">＋</span><span><strong>출발지 선택</strong><small>사진으로 골라보세요</small></span><span aria-hidden="true">→</span></button></li>'}${plan.stopIds.map((id,index)=>pointRow(id,index,'spot')).join('')}${pointRow(plan.finishId,-1,'finish')}</ol>${stats.issues.filter(issue=>issue.placeId||ready&&issue.code==='UNREACHABLE').map(issue=>`<p class="rp-error">${esc(issueText(issue))}</p>`).join('')}</div>`;}
    function operationMarkup(){if(generation&&!operationError)return '';return `<div class="rp-operation" role="status">${operationError?`<span class="rp-error">${esc(operationError)}</span><button type="button" data-rp-action="retry-generation">다시 시도</button>`:providerError?`<span class="rp-error">${esc(providerError)}</span><button type="button" data-rp-action="retry-provider">다시 시도</button>`:!ready?'도로 정보를 준비하고 있어요.':pendingAdd?'추가할 도로 연결 중…':routeBusy?'도로 연결 중…':routeError?`<span class="rp-error">${esc(routeError)}</span><button type="button" data-rp-action="retry-route">다시 계산</button>`:''}</div>`;}
    function routeFooter(){
      const complete=plan.stopIds.length>=minimum(),review=reviewFor(plan,0),disabled=!plan.startId||!ready||routeBusy||pendingAdd||generation||['UNREVIEWED','UNAVAILABLE'].includes(review.state);
      const button=(action,label,primary=false,extra=false)=>`<button type="button" class="rp-browse-button${primary?' rp-primary':''}" data-rp-action="${action}" data-route-generation aria-busy="${generation?.type===(action==='autofill'?'auto':action)}" aria-live="polite" ${disabled||extra?'disabled':''}>${generation?.type===(action==='autofill'?'auto':action)?action==='optimize'?'최적화 중…':action==='rebuild'?'재구성 중…':'루트 만드는 중…':label}</button>`;
      return `<div class="rp-route-tools${complete?' is-complete':''}">${complete?button('rebuild','경유지 재구성',true,plan.pinnedStopIds.length===plan.stopIds.length)+button('optimize','경로 최적화'):button('autofill','경유지 자동 완성',true)}</div>${operationMarkup()}`;
    }
    function activateTab(next){if(mobile&&!detailId)tabScroll.set(tab,mobilePosition());detailId=null;tab=next==='route'?'route':'search';options.onTabChange?.(tab);render();scheduleLayout();scrollList(tabScroll.get(tab)||0);}
    function placesContent(){
      const starting=!plan.startId,searching=Boolean(queryText.trim()),rec=recommendations(),items=filterItems.filter(p=>p.kind===(starting?'start':'spot'));
      const recommended=!starting&&!searching&&rec.length>0,shown=recommended?rec.map(r=>card(byId.get(r.placeId),{recommendation:r})).join(''):items.slice(0,candidateLimit).map(p=>card(p)).join('');
      return `<div class="rp-section-title"><h3>${starting?'출발지':searching?'검색 결과':recommended?'추천 스팟':'장소 찾기'}</h3>${recommended?'':`<span>${items.length}곳</span>`}</div><div class="rp-filter-slot"></div><div id="rp-category-results" role="tabpanel" aria-labelledby="spot-category-${esc(filterCategory)}"><div class="rp-search-slot"></div><div class="${recommended?'rp-next':'rp-place-results'}">${shown||'<p class="rp-caption">조건에 맞는 장소가 없습니다. 검색 조건을 바꿔보세요.</p>'}</div></div>${!recommended&&items.length>candidateLimit?'<button type="button" class="rp-browse-button" data-rp-action="more">장소 더 보기</button>':''}`;
    }
    function detailContent(){const p=byId.get(detailId);if(!p)return '';return `<section class="rp-place-detail"><div class="rp-detail-head"><button type="button" data-rp-action="back-detail" aria-label="목록으로 돌아가기">←</button><div><h3>${esc(placeText(p.name))}</h3><p class="rp-detail-region">${esc(placeText(p.region))}</p></div></div>${plan.stopIds.includes(p.id)?`<p class="rp-included">경로 포함 · ${plan.stopIds.indexOf(p.id)+1}번째 경유지</p>`:''}${insertionCaption(p)}<p>${esc(p.description||p.lead)}</p>${p.image?`<figure class="rp-detail-visual"><img class="rp-detail-image" src="${esc(p.image)}" alt="${esc(placeText(p.name))}" referrerpolicy="no-referrer"><figcaption><a href="${esc(p.photoSource||p.source)}" target="_blank" rel="noopener noreferrer">${esc(p.photoCredit||'장소 사진 출처')}</a></figcaption></figure>`:''}<p>${esc(p.address||'')}</p><p class="rp-caption">${esc(p.note)}</p>${p.parking?`<p class="rp-caption">주차 위치 ${p.parking.lat.toFixed(6)}, ${p.parking.lng.toFixed(6)}</p>`:''}</section>`;}
    function stopCount(p=plan){const count=p.stopIds.length,missing=Math.max(0,minimum()-count);return '<span>'+count+' 스팟 경유</span>'+(missing?'<span class="rp-stop-shortage">스팟 '+missing+'개 부족</span>':'');}
    function savedContent(){
      const tools=count=>'<div class="rp-management-tools"><span>'+count+'</span><button type="button" data-rp-action="new">＋ 새 루트</button></div>';
      if(!account.linked)return tools('')+'<div class="rp-empty"><h3>저장한 루트를 다시 불러오세요</h3><p>로그인하면 참가 신청 없이도 루트를 저장할 수 있어요.</p><button type="button" class="rp-primary" data-rp-action="login">로그인</button></div>';
      let items;try{items=store.list(account);}catch(error){return '<p class="rp-error">'+esc(error.message)+'</p>';}
      return tools('저장한 루트 '+items.length+' / '+store.maxSavedRoutes)+(items.length?'<div class="rp-saved-list">'+items.map(item=>{
        const stats=status(item),current=item.id===plan.id;
        return '<article class="rp-saved'+(current?' is-current':'')+'" data-saved-id="'+esc(item.id)+'"><div class="rp-saved-heading"><h3>'+esc(item.title)+'</h3>'+(current?'<span class="rp-saved-current">편집 중</span>':'')+'</div><div class="rp-route-count">'+stopCount(item)+'</div><p class="rp-saved-ends">'+esc(placeText(byId.get(item.startId)?.name||'출발지 미정'))+' → '+esc(placeText(byId.get(item.finishId)?.name))+'</p><p class="rp-saved-metrics">'+(Number.isFinite(stats.distanceMeters)?km(stats.distanceMeters)+' · 예상 주행 '+time(stats.durationSeconds):'도로 계산 전')+'</p><div class="rp-saved-actions"><button type="button" class="rp-primary" data-rp-action="load" data-id="'+esc(item.id)+'">불러오기</button><button type="button" data-rp-action="duplicate" data-id="'+esc(item.id)+'">복제</button><button type="button" class="rp-saved-delete" data-rp-action="delete" data-id="'+esc(item.id)+'" aria-label="'+esc(item.title)+' 삭제">삭제</button></div></article>';
      }).join('')+'</div>':'<div class="rp-empty"><h3>저장한 루트가 없어요</h3><p>스팟을 모두 고르기 전에도 초안으로 저장할 수 있어요.</p></div>');
    }
    function render(){
      clearDrag();titleEditing=false;
      if(disposed)return;if(!active){host.hidden=true;return;}
      const scrolls=[...host.querySelectorAll('[data-scroll]')].map(el=>[el.dataset.scroll,el.scrollTop]),pageY=root.scrollY,focus=document.activeElement;
      const focusId=area.contains(focus)?focus?.id:null,focusKey=focus?.dataset?.rpAction,focusPlace=focus?.dataset?.id;
      filterNodes.forEach(node=>node.remove());
      host.className='route-planner';host.dataset.tab=tab;host.hidden=!active;options.onTabChange?.(dialog?.dataset.management?'saved':tab);
      const toolbar=`<label class="rp-title-group"><input id="rp-route-title" class="rp-title" data-route-title aria-label="루트 이름" maxlength="60" value="${esc(plan.title)}" placeholder="새 루트" title="루트 이름을 바로 수정하세요. 비워 두면 저장할 때 번호가 붙어요"><small class="rp-title-state">${dirty?'변경사항 있음':plan.id?'저장됨':''}</small></label><button type="button" class="rp-icon" data-rp-action="manage" aria-label="루트 관리" title="루트 관리">${icon('folder')}</button>${mobile?'':`<div class="rp-summary" role="status">${distanceSummary()}</div>`}${scheduleFields()}<div class="rp-toolbar-spacer"></div><button type="button" class="rp-icon" data-rp-action="undo" aria-label="실행 취소" title="실행 취소 (Ctrl/Cmd+Z)" ${undo.length?'':'disabled'}>${icon('undo')}</button><button type="button" class="rp-icon" data-rp-action="help" aria-label="루트 작성 도움말" title="루트 작성 도움말">${icon('help')}</button><button type="button" class="rp-primary" data-rp-action="save" ${pendingAdd||generation?'disabled':''}>저장</button>`;
      host.innerHTML=`<header class="rp-header"><div class="rp-toolbar">${toolbar}</div></header><nav class="rp-tabs" role="tablist" aria-label="루트 편집 목록">${[['search','장소 찾기'],['route','내 경로']].map(([key,label])=>`<button type="button" id="rp-tab-${key}" role="tab" data-rp-action="tab" data-tab="${key}" aria-selected="${tab===key}" aria-controls="rp-${key==='route'?'route':'places'}-pane">${label}</button>`).join('')}</nav>
        <section class="rp-route-pane" id="rp-route-pane" aria-label="내 경로"><div class="rp-route-scroll rp-scroll" data-scroll="route">${routeContent()}</div>${!mobile||tab==='route'?`<footer class="rp-route-footer">${routeFooter()}</footer>`:''}</section>
        <section class="rp-discovery-pane" id="rp-places-pane" aria-label="장소 찾기"><div class="rp-scroll" data-scroll="places">${detailId?detailContent():placesContent()}</div>${mobile&&tab!=='route'?`<footer class="rp-footer">${routeFooter()}</footer>`:''}</section><p class="rp-notice${noticeError?' is-error':''}" role="status" aria-live="polite" ${noticeMessage?'':'hidden'}>${esc(noticeMessage)}</p>`;
      const slot=host.querySelector('.rp-filter-slot'),searchSlot=host.querySelector('.rp-search-slot');filterNodes.forEach(node=>((node.classList.contains('spot-toolbar')?searchSlot:slot)||options.filterParking)?.append(node));
      if(mobile){const tabs=host.querySelector('.rp-tabs');area.querySelectorAll('.rp-tabs').forEach(old=>{if(old!==tabs)old.remove();});sticky.append(tabs);mapSummary.innerHTML=`<div>${distanceSummary()}</div>`;host.querySelector('.rp-header').after(host.querySelector('.rp-notice'));root.scrollTo({top:pageY,behavior:'instant'});workspaceLayout();}
      headerResize.disconnect();if(!mobile)headerResize.observe(host.querySelector('.rp-header'));
      scrolls.forEach(([key,top])=>{const el=host.querySelector(`[data-scroll="${key}"]`);if(el)el.scrollTop=top;});
      if(focus?.isConnected&&filterNodes.some(n=>n.contains(focus)))focus.focus({preventScroll:true});
      else if(focusId)area.querySelector('#'+CSS.escape(focusId))?.focus({preventScroll:true});
      else if(focusKey)[...host.querySelectorAll('[data-rp-action]')].find(el=>el.dataset.rpAction===focusKey&&el.dataset.id===focusPlace)?.focus({preventScroll:true});
    }
    function closeDialog(){
      const focus=dialogFocus;disposeDialog?.();disposeDialog=null;dialog?.close();dialog?.remove();dialog=null;dialogFocus=null;options.onTabChange?.(tab);
      if(focus?.isConnected)focus.focus({preventScroll:true});else if(focus?.dataset.rpAction)host.querySelector(`[data-rp-action="${focus.dataset.rpAction}"]`)?.focus({preventScroll:true});
    }
    function openDialog(title,html,variant=''){
      const focus=dialog?.contains(document.activeElement)?dialogFocus:document.activeElement;closeDialog();dialogFocus=focus;dialog=document.createElement('dialog');dialog.className='rp-dialog'+(variant?' rp-dialog--'+variant:'');dialog.setAttribute('aria-labelledby','rp-dialog-title');dialog.innerHTML=`<div class="rp-dialog-head"><h2 id="rp-dialog-title">${esc(title)}</h2><button type="button" data-close aria-label="닫기">×</button></div><div class="rp-dialog-body">${html}</div>`;document.body.append(dialog);
      dialog.querySelector('[data-close]').addEventListener('click',closeDialog);dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();else if(event.target.closest('[data-rp-action]'))handleAction(event);});dialog.showModal();return dialog;
    }
    function confirmAction(title,message,action){const modal=openDialog(title,`<p>${esc(message)}</p><div class="rp-dialog-actions"><button type="button" data-cancel>취소</button><button type="button" class="rp-primary" data-confirm>확인</button></div>`);modal.querySelector('[data-cancel]').onclick=closeDialog;modal.querySelector('[data-confirm]').onclick=()=>{closeDialog();action();};}
    function openManagement(){const modal=openDialog('루트 관리',savedContent(),'management');modal.dataset.management='true';options.onTabChange?.('saved');}
    function openHelp(){
      const steps=[
        ['start','출발할 바다를 골라요','내 경로의 ‘출발지 선택’을 누르면 사진으로 출발지를 둘러볼 수 있어요. 마음에 드는 장소를 고르면 그곳에서 여정이 시작됩니다.','해안의 출발지 사진 중 한 곳을 고르는 모습'],
        ['add','가보고 싶은 곳을 담아요','추천 목록이나 검색에서 장소를 누른 뒤, 지도 사진 카드 위의 ‘경유지 추가’를 눌러 주세요. 기존 방문 순서를 유지하면서 도로 우회가 가장 적은 위치에 넣어 드려요.','지도 사진 카드의 경유지 추가 버튼과 연결된 루트'],
        ['order','나에게 맞는 순서로 다듬어요','내 경로의 왼쪽 손잡이를 끌어 방문 순서를 바꾸세요. 키보드에서는 손잡이에 초점을 두고 위아래 방향키를 사용할 수 있어요. ‘경유지 자동 완성’으로 남은 곳을 채우고, 남기고 싶은 경유지는 핀으로 고정해 주세요. 최소 경유 수를 채운 뒤에는 ‘경유지 재구성’으로 핀고정한 곳을 남기고 새 조합을 만들거나, ‘경로 최적화’로 방문 순서만 다듬을 수 있습니다. 바뀐 내용은 ‘실행 취소’로 되돌릴 수 있어요.','방문 순서를 바꾸고 실행 취소로 되돌리는 모습'],
        ['save','저장하고 다음에도 이어가요','상단 ‘저장’을 누르고 루트 이름을 정해 주세요. 로그인하면 참가 신청 전에도 저장할 수 있어요. 장소를 다 고르지 못했어도 초안으로 저장하고, 제목 옆 폴더에서 다시 불러올 수 있습니다.','만든 루트를 저장하고 폴더에서 다시 여는 모습']
      ];
      openDialog('루트 작성 도움말',`<p class="rp-help-intro">어디서 출발해, 어디에 머물까요?<br>사진으로 고르고 지도에서 연결하며 나만의 하루를 만들어 보세요.</p><ol class="rp-help-steps">${steps.map(([key,title,body,alt],i)=>`<li><img src="/web/app/assets/route-help/${key}.svg" alt="${alt}" width="480" height="260"><div><span class="rp-help-number">${i+1}</span><h3>${title}</h3><p>${body}</p></div></li>`).join('')}</ol><section class="rp-help-notes"><h3>달리기 전, 이것만 기억해 주세요</h3><p>${esc(event().publicTitle||'SSKR')}의 완주 조건은 출발·도착과 경유 ${minimum()}곳 이상, 총 ${minimum()+2}곳 이상의 실제 체크인입니다. 루트에 담은 장소 수는 실제 체크인과 별개이며, 루트 작성·저장은 선택입니다.</p><p>예상 주행 시간에는 정차와 실시간 교통이 포함되지 않아요. 상단에서 출발 시각과 휴게시간을 조정하면 ‘내 경로’에서 도착 예상과 마감 여유를 바로 확인할 수 있어요.</p><p>개인 루트의 출발지와 공식 참가 출발지는 별도로 설정합니다.</p></section>`,'help');
    }
    async function login(saveAfter=false){persist();const modal=openDialog('루트 저장을 위한 로그인','<div class="rp-auth"></div>');disposeDialog=root.SSKR_SOCIAL_AUTH.mount(modal.querySelector('.rp-auth'),{title:'나의 루트를 저장하세요',note:'참가 신청 없이도 이용할 수 있습니다.',onSelect:async loginProvider=>{account=await options.onLogin(loginProvider);persist();closeDialog();render();if(saveAfter)save();}});}
    function save(){if(pendingAdd||generation){notify('도로 확인이 끝난 뒤 저장해 주세요.');return;}if(!account.linked){login(true);return;}try{plan=store.save({...plan,routingVersion:ready?provider.version:plan.routingVersion},account);identities.set(context,identity(plan));dirty=false;const scheduleSaved=saveSchedule();persist();render();notify(scheduleSaved?'루트를 저장했습니다.':'루트는 저장했지만 일정 검토는 저장하지 못했습니다. 저장 공간을 확인한 뒤 다시 저장해 주세요.',!scheduleSaved);}catch(error){notify(error?.message||'저장하지 못했습니다. 다시 시도해 주세요.',true);if(error?.code==='ROUTE_LIMIT_REACHED')clearTimeout(flashTimer);}}
    function generationSignature(){return JSON.stringify([context,revision,domain.orderedIds(plan),plan.pinnedStopIds,schedule,event()]);}
    function validRoads(roads,ids){const metric=value=>Number.isFinite(value)&&value>=0;return roads?.valid&&roads.legs?.length===ids.length-1&&roads.legs.every((leg,index)=>leg.fromId===ids[index]&&leg.toId===ids[index+1]&&leg.status==='ready'&&Array.isArray(leg.coordinates)&&leg.coordinates.length>=2&&leg.coordinates.every(point=>Array.isArray(point)&&Number.isFinite(point[0])&&Math.abs(point[0])<=90&&Number.isFinite(point[1])&&Math.abs(point[1])<=180)&&metric(leg.distanceMeters)&&metric(leg.durationSeconds))&&metric(roads.distanceMeters)&&metric(roads.durationSeconds);}
    async function generate(type,retryBase=null){
      if(!active||disposed||!ready||!plan.startId||routeBusy||pendingAdd||generation)return;
      const base=copy(retryBase||plan),original=copy(plan),automatic=type!=='optimize';
      invalidateGeneration();deselect({closeDetail:true,renderUI:false});const request={controller:new AbortController(),signature:generationSignature(),type,base};generation=request;render();syncMap();
      const current=()=>!disposed&&active&&generation===request&&!request.controller.signal.aborted&&request.signature===generationSignature();
      try{
        await new Promise(resolve=>requestAnimationFrame(resolve));if(!current())return;
        const budget=reviewFor(base,0).drivingBudgetSeconds,generationOptions={variant:variant++,event:event()},baseDuration=status(base).durationSeconds;
        let next=automatic?domain.rebuild(base,catalog,provider,{...generationOptions,drivingBudgetSeconds:budget}):domain.optimize(base,provider,{drivingBudgetSeconds:Number.isFinite(budget)&&baseDuration<=budget?budget:null});
        // A planning estimate is advisory. Try the day budget first, then keep a
        // connected proposal and show its actual arrival warning in My Route.
        if(automatic&&next.stopIds.length<minimum()&&Number.isFinite(budget))next=domain.rebuild(base,catalog,provider,generationOptions);
        if(automatic&&next.stopIds.length<minimum())throw new Error('새 조합에 넣을 수 있는 경유지를 충분히 찾지 못했습니다. 현재 경로는 그대로 유지됩니다.');
        if(new Set(next.stopIds).size!==next.stopIds.length||next.startId!==base.startId||next.finishId!==base.finishId)throw new Error('루트 구성을 확인하지 못했습니다. 기존 경로를 유지했습니다.');
        const pinned=new Set(base.pinnedStopIds),pinOrder=base.stopIds.filter(id=>pinned.has(id));
        if(JSON.stringify(next.stopIds.filter(id=>pinned.has(id)))!==JSON.stringify(pinOrder))throw new Error('핀고정한 장소를 유지하지 못했습니다. 기존 경로를 유지했습니다.');
        if(automatic&&next.stopIds.some(id=>base.stopIds.includes(id)&&!pinned.has(id)))throw new Error('새 조합을 구성하지 못했습니다. 핀고정이나 일정을 조정해 주세요.');
        if(!automatic&&JSON.stringify([...next.stopIds].sort())!==JSON.stringify([...base.stopIds].sort()))throw new Error('루트 구성에 변경이 있어 적용하지 않았습니다.');
        const ids=domain.orderedIds(next),roads=await provider.route(ids,{signal:request.controller.signal});if(!current())return;
        if(!validRoads(roads,ids))throw new Error('도로 연결을 확인하지 못했습니다. 기존 경로를 유지했습니다.');
        const before=status(original);
        if(JSON.stringify(next.stopIds)===JSON.stringify(original.stopIds)||!automatic&&roads.distanceMeters+1>=before.distanceMeters){notify(!automatic?'더 짧은 방문 순서를 찾지 못했습니다.':'핀고정한 장소를 유지하는 다른 조합을 찾지 못했습니다.');return;}
        remember();plan=domain.normalize(next,catalog);dirty=true;generation=null;result=roads;routeError='';routeBusy=false;++routeRequest;routeAbort?.abort();anchorId=null;selected=null;detailId=null;viewer.clearSelection?.();persist();render();syncMap(true);scheduleLayout();notify(!automatic?`경로 최적화로 ${km(before.distanceMeters-roads.distanceMeters)} 줄였습니다.`:type==='rebuild'?'핀고정한 장소를 유지하고 경유지를 재구성했습니다.':'경유지 자동 완성을 적용했습니다.');
      }catch(error){if(current()&&error?.name!=='AbortError'){operationError=roadMessage(error);failedOperation={type,base};}}
      finally{if(generation===request){generation=null;render();syncMap();}}
    }
    function togglePin(id){
      if(!plan.stopIds.includes(id)||!byId.has(id))return;cancelAdd();invalidateGeneration();remember();
      const pinned=new Set(plan.pinnedStopIds);pinned.has(id)?pinned.delete(id):pinned.add(id);
      plan=domain.normalize({...plan,pinnedStopIds:[...pinned]},catalog);dirty=true;persist();render();syncMap();
    }
    function resetSpots(){
      if(!plan.stopIds.length)return;cancelAdd();invalidateGeneration();render();syncMap();
      const pins=plan.stopIds.filter(id=>plan.pinnedStopIds.includes(id)),hasPins=pins.length>0;
      const modal=openDialog('스팟을 초기화할까요?',`<p>${hasPins?`핀고정한 스팟 ${pins.length}곳이 있습니다. 핀고정한 스팟을 남겨 둘까요, 함께 초기화할까요?`:'경유 스팟을 모두 목록에서 삭제합니다.'}</p><p class="rp-caption">출발지와 도착지는 유지됩니다.</p><div class="rp-dialog-actions rp-reset-actions"><button type="button" data-cancel>취소</button>${hasPins?'<button type="button" data-reset="keep">핀고정 제외</button>':''}<button type="button" class="rp-primary" data-reset="all">${hasPins?'전부 초기화':'초기화'}</button></div>`);
      modal.querySelector('[data-cancel]').onclick=closeDialog;
      modal.querySelectorAll('[data-reset]').forEach(button=>button.onclick=()=>{const keep=button.dataset.reset==='keep';closeDialog();anchorId=null;selected=null;detailId=null;viewer.clearSelection?.();change({...plan,stopIds:keep?pins:[],pinnedStopIds:keep?pins:[]},keep?`핀고정한 스팟 ${pins.length}곳만 남겼습니다.`:'경유 스팟을 초기화했습니다.');});
    }
    function switchPlan(next,nextSchedule,changed=false){cancelAdd();invalidateGeneration();deselect({closeDetail:true,renderUI:false});remember();context=++contextSerial;plan=domain.normalize(next,catalog);identities.set(context,identity(plan));autoDeparture=nextSchedule?.autoDeparture??!nextSchedule?.departureTime;schedule=readSchedule(nextSchedule,autoDeparture,nextSchedule?.autoDeparture===undefined);dirty=changed;anchorId=null;selected=null;detailId=null;tab='search';closeDialog();options.onStartChange?.(plan.startId);persist();calculate(true);}
    function editSaved(id,duplicate=false){let saved;try{saved=store.get(id,account);}catch(error){notify(error.message,true);return;}if(!saved)return;let nextSchedule;try{nextSchedule=JSON.parse(storage?.getItem('sskr.route.schedule.'+account.id+'.'+id)||'null')||null;}catch{nextSchedule=null;}if(duplicate)saved={...saved,id:null,ownerUserId:null,title:`${saved.title.slice(0,57)} 복사`,createdAt:null,updatedAt:null};switchPlan(saved,nextSchedule,duplicate);}
    function newPlan(){switchPlan(domain.createEmpty(catalog),null);}
    function undoChange(){if(!undo.length)return;cancelAdd();invalidateGeneration();const previous=undo.pop(),switched=previous.context!==context,oldStart=plan.startId;if(switched){schedule=previous.schedule;autoDeparture=previous.autoDeparture;}context=previous.context;plan={...previous.plan,...(identities.get(context)||identity(previous.plan))};if(autoDeparture)schedule.departureTime=defaultSchedule().departureTime;dirty=switched?previous.dirty:true;anchorId=null;selected=null;detailId=null;if(switched||oldStart!==plan.startId)options.onStartChange?.(plan.startId);persist();calculate();viewer.clearSelection?.();notify('이전 작성 내용으로 돌아갔습니다.');}
    function showDetail(id){if(!byId.has(id))return;if(!detailId){returnTab=tab;detailScroll=mobile?mobilePosition():host.querySelector('[data-scroll="places"]')?.scrollTop||0;}detailId=id;tab='search';render();workspaceLayout();selectionLayout();host.querySelector('[data-scroll="places"]').scrollTop=0;}
    function openStartPicker(){
      const modal=openDialog('출발지 선택',`<p class="rp-start-intro">어떤 바다에서 하루를 시작할까요? 사진을 눌러 출발지를 선택하세요.</p><div class="rp-start-options">${catalog.filter(p=>p.kind==='start').map(p=>`<button type="button" data-start-id="${esc(p.id)}" aria-pressed="${p.id===plan.startId}">${p.image?`<img src="${esc(p.image)}" alt="" width="320" height="200" loading="lazy" referrerpolicy="no-referrer">`:'<span class="rp-start-photo-empty" aria-hidden="true"></span>'}<span class="rp-start-copy"><strong>${esc(placeText(p.name))}</strong><small>${esc(placeText(p.region))}</small>${p.id===plan.startId?'<span class="rp-start-chosen">선택됨</span>':''}</span></button>`).join('')}</div>`,'starts');
      modal.querySelectorAll('[data-start-id]').forEach(button=>button.onclick=()=>{closeDialog();start(button.dataset.startId);});
    }
    function updateTitle(value){
      if(value===plan.title)return;
      const firstEdit=!titleEditing,interrupted=Boolean(pendingAdd||generation);
      if(firstEdit){cancelAdd();invalidateGeneration();remember();titleEditing=true;}
      plan={...plan,title:value};dirty=true;persist();
      const input=host.querySelector('[data-route-title]');input?.setCustomValidity('');input?.removeAttribute('aria-invalid');
      const state=host.querySelector('.rp-title-state');if(state)state.textContent='변경사항 있음';
      const undoButton=host.querySelector('[data-rp-action="undo"]');if(undoButton)undoButton.disabled=false;
      if(firstEdit){const footer=host.querySelector('.rp-route-footer,.rp-footer');if(footer)footer.innerHTML=routeFooter();const saveButton=host.querySelector('[data-rp-action="save"]');if(saveButton)saveButton.disabled=false;if(interrupted)syncMap();}
      scheduleLayout();
    }
    function promptSave(){save();}
    function handleAction(event){
      const button=event.target.closest('[data-rp-action]');if(!button||button.disabled)return;const action=button.dataset.rpAction,id=button.dataset.id;button.closest('details')?.removeAttribute('open');
      if(action==='manage'){openManagement();return;}if(action==='help'){openHelp();return;}
      if(action==='change-start'){openStartPicker();return;}
      if(action==='back-detail'){detailId=null;tab=returnTab==='route'?'route':'search';render();if(mobile)scrollList(detailScroll);else host.querySelector('[data-scroll="places"]').scrollTop=detailScroll;return;}
      if(action==='tab'){activateTab(button.dataset.tab);return;}
      if(action==='select'){select(byId.get(id));selectOnMap(id,true);return;}
      if(action==='anchor'){detailId=null;anchorId=id;selected=byId.get(id);selectOnMap(id,true);render();revealRoutePoint(id);syncMap();persist();return;}
      if(action==='pin'){togglePin(id);return;}if(action==='reset-spots'){resetSpots();return;}
      if(action==='remove'){if(anchorId===id)anchorId=null;if(selected?.id===id){selected=null;viewer.clearSelection?.();}change({...plan,stopIds:plan.stopIds.filter(stop=>stop!==id)},'경유지를 삭제했습니다.');return;}
      if(action==='up'||action==='down'){const stops=plan.stopIds.slice(),index=stops.indexOf(id),target=index+(action==='up'?-1:1);if(index>=0&&target>=0&&target<stops.length){[stops[index],stops[target]]=[stops[target],stops[index]];change({...plan,stopIds:stops});}return;}
      if(action==='undo'){undoChange();return;}
      if(action==='more'){candidateLimit+=12;render();return;}
      if(action==='autofill'){generate('auto');return;}if(action==='rebuild'){generate('rebuild');return;}if(action==='optimize'){generate('optimize');return;}
      if(action==='retry-generation'){if(failedOperation)generate(failedOperation.type,failedOperation.base);return;}
      if(action==='retry-route'){calculate();return;}if(action==='retry-provider'){loadProvider();return;}
      if(action==='schedule-step'){const input=host.querySelector('[name=breakMinutes]'),current=Number(input.value||120);input.value=String(Math.max(0,Math.min(1440,current+Number(button.dataset.step))));updateSchedule('breakMinutes',input.value);return;}if(action==='save'){promptSave();return;}if(action==='login'){login();return;}if(action==='new'){newPlan();return;}
      if(action==='route-tab'){closeDialog();activateTab('search');return;}if(action==='load'||action==='duplicate'){editSaved(id,action==='duplicate');return;}
      if(action==='delete'){confirmAction('저장한 루트를 삭제할까요?','삭제한 루트는 복구할 수 없습니다.',()=>{try{store.remove(id,account);for(const [key,value] of identities)if(value.id===id)identities.set(key,{id:null,ownerUserId:null,createdAt:null,updatedAt:null});if(plan.id===id){plan={...plan,...identities.get(context)};dirty=true;persist();}render();openManagement();notify('저장한 루트를 삭제했습니다.');}catch(error){notify(error.message,true);}});return;}
    }
    host.addEventListener('input',event=>{if(event.target.matches('[data-schedule-input]'))updateSchedule(event.target.name,event.target.value);else if(event.target.matches('[data-route-title]'))updateTitle(event.target.value);},{signal:events.signal});
    host.addEventListener('focusout',event=>{if(!event.target.matches('[data-route-title]'))return;const title=event.target.value.trim();if(title!==plan.title){plan={...plan,title};persist();}event.target.value=title;titleEditing=false;},{signal:events.signal});
    host.addEventListener('keydown',event=>{if(event.target.matches('[data-route-title]')&&event.key==='Enter'){event.preventDefault();event.target.blur();}},{signal:events.signal});
    area.addEventListener('click',handleAction,{signal:events.signal});
    document.addEventListener('click',event=>{
      if(!active||disposed||!selected&&!anchorId||mapHost.contains(event.target))return;
      // Place controls select a place; other outside clicks clear its visual
      // selection. Reading a detail keeps the detail view and its scroll state.
      if(event.target.closest('.rp-dialog,[data-rp-action="select"],[data-rp-action="anchor"],[data-drag-handle]'))return;
      deselect();
    },{signal:events.signal});
    root.addEventListener('keydown',event=>{if(!active||dialog||event.defaultPrevented||event.target.closest('input,textarea,[contenteditable]:not([contenteditable="false"])'))return;if((event.ctrlKey||event.metaKey)&&!event.shiftKey&&event.key.toLowerCase()==='z'&&undo.length){event.preventDefault();undoChange();}const id=event.target.closest('[data-drag-handle]')?.dataset.dragHandle;if(id&&['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();handleAction({target:{closest:()=>({dataset:{rpAction:event.key==='ArrowUp'?'up':'down',id},closest:()=>null})}});host.querySelector(`[data-drag-handle="${CSS.escape(id)}"]`)?.focus({preventScroll:true});}},{signal:events.signal});
    area.addEventListener('keydown',event=>{const button=event.target.closest('.rp-tabs [role="tab"]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...area.querySelectorAll('.rp-tabs [role="tab"]:not(:disabled)')],i=tabs.indexOf(button),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activateTab(tabs[next].dataset.tab);area.querySelector('#rp-tab-'+tab)?.focus({preventScroll:true});},{signal:events.signal});

    function clearDropSlot(){dropSlot?.remove();dropSlot=null;dropIndex=null;}
    function clearDrag(){clearDropSlot();draggedId=null;host.querySelector('.is-dragging')?.classList.remove('is-dragging');}
    function showDropSlot(y){
      const remaining=plan.stopIds.filter(id=>id!==draggedId),rows=remaining.map(id=>host.querySelector('[data-waypoint="'+CSS.escape(id)+'"]'));
      let index=rows.findIndex(row=>{const box=row.getBoundingClientRect();return y<box.top+box.height/2;});if(index<0)index=remaining.length;
      if(index===plan.stopIds.indexOf(draggedId)){clearDropSlot();return;}
      if(dropSlot&&index===dropIndex)return;
      clearDropSlot();dropIndex=index;dropSlot=document.createElement('li');dropSlot.className='rp-drop-slot';dropSlot.setAttribute('aria-hidden','true');dropSlot.innerHTML='<span>여기에 놓기</span>';
      const before=index<rows.length?rows[index]:host.querySelector('[data-waypoint="'+CSS.escape(plan.finishId)+'"]');host.querySelector('.rp-waypoints').insertBefore(dropSlot,before);
    }
    host.addEventListener('dragstart',event=>{const row=event.target.closest('[data-waypoint][draggable]');if(!row)return;clearDrag();draggedId=row.dataset.waypoint;event.dataTransfer.setData('text/plain',draggedId);event.dataTransfer.effectAllowed='move';row.classList.add('is-dragging');},{signal:events.signal});
    host.addEventListener('dragover',event=>{if(!draggedId)return;const list=event.target.closest('.rp-waypoints');if(!list){clearDropSlot();return;}event.preventDefault();event.dataTransfer.dropEffect='move';if(!event.target.closest('.rp-drop-slot'))showDropSlot(event.clientY);},{signal:events.signal});
    host.addEventListener('dragleave',event=>{const list=host.querySelector('.rp-waypoints');if(draggedId&&list?.contains(event.target)&&!list.contains(event.relatedTarget))clearDropSlot();},{signal:events.signal});
    host.addEventListener('drop',event=>{if(!draggedId||!event.target.closest('.rp-waypoints'))return;event.preventDefault();if(dropIndex==null){clearDrag();return;}const stops=plan.stopIds.filter(id=>id!==draggedId);stops.splice(Math.min(dropIndex,stops.length),0,draggedId);const changed=stops.some((id,i)=>id!==plan.stopIds[i]);clearDrag();if(changed)change({...plan,stopIds:stops},'방문 순서를 변경했습니다.');},{signal:events.signal});
    host.addEventListener('dragend',clearDrag,{signal:events.signal});
    async function loadProvider(){providerStarted=true;providerError='';render();try{await provider.ready();if(disposed)return;ready=true;options.onRoadReady?.();calculate();}catch(error){if(disposed)return;providerError=roadMessage(error);render();}}
    const map=viewer.getMap?.();map?.on('moveend',persist);root.addEventListener('pagehide',persist,{signal:events.signal});
    if(scrollRestore&&active&&map){map.setView([scrollRestore.lat,scrollRestore.lng],scrollRestore.zoom,{animate:false});requestAnimationFrame(()=>{if(!disposed)root.scrollTo({top:0,behavior:'instant'});scheduleLayout();});}
    setMode(active);
    return {deselect,receivePlace(id){const p=byId.get(id);if(!p)return;if(p.kind==='start'){start(id);}else if(!plan.startId){incomingCandidate=p;notify('출발지를 먼저 선택하면 탐색한 장소를 이어서 검토할 수 있습니다.');}else{select(p);selectOnMap(id,true);}},isActive:()=>active,hasStart:()=>Boolean(plan.startId),distanceFromStart:id=>ready&&plan.startId?provider.summary(plan.startId,id)?.distanceMeters:null,startPlace:()=>byId.get(plan.startId),openSaved:openManagement,setMode,select,routeActionState,openPlace(place){if(!active||!place||!plan.startId&&place.kind!=='start')return;selected=byId.get(place.id)||place;showDetail(place.id);syncMap();persist();},addFromMap(place){if(active&&place)add(place.id);},setFilters(items,filters={}){filterItems=items;filterCategory=typeof filters==='object'?filters.category||'all':'all';queryText=typeof filters==='object'?filters.query||'':'';filterActive=typeof filters==='object'?Boolean(queryText||filters.category&&filters.category!=='all'):filters;candidateLimit=12;if(active)render();},destroy(){cancelAdd();invalidateGeneration();persist();active=false;layoutMode();disposed=true;resize.disconnect();panelResize.disconnect();headerResize.disconnect();filterNodes.forEach(node=>options.filterParking?.append(node));document.body.classList.remove('route-editor-active');cancelAnimationFrame(layoutFrame);events.abort();routeAbort?.abort();map?.off('moveend',persist);clearTimeout(flashTimer);closeDialog();viewer.setEditing?.(false);}};
  }
  root.SSKR_ROUTE_PLANNER={mount};
})(typeof globalThis!=='undefined'?globalThis:this);
