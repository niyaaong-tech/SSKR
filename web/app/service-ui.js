(()=>{'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const api=()=>window.SSKR_BACKEND,places=()=>window.SSKR_SPOT_CATALOG;
  const remote={backend:true,items:[],all(){return this.items;},async refresh(){this.items=(await api().request('memorials')).items;return this.items;},async update(id,account,values){const item=this.items.find(m=>m.id===id);await api().request('memorial','POST',{eventId:item.eventId,revision:item.revision,values});await this.refresh();return this.items.find(m=>m.id===id);}};
  const media={all:()=>remote.items.flatMap(m=>m.visits.flatMap(v=>v.media||[])),async add(file,{item,visitId}) {
    const reservation=await api().request('media','POST',{action:'RESERVE',eventId:item.eventId,visitId,type:file.type,size:file.size});
    try{const upload=await fetch(reservation.uploadUrl,{method:'PUT',body:file,headers:{'Content-Type':file.type}});
    if(!upload.ok)throw Error('사진 업로드를 완료하지 못했습니다.');
    const result=await api().request('media','POST',{action:'FINALIZE',eventId:item.eventId,id:reservation.id});
    const visit=item.visits.find(v=>v.id===visitId);visit.media||=[];visit.media.push(result.photo);return result.photo;
    }catch(error){try{await api().request('media','POST',{action:'REMOVE',eventId:item.eventId,id:reservation.id});}catch{}throw error;}
  }};
  function mountRide(root,context,onUpdate) {
    let disposed=false,busy=false,current=context;
    const key='sskr.checkin-queue.'+context.account.id,controller=new AbortController();
    const queue=()=>{try{return JSON.parse(localStorage.getItem(key)||'[]').filter(x=>x.eventId===context.event.id);}catch{return [];}};
    const save=q=>{localStorage.setItem(key,JSON.stringify(q));};
    const reasons={LOCATION_UNCERTAIN:'위치 정확도를 확인해 주세요.',OUTSIDE_SPOT:'스팟 가까이에서 다시 체크인해 주세요.',MORE_SPOTS_REQUIRED:'필수 스팟을 모두 체크인한 뒤 도착을 기록해 주세요.',TIME_REVIEW_REQUIRED:'전송 시각 확인이 필요한 기록입니다.',ORDER_REVIEW_REQUIRED:'방문 순서 확인이 필요한 기록입니다.',DUPLICATE_SPOT:'이미 체크인한 스팟입니다.',OUTSIDE_EVENT_TIME:'행사 진행 시간 밖의 기록입니다.',ALREADY_FINISHED:'이미 도착 체크인을 완료했습니다.',START_FIRST:'출발 체크인을 먼저 완료해 주세요.'};
    function render(message='') {
      if(disposed)return;
      const visits=current.run?.visits||[],count=visits.filter(v=>v.role==='SPOT'&&v.validationStatus==='VALIDATED').length;
      root.innerHTML='<section class="service-panel"><header><p>SSKR 체크인</p><h1>오늘의 여정</h1><p>'+count+' 스팟 체크인 · 목표 '+(current.run?.minimumSpotCheckins||current.event.minimumSpotCheckins)+' 스팟</p></header><div class="service-actions"><button class="manager-primary" data-checkin '+(busy||current.run?.state==='COMPLETED'?'disabled':'')+'>'+(busy?'기록을 확인하고 있어요…':'현재 위치로 체크인')+'</button><button class="manager-secondary" data-sync '+(busy?'disabled':'')+'>전송 상태 확인</button></div><p class="service-status" role="status">'+esc(message||'체크인할 때만 현재 위치를 확인합니다.')+'</p>'+(queue().length?'<p>전송 대기 '+queue().length+'건 · 인터넷에 연결되면 다시 전송합니다.</p>':'')+'<ol class="service-visits">'+visits.map(v=>'<li><strong>'+esc(places().find(p=>p.id===v.locationId)?.name||v.locationId)+'</strong><span>'+new Date(v.checkedInAt).toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit'})+'</span><p>'+(v.validationStatus==='VALIDATED'?'체크인 완료':esc(reasons[v.reason]||'운영자 확인이 필요한 기록입니다.'))+'</p></li>').join('')+'</ol>'+(current.run?.state==='COMPLETED'?'<a class="manager-primary" href="/app/my" data-app-link>완주 기록 보기</a>':'')+'<a href="/app/preparation" data-app-link>참가 준비</a></section>';
      root.querySelector('[data-checkin]').onclick=locate;root.querySelector('[data-sync]').onclick=flush;
    }
    async function flush() {
      if(busy||disposed)return;busy=true;render();let message='';
      try{let q=queue();for(const body of q){const next=await api().request('ride','POST',body);if(disposed)return;current=next;onUpdate(next);q=q.filter(x=>x.requestId!==body.requestId);save(q);message=reasons[next.run?.visits.at(-1)?.reason]||'체크인 기록을 저장했습니다.';}
        if(!q.length){current=await api().request('context');onUpdate(current);}
      }catch(e){message=navigator.onLine?e.message:'인터넷 연결을 기다리고 있습니다. 기록은 이 기기에 보관됩니다.';}
      finally{busy=false;render(message);}
    }
    async function locate() {
      if(busy)return;busy=true;render();
      try {
        const pos=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:15000,maximumAge:0}));
        const {latitude:lat,longitude:lng,accuracy}=pos.coords;
        const pool=places().filter(p=>p.kind==='spot'||current.event.startLocationIds?.includes(p.id)||p.id===current.event.finishLocationId);
        const closest=pool.reduce((a,b)=>Math.hypot(b.lat-lat,(b.lng-lng)*Math.cos(lat*Math.PI/180))<Math.hypot(a.lat-lat,(a.lng-lng)*Math.cos(lat*Math.PI/180))?b:a);
        const q=queue();if(q.length>=30)throw Error('대기 중인 기록을 먼저 전송해 주세요.');
        q.push({eventId:current.event.id,requestId:crypto.randomUUID(),locationId:closest.id,lat,lng,accuracy,capturedAt:new Date(pos.timestamp).toISOString()});save(q);
        busy=false;await flush();
      }catch(e){busy=false;render(e.code===1?'위치 권한을 허용한 뒤 다시 시도해 주세요.':e.message||'현재 위치를 확인하지 못했습니다.');}
    }
    window.addEventListener('online',flush,{signal:controller.signal});render();
    return ()=>{disposed=true;controller.abort();};
  }
  window.SSKR_SERVICE_UI={remote,media,mountRide};
})();
