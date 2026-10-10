const test=require('node:test'),assert=require('node:assert/strict');
const {createScenario}=require('../../server/participate/mock-scenarios');
const {MockParticipateRepository}=require('../../server/participate/mock-repository');
const {createTransactionService}=require('../../server/participate/transaction-service');
const {handleParticipateRequest}=require('../../server/participate/request-handler');
const {preparation,reviewSchedule}=require('../../web/shared/event-rules');
const {resolveManager}=require('../../web/app/manager-resolver');
function make(scenario='active'){const repository=new MockParticipateRepository(createScenario(scenario));return {repository,service:createTransactionService(repository)};}
test('official start and shipping are independently saved and restored through the API',async()=>{
 let response=await handleParticipateRequest('application',{scenario:'active',account:{linked:true},action:'SAVE_START_LOCATION',startLocationId:'gangneung'});
 assert.equal(response.ok,true);assert.equal(response.participation.selectedStartLocationId,'gangneung');
 response=await handleParticipateRequest('application',{snapshot:response.mockSnapshot,account:{linked:true},action:'SAVE_KIT_RECIPIENT',recipient:{name:'라이더',phone:'010-1234-5678',postalCode:'12345',address:'부산시 테스트로 10',detail:'101호'}});
 assert.equal(response.ok,true);assert.equal(response.participation.kitRecipient.phone,'01012345678');assert.equal(response.participation.selectedStartLocationId,'gangneung');
 assert.equal(preparation(response).find(row=>row.key==='kit').complete,true);
});
test('preparation rejects nonparticipants, foreign participation, invalid start and dispatched address edits',()=>{
 const guest=make('logged-in-no-application');assert.throws(()=>guest.service.saveStartLocation('gangneung'),{code:'PREPARATION_UNAVAILABLE'});
 const active=make();assert.throws(()=>active.service.saveStartLocation('auraji'),{code:'INVALID_START_LOCATION'});
 active.repository.snapshot.participation.userId='other';assert.throws(()=>active.service.saveStartLocation('gangneung'),{code:'PREPARATION_UNAVAILABLE'});
 const shipped=make();shipped.repository.snapshot.participation.fulfillmentState='SHIPPED';assert.throws(()=>shipped.service.saveKitRecipient({}),{code:'KIT_ALREADY_SHIPPED'});
});
test('late purchasers can prepare until configured deadlines, then edits lock',()=>{
 const active=make();active.repository.snapshot.mock.now='2027-06-12T01:00:00Z';const service=createTransactionService(active.repository);
 service.saveBikeInfo({maker:'Honda',model:'CB500',className:'500cc'});assert.equal(active.repository.getParticipation().bikeInfo.model,'CB500');
 active.repository.snapshot.mock.now='2027-06-12T04:00:00Z';assert.throws(()=>createTransactionService(active.repository).saveStartLocation('gangneung'),{code:'PREPARATION_DEADLINE_PASSED'});
 const e=active.repository.getCurrentEvent();assert.ok(Date.parse(e.applicationCloseAt)<Date.parse(e.kitAddressDeadlineAt));assert.ok(Date.parse(e.kitAddressDeadlineAt)<Date.parse(e.kitDispatchAt));assert.ok(Date.parse(e.kitDispatchAt)<Date.parse(e.eventStartAt));
});
test('notice version change reopens preparation and manager priority reflects the actual missing field',async()=>{
 const response=await handleParticipateRequest('context',{scenario:'active',account:{linked:true}});
 assert.match(resolveManager(response).primaryAction.href,/#bike$/);
 const p=response.participation;p.bikeInfo={maker:'Honda',model:'CB500',className:'500cc'};p.selectedStartLocationId='gangneung';p.kitRecipient={name:'수령인',phone:'01012345678',postalCode:'12345',address:'테스트 주소'};
 p.acknowledgedNoticeVersion=response.event.preparationNoticeVersion;assert.equal(preparation(response).every(row=>row.complete),true);
 response.event.preparationNoticeVersion='changed';assert.equal(preparation(response).find(row=>row.key==='notice').complete,false);assert.match(resolveManager(response).primaryAction.href,/#notice$/);
});
test('legacy paid waiting is never newly charged or silently promoted',()=>{
 const {repository,service}=make('b-step4');service.prepareCheckout();repository.snapshot.checkoutHold.slotTarget='WAITLISTED';
 assert.throws(()=>service.startPayment({idempotencyKey:'bad-hold'}),{code:'CONFIRMED_SLOT_REQUIRED'});assert.equal(repository.getPaymentAttempts().length,0);assert.equal(service.promoteWaitlist,undefined);
});
test('schedule review handles absent input, official day, early departure and late finish',()=>{
 const event={eventStartAt:'2030-06-15T06:00:00+09:00',eventEndAt:'2030-06-15T19:30:00+09:00',timezone:'Asia/Seoul'};
 assert.equal(reviewSchedule({event,drivingSeconds:3600}).state,'UNREVIEWED');
 assert.equal(reviewSchedule({event,departureTime:'06:00',breakMinutes:'60',drivingSeconds:NaN}).state,'UNREVIEWED');
 const valid=reviewSchedule({event,departureTime:'06:30',breakMinutes:'120',drivingSeconds:8*3600});assert.equal(valid.state,'WITHIN');assert.equal(valid.arrivalAt,'2030-06-15T07:30:00.000Z');
 assert.equal(reviewSchedule({event,departureTime:'05:00',breakMinutes:'0',drivingSeconds:3600}).state,'EARLY');
 assert.equal(reviewSchedule({event,departureTime:'12:00',breakMinutes:'120',drivingSeconds:8*3600}).state,'LATE');
});

test('known legacy mock data upgrades preparation fields without resetting event rules or payment',()=>{
 const snapshot=createScenario('active');snapshot.event.minimumSpotCheckins=12;snapshot.event.bikeInfoDeadlineAt='2027-05-31T23:59:59+09:00';delete snapshot.event.kitAddressDeadlineAt;delete snapshot.event.finishLocationId;
 const restored=new MockParticipateRepository(snapshot).exportSnapshot();assert.equal(restored.event.minimumSpotCheckins,12);assert.equal(restored.event.finishLocationId,'daecheon');assert.equal(restored.event.bikeInfoDeadlineAt,'2027-06-12T12:00:00+09:00');assert.equal(restored.paymentAttempts[0].state,'SUCCEEDED');
});
