(function(root){'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy=v=>JSON.parse(JSON.stringify(v));
  const km=v=>Number.isFinite(v)?`${(v/1000).toFixed(1)} km`:'계산 전';
  const time=v=>{if(!Number.isFinite(v))return '';const m=Math.round(v/60);return m>=60?`${Math.floor(m/60)}시간 ${m%60}분`:`${m}분`;};
  const roadMessage=error=>/[가-힣]/.test(error?.message||'')?error.message:'도로 정보를 불러오지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.';
  const SESSION='sskr.route-editor';
  const categories={cafe:'라이딩 · 카페',food:'맛집 · 시장',nature:'자연 · 전망',culture:'역사 · 마을'};
  const placeText=value=>root.SSKR_MAP.formatPlaceText(value);
  const iconPaths={folder:'<path d="M3 7V5h7l2 2h9v13H3Z"/>',undo:'<path d="m8 4-5 5 5 5M3 9h10a7 7 0 0 1 0 14"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 0-1 1-1 2m0 3h.01"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',drag:'<path d="M8 5h.01M8 12h.01M8 19h.01M16 5h.01M16 12h.01M16 19h.01"/>'};
  const icon=key=>`<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[key]}</svg>`;
  function mount(host,options){
    const domain=root.SSKR_ROUTE_PLAN,catalog=options.catalog,byId=new Map(catalog.map(p=>[p.id,p])),viewer=options.viewer;
    const event=()=>options.getEvent?.()||{},minimum=()=>domain.minimumStops(event());
    let storage,session;try{storage=root.localStorage;}catch{}try{session=root.sessionStorage;}catch{}
    const store=domain.createStore(storage,catalog),provider=root.SSKR_ROUTE_PROVIDER.create(),events=new AbortController();
    let account=options.getAccount?.()||{},plan=domain.createEmpty(catalog),active=false,tab='search',dirty=false,selected=null,anchorId=null;
    let providerStarted=false,ready=false,routeBusy=false,routeError='',providerError='',result=null,variant=0,filterItems=[],candidateLimit=12,disposed=false,routeRequest=0,routeAbort=null,dialog=null,disposeDialog=null,flashTimer,scrollRestore=null;
    const undo=[],identities=new Map();let schedule={departureTime:'',breakMinutes:''},incomingCandidate=null,pendingAdd=null;
    let revision=0,context=0,contextSerial=0,generation=null,autoBaseline=null,operationError='',failedOperation=null,queryText='',filterActive=false,dialogFocus=null;
    let detailId=null,detailScroll=0,returnTab='search',filterOpen=false,syncingSelection=false,noticeMessage='',noticeError=false;
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
    const panelResize=new ResizeObserver(()=>{if(active&&!mobile)selectionLayout();});panelResize.observe(host);root.addEventListener('resize',resizeLayout,{signal:events.signal});root.visualViewport?.addEventListener('resize',scheduleLayout,{signal:events.signal});
    host.addEventListener('focusin',scheduleLayout,{signal:events.signal});host.addEventListener('focusout',()=>requestAnimationFrame(scheduleLayout),{signal:events.signal});
    function recover(){try{const value=JSON.parse(session?.getItem(SESSION)||'null');if(value&&(value.ownerId===null||value.ownerId===(account.linked?account.id:null))){plan=domain.normalize(value.plan,catalog);schedule=value.schedule||schedule;active=value.active===true;dirty=value.dirty===true;anchorId=value.anchorId||plan.stopIds.at(-1)||plan.startId;selected=byId.get(value.selectedId)||byId.get(anchorId)||null;scrollRestore=value.viewport;}}catch{}}
    recover();
    const identity=p=>({id:p.id,ownerUserId:p.ownerUserId,createdAt:p.createdAt,updatedAt:p.updatedAt});
    identities.set(context,identity(plan));
    function remember(){undo.push({context,plan:copy(plan),schedule:copy(schedule),dirty});if(undo.length>30)undo.shift();}
    function invalidateGeneration(){revision++;generation?.controller.abort();generation=null;autoBaseline=null;operationError='';failedOperation=null;}
    function snapshot(){const map=viewer.getMap?.(),center=map?.getCenter();return center?{lat:center.lat,lng:center.lng,zoom:map.getZoom(),scrollY:root.scrollY}:scrollRestore;}
    function persist(){try{session?.setItem(SESSION,JSON.stringify({plan,schedule,active,dirty,anchorId,selectedId:selected?.id||null,ownerId:account.linked?account.id:null,browseFilters:options.getBrowseFilters?.()||null,viewport:snapshot()}));}catch{/* Restricted session storage must not interrupt editing. */}}
    function notify(message,error=false){noticeMessage=message;noticeError=error;clearTimeout(flashTimer);const el=host.querySelector('.rp-notice');if(el){el.textContent=message;el.classList.toggle('is-error',error);el.hidden=false;}flashTimer=setTimeout(()=>{noticeMessage='';const current=host.querySelector('.rp-notice');if(current)current.hidden=true;},3500);}
    function status(p=plan){return domain.status(p,catalog,ready?provider:null,event());}
    function distanceSummary(p=plan){const value=status(p);return Number.isFinite(value.distanceMeters)?`<strong>${km(value.distanceMeters)}</strong><span class="rp-drive-time">예상 주행 ${time(value.durationSeconds)}</span>`:`<span>${!p.startId?'출발지를 선택해 주세요':!ready?'도로 정보 준비 중':'경로 확인 필요'}</span>`;}
    function mapPlan(p=plan,fit=false){if(!active)return;const ids=p.startId?domain.orderedIds(p):[];viewer.setRoute?.(result?.legs||[],{selectedIds:ids,activeId:anchorId,places:ids.map(id=>byId.get(id)).filter(Boolean),fit});}
    function currentId(){return anchorId===plan.startId||plan.stopIds.includes(anchorId)?anchorId:plan.stopIds.at(-1)||plan.startId;}
    function insertionFor(id){return ready?domain.bestInsertion(plan,id,catalog,provider):null;}
    function insertionSignature(){return JSON.stringify([context,revision,domain.orderedIds(plan)]);}
    function cancelAdd(){pendingAdd?.controller.abort();pendingAdd=null;}
    function gapText(value){return `${placeText(byId.get(value.fromId)?.name)} → ${placeText(byId.get(value.toId)?.name)} 구간`;}
    function insertionDelta(value){return `전체 경로 ${value.addedDistanceMeters>=0?'+':'−'}${km(Math.abs(value.addedDistanceMeters))} · ${value.addedDurationSeconds>=0?'+':'−'}${time(Math.abs(value.addedDurationSeconds))}`;}
    function routeActionState(place){
      if(place.kind==='start')return {disabled:Boolean(pendingAdd),description:''};
      if(pendingAdd)return {disabled:true,label:'도로 확인 중…',description:'연결을 확인한 뒤 추가합니다.'};
      if(!plan.startId)return {disabled:true,description:'먼저 출발지를 선택해 주세요.'};
      if(!ready||routeBusy)return {disabled:true,description:'도로 연결을 확인하고 있습니다.'};
      if(routeError)return {disabled:true,description:'현재 경로의 도로를 확인하지 못했습니다. 다시 계산해 주세요.'};
      const value=insertionFor(place.id);
      return value?{disabled:false,description:`경유 ${value.at+1}번째 구간 · 전체 ${value.addedDistanceMeters>=0?'+':'−'}${km(Math.abs(value.addedDistanceMeters)).replace(' km','km')}`}:{disabled:true,description:plan.stopIds.includes(place.id)?'이미 경로에 포함된 장소입니다.':'이 구간의 도로를 연결할 수 없습니다.'};
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
    function change(next,message,fit=false){cancelAdd();invalidateGeneration();remember();plan=domain.normalize(next,catalog);dirty=true;persist();calculate(fit);if(message)notify(message);}
    function applyStart(id){anchorId=id;selected=byId.get(id);detailId=null;tab='search';change({...plan,startId:id},`출발지를 선택했습니다. 경유지를 직접 고르거나 ${minimum()}곳을 추천받으세요.`);options.onStartChange?.(id);selectOnMap(id,true);host.querySelector('[data-scroll="places"]').scrollTop=0;if(incomingCandidate){const candidate=incomingCandidate;incomingCandidate=null;select(candidate);selectOnMap(candidate.id,true);}}
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
        anchorId=id;selected=place;detailId=null;change({...plan,stopIds:stops},`${placeText(place.name)} · ${gapText(latest)}에 추가했습니다. 실행 취소로 되돌릴 수 있어요.`);selectOnMap(id);
      }catch(error){if(!disposed&&pendingAdd===request&&error?.name!=='AbortError')notify(roadMessage(error),true);}
      finally{if(pendingAdd===request){pendingAdd=null;render();syncMap();}}
    }
    function select(place){if(syncingSelection||!active||!place||(!plan.startId&&place.kind!=='start'))return;selected=byId.get(place.id)||place;if(plan.stopIds.includes(place.id)||plan.startId===place.id)anchorId=place.id;showDetail(place.id);syncMap();persist();}
    function card(place,{recommendation=null}={}){if(!place)return'';
      const position=plan.stopIds.indexOf(place.id),included=position>=0?`경로 포함 · ${position+1}번째`:place.id===plan.startId?'선택된 출발지':place.id===plan.finishId?'고정 도착지':'';
      return `<article class="rp-place${selected?.id===place.id?' is-selected':''}" data-place-id="${esc(place.id)}"><button type="button" class="rp-place-view" data-rp-action="select" data-id="${esc(place.id)}" aria-label="${esc(placeText(place.name))} 지도에서 확인">${place.image?`<img src="${esc(place.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'<span class="rp-photo-empty"></span>'}<span><small>${esc(placeText(place.region))}</small><strong>${esc(placeText(place.name))}</strong>${included?`<span class="rp-included">${included}</span>`:''}<em>${esc(place.kind==='start'?'출발지':place.kind==='finish'?'고정 도착지':categories[place.category]||'스팟')}</em></span></button>${recommendation?`<p class="rp-insertion-gap">${esc(gapText(recommendation))}</p><p>${esc(insertionDelta(recommendation))}</p>`:''}</article>`;
    }
    function pointRow(id,index,kind){
      const place=byId.get(id),name=placeText(place?.name||'더 이상 제공되지 않는 장소'),isStop=kind==='spot';
      return `<li class="rp-waypoint${anchorId===id?' is-active':''}${!place?' is-missing':''}" data-waypoint="${esc(id)}"${isStop?' draggable="true"':''}>
        ${isStop?`<button type="button" class="rp-drag rp-icon" data-drag-handle="${esc(id)}" aria-label="${esc(name)} 순서 이동, 위아래 방향키 사용" title="끌어서 순서 이동">${icon('drag')}</button>`:''}
        <button type="button" class="rp-point-main" data-rp-action="anchor" data-id="${esc(id)}" aria-label="${esc(name)} 지도에서 확인"><span class="rp-point-number ${kind}">${isStop?index+1:kind==='start'?'출':'도'}</span><span><small>${kind==='start'?'출발지':kind==='finish'?'고정 도착지':esc(placeText(place?.region||'위치 확인 필요'))}</small><strong>${esc(name)}</strong></span></button>
        ${kind==='start'?'<button type="button" class="rp-start-change" data-rp-action="change-start" aria-label="출발지 변경">변경</button>':''}
        ${isStop?`<details class="rp-row-menu"><summary aria-label="${esc(name)} 편집 메뉴" title="장소 편집">${icon('more')}</summary><div><button type="button" data-rp-action="detail" data-id="${esc(id)}">상세 보기</button><button type="button" data-rp-action="up" data-id="${esc(id)}" ${index===0?'disabled':''}>위로 이동</button><button type="button" data-rp-action="down" data-id="${esc(id)}" ${index===plan.stopIds.length-1?'disabled':''}>아래로 이동</button><button type="button" data-rp-action="remove" data-id="${esc(id)}">삭제</button></div></details>`:''}</li>`;
    }
    function insertionCaption(place){if(place.kind!=='spot'||plan.stopIds.includes(place.id))return '';const value=insertionFor(place.id);return `<p class="rp-insertion-preview" role="status">${value?`추가 예정 · ${esc(gapText(value))}<br>${esc(insertionDelta(value))}`:esc(routeActionState(place).description)}</p>`;}
    function eventCaption(){
      const official=options.getParticipation?.()?.selectedStartLocationId,review=reviewFor();
      const warnings=[];
      if(official&&plan.startId&&official!==plan.startId)warnings.push('<p class="rp-error">공식 참가 출발지와 다른 루트입니다. <a href="/app/preparation#start" data-app-link>공식 출발지 확인·변경 →</a></p>');
      if(['LATE','EARLY','EARLY_LATE'].includes(review.state))warnings.push(`<p class="rp-error rp-schedule-warning">${esc(review.arrivalLabel||'')} · ${esc(review.label)}</p>`);
      return warnings.length?`<div class="rp-event-context">${warnings.join('')}</div>`:'';
    }
    function reviewFor(p=plan,drivingSeconds=status(p).durationSeconds){return root.SSKR_EVENT_RULES.reviewSchedule({event:event(),...schedule,drivingSeconds,start:byId.get(p.startId),finish:byId.get(p.finishId)});}
    function reviewSchedule(){
      const stats=status(),e=event(),modal=openDialog('하루 일정 검토',`<p>${esc(e.publicTitle)} · 예상 주행 ${time(stats.durationSeconds)}</p><form data-schedule><label class="rp-name">예상 출발 시각<input type="time" name="departureTime" value="${esc(schedule.departureTime)}" required></label><label class="rp-name">전체 휴식·관광 시간 (분)<input type="number" name="breakMinutes" min="0" max="1440" value="${esc(schedule.breakMinutes)}" required></label><p role="status" data-schedule-result></p><p class="rp-caption">휴식·관광을 포함해 검토합니다. 교통과 현장 상황은 반영하지 않습니다. 시간이 부족하면 덜 우회하는 장소와 일정을 검토하세요. 휴식과 안전을 우선해 주세요.</p><button class="rp-primary" type="submit">검토 내용 저장</button></form>`),form=modal.querySelector('form');
      const update=()=>{
        const values=Object.fromEntries(new FormData(form)),value=root.SSKR_EVENT_RULES.reviewSchedule({event:e,...values,drivingSeconds:stats.durationSeconds,start:byId.get(plan.startId),finish:byId.get(plan.finishId)});
        form.querySelector('[data-schedule-result]').textContent=(value.arrivalLabel?value.arrivalLabel+' · ':'')+value.label+(value.sunlightState==='CALCULATED_MOCK'?' · 일출·일몰 계산 예시, 운영 전 확인 필요':'');
      };
      form.addEventListener('input',()=>{if(generation||pendingAdd){invalidateGeneration();cancelAdd();render();syncMap();}update();});form.addEventListener('submit',event=>{event.preventDefault();invalidateGeneration();cancelAdd();schedule=Object.fromEntries(new FormData(form));persist();const saved=saveSchedule();closeDialog();render();if(!saved)notify('일정 검토를 저장하지 못했습니다. 저장 공간을 확인한 뒤 다시 저장해 주세요.',true);});update();
    }
    function saveSchedule(){if(!plan.id||!account.linked)return true;try{if(!storage)throw new Error('Storage unavailable');storage.setItem('sskr.route.schedule.'+account.id+'.'+plan.id,JSON.stringify(schedule));return true;}catch{return false;}}
    function routeContent(){const stats=status();return `<div class="rp-route-selected"><div class="rp-route-heading"><h3>내 경로</h3></div>${eventCaption()}<ol class="rp-waypoints">${plan.startId?pointRow(plan.startId,-1,'start'):'<li class="rp-start-empty"><button type="button" data-rp-action="change-start">출발지 선택</button></li>'}${plan.stopIds.map((id,index)=>pointRow(id,index,'spot')).join('')}${pointRow(plan.finishId,-1,'finish')}</ol>${stats.issues.filter(issue=>issue.placeId||ready&&issue.code==='UNREACHABLE').map(issue=>`<p class="rp-error">${esc(issue.message)}</p>`).join('')}</div>`;}
    function operationMarkup(){return `<div class="rp-operation" role="status">${operationError?`<span class="rp-error">${esc(operationError)}</span><button type="button" data-rp-action="retry-generation">다시 시도</button>`:generation?'루트 만드는 중…':providerError?`<span class="rp-error">${esc(providerError)}</span><button type="button" data-rp-action="retry-provider">다시 시도</button>`:!ready?'도로 정보를 준비하고 있어요.':pendingAdd?'추가할 도로 연결 중…':routeBusy?'도로 연결 중…':routeError?`<span class="rp-error">${esc(routeError)}</span><button type="button" data-rp-action="retry-route">다시 계산</button>`:''}</div>`;}
    function routeFooter(){return `<button class="rp-browse-button rp-primary" type="button" data-rp-action="autofill" ${!plan.startId||!ready||routeBusy||pendingAdd||generation||plan.stopIds.length>=minimum()?'disabled':''}>${generation?'루트 만드는 중…':'경유지 자동 완성'}</button>${operationMarkup()}`;}
    function activateTab(next){if(mobile&&!detailId)tabScroll.set(tab,mobilePosition());detailId=null;tab=next==='route'?'route':'search';options.onTabChange?.(tab);render();scheduleLayout();scrollList(tabScroll.get(tab)||0);}
    function placesContent(){
      const starting=!plan.startId,searching=Boolean(queryText.trim()),rec=recommendations(),items=filterItems.filter(p=>p.kind===(starting?'start':'spot'));
      const recommended=!starting&&!searching&&rec.length>0,shown=recommended?rec.map(r=>card(byId.get(r.placeId),{recommendation:r})).join(''):items.slice(0,candidateLimit).map(p=>card(p)).join('');
      return `<div class="rp-search-slot"></div><details class="rp-filters" ${filterOpen?'open':''}><summary>카테고리</summary><div class="rp-filter-slot"></div></details><div class="rp-section-title"><h3>${starting?'출발지':searching?'검색 결과':recommended?'루트에 어울리는 스팟':'장소 찾기'}</h3>${recommended?'':`<span>${items.length}곳</span>`}</div><div class="${recommended?'rp-next':'rp-place-results'}">${shown||'<p class="rp-caption">조건에 맞는 장소가 없습니다. 검색 조건을 바꿔보세요.</p>'}</div>${!recommended&&items.length>candidateLimit?'<button type="button" class="rp-browse-button" data-rp-action="more">장소 더 보기</button>':''}`;
    }
    function detailContent(){const p=byId.get(detailId);if(!p)return '';return `<section class="rp-place-detail"><div class="rp-detail-head"><button type="button" data-rp-action="back-detail" aria-label="목록으로 돌아가기">←</button><div><h3>${esc(placeText(p.name))}</h3><p class="rp-detail-region">${esc(placeText(p.region))}</p></div></div>${plan.stopIds.includes(p.id)?`<p class="rp-included">경로 포함 · ${plan.stopIds.indexOf(p.id)+1}번째 경유지</p>`:''}${insertionCaption(p)}<p>${esc(p.description||p.lead)}</p>${p.image?`<figure class="rp-detail-visual"><img class="rp-detail-image" src="${esc(p.image)}" alt="${esc(placeText(p.name))}" referrerpolicy="no-referrer"><figcaption><a href="${esc(p.photoSource||p.source)}" target="_blank" rel="noopener noreferrer">${esc(p.photoCredit||'장소 사진 출처')}</a></figcaption></figure>`:''}<p>${esc(p.address||'')}</p><p class="rp-caption">${esc(p.note)}</p>${p.parking?`<p class="rp-caption">주차 위치 ${p.parking.lat.toFixed(6)}, ${p.parking.lng.toFixed(6)}</p>`:''}</section>`;}
    function savedContent(){if(!account.linked)return '<div class="rp-empty"><h3>다음에도 이어서 준비하세요</h3><p>로그인하면 참가 신청 없이도 루트를 저장하고 다시 불러올 수 있어요.</p><button type="button" class="rp-primary" data-rp-action="login">로그인</button></div>';let items;try{items=store.list(account);}catch(error){return `<p class="rp-error">${esc(error.message)}</p>`;}return `<div class="rp-section-title"><h3>내 루트</h3></div>${items.length?items.map(item=>{const stats=status(item);return `<article class="rp-saved"><span>${stats.complete?'최소 경유 수 충족':'초안'} · 경유 ${item.stopIds.length}곳</span><h3>${esc(item.title)}</h3><p>${esc(placeText(byId.get(item.startId)?.name||'출발지 미정'))} → ${esc(placeText(byId.get(item.finishId)?.name))}</p><small>${km(stats.distanceMeters)} · ${time(stats.durationSeconds)}</small><div><button type="button" data-rp-action="load" data-id="${esc(item.id)}">불러오기</button><button type="button" data-rp-action="duplicate" data-id="${esc(item.id)}">복제해 편집</button><button type="button" data-rp-action="delete" data-id="${esc(item.id)}">삭제</button></div></article>`;}).join(''):'<div class="rp-empty"><h3>저장한 루트가 없어요</h3><p>경유지를 모두 고르기 전에도 초안으로 저장할 수 있어요.</p><button type="button" class="rp-primary" data-rp-action="route-tab">루트 만들기</button></div>'}`;}
    function render(){
      if(disposed)return;if(!active){host.hidden=true;return;}
      const scrolls=[...host.querySelectorAll('[data-scroll]')].map(el=>[el.dataset.scroll,el.scrollTop]),pageY=root.scrollY,focus=document.activeElement;
      const focusId=area.contains(focus)?focus?.id:null,focusKey=focus?.dataset?.rpAction,focusPlace=focus?.dataset?.id;
      filterOpen=host.querySelector('.rp-filters')?.open??filterOpen;filterNodes.forEach(node=>node.remove());
      host.className='route-planner';host.dataset.tab=tab;host.hidden=!active;options.onTabChange?.(dialog?.dataset.management?'saved':tab);
      const toolbar=`<div class="rp-title-group"><strong class="rp-title">${esc(plan.title||'새 루트')}</strong><small>${dirty?'변경사항 있음':plan.id?'저장됨':''}</small></div><button type="button" class="rp-icon" data-rp-action="manage" aria-label="루트 관리" title="루트 관리">${icon('folder')}</button><div class="rp-toolbar-spacer"></div><button type="button" class="rp-icon" data-rp-action="undo" aria-label="실행 취소" title="실행 취소 (Ctrl/Cmd+Z)" ${undo.length?'':'disabled'}>${icon('undo')}</button><button type="button" class="rp-icon" data-rp-action="help" aria-label="루트 작성 도움말" title="루트 작성 도움말">${icon('help')}</button><details class="rp-more-menu"><summary aria-label="루트 도구 더보기" title="루트 도구 더보기">${icon('more')}</summary><div><button type="button" data-rp-action="optimize" ${plan.stopIds.length<2||!ready||routeBusy||pendingAdd||generation?'disabled':''}>루트 최적화</button><button type="button" data-rp-action="another" ${autoBaseline&&!generation&&!routeBusy?'':'disabled'}>다른 조합 만들기</button><button type="button" data-rp-action="schedule" ${!plan.startId||!ready?'disabled':''}>하루 일정 검토</button></div></details><button type="button" class="rp-primary" data-rp-action="save" ${pendingAdd||generation?'disabled':''}>저장</button>`;
      host.innerHTML=`<header class="rp-header"><div class="rp-toolbar">${toolbar}</div>${mobile?'':`<div class="rp-summary">${distanceSummary()}</div>`}</header><nav class="rp-tabs" role="tablist" aria-label="루트 편집 목록">${[['search','장소 찾기'],['route','내 경로']].map(([key,label])=>`<button type="button" id="rp-tab-${key}" role="tab" data-rp-action="tab" data-tab="${key}" aria-selected="${tab===key}" aria-controls="rp-${key==='route'?'route':'places'}-pane">${label}</button>`).join('')}</nav>
        <section class="rp-route-pane" id="rp-route-pane" aria-label="내 경로"><div class="rp-route-scroll rp-scroll" data-scroll="route">${routeContent()}</div>${!mobile||tab==='route'?`<footer class="rp-route-footer">${routeFooter()}</footer>`:''}</section>
        <section class="rp-discovery-pane" id="rp-places-pane" aria-label="장소 찾기"><div class="rp-scroll" data-scroll="places">${detailId?detailContent():placesContent()}</div>${mobile&&tab!=='route'?`<footer class="rp-footer">${routeFooter()}</footer>`:''}</section><p class="rp-notice${noticeError?' is-error':''}" role="status" aria-live="polite" ${noticeMessage?'':'hidden'}>${esc(noticeMessage)}</p>`;
      const slot=host.querySelector('.rp-filter-slot'),searchSlot=host.querySelector('.rp-search-slot');filterNodes.forEach(node=>((node.classList.contains('spot-toolbar')?searchSlot:slot)||options.filterParking)?.append(node));
      if(mobile){const tabs=host.querySelector('.rp-tabs');area.querySelectorAll('.rp-tabs').forEach(old=>{if(old!==tabs)old.remove();});sticky.append(tabs);mapSummary.innerHTML=`<div>${distanceSummary()}</div>`;host.querySelector('.rp-header').prepend(host.querySelector('.rp-notice'));root.scrollTo({top:pageY,behavior:'instant'});workspaceLayout();}
      scrolls.forEach(([key,top])=>{const el=host.querySelector(`[data-scroll="${key}"]`);if(el)el.scrollTop=top;});
      if(focus?.isConnected&&filterNodes.some(n=>n.contains(focus)))focus.focus({preventScroll:true});
      else if(focusId)area.querySelector('#'+CSS.escape(focusId))?.focus({preventScroll:true});
      else if(focusKey)[...host.querySelectorAll('[data-rp-action]')].find(el=>el.dataset.rpAction===focusKey&&el.dataset.id===focusPlace)?.focus({preventScroll:true});
    }
    function closeDialog(){
      const focus=dialogFocus;disposeDialog?.();disposeDialog=null;dialog?.close();dialog?.remove();dialog=null;dialogFocus=null;options.onTabChange?.(tab);
      if(focus?.isConnected)focus.focus({preventScroll:true});else if(focus?.dataset.rpAction)host.querySelector(`[data-rp-action="${focus.dataset.rpAction}"]`)?.focus({preventScroll:true});
    }
    function openDialog(title,html){
      const focus=dialog?.contains(document.activeElement)?dialogFocus:document.activeElement;closeDialog();dialogFocus=focus;dialog=document.createElement('dialog');dialog.className='rp-dialog';dialog.innerHTML=`<div class="rp-dialog-head"><h2>${esc(title)}</h2><button type="button" data-close aria-label="닫기">×</button></div><div class="rp-dialog-body">${html}</div>`;document.body.append(dialog);
      dialog.querySelector('[data-close]').addEventListener('click',closeDialog);dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();else if(event.target.closest('[data-rp-action]'))handleAction(event);});dialog.showModal();return dialog;
    }
    function confirmAction(title,message,action){const modal=openDialog(title,`<p>${esc(message)}</p><div class="rp-dialog-actions"><button type="button" data-cancel>취소</button><button type="button" class="rp-primary" data-confirm>확인</button></div>`);modal.querySelector('[data-cancel]').onclick=closeDialog;modal.querySelector('[data-confirm]').onclick=()=>{closeDialog();action();};}
    function openManagement(){const modal=openDialog('루트 관리',`<div class="rp-managed-current"><strong>${esc(plan.title||'새 루트')}</strong><small>${dirty?'변경사항 있음':plan.id?'저장됨':'작성 중'}</small><button type="button" data-rp-action="rename">이름 변경</button><button type="button" data-rp-action="new">새 루트</button></div>${savedContent()}`);modal.dataset.management='true';options.onTabChange?.('saved');}
    function openHelp(){openDialog('루트 작성 도움말',`<p>출발지를 선택하고 지도 사진 카드의 ‘경유지 추가’를 눌러 장소를 담으세요. 새 장소는 도로 우회가 가장 적은 구간에 들어갑니다.</p><p>방문 순서는 내 경로에서 끌거나 편집 메뉴의 위아래 이동으로 바꿀 수 있습니다. 자동 완성과 루트 최적화는 바로 적용되며 실행 취소로 되돌릴 수 있습니다.</p><p>${esc(event().publicTitle||'SSKR')}의 완주 조건은 출발·도착과 경유 ${minimum()}곳 이상, 총 ${minimum()+2}곳 이상의 실제 체크인입니다. 루트 작성·저장은 선택이며 경유지가 부족해도 초안으로 저장할 수 있습니다.</p><p>예상 주행 시간은 정차와 실시간 교통을 포함하지 않습니다. 하루 일정 검토에서 출발 시각과 휴식·관광 시간을 입력하세요.</p><p>개인 루트의 출발지와 공식 참가 출발지는 별도로 설정합니다.</p><button type="button" data-rp-action="schedule" ${!plan.startId||!ready?'disabled':''}>하루 일정 검토</button>`);}
    async function login(saveAfter=false){persist();const modal=openDialog('루트 저장을 위한 로그인','<div class="rp-auth"></div>');disposeDialog=root.SSKR_SOCIAL_AUTH.mount(modal.querySelector('.rp-auth'),{title:'나의 루트를 저장하세요',note:'참가 신청 없이도 이용할 수 있습니다.',onSelect:async loginProvider=>{account=await options.onLogin(loginProvider);persist();closeDialog();render();if(saveAfter)save();}});}
    function save(){if(pendingAdd||generation){notify('도로 확인이 끝난 뒤 저장해 주세요.');return;}if(!account.linked){login(true);return;}try{plan=store.save({...plan,routingVersion:ready?provider.version:plan.routingVersion},account);identities.set(context,identity(plan));dirty=false;const scheduleSaved=saveSchedule();persist();render();notify(scheduleSaved?'루트를 저장했습니다.':'루트는 저장했지만 일정 검토는 저장하지 못했습니다. 저장 공간을 확인한 뒤 다시 저장해 주세요.',!scheduleSaved);}catch(error){notify(error?.message||'저장하지 못했습니다. 다시 시도해 주세요.',true);}}
    function generationSignature(){return JSON.stringify([context,revision,domain.orderedIds(plan),schedule,event()]);}
    function validRoads(roads,ids){const metric=value=>Number.isFinite(value)&&value>=0;return roads?.valid&&roads.legs?.length===ids.length-1&&roads.legs.every((leg,index)=>leg.fromId===ids[index]&&leg.toId===ids[index+1]&&leg.status==='ready'&&Array.isArray(leg.coordinates)&&leg.coordinates.length>=2&&leg.coordinates.every(point=>Array.isArray(point)&&Number.isFinite(point[0])&&Math.abs(point[0])<=90&&Number.isFinite(point[1])&&Math.abs(point[1])<=180)&&metric(leg.distanceMeters)&&metric(leg.durationSeconds))&&metric(roads.distanceMeters)&&metric(roads.durationSeconds);}
    async function generate(type,another=false,retryBase=null){
      if(!active||disposed||!ready||!plan.startId||routeBusy||pendingAdd)return;
      const base=copy(retryBase||(another&&autoBaseline?autoBaseline.plan:plan)),original=copy(plan),baseline=type==='auto'?base:null;
      invalidateGeneration();const request={controller:new AbortController(),signature:generationSignature(),type,base};generation=request;render();
      const current=()=>!disposed&&active&&generation===request&&!request.controller.signal.aborted&&request.signature===generationSignature();
      try{
        await new Promise(resolve=>requestAnimationFrame(resolve));if(!current())return;
        const budget=reviewFor(base,0).drivingBudgetSeconds,next=type==='auto'?domain.autoFill(base,catalog,provider,{variant:variant++,event:event(),drivingBudgetSeconds:budget}):domain.optimize(base,provider);
        if(type==='auto'&&next.stopIds.length<minimum())throw new Error(Number.isFinite(budget)?'현재 장소와 일정 안에서 경유지를 모두 채우지 못했습니다. 장소의 우회 정도나 하루 일정을 조정해 주세요.':'연결 가능한 후보로 경유지를 모두 채우지 못했습니다. 다른 출발지나 장소를 검토해 주세요.');
        if(new Set(next.stopIds).size!==next.stopIds.length||next.startId!==base.startId||next.finishId!==base.finishId)throw new Error('루트 구성을 확인하지 못했습니다. 기존 경로를 유지했습니다.');
        if(type==='auto'&&JSON.stringify(next.stopIds.filter(id=>base.stopIds.includes(id)))!==JSON.stringify(base.stopIds))throw new Error('직접 선택한 장소의 순서를 유지하지 못했습니다.');
        if(type==='optimize'&&JSON.stringify([...next.stopIds].sort())!==JSON.stringify([...base.stopIds].sort()))throw new Error('루트 구성에 변경이 있어 적용하지 않았습니다.');
        const ids=domain.orderedIds(next),roads=await provider.route(ids,{signal:request.controller.signal});if(!current())return;
        if(!validRoads(roads,ids))throw new Error('도로 연결을 확인하지 못했습니다. 기존 경로를 유지했습니다.');
        if(type==='auto'&&Number.isFinite(budget)&&roads.durationSeconds>budget)throw new Error('설정한 하루 일정 안에서 주행하기 어려운 조합입니다. 기존 경로를 유지했습니다.');
        const before=status(original);
        if(JSON.stringify(next.stopIds)===JSON.stringify(original.stopIds)||type==='optimize'&&roads.distanceMeters+1>=before.distanceMeters){autoBaseline=baseline?{plan:baseline}:null;notify(type==='optimize'?'더 짧은 방문 순서를 찾지 못했습니다.':'현재 조합이 가장 적합합니다.');return;}
        remember();plan=domain.normalize(next,catalog);dirty=true;generation=null;autoBaseline=baseline?{plan:baseline}:null;result=roads;routeError='';routeBusy=false;++routeRequest;routeAbort?.abort();anchorId=null;selected=null;detailId=null;viewer.clearSelection?.();persist();render();syncMap(true);scheduleLayout();notify(type==='optimize'?`루트 최적화로 ${km(before.distanceMeters-roads.distanceMeters)} 줄였습니다.`:'경유지 자동 완성을 적용했습니다.');
      }catch(error){if(current()&&error?.name!=='AbortError'){operationError=roadMessage(error);failedOperation={type,base};}}
      finally{if(generation===request){generation=null;render();syncMap();}}
    }
    function switchPlan(next,nextSchedule,changed=false){cancelAdd();invalidateGeneration();remember();context=++contextSerial;plan=domain.normalize(next,catalog);identities.set(context,identity(plan));schedule=nextSchedule;dirty=changed;anchorId=null;selected=null;detailId=null;tab='search';closeDialog();options.onStartChange?.(plan.startId);persist();calculate(true);}
    function editSaved(id,duplicate=false){let saved;try{saved=store.get(id,account);}catch(error){notify(error.message,true);return;}if(!saved)return;let nextSchedule;try{nextSchedule=JSON.parse(storage?.getItem('sskr.route.schedule.'+account.id+'.'+id)||'null')||{departureTime:'',breakMinutes:''};}catch{nextSchedule={departureTime:'',breakMinutes:''};}if(duplicate)saved={...saved,id:null,ownerUserId:null,title:`${saved.title.slice(0,57)} 복사`,createdAt:null,updatedAt:null};switchPlan(saved,nextSchedule,duplicate);}
    function newPlan(){switchPlan(domain.createEmpty(catalog),{departureTime:'',breakMinutes:''});}
    function undoChange(){if(!undo.length)return;cancelAdd();invalidateGeneration();const previous=undo.pop(),switched=previous.context!==context,oldStart=plan.startId;if(switched)schedule=previous.schedule;context=previous.context;plan={...previous.plan,...(identities.get(context)||identity(previous.plan))};dirty=switched?previous.dirty:true;anchorId=null;selected=null;detailId=null;if(switched||oldStart!==plan.startId)options.onStartChange?.(plan.startId);persist();calculate();viewer.clearSelection?.();notify('이전 작성 내용으로 돌아갔습니다.');}
    function showDetail(id){if(!byId.has(id))return;if(!detailId){returnTab=tab;detailScroll=mobile?mobilePosition():host.querySelector('[data-scroll="places"]')?.scrollTop||0;}detailId=id;tab='search';render();workspaceLayout();selectionLayout();host.querySelector('[data-scroll="places"]').scrollTop=0;}
    function openStartPicker(){
      const modal=openDialog('출발지 선택',`<div class="rp-start-options">${catalog.filter(p=>p.kind==='start').map(p=>`<button type="button" data-start-id="${esc(p.id)}" aria-pressed="${p.id===plan.startId}"><strong>${esc(placeText(p.name))}</strong><small>${esc(placeText(p.region))}</small></button>`).join('')}</div>`);
      modal.querySelectorAll('[data-start-id]').forEach(button=>button.onclick=()=>{closeDialog();start(button.dataset.startId);});
    }
    function editName(saveAfter=false){const modal=openDialog(saveAfter?'루트 저장':'루트 이름 변경',`<form data-name-form><label class="rp-name">루트 이름<input id="rp-title" maxlength="60" value="${esc(plan.title)}" placeholder="나의 주행 루트" required></label><button type="submit" class="rp-primary" data-save-confirm>${saveAfter?'저장':'변경'}</button></form>`);modal.querySelector('form').onsubmit=event=>{event.preventDefault();const title=modal.querySelector('input').value.trim();if(!title)return;if(title!==plan.title){invalidateGeneration();remember();plan={...plan,title};dirty=true;persist();}closeDialog();render();if(saveAfter)save();};}
    function promptSave(){if(plan.title?.trim())save();else editName(true);}
    function handleAction(event){
      const button=event.target.closest('[data-rp-action]');if(!button||button.disabled)return;const action=button.dataset.rpAction,id=button.dataset.id;button.closest('details')?.removeAttribute('open');
      if(action==='manage'){openManagement();return;}if(action==='help'){openHelp();return;}if(action==='rename'){editName();return;}
      if(action==='change-start'){openStartPicker();return;}
      if(action==='back-detail'){detailId=null;tab=returnTab==='route'?'route':'search';render();if(mobile)scrollList(detailScroll);else host.querySelector('[data-scroll="places"]').scrollTop=detailScroll;return;}
      if(action==='tab'){activateTab(button.dataset.tab);return;}
      if(action==='select'){select(byId.get(id));selectOnMap(id,true);return;}
      if(action==='anchor'){detailId=null;anchorId=id;selected=byId.get(id);selectOnMap(id,true);render();syncMap();persist();return;}
      if(action==='remove'){if(anchorId===id)anchorId=null;if(selected?.id===id){selected=null;viewer.clearSelection?.();}change({...plan,stopIds:plan.stopIds.filter(stop=>stop!==id)},'경유지를 삭제했습니다.');return;}
      if(action==='up'||action==='down'){const stops=plan.stopIds.slice(),index=stops.indexOf(id),target=index+(action==='up'?-1:1);if(index>=0&&target>=0&&target<stops.length){[stops[index],stops[target]]=[stops[target],stops[index]];change({...plan,stopIds:stops});}return;}
      if(action==='undo'){undoChange();return;}
      if(action==='more'){candidateLimit+=12;render();return;}
      if(action==='autofill'){generate('auto');return;}if(action==='another'){generate('auto',true);return;}if(action==='optimize'){generate('optimize');return;}
      if(action==='retry-generation'){if(failedOperation)generate(failedOperation.type,false,failedOperation.base);return;}
      if(action==='retry-route'){calculate();return;}if(action==='retry-provider'){loadProvider();return;}
      if(action==='schedule'){reviewSchedule();return;}if(action==='save'){promptSave();return;}if(action==='login'){login();return;}if(action==='new'){newPlan();return;}
      if(action==='route-tab'){closeDialog();activateTab('search');return;}if(action==='load'||action==='duplicate'){editSaved(id,action==='duplicate');return;}
      if(action==='delete'){confirmAction('저장한 루트를 삭제할까요?','삭제한 루트는 복구할 수 없습니다.',()=>{try{store.remove(id,account);for(const [key,value] of identities)if(value.id===id)identities.set(key,{id:null,ownerUserId:null,createdAt:null,updatedAt:null});if(plan.id===id){plan={...plan,...identities.get(context)};dirty=true;persist();}render();openManagement();notify('저장한 루트를 삭제했습니다.');}catch(error){notify(error.message,true);}});return;}
      if(action==='detail'){showDetail(id);selectOnMap(id,true);}
    }
    area.addEventListener('click',handleAction,{signal:events.signal});
    root.addEventListener('keydown',event=>{if(!active||dialog||event.defaultPrevented||event.target.closest('input,textarea,[contenteditable]:not([contenteditable="false"])'))return;if((event.ctrlKey||event.metaKey)&&!event.shiftKey&&event.key.toLowerCase()==='z'&&undo.length){event.preventDefault();undoChange();}const id=event.target.closest('[data-drag-handle]')?.dataset.dragHandle;if(id&&['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();handleAction({target:{closest:()=>({dataset:{rpAction:event.key==='ArrowUp'?'up':'down',id},closest:()=>null})}});host.querySelector(`[data-drag-handle="${CSS.escape(id)}"]`)?.focus({preventScroll:true});}},{signal:events.signal});
    area.addEventListener('keydown',event=>{const button=event.target.closest('[role="tab"]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...area.querySelectorAll('[role="tab"]:not(:disabled)')],i=tabs.indexOf(button),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activateTab(tabs[next].dataset.tab);area.querySelector('#rp-tab-'+tab)?.focus({preventScroll:true});},{signal:events.signal});

    let draggedId=null;host.addEventListener('dragstart',event=>{const row=event.target.closest('[data-waypoint][draggable]');if(!row)return;draggedId=row.dataset.waypoint;event.dataTransfer.setData('text/plain',draggedId);event.dataTransfer.effectAllowed='move';row.classList.add('is-dragging');},{signal:events.signal});
    host.addEventListener('dragover',event=>{if(draggedId&&event.target.closest('[data-waypoint][draggable]')){event.preventDefault();event.dataTransfer.dropEffect='move';}},{signal:events.signal});
    host.addEventListener('drop',event=>{const target=event.target.closest('[data-waypoint][draggable]')?.dataset.waypoint;if(!draggedId||!target||target===draggedId)return;event.preventDefault();const stops=plan.stopIds.slice(),from=stops.indexOf(draggedId),to=stops.indexOf(target);if(from>=0&&to>=0){stops.splice(from,1);stops.splice(to,0,draggedId);change({...plan,stopIds:stops});}draggedId=null;},{signal:events.signal});
    host.addEventListener('dragend',()=>{draggedId=null;host.querySelector('.is-dragging')?.classList.remove('is-dragging');},{signal:events.signal});
    async function loadProvider(){providerStarted=true;providerError='';render();try{await provider.ready();if(disposed)return;ready=true;options.onRoadReady?.();calculate();}catch(error){if(disposed)return;providerError=roadMessage(error);render();}}
    const map=viewer.getMap?.();map?.on('moveend',persist);root.addEventListener('pagehide',persist,{signal:events.signal});
    if(scrollRestore&&active&&map){map.setView([scrollRestore.lat,scrollRestore.lng],scrollRestore.zoom,{animate:false});requestAnimationFrame(()=>{if(!disposed)root.scrollTo({top:0,behavior:'instant'});scheduleLayout();});}
    setMode(active);
    return {receivePlace(id){const p=byId.get(id);if(!p)return;if(p.kind==='start'){if(plan.startId&&plan.startId!==id)confirmAction('선택한 출발지로 바꿀까요?','현재 루트의 경유지는 유지됩니다. 공식 참가 출발지는 변경되지 않습니다.',()=>applyStart(id));else start(id);}else if(!plan.startId){incomingCandidate=p;notify('출발지를 먼저 선택하면 탐색한 장소를 이어서 검토할 수 있습니다.');}else{select(p);selectOnMap(id,true);}},isActive:()=>active,hasStart:()=>Boolean(plan.startId),distanceFromStart:id=>ready&&plan.startId?provider.summary(plan.startId,id)?.distanceMeters:null,startPlace:()=>byId.get(plan.startId),openSaved:openManagement,setMode,select,routeActionState,openPlace(place){if(!active||!place||!plan.startId&&place.kind!=='start')return;select(place);},addFromMap(place){if(active&&place)add(place.id);},setFilters(items,filters={}){filterItems=items;queryText=typeof filters==='object'?filters.query||'':'';filterActive=typeof filters==='object'?Boolean(queryText||filters.category&&filters.category!=='all'):filters;candidateLimit=12;if(active)render();},destroy(){cancelAdd();invalidateGeneration();persist();active=false;layoutMode();disposed=true;resize.disconnect();panelResize.disconnect();filterNodes.forEach(node=>options.filterParking?.append(node));document.body.classList.remove('route-editor-active');cancelAnimationFrame(layoutFrame);events.abort();routeAbort?.abort();map?.off('moveend',persist);clearTimeout(flashTimer);closeDialog();viewer.setEditing?.(false);}};
  }
  root.SSKR_ROUTE_PLANNER={mount};
})(typeof globalThis!=='undefined'?globalThis:this);
