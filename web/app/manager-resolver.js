(function (root, factory) {
  const eventView = typeof module === 'object' && module.exports ? require('./event-view') : root.SSKR_EVENT_VIEW;
  const api = factory(eventView);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SSKR_MANAGER_RESOLVER = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, eventView => {
  function resolveManager(context = {}, source = {}) {
    const event = eventView.resolve(context), linked = context.account?.linked === true;
    const plans = linked ? (source.plans || []).slice().sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))) : [];
    const participant = linked && (!context.participation?.eventId || context.participation.eventId === context.event?.id) ? context.participation : null;
    const confirmed = participant?.state === 'ACTIVE' && participant.slotAllocation !== 'WAITLISTED';
    const finished = context.event?.resolvedStage === 'SEASON_CLEAR';
    const personal = event?.status;
    const preparing = confirmed && !finished && !context.account?.blocked;
    const preparation = preparing ? [
      { label: '참가 등록', value: participant.participantNumber || '참가 확정' },
      { label: '바이크 정보', value: context.statuses?.bikeInfoComplete ? '등록 완료' : '확인 필요' },
      ...(context.statuses?.fulfillmentState && context.statuses.fulfillmentState !== 'NOT_PREPARED' ? [{ label: '참가 키트', value: ({PREPARING:'준비 중',SHIPPED:'발송 완료',DELIVERED:'배송 완료'})[context.statuses.fulfillmentState] || '안내 확인' }] : [])
    ] : [];
    const personalAction = personal && !['신청 전','로그인 전'].includes(personal.label);
    return {
      title: personalAction ? personal.title : linked ? '다음 여정을 준비해 보세요.' : '어디서 출발해, 어디에 머물까요?',
      copy: personalAction ? personal.copy : linked ? '저장한 루트를 이어서 다듬고, 나만의 하루를 계획하세요.' : '스팟을 연결해 루트를 만들고, 라이더들이 남긴 여정을 만나보세요.',
      label: personalAction ? personal.label : 'MY SSKR',
      primaryAction: personalAction ? personal.action : {label: plans.length ? '저장한 루트 보기' : '루트 만들어보기', href: '/app/spots?mode=plan' + (plans.length ? '&tab=saved' : '')},
      banner: event && context.event?.visibility !== 'PRIVATE' && context.event?.published !== false ? {title:event.title, status:event.registration, href:'/participate?view=guide'} : null,
      preparation, plans:plans.slice(0,3), planCount:plans.length, linked,
      notices:(source.notices || []).slice(0,3),
      alert:(source.notices || []).find(n=>n.important && (!n.eventId || n.eventId===context.event?.id)) || null
    };
  }
  return { resolveManager };
});
