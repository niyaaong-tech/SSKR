(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SSKR_MEMORIAL_JOURNEY=Object.freeze(api);})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const km=m=>(m/1000).toLocaleString('ko-KR',{maximumFractionDigits:1});
  const duration=s=>Math.floor(s/3600) ? `${Math.floor(s/3600)}시간 ${Math.floor(s%3600/60)}분` : `${Math.floor(s/60)}분`;
  const time=value=>new Date(value).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false});
  function decode(str){let i=0,lat=0,lon=0,out=[];while(i<str.length){const read=()=>{let n=0,s=0,b;do{b=str.charCodeAt(i++)-63;n|=(b&31)<<s;s+=5;}while(b>=32);return n&1?~(n>>1):n>>1;};lat+=read();lon+=read();out.push([lon/1e6,lat/1e6]);}return out;}
  function preview(item){const points=item.previewCoordinates||[];if(points.length<2)return '';const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);const minX=Math.min(...xs),maxY=Math.max(...ys),w=Math.max(...xs)-minX,h=maxY-Math.min(...ys),scale=Math.min(154/(w||1),84/(h||1));const xy=points.map(p=>[(p[0]-minX)*scale+12,(maxY-p[1])*scale+10]);return `<svg class="memorial-route-thumb" viewBox="0 0 180 108" aria-label="주행 경로 미리보기"><polyline points="${xy.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}"/><circle cx="${xy[0][0]}" cy="${xy[0][1]}" r="4"/><circle class="finish" cx="${xy.at(-1)[0]}" cy="${xy.at(-1)[1]}" r="4"/></svg>`;}
  function gpx(record,title){const segments=record.legs.map(leg=>`<trkseg>${decode(leg.shape).map(([lon,lat],i)=>`<trkpt lat="${lat}" lon="${lon}"><time>${new Date(Date.parse(leg.startedAt)+leg.elapsedSeconds[i]*1000).toISOString()}</time></trkpt>`).join('')}</trkseg>`).join('');return `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="SSKR synthetic event fixture" xmlns="http://www.topografix.com/GPX/1/1"><metadata><name>${esc(title)}</name><desc>SYNTHETIC TEST DATA. Simulated timestamps on Valhalla/OpenStreetMap road geometry. Not recorded GPS. Road data is from query time, not May 2026. © OpenStreetMap contributors, ODbL-1.0.</desc></metadata><trk><name>${esc(title)}</name>${segments}</trk></gpx>`;}
  const mapInteraction=typeof module==='object'&&module.exports?require('../shared/map/interaction'):window.SSKR_MAP_INTERACTION;
  const {createWheelSession}=mapInteraction;
  function mount(host,item,places,{account={},preview=false}={}){
    const controller=new AbortController(),byId=new Map([...places,...(item.places||[])].map(p=>[p.id,p]));
    const model=window.SSKR_MEMORIAL_STORE,owner=model.isOwner(item,account),synthetic=item.synthetic!==false;
    let viewer,record,disposed=false;
    const motion=()=>matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth';
    const label=(visit,index)=>visit.role==='START'?'출':visit.role==='FINISH'?'도':String(index);
    host.innerHTML='<div class="memorial-route-loading" role="status">여정 기록을 불러오고 있습니다.</div>';
    function clearSelection(){
      viewer?.highlight([]);
      host.querySelectorAll('.journey-log-entry').forEach(entry=>{entry.classList.remove('is-selected');entry.querySelector('[data-return]')?.remove();});
    }
    function mountMap(){
      if(viewer||!record||disposed)return;
      const visits=record.visits.map((visit,index)=>{
        const place=byId.get(visit.locationId),photo=model.selectPhoto(visit,{owner});
        return {id:String(index),locationId:visit.locationId,
          lat:visit.coordinate?.[1]??place?.lat,lng:visit.coordinate?.[0]??place?.lng,
          kind:visit.role==='START'?'start':visit.role==='FINISH'?'finish':'spot',number:label(visit,index),
          name:place?.name||visit.locationId,region:place?.region||'',image:photo?.url||place?.image,meta:time(visit.arrivedAt)};
      }).filter(visit=>Number.isFinite(visit.lat)&&Number.isFinite(visit.lng));
      viewer=window.SSKR_MAP.mount(host.querySelector('.journey-map-host'),{
        items:visits,catalog:visits,inView:false,inViewControl:false,cluster:false,
        route:record.legs.map(leg=>decode(leg.shape).map(([lon,lat])=>[lat,lon])),
        onSelect:place=>select(Number(place.id)),onOpen:place=>select(Number(place.id),true),onDeselect:clearSelection
      });
    }
    function select(index,open=false){
      clearSelection();
      const leg=record.legs[index-1];viewer?.highlight(leg?decode(leg.shape).map(([lon,lat])=>[lat,lon]):[]);
      const entry=host.querySelector('[data-visit="'+index+'"]');
      if(!entry)return;
      entry.classList.add('is-selected');
      if(open){
        const button=document.createElement('button');button.type='button';button.className='sskr-map-return journey-log-return';
        button.dataset.return='';button.textContent='← 지도로 돌아가기';entry.children[1].prepend(button);
        entry.scrollIntoView({behavior:motion(),block:'start'});
      }
    }
    function render(){
      // Check-in records share the journey UI. Road statistics and downloads need
      // recorded data; a planned route must never be presented as a ridden track.
      const hasMetrics=record.legs.length>0&&[item.distanceMeters,item.movingSeconds,item.stoppedSeconds].every(Number.isFinite);
      const metrics=hasMetrics?'<details class="memorial-time-details"><summary>거리·주행 시간과 출발·도착</summary><p>'+km(item.distanceMeters)+'km · '+item.spotCount+' 스팟 경유 · 주행 '+duration(item.movingSeconds)+' · 정차 '+duration(item.stoppedSeconds)+' · '+time(item.startedAt)+' → '+time(item.finishedAt)+'</p>'+(synthetic?'<button type="button" class="memorial-button is-secondary" data-download>테스트 주행기록 GPX ↓</button>':'')+'</details>':'';
      const entries=record.visits.map((visit,index)=>{
        const place=byId.get(visit.locationId),leg=record.legs[index-1],photo=model.selectPhoto(visit,{owner});
        return '<article class="journey-log-entry" data-visit="'+index+'"><div class="journey-log-index">'+label(visit,index)+'</div><div><div class="journey-log-title"><h4>'+esc(place?.name||visit.locationId)+'</h4><span>'+time(visit.arrivedAt)+'</span></div>'+
          (photo?'<figure class="journey-visit-photo"><img src="'+esc(photo.url)+'" alt="'+esc(place?.name||'방문 장소')+'" loading="lazy" />'+(photo.sourceUrl?'<figcaption><a href="'+esc(photo.sourceUrl)+'" target="_blank" rel="noreferrer">'+esc(photo.credit||'사진 출처')+' ↗</a></figcaption>':'')+'</figure>':'')+
          (visit.note?'<p class="journey-visit-note">'+esc(visit.note)+'</p>':'')+
          (leg?'<details><summary>직전 주행 구간</summary><p>'+km(leg.distanceMeters)+'km · '+duration(leg.durationSeconds)+' · '+esc(leg.roadNames.join(' → ')||'도로명 없는 연결 도로')+'</p></details>':'')+'</div></article>';
      }).join('');
      const source=synthetic?'<details class="journey-data-source"><summary>테스트 데이터와 출처</summary><p>2026년 5월 행사가 치러졌다고 가정한 합성 기록입니다. '+record.sampleCount.toLocaleString('ko-KR')+'개 도로 좌표와 모의 시각을 연결했으며 실제 참가자의 GPS 기록이 아닙니다. 기본 사진은 장소 참고 사진이며, 브라우저에서 추가한 사진도 개발용 미리보기로만 보관합니다.</p><p>경로: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · ODbL</a> / <a href="https://valhalla.github.io/valhalla/api/route/api-reference/" target="_blank" rel="noreferrer">Valhalla 이륜차 경로</a>. 조회 시점 도로망을 사용했으며 2026년 5월 당시 도로·영업·출입 조건의 검증 자료가 아닙니다.</p></details>':'';
      host.innerHTML='<details class="journey-map-details"><summary>여정 지도 보기</summary><div class="journey-map-host"></div>'+metrics+'</details><section class="journey-log"><header><div><h3>머물렀던 순간들</h3><p>방문 순서대로 남긴 사진과 메모</p></div></header><div class="journey-log-list">'+entries+'</div></section>'+source;
      host.querySelector('.journey-map-details').addEventListener('toggle',event=>{
        if(event.target.open){mountMap();requestAnimationFrame(()=>{if(!disposed)viewer?.getMap?.()?.invalidateSize({pan:false});});}
      },{signal:controller.signal});
    }
    host.addEventListener('click',event=>{
      if(event.target.closest('[data-return]'))host.querySelector('.journey-map-details').scrollIntoView({block:'start',behavior:motion()});
      if(event.target.closest('[data-download]')&&record&&synthetic){
        const url=URL.createObjectURL(new Blob([gpx(record,item.title)],{type:'application/gpx+xml'}));
        const link=document.createElement('a');link.href=url;link.download=item.publicSlug+'-synthetic.gpx';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      }
    },{signal:controller.signal});
    async function load(){
      try{
        if(synthetic){
          const response=await fetch(item.routeUrl,{signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);
          record=await response.json();if(disposed)return;
          if(record.id!==item.runSessionId||!record.legs?.length||!record.visits?.length)throw Error('Invalid journey');
          record={...record,visits:model.applyVisitEdits(item,record.visits,window.SSKR_MEMORIAL_MEDIA?.all()||[],account)};
        }else{
          record={legs:[],visits:item.visits.map(visit=>({...visit,arrivedAt:visit.checkedInAt}))};
        }
        render();
      }catch(error){
        if(disposed||error.name==='AbortError')return;
        viewer?.destroy();viewer=null;
        host.innerHTML='<div class="memorial-route-loading" role="status">여정 기록을 불러오지 못했습니다. <button class="memorial-button is-secondary" type="button" data-retry>다시 불러오기</button></div>';
        host.querySelector('[data-retry]').addEventListener('click',load,{once:true,signal:controller.signal});
      }
    }
    load();return()=>{disposed=true;controller.abort();viewer?.destroy();};
  }
  return {decode,preview,gpx,mount,km,duration,time,createWheelSession};
});
