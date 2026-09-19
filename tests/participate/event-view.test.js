const test=require('node:test'),assert=require('node:assert/strict');
const {resolve}=require('../../web/app/event-view');
const {handleParticipateRequest}=require('../../server/participate/request-handler');
test('event display follows server timestamps and changed event records without year-specific UI data',async()=>{
 const original=await handleParticipateRequest('context',{scenario:'guest',account:{linked:false}});
 assert.equal(original.event.eventDateDisplay,'2027.06.14 (월)');
 const snapshot=original.mockSnapshot;
 Object.assign(snapshot.event,{id:'sskr-autumn-2030',publicTitle:'SSKR 가을 2030',eventStartAt:'2030-10-12T06:00:00+09:00',eventEndAt:'2030-10-12T21:00:00+09:00',eventDateDisplay:'old label'});
 snapshot.priceTiers.forEach(t=>{t.eventId=snapshot.event.id;t.amount+=10000;});
 const next=await handleParticipateRequest('context',{snapshot,account:{linked:false}}),model=resolve(next);
 assert.equal(model.id,'sskr-autumn-2030');assert.equal(model.title,'SSKR 가을 2030');assert.equal(model.date,'2030.10.12 (토)');assert.doesNotMatch(model.date,/2027|old label/);
 assert.equal(model.tiers.length,next.tiers.length);assert.equal(model.tiers[0].amount,next.tiers[0].displayAmount);
});
test('event page distinguishes saved, processing, waiting, confirmed and finished states',async()=>{
 const cases=[['c-payment-deferred','결제 대기','/participate?resumePayment=1'],['processing','결제 확인 중','/participate'],['c-waitlisted','참가 대기','/participate'],['active','참가 확정','/app/preparation'],['c-season-completed','완주','/app/my']];
 for(const [scenario,label,href] of cases){const dto=await handleParticipateRequest('context',{scenario,account:{linked:true,provider:'google'}}),model=resolve(dto);assert.equal(model.status.label,label,scenario);assert.equal(model.status.action.href,href,scenario);}
});
test('successful payment without a participant offers recovery, never payment again',()=>{
 const model=resolve({event:{id:'event'},account:{linked:true},payment:{state:'SUCCEEDED'},surface:{step:'STEP_4'}});
 assert.equal(model.status.label,'참가권 발급 중');assert.equal(model.status.action.label,'발급 상태 확인');assert.doesNotMatch(model.status.action.href,/resumePayment/);
});
test('guest and unrelated-event records do not disclose participant numbers',()=>{
 const base={event:{id:'current'},participation:{eventId:'current',participantNumber:'SECRET',state:'ACTIVE'}};
 assert.equal(resolve({...base,account:{linked:false}}).participantNumber,null);
 assert.equal(resolve({...base,account:{linked:true},participation:{...base.participation,eventId:'past'}}).participantNumber,null);
 assert.equal(resolve({}),null);
});

