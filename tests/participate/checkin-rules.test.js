const test=require('node:test');
const assert=require('node:assert/strict');
const {minimumSpotCheckins,checkinRequirement}=require('../../web/shared/checkin-rules');
const endpoints={startId:'start',finishId:'finish'};
const visit=(id,role='SPOT',validationStatus='VALIDATED')=>({locationId:id,role,validationStatus});
const journey=n=>[visit('start','START'),...Array.from({length:n},(_,i)=>visit('spot-'+i)),visit('finish','FINISH')];

test('default completion count requires ten intermediate check-ins plus both endpoints',()=>{
  assert.equal(minimumSpotCheckins(),10);
  const tooShort=checkinRequirement({},journey(9),endpoints);
  assert.equal(tooShort.met,false);assert.equal(tooShort.totalCheckins,11);
  assert.deepEqual(checkinRequirement({},journey(10),endpoints),{minimumSpotCheckins:10,spotCount:10,totalCheckins:12,hasStart:true,hasFinish:true,met:true});
  assert.equal(checkinRequirement({},journey(11),endpoints).met,true);
});
test('each event supplies its own minimum and rejects malformed configuration',()=>{
  assert.equal(checkinRequirement({minimumSpotCheckins:3},journey(3),endpoints).met,true);
  assert.equal(checkinRequirement({minimumSpotCheckins:12},journey(11),endpoints).met,false);
  assert.equal(checkinRequirement({minimumSpotCheckins:12},journey(12),endpoints).totalCheckins,14);
  for(const value of [0,-1,1.5,'10',NaN,Infinity])assert.throws(()=>minimumSpotCheckins({minimumSpotCheckins:value}),/정수/);
});
test('duplicates, endpoints, pending evidence and visits outside the run never satisfy the minimum',()=>{
  const visits=journey(9);
  visits.splice(1,0,visit('spot-0'),visit('start'),visit('finish'),visit('pending','SPOT','PENDING'),visit('rejected','SPOT','REJECTED'));
  visits.unshift(visit('before-start'));
  visits.push(visit('after-finish'));
  const result=checkinRequirement({},visits,endpoints);
  assert.equal(result.spotCount,9);assert.equal(result.met,false);
  assert.equal(checkinRequirement({},journey(10).slice(1),endpoints).met,false);
  assert.equal(checkinRequirement({},journey(10).slice(0,-1),endpoints).met,false);
  assert.equal(checkinRequirement({},journey(10),{...endpoints,finishId:'wrong'}).met,false);
});
test('simulated check-ins are accepted only for explicitly synthetic events',()=>{
  const visits=journey(10).map(v=>({...v,validationStatus:'SIMULATED'}));
  assert.equal(checkinRequirement({},visits,endpoints).met,false);
  assert.equal(checkinRequirement({synthetic:true},visits,endpoints).met,true);
});
