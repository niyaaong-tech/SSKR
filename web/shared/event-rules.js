(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SSKR_EVENT_RULES=Object.freeze(api);})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  const validDate = value => value && Number.isFinite(Date.parse(value));
  function preparation(context={}) {
    const p=context.participation,e=context.event||{},now=Date.parse(context.generatedAt||new Date().toISOString());
    if(!context.account?.linked || p?.state!=='ACTIVE' || p.slotAllocation!=='CONFIRMED' || p.eventId!==e.id)return [];
    const editable=deadline=>!context.account.blocked && !['LIVE','SEASON_CLEAR'].includes(e.resolvedStage) && (!validDate(deadline)||now<=Date.parse(deadline));
    const address=p.kitRecipient;
    return [
      {key:'bike',label:'바이크 정보',complete:Boolean(p.bikeInfo?.maker&&p.bikeInfo?.model&&p.bikeInfo?.className),value:p.bikeInfo?.model||'등록 필요',deadline:e.bikeInfoDeadlineAt,editable:editable(e.bikeInfoDeadlineAt)},
      {key:'start',label:'공식 출발지',complete:Boolean(p.selectedStartLocationId),value:p.selectedStartLocationId||'선택 필요',deadline:e.startSelectionDeadlineAt,editable:editable(e.startSelectionDeadlineAt)},
      {key:'kit',label:'키트 배송 정보',complete:Boolean(address?.name&&address?.phone&&address?.postalCode&&address?.address),value:({SHIPPED:'발송 완료',DELIVERED:'배송 완료'})[p.fulfillmentState]||(address?.address||'배송지 입력 필요'),deadline:e.kitAddressDeadlineAt,editable:editable(e.kitAddressDeadlineAt)&&!['SHIPPED','DELIVERED'].includes(p.fulfillmentState)},
      {key:'notice',label:'운영 안내',complete:p.acknowledgedNoticeVersion===e.preparationNoticeVersion,value:p.acknowledgedNoticeVersion===e.preparationNoticeVersion?'확인 완료':'최신 안내 확인 필요',editable:!context.account.blocked}
    ];
  }
  function reviewSchedule({event={},departureTime,breakMinutes,drivingSeconds=0,date=event.eventStartAt}) {
    if(!Number.isFinite(drivingSeconds)||drivingSeconds<0 || !/^\d{2}:\d{2}$/.test(departureTime||'') || !validDate(date) || breakMinutes==='' || breakMinutes==null || !Number.isFinite(Number(breakMinutes)) || Number(breakMinutes)<0)return {state:'UNREVIEWED',label:'일정 미검토'};
    const [hours,minutes]=departureTime.split(':').map(Number);
    if(hours>23||minutes>59)return {state:'UNREVIEWED',label:'일정 미검토'};
    const timezone=event.timezone||'Asia/Seoul';
    // Calendar date and UTC offset both come from Event; no browser-local date conversion.
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(date)).map(p=>[p.type,p.value]));
    const midnight=Date.UTC(+parts.year,+parts.month-1,+parts.day);
    const offsetName=new Intl.DateTimeFormat('en',{timeZone:timezone,timeZoneName:'longOffset'}).formatToParts(new Date(date)).find(p=>p.type==='timeZoneName')?.value||'GMT';
    const offset=offsetName.match(/GMT([+-])(\d{2}):(\d{2})/);
    const offsetMinutes=offset?(offset[1]==='-'?-1:1)*(+offset[2]*60 + +offset[3]):0;
    const departureAt=midnight+(hours*60+minutes-offsetMinutes)*60000;
    const arrivalAt=departureAt+drivingSeconds*1000+Number(breakMinutes)*60000;
    if(!validDate(event.eventEndAt)||!validDate(event.eventStartAt))return {state:'UNAVAILABLE',label:'행사 시각 안내 예정'};
    const beforeStart=departureAt<Date.parse(event.eventStartAt),late=arrivalAt>Date.parse(event.eventEndAt);
    return {state:beforeStart?'EARLY':late?'LATE':'WITHIN',label:beforeStart?'공식 출발 가능 시각 전입니다':late?'도착 마감 이후 예상':'설정한 일정은 마감 이내',departureAt:new Date(departureAt).toISOString(),arrivalAt:new Date(arrivalAt).toISOString(),remainingMinutes:Math.floor((Date.parse(event.eventEndAt)-arrivalAt)/60000)};
  }
  return {preparation,reviewSchedule};
});
