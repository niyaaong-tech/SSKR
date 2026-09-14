(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SSKR_MEMORIAL_JOURNEY=Object.freeze(api);})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const km=m=>(m/1000).toLocaleString('ko-KR',{maximumFractionDigits:1});
  const duration=s=>Math.floor(s/3600) ? `${Math.floor(s/3600)}시간 ${Math.floor(s%3600/60)}분` : `${Math.floor(s/60)}분`;
  const time=value=>new Date(value).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false});
  function decode(str){let i=0,lat=0,lon=0,out=[];while(i<str.length){const read=()=>{let n=0,s=0,b;do{b=str.charCodeAt(i++)-63;n|=(b&31)<<s;s+=5;}while(b>=32);return n&1?~(n>>1):n>>1;};lat+=read();lon+=read();out.push([lon/1e6,lat/1e6]);}return out;}
  function preview(item){const points=item.previewCoordinates||[];if(points.length<2)return '';const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);const minX=Math.min(...xs),maxY=Math.max(...ys),w=Math.max(...xs)-minX,h=maxY-Math.min(...ys),scale=Math.min(154/(w||1),84/(h||1));const xy=points.map(p=>[(p[0]-minX)*scale+12,(maxY-p[1])*scale+10]);return `<svg class="memorial-route-thumb" viewBox="0 0 180 108" aria-label="주행 경로 미리보기"><polyline points="${xy.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}"/><circle cx="${xy[0][0]}" cy="${xy[0][1]}" r="4"/><circle class="finish" cx="${xy.at(-1)[0]}" cy="${xy.at(-1)[1]}" r="4"/></svg>`;}
  function gpx(record,title){const segments=record.legs.map(leg=>`<trkseg>${decode(leg.shape).map(([lon,lat],i)=>`<trkpt lat="${lat}" lon="${lon}"><time>${new Date(Date.parse(leg.startedAt)+leg.elapsedSeconds[i]*1000).toISOString()}</time></trkpt>`).join('')}</trkseg>`).join('');return `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="SSKR synthetic event fixture" xmlns="http://www.topografix.com/GPX/1/1"><metadata><name>${esc(title)}</name><desc>SYNTHETIC TEST DATA. Simulated timestamps on Valhalla/OpenStreetMap road geometry. Not recorded GPS. Road data is from query time, not May 2026. © OpenStreetMap contributors, ODbL-1.0.</desc></metadata><trk><name>${esc(title)}</name>${segments}</trk></gpx>`;}
  function labelLayout(points,width,height) {
    const cardWidth = width < 440 ? 108 : 138, cardHeight = 38, gap = 5, top = 60, bottom = height-32;
    const visible = points.filter(p=>p.x>=0 && p.x<=width && p.y>=0 && p.y<=height);
    const ordered = [...visible].sort((a,b)=>a.x-b.x || a.index-b.index);
    const split = Math.ceil(ordered.length/2), output=[];
    [ordered.slice(0,split),ordered.slice(split)].forEach((group,side)=>{
      group.sort((a,b)=>a.y-b.y || a.index-b.index);
      const step=cardHeight+gap, last=bottom-cardHeight;
      let previous=top-step;
      const ys=group.map(p=>{const y=Math.max(previous+step,Math.min(last,p.y-cardHeight/2));previous=y;return y;});
      for(let i=ys.length-1;i>=0;i--)ys[i]=Math.min(ys[i],last-(ys.length-1-i)*step);
      group.forEach((p,i)=>output.push({...p,left:side?width-cardWidth-8:8,top:ys[i],width:cardWidth,height:cardHeight,side}));
    });
    return output;
  }
  // Cards are navigation for the complete journey, not only the current viewport.
  // Normalize route coordinates independently of map zoom and pan to keep their
  // sides and order stable while the user inspects a particular location.
  function routeLabelLayout(points,width,height) {
    if(!points.length)return [];
    const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
    const minX=Math.min(...xs),minY=Math.min(...ys),spanX=Math.max(...xs)-minX,spanY=Math.max(...ys)-minY;
    const scale=Math.min((width-40)/(spanX||1),(height-120)/(spanY||1));
    const left=(width-spanX*scale)/2,top=(height-spanY*scale)/2;
    return labelLayout(points.map(p=>({...p,x:left+(p.x-minX)*scale,y:top+(p.y-minY)*scale})),width,height);
  }
  const mapInteraction=typeof module==='object'&&module.exports?require('./map-interaction'):window.SSKR_MAP_INTERACTION;
  const {createWheelSession}=mapInteraction;
  function mount(host,item,places){
    const controller=new AbortController(),byId=new Map(places.map(p=>[p.id,p]));let map,record,disposed=false,observer,tiles,highlight;const markers=[];
    host.innerHTML='<div class="memorial-route-loading" role="status">주행 기록을 불러오고 있습니다.</div>';
    const listen=(node,type,fn)=>node.addEventListener(type,fn,{signal:controller.signal});
    mapInteraction.bindWheel({getMap:()=>map,panel:()=>host.querySelector('.journey-map-panel'),signal:controller.signal});
    function select(index){
      if(!record)return;const checkin=record.visits[index],place=byId.get(checkin.locationId),leg=record.legs[Math.max(0,index-1)];
      host.querySelectorAll('[data-map-visit]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.mapVisit)===index)));
      const latLngs=decode(leg.shape).map(([lon,lat])=>[lat,lon]);
      if(map){highlight?.setLatLngs(latLngs).setStyle({opacity:1});map.flyTo([checkin.coordinate[1],checkin.coordinate[0]],12,{animate:!matchMedia('(prefers-reduced-motion:reduce)').matches});}
      host.querySelector('.journey-selected').innerHTML=`<div><span>${index===0?'출발':index===record.visits.length-1?'도착':index+'번째 스팟'}</span><strong>${esc(place?.name||checkin.locationId)}</strong><p>${time(checkin.arrivedAt)}${checkin.durationSeconds?' · '+Math.round(checkin.durationSeconds/60)+'분 정차':''} · 누적 ${km(checkin.cumulativeDistanceMeters)}km</p></div><a class="memorial-button is-secondary" href="/app/spots/${encodeURIComponent(checkin.locationId)}" data-app-link>장소 정보 →</a>`;
    }
    function render(){
      host.innerHTML=`<div class="journey-workspace"><section class="journey-map-panel ${record.visits.length > 10 ? 'has-many-visits' : ''}" aria-label="연결된 주행 경로"><div class="journey-map" role="region" aria-label="출발지부터 대천까지의 실제 도로 경로 지도"></div><div class="journey-map-controls"><button type="button" data-map="in" aria-label="주행 지도 확대">+</button><button type="button" data-map="out" aria-label="주행 지도 축소">−</button><button type="button" data-map="fit">전체 경로</button></div><p class="journey-map-status" role="status"></p></section></div><div class="journey-selected" aria-live="polite"></div><section class="journey-log"><header><div><h3>스팟과 주행 기록</h3><p>방문 순서대로 연결된 ${record.legs.length}개 주행 구간</p></div><button type="button" class="memorial-button is-secondary" data-download>테스트 주행기록 GPX ↓</button></header><div class="journey-log-list">${record.visits.map((c,i)=>{const p=byId.get(c.locationId),leg=record.legs[i-1];return `<article class="journey-log-entry"><div class="journey-log-index">${i===0?'출':i===record.visits.length-1?'도':String(i)}</div><div><div class="journey-log-title"><h4>${esc(p?.name||c.locationId)}</h4><span>${time(c.arrivedAt)}${c.durationSeconds?' – '+time(c.departedAt):''}</span></div><p class="journey-log-meta">${c.durationSeconds ? Math.round(c.durationSeconds/60)+'분 정차 · ' : ''}누적 ${km(c.cumulativeDistanceMeters)}km</p><p>${esc(c.note)}</p>${c.snapDistanceMeters>100?`<p class="journey-access-note">주행 기록은 장소 주변 도로 접근점까지 연결됩니다. 원본 장소 좌표와 약 ${c.snapDistanceMeters}m 차이가 있습니다.</p>`:''}${leg?`<details><summary>직전 구간 ${km(leg.distanceMeters)}km · ${duration(leg.durationSeconds)} · 도로 정보</summary><p>${esc(leg.roadNames.join(' → ')||'도로명 없는 연결 도로')}</p></details>`:''}</div></article>`;}).join('')}</div></section><details class="journey-data-source"><summary>테스트 데이터와 출처</summary><p>2026년 5월 행사가 치러졌다고 가정한 합성 기록입니다. ${record.sampleCount.toLocaleString('ko-KR')}개 도로 좌표와 구간별 모의 시각을 연결했으며, 실제 참가자가 측정한 GPS 기록이 아닙니다.</p><p>경로: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · ODbL</a> / <a href="https://valhalla.github.io/valhalla/api/route/api-reference/" target="_blank" rel="noreferrer">Valhalla 이륜차 경로</a>. 조회 시점 도로망을 사용했으며 2026년 5월 당시 도로·영업·출입 조건의 검증 자료가 아닙니다. 장소 좌표는 기존 SSKR 카탈로그의 근사 좌표입니다.</p></details>`;
      if(window.L){
        const L=window.L;map=L.map(host.querySelector('.journey-map'),{zoomControl:false,scrollWheelZoom:false}).setView([36.7,128],7);
        tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
        tiles.on('tileerror',()=>{if(!disposed)host.querySelector('.journey-map-status').textContent='배경 지도를 불러오지 못했습니다. 주행 경로와 방문 기록은 계속 볼 수 있습니다.';});
        const layer=L.featureGroup().addTo(map);record.legs.forEach(l=>L.polyline(decode(l.shape).map(([lon,lat])=>[lat,lon]),{color:'#557266',weight:4,opacity:.9}).addTo(layer));
        highlight=L.polyline(decode(record.legs[0].shape).map(([lon,lat])=>[lat,lon]),{color:'#cd873c',weight:6,opacity:0}).addTo(map);
        record.visits.forEach((c,i)=>{
          const p=byId.get(c.locationId),label=i===0?'출':i===record.visits.length-1?'도':String(i);
          const marker=L.marker([c.coordinate[1],c.coordinate[0]],{keyboard:true,title:(p?.name||c.locationId)+' 기록 보기',icon:L.divIcon({className:'journey-marker '+(i===0?'is-start':i===record.visits.length-1?'is-finish':''),html:'<span>'+label+'</span>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map);
          marker.on('click',()=>select(i));markers.push(marker);
        });
        const overlay=document.createElement('div');overlay.className='journey-map-labels';
        overlay.innerHTML='<div class="journey-label-cards"></div>';
        host.querySelector('.journey-map-panel').append(overlay);
        const cards=record.visits.map((v,i)=>{
          const p=byId.get(v.locationId),photo=window.SSKR_MEMORIAL_STORE.selectPhoto(v);
          const card=document.createElement('button');card.type='button';card.className='journey-map-card';card.dataset.mapVisit=i;card.setAttribute('aria-pressed','false');card.title=(p?.name||v.locationId)+' · '+time(v.arrivedAt)+' 기록 보기';
          card.innerHTML=`<b class="journey-card-number ${i===0?'is-start':i===record.visits.length-1?'is-finish':''}" aria-hidden="true">${i===0?'출':i===record.visits.length-1?'도':i}</b>${photo?`<img src="${esc(photo.url)}" alt="" loading="lazy" />`:''}<span><strong>${esc(p?.name||v.locationId)}</strong><small>${i===0?'출발':i===record.visits.length-1?'도착':'스팟 '+i} · ${time(v.arrivedAt)}</small></span>`;
          overlay.querySelector('.journey-label-cards').append(card);
          listen(card,'click',()=>select(i));return card;
        });
        function layoutLabels(){
          if(disposed)return;
          const size=map.getSize(),positions=markers.map((marker,index)=>{const p=map.project(marker.getLatLng(),0);return {index,x:p.x,y:p.y};});
          const layout=routeLabelLayout(positions,size.x,size.y);cards.forEach(c=>c.hidden=true);
          layout.forEach(p=>{
            const card=cards[p.index];card.hidden=false;Object.assign(card.style,{left:p.left+'px',top:p.top+'px',width:p.width+'px',height:p.height+'px'});
          });
        }
        const fit=()=>{const width=map.getSize().x;map.fitBounds(layer.getBounds(),{paddingTopLeft:[width<440?112:150,72],paddingBottomRight:[width<440?112:150,48],animate:false});layoutLabels();};fit();
        map.on('resize',layoutLabels);
        listen(host,'click',e=>{const control=e.target.closest('[data-map]');if(!control)return;control.dataset.map==='in'?map.zoomIn():control.dataset.map==='out'?map.zoomOut():fit();});
        observer=new ResizeObserver(()=>{map.invalidateSize({pan:false});});observer.observe(host.querySelector('.journey-map'));
      }else{host.querySelector('.journey-map').innerHTML=preview(item);host.querySelector('.journey-map-status').textContent='지도 연결을 확인해 주세요. 아래 방문 기록은 계속 이용할 수 있습니다.';host.querySelectorAll('[data-map]').forEach(b=>b.disabled=true);}
      // Show the departure context without zooming away from the full route.
      host.querySelector('.journey-selected').innerHTML=`<div><span>연결된 여정</span><strong>${esc(byId.get(item.startLocationId)?.name)} → 대천해수욕장</strong><p>지도 마커나 미니 카드를 누르면 해당 구간을 확인할 수 있습니다.</p></div>`;
      listen(host,'click',e=>{if(e.target.closest('[data-download]')){const url=URL.createObjectURL(new Blob([gpx(record,item.title)],{type:'application/gpx+xml'}));const a=document.createElement('a');a.href=url;a.download=item.publicSlug+'-synthetic.gpx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}});
    }
    async function load(){try{const response=await fetch(item.routeUrl,{signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);record=await response.json();if(disposed)return;if(record.id!==item.runSessionId||!record.legs?.length||!record.visits?.length)throw Error('Invalid journey');render();}catch(error){if(disposed||error.name==='AbortError')return;console.error('Memorial journey load failed',error);observer?.disconnect();map?.remove();map=null;markers.length=0;host.innerHTML='<div class="memorial-route-loading" role="status">주행 기록을 불러오지 못했습니다. <button class="memorial-button is-secondary" type="button" data-retry>다시 불러오기</button></div>';host.querySelector('[data-retry]').addEventListener('click',load,{once:true,signal:controller.signal});}}
    load();return()=>{disposed=true;controller.abort();observer?.disconnect();map?.remove();};
  }
  return {decode,preview,gpx,mount,km,duration,time,labelLayout,routeLabelLayout,createWheelSession};
});
