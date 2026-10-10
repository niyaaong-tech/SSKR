const test=require('node:test'),assert=require('node:assert/strict');
const {resolveManager}=require('../../web/app/manager-resolver');
const {resolve}=require('../../web/app/event-view');
const {handleParticipateRequest}=require('../../server/participate/request-handler');
const {historyRows}=require('../../web/app/memorial-store');
const {MockParticipateRepository}=require('../../server/participate/mock-repository');
const event={id:'event',publicTitle:'SSKR 2030',registrationLabel:'모집 중'};
test('manager invites guests to plan and reads linked nonparticipant saved routes without invented progress',()=>{
 const guest=resolveManager({event,account:{linked:false}},{plans:[{id:'hidden'}]});
 assert.equal(guest.primaryAction.href,'/app/spots?mode=plan');assert.equal(guest.plans.length,0);assert.deepEqual(guest.preparation,[]);
 const linked=resolveManager({event,account:{linked:true}},{plans:[{id:'old',updatedAt:'2030-01-01'},{id:'recent',updatedAt:'2030-02-01'}]});
 assert.equal(linked.primaryAction.href,'/app/spots?mode=plan&tab=saved');assert.equal(linked.plans[0].id,'recent');assert.equal(linked.banner.title,'SSKR 2030');
 assert.equal(resolveManager({account:{linked:true}}).banner,null);
});
test('manager status and next action agree with event state across application, payment, waiting and completed states',async()=>{
 for(const scenario of ['application-step2','c-payment-deferred','failed','processing','active','c-season-completed','blocked']){
 const context=await handleParticipateRequest('context',{scenario,account:{linked:true,provider:'google'}});
 const manager=resolveManager(context),status=resolve(context).status;
 assert.equal(manager.label,status.label,scenario);if(scenario!=='active')assert.deepEqual(manager.primaryAction,status.action,scenario);

 if(scenario==='active'){assert.equal(manager.preparation[0].key,'bike');assert.equal(manager.primaryAction.href,'/app/preparation#bike');}
 }
});
test('cancelled and finalizing participants are never invited to pay again or shown confirmed preparation',()=>{
 const base={event,account:{linked:true}};
 const cancelled=resolveManager({...base,participation:{state:'CANCELLED'}});assert.equal(cancelled.label,'참가 취소');assert.deepEqual(cancelled.preparation,[]);
 const pending=resolveManager({...base,payment:{state:'SUCCEEDED'}});assert.equal(pending.label,'참가권 발급 중');assert.doesNotMatch(pending.primaryAction.href,/resumePayment/);
});
test('history keeps participations without memorials and scopes both sources to the owner',()=>{
 const account={id:'me',linked:true},rows=[{id:'a',ownerUserId:'me',eventDate:'2030-01-01'},{id:'b',ownerUserId:'me',eventDate:'2029-01-01'},{id:'other',ownerUserId:'other'}];
 const items=[{id:'m',participationId:'a',ownerUserId:'me',publishStatus:'PUBLISHED',visibility:'PRIVATE'}];
 const result=historyRows(rows,items,account);assert.equal(result.length,2);assert.equal(result[0].memorial.id,'m');assert.equal(result[1].memorial,null);
 assert.deepEqual(historyRows(rows,items,{...account,linked:false}),[]);
});
test('history adapter returns owner participation even when no public memorial was created',()=>{
 const fixture=require('../../data/fixtures/memorial-event.json'),participant=fixture.participations[35];
 const repo=new MockParticipateRepository({account:{linked:true,id:participant.userId}});
 assert.equal(repo.getParticipationHistory()[0].id,participant.id);
 assert.equal(fixture.memorials.some(m=>m.participationId===participant.id),false);
 repo.setAccount({linked:false,id:participant.userId});assert.deepEqual(repo.getParticipationHistory(),[]);
});
test('context does not disclose guest or other-user participation history',async()=>{
 const guest=await handleParticipateRequest('context',{scenario:'guest',account:{linked:false}});assert.deepEqual(guest.pastParticipations,[]);
 const linked=await handleParticipateRequest('context',{scenario:'logged-in-no-application',account:{linked:true,provider:'google'}});assert.ok(linked.pastParticipations.length);assert.ok(linked.pastParticipations.every(p=>p.ownerUserId===linked.account.id));
});
