(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rulesText=e=>`완주 기준: 공식 출발 체크인 + 서로 다른 경유 스팟 ${e.minimumSpotCheckins}곳 이상 + 일몰 전 ${e.finishLocationName||'공식 도착지'} 체크인. 출발·도착을 포함해 총 ${e.minimumSpotCheckins+2}곳 이상이며, 계획한 장소 수는 실제 체크인을 대신하지 않습니다.`;
  async function load() {
    const session=window.SSKR_MOCK_SESSION;
    const response=await fetch('/api/participate/context',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario:session?.getScenario()||'guest',snapshot:session?.getSnapshot(),account:{linked:false}})});
    if(!response.ok)throw Error('행사 정보를 불러오지 못했습니다.');const value=await response.json();if(!value.ok)throw Error('행사 정보를 불러오지 못했습니다.');return value.event;
  }
  window.SSKR_PUBLIC_EVENT={load,rulesText,esc};
  if(document.querySelector('[data-public-event]'))load().then(e=>{
    document.querySelectorAll('[data-public-event="title"]').forEach(n=>n.textContent=e.publicTitle);
    document.querySelectorAll('[data-public-event="guide"]').forEach(n=>n.textContent=e.publicTitle+' 참가 안내');
    document.querySelectorAll('[data-public-event="apply"]').forEach(n=>n.textContent=e.publicTitle+' 참가하기');
    document.querySelectorAll('[data-public-event="rules"]').forEach(n=>n.textContent=rulesText(e));
    document.querySelectorAll('[data-public-event="example"]').forEach(n=>n.innerHTML=`연출 속 여정은 예시입니다. ${esc(e.publicTitle)}의 도착지는 ${esc(e.finishLocationName)}입니다. <a href="/participate?view=guide">현재 참가 안내 →</a>`);
  }).catch(()=>document.querySelectorAll('[data-public-event="rules"],[data-public-event="example"]').forEach(n=>n.textContent='행사별 완주 조건과 공식 도착지는 참가 안내에서 확인하세요.'));
})();
