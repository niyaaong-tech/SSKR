(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./solar-times'):root.SSKR_SOLAR_TIMES);if(typeof module==='object'&&module.exports)module.exports=api;else root.SSKR_EVENT_RULES=Object.freeze(api);})(typeof globalThis!=='undefined'?globalThis:this,solar=>{
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
  function reviewSchedule({event={},departureTime,breakMinutes,drivingSeconds=0,date=event.eventStartAt,start,finish}) {
    if(!Number.isFinite(drivingSeconds)||drivingSeconds<0 || !/^\d{2}:\d{2}$/.test(departureTime||'') || !validDate(date) || breakMinutes==='' || breakMinutes==null || !Number.isFinite(Number(breakMinutes)) || Number(breakMinutes)<0||Number(breakMinutes)>1440)return {state:'UNREVIEWED',label:'일정 미검토'};
    const [hours,minutes]=departureTime.split(':').map(Number);
    if(hours>23||minutes>59)return {state:'UNREVIEWED',label:'일정 미검토'};
    const timezone=event.timezone||'Asia/Seoul';
    const calendar=solar.dateKey(date,timezone),midnight=solar.midnight(calendar,timezone);
    if(!midnight)return {state:'UNAVAILABLE',label:'행사 날짜 확인 필요'};
    const departureAt=midnight.utc+(hours*60+minutes)*60000;
    const arrivalAt=departureAt+drivingSeconds*1000+Number(breakMinutes)*60000;
    if(!Number.isFinite(arrivalAt)||Math.abs(arrivalAt)>8640000000000000)return {state:'UNAVAILABLE',label:'예상 시간 확인 필요'};
    if(!validDate(event.eventEndAt)||!validDate(event.eventStartAt))return {state:'UNAVAILABLE',label:'행사 시각 안내 예정'};
    const sunlight=solar.windowFor(event,start,finish);
    if(sunlight.state==='STALE'||event.sunlightMode==='CALCULATED_MOCK'&&sunlight.state==='UNAVAILABLE')return {state:'UNAVAILABLE',label:'일출·일몰 시각 확인 필요',sunlightState:sunlight.state};
    const earliest=Math.max(Date.parse(event.eventStartAt),validDate(sunlight.sunriseAt)?Date.parse(sunlight.sunriseAt):-Infinity);
    const deadline=Math.min(Date.parse(event.eventEndAt),validDate(sunlight.sunsetAt)?Date.parse(sunlight.sunsetAt):Infinity);
    const clock=value=>new Date(value).toLocaleTimeString('ko-KR',{timeZone:timezone,hour:'2-digit',minute:'2-digit',hour12:false});
    const beforeStart=departureAt<earliest,late=arrivalAt>deadline,remainingMinutes=Math.floor((deadline-arrivalAt)/60000),warnings=[];
    if(beforeStart)warnings.push(`${clock(earliest)} 출발 가능 시각 전입니다`);
    if(late)warnings.push(`도착 마감 ${clock(deadline)}보다 ${Math.abs(remainingMinutes)}분 늦습니다`);
    const arrivalDay=solar.dateKey(new Date(arrivalAt).toISOString(),timezone),days=Math.round((Date.parse(arrivalDay)-Date.parse(calendar))/86400000);
    const arrivalLabel=(days===1?'다음 날 ':days>1?`${days}일 후 `:'')+clock(arrivalAt)+' 도착 예상';
    const label=warnings.length?warnings.join(' · '):`설정한 일정은 마감 이내 · ${remainingMinutes}분 여유`;
    return {state:beforeStart&&late?'EARLY_LATE':beforeStart?'EARLY':late?'LATE':'WITHIN',label,arrivalLabel,warnings,departureAt:new Date(departureAt).toISOString(),arrivalAt:new Date(arrivalAt).toISOString(),earliestDepartureAt:new Date(earliest).toISOString(),deadlineAt:new Date(deadline).toISOString(),remainingMinutes,drivingBudgetSeconds:Math.floor((deadline-Math.max(departureAt,earliest))/1000)-Number(breakMinutes)*60,sunlightState:sunlight.state,sourceUrl:sunlight.sourceUrl,calculationVersion:sunlight.calculationVersion};
  }
  return {preparation,reviewSchedule};
});
