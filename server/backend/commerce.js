'use strict';
const { BackendError } = require('./config');
const required = ['TERMS','PRIVACY','LOCATION'];
const invalid = message => { throw new BackendError('INVALID_INPUT',message); };
const text = (v,max=10000) => typeof v==='string' && v.trim().length<=max ? v.trim() : '';
function validateCommerce(input,event,{testParticipation=false}={}) {
  if (!input || typeof input!=='object' || Array.isArray(input)) invalid('접수 설정을 확인해 주세요.');
  const v={eventConfigVersion:event.configVersion,enabled:input.enabled===true,baseCapacity:Number(input.baseCapacity),extraCapacity:Number(input.extraCapacity||0),
    priceTiers:[],agreements:[],notices:[],guide:text(input.guide),guideVersion:text(input.guideVersion,80),
    refundPolicy:{version:text(input.refundPolicy?.version,80),text:text(input.refundPolicy?.text)},
    preparationNotice:text(input.preparationNotice),preparationNoticeVersion:text(input.preparationNoticeVersion,80),
    kitDeliveryMode:input.kitDeliveryMode==='SHIPPING'?'SHIPPING':'ONSITE',
    checkinRadiusMeters:Number(input.checkinRadiusMeters||150),maxAccuracyMeters:Number(input.maxAccuracyMeters||80)};
  if(!Number.isInteger(v.baseCapacity)||v.baseCapacity<1||v.baseCapacity>100000||!Number.isInteger(v.extraCapacity)||v.extraCapacity<0||v.extraCapacity>100000)invalid('정원은 1명 이상, 추가 정원은 0명 이상으로 입력해 주세요.');
  for(const k of ['startSelectionDeadlineAt','kitAddressDeadlineAt','bikeInfoDeadlineAt','ridePreparationAt','rideCheckAt','countdownAt']) {
    if(input[k]&&!Number.isFinite(Date.parse(input[k])))invalid('준비 일정의 날짜와 시간을 확인해 주세요.');
    v[k]=input[k]?new Date(input[k]).toISOString():null;
    if(v[k]&&Date.parse(v[k])>Date.parse(event.eventEndAt))invalid('준비 마감은 행사 종료 이전이어야 합니다.');
  }
  if(!Number.isFinite(v.checkinRadiusMeters)||!Number.isFinite(v.maxAccuracyMeters)||v.checkinRadiusMeters<10||v.checkinRadiusMeters>500||v.maxAccuracyMeters<5||v.maxAccuracyMeters>150)invalid('체크인 위치 허용 범위를 확인해 주세요.');
  if(input.notices&&(!Array.isArray(input.notices)||input.notices.length>50))invalid('행사 공지는 최대 50개까지 등록할 수 있습니다.');
  for(const n of input.notices||[]){
    const notice={id:text(n.id,80),title:text(n.title,120),body:text(n.body,10000),publishedAt:n.publishedAt||null};
    if(!/^[a-zA-Z0-9_-]{1,80}$/.test(notice.id)||v.notices.some(p=>p.id===notice.id)||!notice.title||!notice.body||notice.publishedAt&&!Number.isFinite(Date.parse(notice.publishedAt)))invalid('공지의 제목·본문·공개 시각을 확인해 주세요.');
    v.notices.push(notice);
  }
  const ids=new Set(),codes=new Set();
  if(testParticipation)input={...input,priceTiers:[{id:'test-participation',code:'STANDARD',displayName:'기본 참가',amount:0,currency:'KRW',salesStartAt:event.applicationOpenAt,salesEndAt:event.applicationCloseAt,isActive:true}]};
  for(const p of Array.isArray(input.priceTiers)?input.priceTiers:[]) {
    const tier={id:text(p.id,80),eventId:event.id,code:p.code,displayName:text(p.displayName,80),amount:Number(p.amount),currency:'KRW',
      salesStartAt:p.salesStartAt,salesEndAt:p.salesEndAt,isActive:p.isActive===true,entryLimit:p.entryLimit==null?null:Number(p.entryLimit),benefits:[]};
    if(!/^[a-zA-Z0-9_-]{1,80}$/.test(tier.id)||ids.has(tier.id)||codes.has(tier.code)||!['EARLY','STANDARD','PLATINUM'].includes(tier.code)||!tier.displayName||!Number.isSafeInteger(tier.amount)||tier.amount<(testParticipation?0:100)||tier.amount>10000000||!(Date.parse(tier.salesStartAt)<Date.parse(tier.salesEndAt))||Date.parse(tier.salesEndAt)>Date.parse(event.eventStartAt)||(tier.entryLimit!==null&&(!Number.isInteger(tier.entryLimit)||tier.entryLimit<1)))invalid('참가 유형의 이름·금액·판매 기간을 확인해 주세요.');
    ids.add(tier.id);codes.add(tier.code);v.priceTiers.push(tier);
  }
  for(const a of Array.isArray(input.agreements)?input.agreements:[]) {
    if(![...required,'MARKETING'].includes(a.code)||v.agreements.some(x=>x.code===a.code))invalid('약관 종류가 올바르지 않습니다.');
    v.agreements.push({code:a.code,title:text(a.title,120),version:text(a.version,80),body:text(a.body,16000),required:required.includes(a.code)});
  }
  if(v.enabled&&(!v.priceTiers.some(p=>p.isActive)||!v.guide||!v.guideVersion||(!testParticipation&&(!v.refundPolicy.version||!v.refundPolicy.text))||!v.preparationNotice||!v.preparationNoticeVersion||!v.startSelectionDeadlineAt||!v.bikeInfoDeadlineAt||(v.kitDeliveryMode==='SHIPPING'&&!v.kitAddressDeadlineAt)||required.some(code=>!v.agreements.some(a=>a.code===code&&a.title&&a.version&&a.body))||!event.applicationOpenAt||!event.applicationCloseAt))invalid(testParticipation?'접수 전 정원·약관·참가 안내·준비 마감을 모두 등록해 주세요.':'접수 전 참가비·정원·약관·환불 규정·참가 안내·준비 마감을 모두 등록해 주세요.');
  return v;
}
function eventForWorkflow(snapshot,now,providerReady) {
  const e=snapshot.event,c=snapshot.commerce||{};
  if(!e)return null;
  const open=c.enabled&&c.eventConfigVersion===e.configVersion&&providerReady&&Date.parse(e.applicationOpenAt)<=+now&&+now<Date.parse(e.applicationCloseAt)&&+now<Date.parse(e.eventStartAt);
  return {...e,...c,priceTiers:(c.priceTiers||[]).map(p=>({...p,eventId:e.id,entryCount:snapshot.tierCounts?.[p.id]||0})),
    agreementVersions:Object.fromEntries((c.agreements||[]).map(a=>[a.code,a.version])),participationGuideVersion:c.guideVersion,
    registrationState:open?'OPEN':c.enabled&&+now>=Date.parse(e.applicationCloseAt)?'CLOSED':'NOT_OPEN',
    capacityPolicy:{baseCapacity:c.baseCapacity||0,platinumExtraCapacity:c.extraCapacity||0,...snapshot.capacity},
    earlyBirdEnabled:(c.priceTiers||[]).some(p=>p.code==='EARLY'&&p.isActive),visibility:'PUBLIC',
    coreConfirmedAt:e.publishedAt,spotsConfirmedAt:e.publishedAt,finishLocationName:(e.placeCatalog||require('../../web/app/spot-catalog')).find(p=>p.id===e.finishLocationId)?.name||'',
    seasonClearUntil:new Date(Date.parse(e.eventEndAt)+366*86400000).toISOString()};
}
module.exports={validateCommerce,eventForWorkflow};
