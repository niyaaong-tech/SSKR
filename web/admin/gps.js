(function(){
  'use strict';
  const $=s=>document.querySelector(s),form=$('#config-form'),adminPage=location.pathname.startsWith('/app/admin/');
  const state={places:[],sessions:[],runs:[],operator:false,record:null,map:null,position:null,positionLayer:null,busy:false,editId:null,editRevision:0,pending:null,beginId:null};
  const field=name=>form.elements.namedItem(name);
  const names={walk:'탄천 도보',bus110a:'서울 110A',bus520:'경기 520'};
  const reasons={OUTSIDE_EVENT_TIME:'지정한 테스트 시간 밖입니다.',TIME_REVIEW_REQUIRED:'위치 측정 시각이 오래됐습니다. 다시 측정해 주세요.',LOCATION_UNCERTAIN:'GPS 오차가 허용 범위를 넘었습니다. 위치가 안정된 뒤 다시 시도해 주세요.',OUTSIDE_SPOT:'체크인 반경 밖입니다.',DUPLICATE_SPOT:'이미 체크인한 스팟입니다.',START_FIRST:'출발지에서 먼저 체크인해 주세요.',MORE_SPOTS_REQUIRED:'필수 스팟을 더 방문한 뒤 도착 체크인을 해 주세요.',ALREADY_FINISHED:'완료된 테스트입니다.',ORDER_REVIEW_REQUIRED:'이전 체크인보다 나중에 측정한 위치가 필요합니다.',INVALID_SPOT:'이 코스의 스팟을 선택해 주세요.'};
  const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const option=(id,title)=>{const o=node('option',title);o.value=id;return o;};
  const local=value=>new Date(Date.parse(value)+9*3600000).toISOString().slice(0,16);
  const fmt=value=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(value));
  function message(target,text,error=false){target.textContent=text;target.classList.toggle('error',error);}
  async function api(body){
    const r=await fetch('/api/backend?resource=field-tests',{method:'POST',headers:{'Content-Type':'application/json','X-SSKR-Request':'1'},body:JSON.stringify(body)});
    const d=await r.json();if(!r.ok){const e=Error(d.error?.userMessage||'테스트 연결을 확인해 주세요.');e.code=d.error?.code;e.status=r.status;throw e;}return d;
  }
  async function busy(fn){if(state.busy)return;state.busy=true;const buttons=[...document.querySelectorAll('button')],previous=buttons.map(b=>b.disabled);buttons.forEach(b=>b.disabled=true);try{await fn();}catch(e){message($('#status'),e.message,true);if(e.code==='AUTH_REQUIRED')$('#login').hidden=false;}finally{buttons.forEach((b,i)=>b.disabled=previous[i]);state.busy=false;$('#nearest').disabled=!state.position;$('#checkin').disabled=state.record?.document.run?.state==='COMPLETED';}}
  function addDays(offset){const day=new Date(Date.now()+9*3600000+offset*86400000).toISOString().slice(0,10);field('startAt').value=day+'T00:00';field('endAt').value=day+'T23:59';}
  function fillConfig(record){
    state.editId=record?.id||null;state.editRevision=record?.revision||0;
    form.reset();addDays(0);const doc=record?.document;
    field('title').value=doc?.title||'탄천 도보 GPS 테스트';
    if(doc)for(const key of ['group','minimumSpotCheckins','radius','accuracy','finishId'])field(key).value=doc[key];
    if(doc){field('startAt').value=local(doc.startAt);field('endAt').value=local(doc.endAt);field('enabled').checked=doc.enabled;}
    else field('finishId').value=state.places.filter(p=>p.group==='walk').at(-1)?.id||'';
    form.querySelectorAll('[name=startId]').forEach(c=>c.checked=(doc?.startIds||['test-start-ori']).includes(c.value));
    message($('#config-message'),'');
  }
  function schedule(){
    const doc=state.sessions.find(s=>s.id===$('#session').value)?.document;
    $('#start').replaceChildren(...(doc?.startIds||[]).map(id=>{const p=state.places.find(p=>p.id===id);return option(id,p.startName||p.name);}));
    $('#schedule').textContent=doc?`${fmt(doc.startAt)} ~ ${fmt(doc.endAt)} · ${doc.minimumSpotCheckins} 스팟 방문 후 ${state.places.find(p=>p.id===doc.finishId)?.name} 도착`: '관리자가 테스트 일정을 등록하면 시작할 수 있습니다.';
    $('#begin').disabled=!doc;
    state.beginId=null;
  }
  async function load(){
    const data=await api({action:'LIST'});Object.assign(state,data);
    state.places.sort((a,b)=>['walk','bus110a','bus520'].indexOf(a.group)-['walk','bus110a','bus520'].indexOf(b.group)||(a.routeOrder||0)-(b.routeOrder||0)||a.id.localeCompare(b.id));
    $('#status').textContent='GPS 현장 검수 전용 · 공식 서비스 스팟과 분리된 테스트입니다.';$('#status').classList.remove('error');$('#reload').hidden=true;$('#login').hidden=true;
    $('#settings-link').hidden=!state.operator||adminPage;
    $('#admin').hidden=!adminPage||!state.operator;$('#runner').hidden=adminPage;
    if(adminPage&&!state.operator){message($('#status'),'관리자 계정으로 로그인해야 테스트 설정을 변경할 수 있습니다.',true);return;}
    $('#session').replaceChildren(...state.sessions.filter(s=>s.document.enabled).map(s=>option(s.id,s.document.title)));schedule();
    $('#runs').replaceChildren(...state.runs.map(r=>{const b=node('button',`${r.title} · ${r.state==='COMPLETED'?'완료':'이어가기'} · ${fmt(r.updatedAt)}`);b.className='button';b.onclick=()=>busy(async()=>activate(await api({action:'LOAD',id:r.id})));return b;}));
    if(adminPage){
      $('#edit-session').replaceChildren(option('','새 테스트'),...state.sessions.map(s=>option(s.id,s.document.title+(s.document.enabled?'':' · 중지됨'))));
      $('#start-options').replaceChildren(...state.places.filter(p=>p.startEligible).map(p=>{const label=node('label');label.className='start-option';const c=node('input');c.type='checkbox';c.name='startId';c.value=p.id;label.append(c,node('span',p.startName||p.name));return label;}));
      field('finishId').replaceChildren(...state.places.filter(p=>p.kind==='spot').map(p=>option(p.id,`${names[p.group]} · ${p.name}`)));
      const previous=state.sessions.find(s=>s.id===state.editId);fillConfig(previous);$('#edit-session').value=previous?.id||'';
    }
  }
  function selected(){return state.record?.document.places.find(p=>p.id===$('#place').value);}
  function selectPlace(id,move=true){
    const p=state.record.document.places.find(p=>p.id===id);if(!p)return;
    $('#place').value=id;$('#place-name').textContent=p.name;
    const cfg=state.record.document.config,role=id===state.record.document.startId?'출발지':id===cfg.finishId?'도착지':'테스트 스팟';
    $('#place-note').textContent=[role,p.note,p.stopCode?'정류장 '+p.stopCode:'',`체크인 반경 ${cfg.radius}m`].filter(Boolean).join(' · ');
    $('#external-map').href=`https://map.kakao.com/link/map/${encodeURIComponent(p.name)},${p.lat},${p.lng}`;
    if(move)state.map?.select(id,{fly:true});
  }
  function renderRun(){
    const doc=state.record.document,run=doc.run,cfg=doc.config,valid=run?.visits.filter(v=>v.validationStatus==='VALIDATED')||[];
    const count=valid.filter(v=>v.role==='SPOT').length;
    $('#progress').textContent=run?.state==='COMPLETED'?`테스트 완료 · ${count} 스팟 방문`:`${count} / ${cfg.minimumSpotCheckins} 스팟 방문 · ${valid.length?'진행 중':'출발 체크인 전'}`;
    $('#run-title').textContent=cfg.title;$('#run-window').textContent=`${fmt(cfg.startAt)} ~ ${fmt(cfg.endAt)} · GPS 허용 오차 ${cfg.accuracy}m`;
    $('#checkin').disabled=run?.state==='COMPLETED';
    $('#visits').replaceChildren(...(run?.visits||[]).slice().reverse().map(v=>{const li=node('li'),p=doc.places.find(p=>p.id===v.locationId);li.append(node('strong',p?.name||v.locationId),node('small',`${fmt(v.checkedInAt)} · ${v.validationStatus==='VALIDATED'?'체크인 완료':reasons[v.reason]||v.reason}`));if(v.validationStatus!=='VALIDATED')li.className='error';return li;}));
  }
  function activate(record){
    state.record=record;state.position=null;state.positionLayer=null;$('#nearest').disabled=true;$('#gps-quality').textContent='위치 확인 전';$('#setup').hidden=true;$('#active').hidden=false;
    const doc=record.document;$('#place').replaceChildren(...doc.places.map(p=>option(p.id,(p.id===doc.startId?'출발 · ':p.id===doc.config.finishId?'도착 · ':'')+p.name)));
    state.map?.destroy();state.map=window.SSKR_MAP.mount($('#test-map'),{items:doc.places.map(p=>({...p,number:'테',region:names[p.group]||'테스트 출발지'})),cluster:false,inViewControl:false,inView:false,selectionCard:false,maxZoom:18,fitMaxZoom:16,onSelect:p=>selectPlace(p.id,false)});
    state.map.setEditing(true);state.map.fitRoute();
    renderRun();selectPlace(doc.startId,false);message($('#result'),'');
    try{state.pending=JSON.parse(sessionStorage.getItem('sskr.field.pending.'+record.id)||'null');}catch{state.pending=null;}
    $('#retry').hidden=!state.pending;
    const url=new URL(location.href);url.searchParams.set('run',record.id);history.replaceState(null,'',url);
  }
  function gps(){return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(Error('이 브라우저에서 현재 위치를 사용할 수 없습니다.'));return;}
    navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy,capturedAt:new Date(p.timestamp).toISOString()}),e=>reject(Error(e.code===1?'브라우저 설정에서 위치 접근을 허용해 주세요.':e.code===3?'위치 확인 시간이 초과됐습니다. 다시 시도해 주세요.':'현재 위치를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.')),{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  });}
  function showPosition(p){state.position=p;$('#gps-quality').textContent=`현재 GPS 오차 ±${Math.round(p.accuracy)}m`;$('#nearest').disabled=false;const map=state.map?.getMap();if(map&&window.L){state.positionLayer?.remove();state.positionLayer=L.circleMarker([p.lat,p.lng],{radius:7,color:'#fff',weight:2,fillColor:'#347fb1',fillOpacity:1}).addTo(map);}}
  function nearest(){
    const doc=state.record.document,valid=doc.run?.visits.filter(v=>v.validationStatus==='VALIDATED')||[],seen=new Set(valid.map(v=>v.locationId));
    const pool=valid.length?doc.places.filter(p=>!seen.has(p.id)&&(p.id!==doc.config.finishId||valid.filter(v=>v.role==='SPOT').length>=doc.config.minimumSpotCheckins)):doc.places.filter(p=>p.id===doc.startId);
    const closest=pool.sort((a,b)=>L.latLng(state.position.lat,state.position.lng).distanceTo([a.lat,a.lng])-L.latLng(state.position.lat,state.position.lng).distanceTo([b.lat,b.lng]))[0];
    if(closest)selectPlace(closest.id);
  }
  async function sendPending(){
    const request=state.pending;
    try{
      const record=await api(request);state.record=record;renderRun();
      const visit=record.document.run?.visits.find(v=>v.id===request.evidence.requestId);
      message($('#result'),visit?.validationStatus==='VALIDATED'?'체크인을 완료했습니다.':reasons[visit?.reason]||'체크인 결과를 다시 확인해 주세요.',visit?.validationStatus!=='VALIDATED');
      sessionStorage.removeItem('sskr.field.pending.'+record.id);state.pending=null;$('#retry').hidden=true;
    }catch(e){
      // A definite policy rejection was not stored; allow a corrected location.
      // Preserve uncertain network/server responses for idempotent retry.
      if(e.status>=400&&e.status<500&&!['AUTH_REQUIRED','CONFLICT'].includes(e.code)){sessionStorage.removeItem('sskr.field.pending.'+state.record.id);state.pending=null;}
      $('#retry').hidden=!state.pending;message($('#result'),e.message,true);throw e;
    }
  }
  $('#locate').onclick=()=>busy(async()=>{message($('#result'),'현재 위치를 확인하고 있습니다.');showPosition(await gps());message($('#result'),'위치를 확인했습니다.');});
  $('#nearest').onclick=()=>nearest();
  $('#checkin').onclick=()=>busy(async()=>{
    if(state.pending){message($('#result'),'이전 요청의 처리 결과를 먼저 확인해 주세요.',true);$('#retry').hidden=false;return;}
    const locationId=selected()?.id;if(!locationId)return;
    message($('#result'),'현재 위치를 확인하고 있습니다.');const p=await gps();showPosition(p);
    state.pending={action:'CHECKIN',id:state.record.id,evidence:{requestId:crypto.randomUUID(),locationId,...p}};
    sessionStorage.setItem('sskr.field.pending.'+state.record.id,JSON.stringify(state.pending));await sendPending();
  });
  $('#retry').onclick=()=>busy(sendPending);$('#place').onchange=()=>selectPlace($('#place').value);
  $('#session').onchange=schedule;$('#start').onchange=()=>state.beginId=null;
  $('#begin').onclick=()=>busy(async()=>{state.beginId ||= crypto.randomUUID();activate(await api({action:'BEGIN',id:state.beginId,sessionId:$('#session').value,startId:$('#start').value}));});
  $('#back').onclick=()=>busy(async()=>{state.map?.destroy();state.map=null;state.record=null;state.pending=null;$('#active').hidden=true;$('#setup').hidden=false;history.replaceState(null,'',location.pathname);await load();});
  $('#edit-session').onchange=()=>fillConfig(state.sessions.find(s=>s.id===$('#edit-session').value));
  form.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>addDays(Number(b.dataset.day)));
  field('group').onchange=()=>{const g=field('group').value;field('title').value=names[g]+' GPS 테스트';field('radius').value=g==='walk'?20:60;field('accuracy').value=g==='walk'?35:80;field('finishId').value=state.places.filter(p=>p.group===g).sort((a,b)=>(a.routeOrder||0)-(b.routeOrder||0)||a.id.localeCompare(b.id)).at(-1)?.id||'';form.querySelectorAll('[name=startId]').forEach(c=>c.checked=c.value===(g==='bus110a'?'test-start-soonchunhyang':'test-start-ori'));};
  form.onsubmit=e=>{e.preventDefault();busy(async()=>{
    const document={};for(const key of ['title','group','finishId'])document[key]=field(key).value;
    for(const key of ['minimumSpotCheckins','radius','accuracy'])document[key]=Number(field(key).value);
    for(const key of ['startAt','endAt'])document[key]=field(key).value+':00+09:00';
    document.startIds=[...form.querySelectorAll('[name=startId]:checked')].map(c=>c.value);document.enabled=field('enabled').checked;
    const result=await api({action:'CONFIGURE',id:state.editId||crypto.randomUUID(),revision:state.editRevision,document});state.editId=result.id;await load();message($('#config-message'),'테스트 설정을 저장했습니다.');
  });};
  $('#login').onclick=()=>busy(async()=>{const r=await fetch('/api/backend?resource=login',{method:'POST',headers:{'Content-Type':'application/json','X-SSKR-Request':'1'},body:JSON.stringify({returnTo:location.pathname+location.search})}),d=await r.json();if(!r.ok)throw Error(d.error?.userMessage||'로그인을 시작하지 못했습니다.');location.assign(d.url);});
  $('#reload').onclick=()=>busy(load);
  load().then(async()=>{const id=new URL(location.href).searchParams.get('run');if(id&&!adminPage)activate(await api({action:'LOAD',id}));}).catch(e=>{message($('#status'),e.message,true);$('#login').hidden=e.code!=='AUTH_REQUIRED';$('#reload').hidden=false;});
})();
