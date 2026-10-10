const test=require('node:test'),assert=require('node:assert/strict');
const solar=require('../../web/shared/solar-times'),{reviewSchedule}=require('../../web/shared/event-rules');
const start={id:'gangneung',lat:37.763999,lng:128.954032},finish={id:'daecheon',lat:36.3115,lng:126.5075};
const clock=iso=>new Date(iso).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false});
const event=date=>({id:'sample',configVersion:1,eventStartAt:date+'T06:00:00+09:00',eventEndAt:date+'T21:00:00+09:00',timezone:'Asia/Seoul',sunlightMode:'CALCULATED_MOCK'});

test('spring and autumn mock daylight approximations stay near the independent KASI example times',()=>{
 // KASI calculation examples supplied in QA; NOAA approximations are not an almanac lookup.
 for(const [date,rise,set]of [['2027-04-17','05:47','19:09'],['2027-10-16','06:33','17:58']]){
  const value=solar.windowFor(event(date),start,finish),minutes=text=>Number(text.slice(0,2))*60+Number(text.slice(3));
  assert.equal(value.state,'CALCULATED_MOCK');assert.ok(Math.abs(minutes(clock(value.sunriseAt))-minutes(rise))<=3);assert.ok(Math.abs(minutes(clock(value.sunsetAt))-minutes(set))<=3);
  assert.match(value.sourceUrl,/noaa/);assert.equal(solar.calculate({date,lat:91,lng:126}),null);assert.equal(solar.calculate({date:'2027-02-30',...start}),null);
  assert.equal(solar.calculate({date,...start,timezone:'invalid/timezone'}),null);
 }
});

test('schedule retains simultaneous early and late conditions and explicitly labels a next-day arrival',()=>{
 const value=reviewSchedule({event:event('2027-10-16'),start,finish,departureTime:'05:00',breakMinutes:'180',drivingSeconds:20*3600});
 assert.equal(value.state,'EARLY_LATE');assert.equal(value.warnings.length,2);assert.match(value.label,/출발 가능 시각 전/);assert.match(value.label,/늦습니다/);assert.match(value.arrivalLabel,/다음 날 04:00/);assert.ok(value.remainingMinutes<0);
 const budget=reviewSchedule({event:event('2027-10-16'),start,finish,departureTime:'07:00',breakMinutes:'120',drivingSeconds:0});
 assert.equal(budget.drivingBudgetSeconds,(Date.parse(budget.deadlineAt)-Date.parse(budget.departureAt))/1000-7200);assert.ok(Date.parse(budget.deadlineAt)<Date.parse(event('2027-10-16').eventEndAt));
});

test('reviewed daylight records invalidate when the event date, coordinates or configuration change',()=>{
 const e=event('2027-10-16'),data={eventId:e.id,date:'2027-10-16',timezone:e.timezone,configVersion:1,verification:'REVIEWED',sourceUrl:'https://astro.kasi.re.kr/kor/life/pageView/9',calculationVersion:'reviewed-fixture',starts:[{...start,locationId:start.id,sunriseAt:'2027-10-15T21:33:00.000Z'}],finish:{...finish,locationId:finish.id,sunsetAt:'2027-10-16T08:58:00.000Z'}};
 e.sunlight=data;assert.equal(solar.windowFor(e,start,finish).state,'REVIEWED');
 for(const changed of [{...e,configVersion:2},{...e,eventStartAt:'2027-10-17T06:00:00+09:00'}])assert.equal(solar.windowFor(changed,start,finish).state,'STALE');
 assert.equal(solar.windowFor(e,{...start,lat:start.lat+.001},finish).state,'STALE');
 assert.equal(solar.windowFor({...e,configVersion:undefined},start,finish).state,'STALE');
 assert.equal(solar.windowFor({...e,sunlight:{...data,finish:{...data.finish,sunsetAt:'2027-10-16T17:58'}}},start,finish).state,'STALE');
 assert.equal(reviewSchedule({event:{...e,configVersion:2},start,finish,departureTime:'07:00',breakMinutes:'0',drivingSeconds:3600}).state,'UNAVAILABLE');
});

test('location-specific daylight and mock metadata survive the context adapter without changing stored route format',async()=>{
 const {handleParticipateRequest}=require('../../server/participate/request-handler');
 const value=await handleParticipateRequest('context',{scenario:'guest',account:{linked:false}});
 assert.equal(value.event.sunlightMode,'CALCULATED_MOCK');assert.ok(value.event.configVersion);assert.equal(value.event.sunlight,null);
 const snap=value.mockSnapshot;snap.event.eventStartAt='2027-10-16T06:00:00+09:00';snap.event.eventEndAt='2027-10-16T21:00:00+09:00';
 const updated=await handleParticipateRequest('context',{snapshot:snap,account:{linked:false}}),window=solar.windowFor(updated.event,start,finish);assert.match(window.sunriseAt,/2027-10-15/);assert.equal(window.state,'CALCULATED_MOCK');
});
