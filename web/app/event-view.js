(function(root,factory){const domain=typeof module==='object'&&module.exports?require('./domain'):root.SSKR_APP_DOMAIN;const api=factory(domain);if(typeof module==='object'&&module.exports)module.exports=api;else root.SSKR_EVENT_VIEW=Object.freeze(api);})(typeof globalThis!=='undefined'?globalThis:this,domain=>{
  const action=(label,href='/participate')=>({label,href});
  function resolve(context={}){
    const event=context.event;if(!event?.id)return null;
    // Personal rows must belong to this event. Guest responses never disclose them.
    const linked=context.account?.linked===true;
    const belongs=row=>linked&&row&&(!row.eventId||row.eventId===event.id)?row:null;
    const participation=belongs(context.participation),application=belongs(context.application);
    const payment=linked&&(!context.payment?.applicationId||context.payment.applicationId===application?.id)?context.payment:null;
    const scoped={...context,participation,application,payment,surface:linked?context.surface:{}};
    const relation=domain.currentRelation(scoped),title=event.publicTitle||event.name||'SSKR';
    let status={label:linked?'신청 전':'로그인 전',title:linked?'참가 신청을 준비해 보세요.':'내 신청·참가 내역을 확인하세요.',copy:linked?'참가 조건과 일정을 확인한 뒤 신청할 수 있습니다.':'로그인하면 저장한 신청 정보와 참가 상태를 확인할 수 있습니다.',action:action(linked?'참가 신청하기':'참가 안내 보기')};
    if(['DRAFT','STEP_1','STEP_2','STEP_3'].includes(relation))status={label:'신청 진행 중',title:'작성 중인 신청서가 있습니다.',copy:(({STEP_1:'진행 방식 확인',STEP_2:'필수 동의',STEP_3:'유형·정보 입력'})[relation]||'참가 정보 확인')+' 단계부터 이어서 진행할 수 있습니다.',action:action('참가 신청 이어하기')};
    if(relation==='PAYMENT')status={label:'결제 대기',title:'신청 정보가 저장됐습니다.',copy:'아직 참가 확정 전입니다. 저장한 정보로 결제를 이어갈 수 있습니다.',action:action('결제 이어하기','/participate?resumePayment=1')};
    if(relation==='FAILED')status={label:'결제 실패',title:'결제가 완료되지 않았습니다.',copy:'결제 결과와 신청 조건을 확인한 뒤 다시 진행해 주세요.',action:action('결제 내역 확인')};
    if(relation==='PROCESSING')status={label:'결제 확인 중',title:'결제 결과를 확인하고 있습니다.',copy:'처리가 끝날 때까지 다시 결제하지 마세요. 현재 결제 상태를 확인할 수 있습니다.',action:action('결제 상태 확인')};
    if(payment?.state==='SUCCEEDED'&&!participation)status={label:'참가권 발급 중',title:'결제는 완료됐습니다.',copy:'참가권 발급 상태를 확인하고 있습니다. 추가 결제 없이 진행됩니다.',action:action('발급 상태 확인')};
    if(participation?.state==='ACTIVE')status={label:'참가 확정',title:title+' 참가가 확정됐습니다.',copy:'참가 정보와 출발 전 준비 사항을 확인해 주세요.',action:action('참가 준비 확인','/app/preparation')};
    if(participation?.state==='ACTIVE'&&participation.slotAllocation==='WAITLISTED')status={label:'참가 대기',title:'참가 배정을 기다리고 있습니다.',copy:'아직 참가가 확정되지 않았습니다. 배정 상태와 안내를 확인해 주세요.',action:action('참가 대기 내역 확인')};
    if(participation?.state==='ACTIVE'&&participation.slotAllocation!=='WAITLISTED'&&event.resolvedStage==='SEASON_CLEAR'){
      const result=({COMPLETED:'완주',NO_SHOW:'미참가',RETIRED:'주행 중단',INVALIDATED:'기록 무효'})[participation.runResult]||'결과 확인 중';
      status={label:result,title:'행사가 종료됐습니다.',copy:'참가 결과와 남긴 기록을 내 기록에서 확인할 수 있습니다.',action:action('내 기록 보기','/app/my')};
    }
    if(participation?.state==='CANCELLED')status={label:'참가 취소',title:'참가가 취소됐습니다.',copy:'신청 내역에서 취소 및 결제 처리 상태를 확인해 주세요.',action:action('신청 내역 확인')};
    if(context.account?.blocked===true)status={label:'이용 제한',title:'신청 상태를 확인해 주세요.',copy:context.surface?.blockedReason?.message||'현재 계정으로 참가 신청을 진행할 수 없습니다.',action:null};
    else if(context.surface?.primaryAction?.enabled===false&&context.surface.primaryAction.code==='NONE'&&!['PROCESSING','ACTIVE'].includes(relation)&&payment?.state!=='SUCCEEDED')status={...status,copy:context.surface.blockedReason?.message||'현재 신규 신청 또는 결제를 진행할 수 없습니다.',action:action('참가 조건 확인')};
    const tiers=(context.tiers||[]).map(t=>({name:t.displayName||t.code,amount:t.displayAmount||(Number.isFinite(t.amount)?new Intl.NumberFormat('ko-KR',{style:'currency',currency:t.currency||'KRW',maximumFractionDigits:0}).format(t.amount):'안내 예정'),availability:t.availability?.label||''}));
    return {id:event.id,title,category:event.category||'행사 안내',description:event.description||'',stage:event.stageLabel||'안내 예정',registration:event.registrationLabel||'모집 안내 예정',date:event.eventDateDisplay||'일정 안내 예정',period:event.applicationPeriodDisplay||'일정 안내 예정',capacity:event.capacityDisplay||'정원 안내 예정',capacityNote:event.capacityNote||'',tiers,status,participantNumber:participation?.participantNumber||null};
  }
  return {resolve};
});
