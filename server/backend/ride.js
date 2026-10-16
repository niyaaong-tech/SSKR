'use strict';
const {createHash}=require('node:crypto');
const {BackendError}=require('./config');
const catalog=require('../../web/app/spot-catalog');
const {checkinRequirement}=require('../../web/shared/checkin-rules');
const editable=require('../../web/app/memorial-store').editableValues;
const {mediaDto}=require('./media');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
function distance(a,b){const r=Math.PI/180,dlat=(a.lat-b.lat)*r,dlng=(a.lng-b.lng)*r;return 12742000*Math.asin(Math.min(1,Math.sqrt(Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlng/2)**2)));}
function checkin(repo,snapshot,body,now) {
  const p=repo.getParticipation(),state=repo.snapshot,event=snapshot.event,c=snapshot.commerce;
  if(p?.state!=='ACTIVE'||p.slotAllocation!=='CONFIRMED')throw new BackendError('PARTICIPATION_REQUIRED','참가 확정 후 체크인할 수 있습니다.',403);
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.requestId||''))throw new BackendError('INVALID_INPUT','체크인 요청 번호를 확인해 주세요.');
  const evidence={requestId:body.requestId,locationId:body.locationId,lat:body.lat,lng:body.lng,accuracy:body.accuracy,capturedAt:body.capturedAt};
  if(typeof evidence.locationId!=='string'||!Number.isFinite(evidence.lat)||Math.abs(evidence.lat)>90||!Number.isFinite(evidence.lng)||Math.abs(evidence.lng)>180||!Number.isFinite(evidence.accuracy)||evidence.accuracy<0||!Number.isFinite(Date.parse(evidence.capturedAt)))throw new BackendError('INVALID_INPUT','현재 위치를 다시 확인해 주세요.');
  const fingerprint=hash(evidence),existing=state.run?.receipts?.find(r=>r.id===body.requestId);
  if(existing){if(existing.hash!==fingerprint)throw new BackendError('IDEMPOTENCY_CONFLICT','같은 요청 번호의 위치 정보가 달라졌습니다.',409);return;}
  if(!state.run||state.run.state==='NOT_STARTED') {
    const start=p.selectedStartLocationId;
    if(!start)throw new BackendError('START_REQUIRED','참가 준비에서 출발지를 먼저 선택해 주세요.',409);
    if(body.locationId!==start)throw new BackendError('START_FIRST','선택한 출발지에서 먼저 체크인해 주세요.',409);
    const startTime=event.sunlight?.starts?.find(x=>x.locationId===start)?.sunriseAt;
    const finishTime=event.sunlight?.finish?.sunsetAt;
    if(!startTime||!finishTime)throw new BackendError('EVENT_NOT_READY','행사의 출발·도착 시간을 확인하고 있습니다.',409);
    state.run={state:'NOT_STARTED',rules:{eventId:event.id,eventTitle:event.publicTitle,configVersion:event.configVersion,minimumSpotCheckins:event.minimumSpotCheckins,
      startId:start,finishId:event.finishLocationId,startTime,finishTime,
      radius:c.checkinRadiusMeters,accuracy:c.maxAccuracyMeters,places:catalog.map(p=>({id:p.id,kind:p.kind,lat:p.lat,lng:p.lng}))},visits:state.run?.visits||[],receipts:state.run?.receipts||[]};
  }
  const run=state.run,rules=run.rules,place=rules.places.find(p=>p.id===body.locationId);
  if(!place)throw new BackendError('INVALID_PLACE','행사에 등록된 스팟을 선택해 주세요.');
  if(run.receipts.length>=500)throw new BackendError('CHECKIN_LIMIT','체크인 요청이 많습니다. 운영자에게 문의해 주세요.',429);
  let reason=null;
  const captured=Date.parse(evidence.capturedAt),accepted=run.visits.filter(v=>v.validationStatus==='VALIDATED');
  const role=body.locationId===rules.startId?'START':body.locationId===rules.finishId?'FINISH':'SPOT';
  if(run.state==='COMPLETED')reason='ALREADY_FINISHED';
  else if(captured<Date.parse(rules.startTime)||captured>Date.parse(rules.finishTime))reason='OUTSIDE_EVENT_TIME';
  else if(captured>+now+30000||+now-captured>300000)reason='TIME_REVIEW_REQUIRED';
  else if(evidence.accuracy>rules.accuracy)reason='LOCATION_UNCERTAIN';
  else if(distance(evidence,place)>rules.radius)reason='OUTSIDE_SPOT';
  else if(accepted.some(v=>v.locationId===place.id))reason='DUPLICATE_SPOT';
  else if(accepted.length&&captured<=Date.parse(accepted.at(-1).checkedInAt))reason='ORDER_REVIEW_REQUIRED';
  else if(!accepted.length&&role!=='START')reason='START_FIRST';
  else if(role==='SPOT'&&place.kind!=='spot')reason='INVALID_SPOT';
  else if(role==='FINISH'&&new Set(accepted.filter(v=>v.role==='SPOT').map(v=>v.locationId)).size<rules.minimumSpotCheckins)reason='MORE_SPOTS_REQUIRED';
  const visit={id:body.requestId,locationId:place.id,role,sequence:run.visits.length+1,checkedInAt:evidence.capturedAt,
    receivedAt:now.toISOString(),validationStatus:reason?'REVIEW_REQUIRED':'VALIDATED',reason,note:'',media:[],photoConsent:false};
  run.receipts.push({id:body.requestId,hash:fingerprint});run.visits.push(visit);
  if(!reason){run.state=role==='FINISH'?'COMPLETED':'STARTED';p.runResult=run.state;repo.saveParticipation(p);}
  finishMemorial(repo);
  return {evidence:{...evidence,validationStatus:visit.validationStatus,reason,ruleVersion:rules.configVersion}};
}
function finishMemorial(repo) {
  const state=repo.snapshot,run=state.run,rules=run.rules,p=repo.getParticipation();
  if(run.state==='COMPLETED'&&!state.memorial) {
    const visits=run.visits.filter(v=>v.validationStatus==='VALIDATED'),requirement=checkinRequirement(rules,visits,{startId:rules.startId,finishId:rules.finishId});
    if(!requirement.met)throw new BackendError('RULE_MISMATCH','완주 기록 확인이 필요합니다.',409);
    state.memorial={id:rules.eventId+'-'+p.userId,participationId:p.id,ownerUserId:p.userId,ownerName:'라이더 '+p.participantNumber,
      eventId:rules.eventId,eventTitle:rules.eventTitle,participantNumber:p.participantNumber,title:rules.eventTitle+'의 하루',summary:'',
      revision:1,publishStatus:'DRAFT',visibility:'PRIVATE',synthetic:false,result:'완주',startedAt:visits[0].checkedInAt,finishedAt:visits.at(-1).checkedInAt,
      startLocationId:rules.startId,finishLocationId:rules.finishId,visitedLocationIds:visits.map(v=>v.locationId),spotCount:requirement.spotCount,
      visits,visitEdits:{},distanceMeters:null,minimumSpotCheckins:rules.minimumSpotCheckins,ruleVersion:rules.configVersion};
  }
}
function reviewCheckin(repo,body,actor,now) {
  const run=repo.snapshot.run,v=run?.visits.find(v=>v.id===body.id),note=String(body.note||'').trim();
  if(!v||v.validationStatus!=='REVIEW_REQUIRED'||!['VALIDATED','REJECTED'].includes(body.state)||note.length<10||note.length>1000)throw new BackendError('INVALID_INPUT','검토할 체크인과 판단 근거를 확인해 주세요. 근거는 10자 이상 입력해 주세요.');
  if(body.state==='VALIDATED') {
    if(run.state==='COMPLETED'||Date.parse(v.checkedInAt)<Date.parse(run.rules.startTime)||Date.parse(v.checkedInAt)>Date.parse(run.rules.finishTime))throw new BackendError('CHECKIN_REVIEW_INVALID','완료된 여정이나 행사 시간 밖의 기록은 추가 인정할 수 없습니다.',409);
    const visits=[...run.visits.filter(v=>v.validationStatus==='VALIDATED'),v].sort((a,b)=>Date.parse(a.checkedInAt)-Date.parse(b.checkedInAt));
    if(visits[0].role!=='START'||visits[0].locationId!==run.rules.startId||new Set(visits.map(v=>v.locationId)).size!==visits.length||visits.slice(1).some((v,i)=>v.role==='START'||v.role==='FINISH'&&i!==visits.length-2))throw new BackendError('CHECKIN_REVIEW_INVALID','출발·스팟·도착 순서와 중복 여부를 확인해 주세요.',409);
    if(visits.at(-1).role==='FINISH'&&visits.filter(v=>v.role==='SPOT').length<run.rules.minimumSpotCheckins)throw new BackendError('MORE_SPOTS_REQUIRED','필수 스팟 수를 충족하지 않았습니다.',409);
    v.validationStatus='VALIDATED';run.visits.sort((a,b)=>Date.parse(a.checkedInAt)-Date.parse(b.checkedInAt));run.visits.forEach((v,i)=>v.sequence=i+1);
    run.state=visits.at(-1).role==='FINISH'?'COMPLETED':'STARTED';const p=repo.getParticipation();p.runResult=run.state;repo.saveParticipation(p);finishMemorial(repo);
  }else v.validationStatus='REJECTED';
  v.review={actor,note,at:now.toISOString()};
}
function editMemorial(repo,values,revision) {
  const m=repo.snapshot.memorial;if(!m)throw new BackendError('NOT_FOUND','완주 기록이 없습니다.',404);
  if(revision!==m.revision)throw new BackendError('CONFLICT','다른 화면에서 기록이 바뀌었습니다. 새로 불러온 뒤 수정해 주세요.',409);
  let patch;try{patch=editable(values);}catch(e){throw new BackendError('INVALID_INPUT',e.message);}
  for(const [id,edit] of Object.entries(patch.visitEdits)) {
    const visit=m.visits.find(v=>v.id===id);if(!visit)throw new BackendError('INVALID_INPUT','방문 기록을 확인해 주세요.');
    if(edit.mediaIds.some(id=>!repo.snapshot.media?.some(p=>p.id===id&&p.visitId===visit.id)))throw new BackendError('INVALID_INPUT','사진의 소유 기록을 확인해 주세요.');
    visit.note=edit.note;visit.photoConsent=edit.photoConsent;
    visit.media=edit.mediaIds.map(id=>repo.snapshot.media.find(p=>p.id===id&&p.status==='READY')).filter(Boolean).map(p=>({...mediaDto(p),visibility:edit.photoConsent?'PUBLIC':'PRIVATE'}));
  }
  Object.assign(m,patch,{revision:m.revision+1,publishedAt:patch.publishStatus==='PUBLISHED'?new Date().toISOString():null});
}
function publicMemorial(item,account) {
  const owner=account?.id===item.ownerUserId,m=structuredClone(item);
  if(!owner)delete m.visitEdits;
  m.visits=m.visits.map(v=>({id:v.id,locationId:v.locationId,role:v.role,sequence:v.sequence,checkedInAt:v.checkedInAt,
    validationStatus:v.validationStatus,note:v.note,photoConsent:v.photoConsent,media:(v.media||[]).filter(p=>owner||v.photoConsent&&p.moderationStatus==='APPROVED')}));
  for(const v of m.visits){const p=catalog.find(p=>p.id===v.locationId);if(p?.image)v.placePhoto={id:'place-'+p.id,sourceKind:'CATALOG',status:'READY',moderationStatus:'APPROVED',visibility:'PUBLIC',url:p.image,sourceUrl:p.source,credit:p.photoCredit};}
  return m;
}
module.exports={checkin,editMemorial,publicMemorial,distance,reviewCheckin};
