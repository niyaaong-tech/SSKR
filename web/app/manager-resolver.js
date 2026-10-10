(function (root, factory) {
  const eventView = typeof module === 'object' && module.exports ? require('./event-view') : root.SSKR_EVENT_VIEW;
  const rules = typeof module === 'object' && module.exports ? require('../shared/event-rules') : root.SSKR_EVENT_RULES;
  const api = factory(eventView, rules);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SSKR_MANAGER_RESOLVER = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, (eventView, rules) => {
  function resolveManager(context = {}, source = {}) {
    const event = eventView.resolve(context), linked = context.account?.linked === true;
    const plans = linked ? (source.plans || []).slice().sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))) : [];
    const participant = linked && (!context.participation?.eventId || context.participation.eventId === context.event?.id) ? context.participation : null;
    const confirmed = participant?.state === 'ACTIVE' && participant.slotAllocation === 'CONFIRMED';
    const finished = context.event?.resolvedStage === 'SEASON_CLEAR';
    const personal = event?.status;
    const preparing = confirmed && !finished && !context.account?.blocked;
    const preparation = preparing ? rules.preparation(context) : [];
    const next = preparation.filter(row=>!row.complete).sort((a,b)=>(Date.parse(a.deadline)||Infinity)-(Date.parse(b.deadline)||Infinity))[0];
    const personalAction = personal && !['신청 전','로그인 전'].includes(personal.label);
    return {
      title: next ? next.label+'를 확인해 주세요.' : preparing ? '필수 참가 준비를 마쳤습니다.' : personalAction ? personal.title : linked ? '다음 여정을 준비해 보세요.' : '어디서 출발해, 어디에 머물까요?',
      copy: next ? (next.editable?'참가 준비에서 정보를 등록하고 최신 운영 안내를 확인하세요.':'수정 기한이 지났습니다. 운영 안내에서 보완 방법을 확인하세요.') : preparing ? '원하는 루트를 자유롭게 계획하고, 출발 전 변경 공지를 확인하세요.' : personalAction ? personal.copy : linked ? '저장한 루트를 이어서 다듬고, 나만의 하루를 계획하세요.' : '스팟을 연결해 루트를 만들고, 라이더들이 남긴 여정을 만나보세요.',
      label: personalAction ? personal.label : 'MY SSKR',
      primaryAction: next ? {label:next.label+' 확인',href:'/app/preparation#'+next.key} : preparing ? {label:'루트 검토하기',href:'/app/spots?mode=plan'} : personalAction ? personal.action : {label: plans.length ? '저장한 루트 보기' : '루트 만들어보기', href: '/app/spots?mode=plan' + (plans.length ? '&tab=saved' : '')},
      banner: event && context.event?.visibility !== 'PRIVATE' && context.event?.published !== false ? {title:event.title, status:event.registration, href:'/participate?view=guide'} : null,
      preparation, plans:plans.slice(0,3), planCount:plans.length, linked,
      notices:(source.notices || []).slice(0,3),
      alert:(source.notices || []).find(n=>n.important && (!n.eventId || n.eventId===context.event?.id)) || null
    };
  }
  return { resolveManager };
});
