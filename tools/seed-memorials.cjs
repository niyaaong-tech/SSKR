/* Build the synthetic May event and its public DTO from existing catalog locations.
 * node tools/seed-memorials.cjs [--minimum-spots=10] [--refresh-routes]
 * Uses the shared, access-filtered motorcycle road dataset by default.
 * --refresh-routes explicitly queries the public router instead.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const catalog = require('../web/app/spot-catalog');
const planner = require('../web/app/route-plan');
const rules = require('../web/shared/checkin-rules');
const routeProvider = require('../web/app/route-provider');
const root = path.resolve(__dirname, '..');
const routeDir = path.join(root, 'web/app/data/routes');
const eventId = 'sskr-2026-may';
const date = '2026-05-23';
const byId = new Map(catalog.map(p => [p.id, p]));
const minimumArg = process.argv.find(arg => arg.startsWith('--minimum-spots='));
const minimum = rules.minimumSpotCheckins(minimumArg ? {minimumSpotCheckins:Number(minimumArg.split('=')[1])} : {});
const localProvider = routeProvider.create({fetcher:async url => new Response(fs.readFileSync(path.join(root,url)))});
const endpoint = 'https://valhalla1.openstreetmap.de/route';
const costing = { use_highways: 0, use_tolls: 0, use_ferry: 0, exclude_highways: true, exclude_tolls: true, exclude_ferries: true, exclude_unpaved: true, top_speed: 80, ignore_access: false, ignore_oneways: false, ignore_restrictions: false };
const plans = [
  [
    "gangneung",
    "daegwallyeong cheongpung munui",
    "노을수집가",
    "능선에서 금강을 따라"
  ],
  [
    "gangneung",
    "auraji seondol sanmagi seongjusa",
    "느긋한스로틀",
    "아우라지에서 시작한 긴 우회"
  ],
  [
    "gangneung",
    "daegwallyeong dodam sujupalbong magoksa seongjusa",
    "바람한칸",
    "삼봉과 팔봉 사이의 하루"
  ],
  [
    "gangneung",
    "jeongseon-market seondol cheongnyeongpo yeongwol-market munui gongsanseong",
    "국도산책",
    "시장과 강변을 잇는 길"
  ],
  [
    "gangneung",
    "daegwallyeong uirim-forest uirim-museum jecheon-market goesan-market cheonjangho seongjusa",
    "고갯길커피",
    "고개 너머 잠깐의 커피"
  ],
  [
    "gangneung",
    "seondol cheongnyeongpo yeongwol-market dodam danyang-market sainam munui seongjusa",
    "기어한단",
    "영월에서 단양으로"
  ],
  [
    "samcheok",
    "jukseoru seondol cheongnyeongpo yeongwol-market dodam danyang-market munui gongsanseong seongjusa",
    "동쪽바람",
    "삼척을 떠나 서쪽으로"
  ],
  [
    "samcheok",
    "cheongnyeongpo yeongwol-market dodam danyang-market cheongpung munui gongsanseong gongju-market baekje seongjusa",
    "호수옆라이더",
    "호숫가에 잠깐 세운 바이크"
  ],
  [
    "samcheok",
    "cheongnyeongpo yeongwol-market dodam danyang-market sainam munui gongsanseong gongju-market baekje seongjusa daecheon-market",
    "소금바람",
    "시장과 강변의 작은 정차"
  ],
  [
    "samcheok",
    "cheongnyeongpo yeongwol-market dodam danyang-market sainam munui gongsanseong gongju-market baekje gungnamji seongjusa daecheon-market",
    "정차하는곰",
    "열두 번 멈추고 만난 바다"
  ],
  [
    "samcheok",
    "cheongnyeongpo gaeun baekje",
    "커브의온도",
    "옛 역에서 쉬어 간 여정"
  ],
  [
    "samcheok",
    "seondol uirim-museum munui seongjusa",
    "파도한모금",
    "내륙의 물길을 찾아서"
  ],
  [
    "uljin",
    "buryeongsa daksil museom maltijae baekje",
    "숲길거북",
    "불영계곡을 넘어 무섬으로"
  ],
  [
    "uljin",
    "buncheon sosu yeongju-market gaeun munui seongjusa",
    "두바퀴쉼표",
    "분천역에서 남긴 메모"
  ],
  [
    "uljin",
    "buryeongsa daksil yeongju-market museom hoeryongpo gongsanseong seongjusa",
    "강변오후",
    "회룡포를 돌아 대천까지"
  ],
  [
    "uljin",
    "daksil yeongju-market museom mungyeong gaeun munui cheonjangho seongjusa",
    "길위의감자",
    "문경에서 만난 다른 라이더"
  ],
  [
    "uljin",
    "buryeongsa sosu yeongju-market museom hoeryongpo gyeongcheondae munui baekje seongjusa",
    "산너머도토리",
    "계곡과 강 사이의 국도"
  ],
  [
    "uljin",
    "buryeongsa daksil yeongju-market museom hoeryongpo gaeun munui gongsanseong gongju-market seongjusa",
    "작은배기음",
    "작은 역과 마을의 하루"
  ],
  [
    "yeongdeok",
    "gyeongcheondae maltijae ojanghwan munui gongsanseong gongju-market baekje gungnamji muryangsa seongjusa daecheon-market",
    "구름기어",
    "상주에서 강변과 시장을 거쳐"
  ],
  [
    "yeongdeok",
    "gyeongcheondae rpm-moto maltijae ojanghwan munui gongsanseong gongju-market baekje gungnamji muryangsa seongjusa daecheon-market",
    "느린번개",
    "열두 스팟을 이은 토요일"
  ],
  [
    "yeongdeok",
    "baekseoktan hwabon baekje",
    "먼지묻은부츠",
    "화본역에서 남긴 사진"
  ],
  [
    "yeongdeok",
    "gyeongcheondae maltijae munui cheonjangho",
    "말티재참새",
    "말티재에서 길을 고르다"
  ],
  [
    "yeongdeok",
    "hahoe gaeun munui magoksa seongjusa",
    "서쪽행고양이",
    "서두르지 않고 넘어온 내륙"
  ],
  [
    "yeongdeok",
    "baekseoktan gyeongcheondae wollyubong gongsanseong gongju-market seongjusa",
    "물안개스로틀",
    "돌과 물이 만든 풍경"
  ],
  [
    "gyeongju",
    "imgo hwabon jikjisa wollyubong baekje gungnamji seongjusa",
    "오늘도국도",
    "경주에서 백제의 길로"
  ],
  [
    "gyeongju",
    "imgo geojosa hwabon jikjisa wollyubong baekje gungnamji seongjusa",
    "언덕위헬멧",
    "영천과 김천 사이에서"
  ],
  [
    "gyeongju",
    "imgo hwabon jikjisa wollyubong baekje gungnamji muryangsa seongjusa daecheon-market",
    "도로나무",
    "남쪽 국도로 건넌 한반도"
  ],
  [
    "gyeongju",
    "imgo hwabon jikjisa wollyubong baekje gungnamji seongjusa daecheon-market",
    "반클러치",
    "화본역 이후에는 서쪽으로"
  ],
  [
    "gyeongju",
    "imgo jikjisa wollyubong munui gongsanseong gongju-market seongjusa",
    "노을까지한바퀴",
    "월류봉 아래 짧은 휴식"
  ],
  [
    "gyeongju",
    "imgo jikjisa wollyubong munui gongsanseong gongju-market baekje seongjusa daecheon-market",
    "마지막주유",
    "마지막 정차는 대천항"
  ]
].map(([start,via,name,title],i)=>({id:i+1,start,places:[start,...via.split(' '),'daecheon'],name,title}));
const photoModel = require('../web/app/memorial-store');
function decode(str) { let i=0,lat=0,lon=0,out=[]; while(i<str.length){ const read=()=>{let n=0,s=0,b;do{b=str.charCodeAt(i++)-63;n|=(b&31)<<s;s+=5;}while(b>=32);return n&1?~(n>>1):n>>1;};lat+=read();lon+=read();out.push([lon/1e6,lat/1e6]);} return out; }
function distance(a,b) {const r=Math.PI/180,dl=(b[1]-a[1])*r,dn=(b[0]-a[0])*r;return 6371000*2*Math.asin(Math.min(1,Math.sqrt(Math.sin(dl/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dn/2)**2)));}
function iso(seconds) {return new Date(Date.parse(date+'T00:00:00+09:00')+seconds*1000).toISOString();}
function visitNote(plan,index,place){
  if(index===0)return ['바다를 한 번 더 보고 출발했습니다. 오늘은 서두르지 않고 길을 고르기로 했습니다.','헬멧을 쓰기 전, 파도 소리를 잠깐 들었습니다. 아직 조용한 아침이 좋았습니다.','짐과 타이어를 확인하고 출발했습니다. 오늘 남기고 싶은 장면들을 생각했습니다.'][plan.id%3];
  if(index===plan.places.length-1)return ['마지막 바다 앞에 바이크를 세웠습니다. 달린 거리보다 쉬어 갔던 풍경들이 먼저 떠올랐습니다.','서해에 닿으니 하루가 제법 길었다는 생각이 들었습니다. 오늘 찍은 사진을 천천히 다시 보고 싶습니다.','장갑을 벗고 잠시 앉았습니다. 출발할 때와는 다른 바다를 보고 있으니 하루가 실감났습니다.'][plan.id%3];
  const notes=place.category==='food'?['바이크를 세우고 따뜻한 식사를 했습니다. 다음 구간은 조금 여유 있게 달리기로 했습니다.','늦지 않게 식사를 마치고 물을 채웠습니다. 쉬고 나니 오후 길이 한결 가벼웠습니다.','밥을 먹는 동안 사진 몇 장을 골랐습니다. 잠깐의 식사도 오늘 기록에 남겨 둡니다.']:place.category==='cafe'?['커피 한 잔을 놓고 다음 길을 살펴봤습니다. 잠시 앉아 있는 시간이 반가웠습니다.','헬멧을 내려놓고 쉬었습니다. 다시 출발하기 전에 물을 충분히 마셨습니다.','사진을 정리하며 커피를 마셨습니다. 지도에서 보던 장소에 직접 와 있는 기분이 좋았습니다.']:['바이크를 세우고 가까운 풍경을 둘러봤습니다. 사진으로는 담기지 않는 바람도 기억해 두고 싶습니다.','다음 구간으로 가기 전에 잠시 걸었습니다. 달릴 때 놓쳤던 풍경이 천천히 보였습니다.','눈에 들어온 풍경 앞에서 사진을 남겼습니다. 오늘 길을 다시 떠올릴 때 좋은 표지가 될 것 같습니다.','잠시 엔진을 끄고 쉬었습니다. 움직이지 않는 시간이 있어서 다음 길도 즐거웠습니다.','길에서 보던 모습과 멈춰서 보는 모습이 달랐습니다. 조금 더 머물고 싶은 곳이었습니다.','계획해 둔 길을 다시 확인하고 출발했습니다. 이 자리에서 본 풍경은 사진과 함께 남깁니다.'];
  return notes[(plan.id+index)%notes.length];
}
function storySummary(plan,visited){return visited[0].name+'부터 서해까지, '+['높은 길과 물가를 번갈아 만난 하루입니다.','쉬어 갈 자리를 찾아 조금 돌아갔습니다.','작은 정차마다 다른 풍경을 담았습니다.','사진을 남기고 싶었던 장소들을 이어 봤습니다.','한적한 길을 고르고, 쉬는 시간도 충분히 뒀습니다.','길을 따라 만난 장소와 기분을 기록했습니다.'][plan.id%6]+' '+visited.slice(1,3).map(p=>p.name).join('와 ')+'에서 남긴 장면을 모았습니다.';}
function save(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value));}
function encode(coordinates){let lat=0,lng=0,out='';const emit=value=>{let n=value<0?~(value<<1):value<<1;while(n>=32){out+=String.fromCharCode((32|(n&31))+63);n>>>=5;}out+=String.fromCharCode(n+63);};for(const p of coordinates){const a=Math.round(p[0]*1e6),b=Math.round(p[1]*1e6);emit(a-lat);emit(b-lng);lat=a;lng=b;}return out;}
const generatedPaths=new Set();
function preparePlan(plan){
  const stopIds=plan.places.slice(1,-1).filter(id=>byId.get(id)?.kind==='spot');
  const selected=planner.optimize({...planner.createEmpty(catalog),startId:plan.start,stopIds},localProvider);
  let ordered;
  for(let attempt=0;attempt<50;attempt++){
    const filled=planner.autoFill(selected,catalog,localProvider,{variant:plan.id+attempt*plans.length,event:{minimumSpotCheckins:minimum+(plan.id-1)%3}});
    ordered=planner.optimize(filled,localProvider);
    const signature=planner.orderedIds(ordered).join(',');
    if(!generatedPaths.has(signature)){generatedPaths.add(signature);break;}
    if(attempt===49)throw Error('Duplicate planned journey '+plan.id);
  }
  if(!planner.status(ordered,catalog,localProvider,{minimumSpotCheckins:minimum}).complete)throw Error('Incomplete planned check-ins '+plan.id);
  plan.places=planner.orderedIds(ordered);
  // Titles must not advertise removed places that the rebuilt journey no longer visits.
  if(plan.id===13)plan.title='울진을 떠나 내륙의 마을로';
  if(plan.id===15)plan.title='강변과 시장을 돌아 대천까지';
  if(plan.id===22)plan.title='고개를 넘고 다음 길을 고르다';
  if(plan.id===30)plan.title='마지막 정차 뒤에 만난 바다';
}
function payload(plan){return {locations:plan.places.map(id=>{const p=byId.get(id);if(!p)throw Error('Missing '+id);return {lat:p.lat,lon:p.lng,type:'break',search_cutoff:1500,search_filter:{max_road_class:'primary',exclude_toll:true,exclude_ferry:true}};}),costing:'motorcycle',costing_options:{motorcycle:costing},directions_options:{units:'kilometers',language:'en-US'}};}
async function route(plan){
  const request=payload(plan),requestHash=crypto.createHash('sha256').update(JSON.stringify(request)).digest('hex');
  if(!process.argv.includes('--refresh-routes')){
    const road=await localProvider.route(plan.places),manifest=localProvider.manifest;
    if(!road.valid)throw Error('Missing motorcycle road '+plan.id);
    const whole=road.legs.flatMap(leg=>leg.coordinates);
    return {id:'run-'+String(plan.id).padStart(3,'0'),eventId,synthetic:true,provenance:{provider:'Valhalla',source:'OpenStreetMap',endpoint:'local shared motorcycle road dataset',routingVersion:manifest.version,policyVersion:manifest.policyVersion,roadSource:manifest.source,requestHash,request,license:'ODbL-1.0',attribution:'© OpenStreetMap contributors',isRecordedGPS:false,historicalRoadSnapshot:false,timestampMethod:'simulated travel time distributed over real road geometry; no recorded GPS'},summary:{length:road.distanceMeters/1000,time:road.durationSeconds,has_highway:false,has_toll:false,has_ferry:false,min_lat:Math.min(...whole.map(p=>p[0])),max_lat:Math.max(...whole.map(p=>p[0])),min_lon:Math.min(...whole.map(p=>p[1])),max_lon:Math.max(...whole.map(p=>p[1]))},legs:road.legs.map((leg,i)=>({id:'leg-'+plan.id+'-'+(i+1),fromLocationId:leg.fromId,toLocationId:leg.toId,shape:encode(leg.coordinates),shapePrecision:6,distanceMeters:leg.distanceMeters,routingDurationSeconds:leg.durationSeconds,roadNames:[],maneuvers:[],validation:{hasHighway:false,hasToll:false,hasFerry:false,policyVersion:manifest.policyVersion}}))};
  }
  // The public router accepts ten locations per request. Overlap the boundary
  // location and retain every request; each chunk still yields real road legs.
  const trips=[],requests=[];
  for(let offset=0;offset<request.locations.length-1;offset+=9){
    const part={...request,locations:request.locations.slice(offset,offset+10)};
    requests.push(part);
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-Client-Id':'SSKR-synthetic-fixture','User-Agent':'SSKR-synthetic-fixture/1.0'},body:JSON.stringify(part),signal:AbortSignal.timeout(55000)});
    if(!response.ok)throw Error('Routing '+response.status+' '+await response.text());
    const raw=await response.json();if(raw.trip?.status!==0)throw Error('Incomplete chunk '+plan.id);
    trips.push(raw.trip);
    await new Promise(r=>setTimeout(r,1200));
  }
  const trip={status:0,legs:trips.flatMap(t=>t.legs),summary:{...trips[0].summary,length:trips.reduce((n,t)=>n+t.summary.length,0),time:trips.reduce((n,t)=>n+t.summary.time,0),has_highway:trips.some(t=>t.summary.has_highway),has_toll:trips.some(t=>t.summary.has_toll),has_ferry:trips.some(t=>t.summary.has_ferry),min_lat:Math.min(...trips.map(t=>t.summary.min_lat)),max_lat:Math.max(...trips.map(t=>t.summary.max_lat)),min_lon:Math.min(...trips.map(t=>t.summary.min_lon)),max_lon:Math.max(...trips.map(t=>t.summary.max_lon))}};
  if(!trip||trip.status!==0||trip.legs.length!==plan.places.length-1)throw Error('Incomplete route '+plan.id);
  if(trip.summary.has_highway||trip.summary.has_toll||trip.summary.has_ferry)throw Error('Excluded roads in route '+plan.id);
  const record={id:'run-'+String(plan.id).padStart(3,'0'),eventId,synthetic:true,provenance:{provider:'Valhalla',source:'OpenStreetMap',endpoint,queriedAt:new Date().toISOString(),requestHash,request,requests,license:'ODbL-1.0',attribution:'© OpenStreetMap contributors',isRecordedGPS:false,historicalRoadSnapshot:false},summary:trip.summary,legs:trip.legs.map((leg,i)=>({id:'leg-'+plan.id+'-'+(i+1),fromLocationId:plan.places[i],toLocationId:plan.places[i+1],shape:leg.shape,shapePrecision:6,distanceMeters:Math.round(leg.summary.length*1000),routingDurationSeconds:Math.round(leg.summary.time),roadNames:[...new Set(leg.maneuvers.flatMap(m=>m.street_names||[]))],maneuvers:leg.maneuvers.map(m=>({beginShapeIndex:m.begin_shape_index,endShapeIndex:m.end_shape_index,durationSeconds:m.time,distanceMeters:Math.round(m.length*1000),roadNames:m.street_names||[],instruction:m.instruction})),validation:{hasHighway:leg.summary.has_highway,hasToll:leg.summary.has_toll,hasFerry:leg.summary.has_ferry}}))};
  await new Promise(r=>setTimeout(r,1200));
  return record;
}
function timetable(record,plan){
  const start=5*3600+15*60+(plan.id%6)*60;
  let time=start,km=0;
  const visits=[];
  const count=record.legs.length;
  const totalDrive=record.legs.reduce((n,l)=>n+l.routingDurationSeconds,0);
  // Keep routing travel times intact. If the itinerary exceeds daylight it must be redesigned.
  const pauseBudget=(19*3600+30*60)-start-totalDrive;
  if(pauseBudget<(count-1)*8*60)throw Error('Itinerary too long '+plan.id+' drive='+Math.round(totalDrive/60)+'min');
  const stops=plan.places.slice(1,-1).map((id,i)=>{const p=byId.get(id),snap=distance([p.lng,p.lat],decode(record.legs[i].shape).at(-1));return {id,minutes:Math.max(i===Math.floor((count-1)/2)?18:8,8+Math.ceil(snap*2/70))};});
  let remaining=Math.floor(pauseBudget/60)-stops.reduce((n,s)=>n+s.minutes,0);
  if(remaining<0)throw Error('Insufficient stop / walking time '+plan.id);
  for(const stop of stops){const extra=Math.min(remaining,10);stop.minutes+=extra;remaining-=extra;}
  function visit(i,arrived,departed,coord){const p=byId.get(plan.places[i]);const snap=distance([p.lng,p.lat],coord);if(snap>1500)throw Error('Location snapping >1.5km '+p.id);return {id:'checkin-'+plan.id+'-'+i,runSessionId:record.id,eventLocationId:eventId+':'+p.id,locationId:p.id,sequence:i,role:p.kind.toUpperCase(),arrivedAt:iso(arrived),departedAt:iso(departed),durationSeconds:departed-arrived,cumulativeDistanceMeters:km,coordinate:coord,catalogCoordinate:[p.lng,p.lat],snapDistanceMeters:Math.round(snap),coordinateMethod:'routed-road-access-point',validationStatus:'SIMULATED',note:visitNote(plan,i,p)};}
  visits.push(visit(0,time,time,decode(record.legs[0].shape)[0]));
  record.legs.forEach((leg,i)=>{
    const points=decode(leg.shape),cum=[0];for(let j=1;j<points.length;j++)cum.push(cum[j-1]+distance(points[j-1],points[j]));
    leg.fromVisitId='checkin-'+plan.id+'-'+i;leg.toVisitId='checkin-'+plan.id+'-'+(i+1);
    leg.startedAt=iso(time);leg.durationSeconds=leg.routingDurationSeconds;
    // Seconds are attached to every road-geometry vertex; pauses are represented by check-ins.
    leg.elapsedSeconds=cum.map(d=>Math.round(d/cum.at(-1)*leg.durationSeconds*1000)/1000);
    const maneuverTotal=leg.maneuvers.reduce((n,m)=>n+m.durationSeconds,0);
    let elapsed=0;
    for(const m of leg.maneuvers){const first=m.beginShapeIndex,last=m.endShapeIndex,span=cum[last]-cum[first];if(span>0)for(let j=first;j<=last;j++)leg.elapsedSeconds[j]=Math.round((elapsed+(cum[j]-cum[first])/span*m.durationSeconds)/maneuverTotal*leg.durationSeconds*1000)/1000;elapsed+=m.durationSeconds;}
    leg.elapsedSeconds[0]=0;leg.elapsedSeconds[leg.elapsedSeconds.length-1]=leg.durationSeconds;
    time+=leg.durationSeconds;leg.endedAt=iso(time);km+=leg.distanceMeters;
    const pause=stops[i]?stops[i].minutes*60:0;
    visits.push(visit(i+1,time,time+pause,points.at(-1)));time+=pause;
  });
  record.visits=visits;record.startedAt=iso(start);record.finishedAt=visits.at(-1).arrivedAt;
  record.distanceMeters=km;record.movingSeconds=totalDrive;record.stoppedSeconds=stops.reduce((n,s)=>n+s.minutes*60,0);record.elapsedSeconds=totalDrive+record.stoppedSeconds;
  record.sampleCount=record.legs.reduce((n,l)=>n+decode(l.shape).length,0);
  const whole=record.legs.flatMap(l=>decode(l.shape));
  record.previewCoordinates=whole.filter((_,i)=>i%Math.max(1,Math.floor(whole.length/160))===0);record.previewCoordinates.push(whole.at(-1));
  return record;
}
async function main(){
  await localProvider.ready();
  if(localProvider.manifest.policyVersion!=='kr-motorcycle-1')throw Error('Unverified motorcycle road policy');
  const routes=[],failures=[];
  for(const plan of plans){try{preparePlan(plan);const routed=await route(plan);const record=timetable(routed,plan);const counted=rules.checkinRequirement({synthetic:true,minimumSpotCheckins:minimum},record.visits,{startId:plan.start,finishId:'daecheon'});if(!counted.met)throw Error('Missing required check-ins '+plan.id);routes.push(record);console.log('route '+plan.id+'/30 '+counted.spotCount+' spots '+Math.round(record.distanceMeters/1000)+'km '+Math.round(record.movingSeconds/60)+'min');}catch(error){console.error('route '+plan.id+': '+error.message);failures.push(plan.id);}}
  if(failures.length)throw Error('Redesign itineraries: '+failures.join(','));
  const event={id:eventId,publicTitle:'SSKR 2026 · 5월',minimumSpotCheckins:minimum,timezone:'Asia/Seoul',startsAt:iso(5*3600),endsAt:iso(20*3600),status:'COMPLETED',synthetic:true,participantCount:200,publishedMemorialCount:30,finishLocationId:'daecheon',startLocationIds:plans.filter((_,i)=>i%6===0).map(p=>p.start)};
  const tiers=[{id:eventId+'-early',eventId,code:'EARLY',label:'얼리',amount:50000,currency:'KRW',quantity:50},{id:eventId+'-standard',eventId,code:'STANDARD',label:'표준',amount:100000,currency:'KRW',quantity:120},{id:eventId+'-vip',eventId,code:'PLATINUM',label:'VIP',amount:200000,currency:'KRW',quantity:30}];
  const users=[],applications=[],payments=[],participations=[];
  for(let i=0;i<200;i++){
    const id=i===0?'mock-rider-0271':'fixture-rider-'+String(i+1).padStart(3,'0'),tier=tiers[i%20<5?0:i%20<17?1:2];
    const applicationId='application-'+eventId+'-'+(i+1),paymentId='payment-'+eventId+'-'+(i+1),participationId='participation-'+eventId+'-'+(i+1);
    const createdAt=new Date(Date.UTC(2026,tier.code==='EARLY'?2:3,1+Math.floor(i/10),1,i%60)).toISOString();
    users.push({id,displayName:plans[i]?.name||['새벽','은빛','산길','바다','구름','초록','느긋한','작은','봄날','별빛'][Math.floor((i-30)/17)] + ['고래','참새','바퀴','토끼','산책','여우','오리','나침반','물결','엔진','달팽이','쉼표','행자','바람','곰','도토리','유랑'][((i-30)%17)],synthetic:true});
    applications.push({id:applicationId,eventId,userId:id,tierId:tier.id,state:'COMPLETED',submittedAt:createdAt});
    payments.push({id:paymentId,applicationId,amount:tier.amount,currency:'KRW',state:'SUCCEEDED',provider:'SYNTHETIC',idempotencyKey:'fixture-'+paymentId,paidAt:createdAt});
    participations.push({id:participationId,eventId,userId:id,applicationId,paymentId,priceTierId:tier.id,state:'ACTIVE',slotAllocation:'CONFIRMED',participantNumber:'#'+String(i+1).padStart(4,'0'),startLocationId:plans[i]?.start||event.startLocationIds[i%5],runResult:i<30?'COMPLETED':null,runDataStatus:i<30?'SYNTHETIC_RECORDED':'OUTSIDE_FIXTURE_SCOPE'});
  }
  // Media assets and visit-media links remain separate from the physical place.
  // These simulate uploads using locally available catalog photos, never measured rider evidence.
  const mediaAssets=[],visitMedia=[];
  const placeMedia=new Map();
  for(const p of catalog){if(!p.image)continue;const asset={id:'place-photo-'+p.id,locationId:p.id,ownerUserId:null,kind:'IMAGE',url:p.image,sourceKind:'PLACE_REFERENCE',status:'READY',moderationStatus:'APPROVED',visibility:'PUBLIC',altText:p.name,credit:p.photoCredit||'장소 자료',sourceUrl:p.source,synthetic:false};mediaAssets.push(asset);placeMedia.set(p.id,asset);}
  routes.forEach((run,i)=>{
    run.schemaVersion=2;
    run.visits.forEach((v,j)=>{
      v.synthetic=true;v.checkinMethod='SIMULATED';v.visibility='PUBLIC';v.photoConsent=true;
      const reference=placeMedia.get(v.locationId);
      if(i%5!==4 && j>0 && j<run.visits.length-1 && (j+i)%3===0 && reference?.url.startsWith('/') && fs.existsSync(path.join(root,reference.url))){
        const asset={...reference,id:'upload-'+run.id+'-'+j,ownerUserId:users[i].id,sourceKind:'USER_UPLOAD',capturedAt:v.arrivedAt,uploadedAt:new Date(Date.parse(v.arrivedAt)+60000).toISOString(),caption:byId.get(v.locationId).name+'에서 잠시 쉬어 갔습니다.',synthetic:true,originalSourceKind:'PLACE_REFERENCE'};
        mediaAssets.push(asset);visitMedia.push({id:'visit-media-'+asset.id,visitId:v.id,mediaAssetId:asset.id,sortOrder:0,isFeatured:true});
      }
    });
  });
  const assetById=new Map(mediaAssets.map(a=>[a.id,a]));
  const publicVisit=v=>({...v,placePhoto:placeMedia.get(v.locationId)||null,media:visitMedia.filter(l=>l.visitId===v.id && v.photoConsent).map(l=>({...assetById.get(l.mediaAssetId),sortOrder:l.sortOrder})).filter(photoModel.isPublicPhoto)});
  const memorials=plans.map((plan,i)=>{
    const run=routes[i],participant=participations[i],visited=plan.places.map(id=>byId.get(id)),visits=run.visits.map(publicVisit);
    const cover=photoModel.selectCover(visits);
    return {id:'memorial-'+eventId+'-'+String(i+1).padStart(3,'0'),ownerUserId:users[i].id,participationId:participant.id,eventId,eventTitle:event.publicTitle,publishStatus:'PUBLISHED',visibility:'PUBLIC',publicSlug:'may-journey-'+String(i+1).padStart(3,'0'),createdAt:run.finishedAt,publishedAt:new Date(Date.parse(run.finishedAt)+(i+1)*3600000).toISOString(),title:plan.title,ownerName:users[i].displayName,summary:storySummary(plan,visited),image:cover?.photo.url||'',coverLocationId:cover?.visit.locationId,coverVisitId:cover?.visit.id,coverMediaAssetId:cover?.photo.id,photoCredit:cover?.photo.credit,photoSource:cover?.photo.sourceUrl,photoType:cover?.photo.sourceKind,visits,result:'완주',runSessionId:run.id,routeUrl:'/web/app/data/routes/'+run.id+'.json',participantNumber:participant.participantNumber,startLocationId:plan.start,finishLocationId:'daecheon',visitedLocationIds:plan.places,distanceMeters:run.distanceMeters,movingSeconds:run.movingSeconds,stoppedSeconds:run.stoppedSeconds,elapsedSeconds:run.elapsedSeconds,startedAt:run.startedAt,finishedAt:run.finishedAt,spotCount:plan.places.length-2,sampleCount:run.sampleCount,previewCoordinates:run.previewCoordinates,synthetic:true};
  });
  const locations=catalog.map(p=>({id:p.id,name:p.name,lat:p.lat,lon:p.lng,category:p.category,coordinateAccuracy:p.coordinateAccuracy,source:p.source,representativeMediaAssetId:placeMedia.get(p.id)?.id||null}));
  const eventLocations=catalog.map(p=>({id:eventId+':'+p.id,eventId,locationId:p.id,role:p.kind.toUpperCase(),operationalValidation:'NOT_VERIFIED',syntheticEventAssignment:true}));
  // Route files are a public projection; visit photo eligibility is resolved before writing.
  routes.forEach(run=>{const projected={...run,visits:run.visits.map(publicVisit)};delete projected.checkins;save(path.join(routeDir,run.id+'.json'),projected);});
  const dataset={schemaVersion:2,datasetKind:'SYNTHETIC_EVENT_FIXTURE',synthetic:true,event,priceTiers:tiers,users,applications,payments,participations,locations,eventLocations,mediaAssets,visitMedia,runSessions:routes.map(r=>({id:r.id,eventId,participationId:participations[Number(r.id.slice(-3))-1].id,startedAt:r.startedAt,finishedAt:r.finishedAt,distanceMeters:r.distanceMeters,movingSeconds:r.movingSeconds,stoppedSeconds:r.stoppedSeconds,trackUrl:'/web/app/data/routes/'+r.id+'.json',coordinateSource:'VALHALLA_OSM',timestampSource:'SIMULATED',sampleCount:r.sampleCount})),visits:routes.flatMap(r=>r.visits),memorials,provenance:{eventDateAssumption:date,generatedAt:new Date().toISOString(),routing:'Valhalla motorcycle / OpenStreetMap',roadDataAsOf:process.argv.includes('--refresh-routes')?'query time, not a historical May 2026 snapshot':localProvider.manifest.source.snapshot+' shared road snapshot, not historical May 2026 roads',routingVersion:process.argv.includes('--refresh-routes')?null:localProvider.version,fixtureScope:'200 paid participations, 30 public complete journeys; other 170 run results are unspecified',license:'Road geometry © OpenStreetMap contributors, ODbL-1.0',referencePhotos:'Attributed catalog photos; USER_UPLOAD rows simulate check-in uploads and preserve originalSourceKind. Not actual rider photography.',productionPromotion:'Keep synthetic flag. Reuse schema and import adapter; never relabel this fixture as measured event data.'}};
  save(path.join(root,'data/fixtures/memorial-event.json'),dataset);
  const publicData={schemaVersion:2,event,memorials};
  fs.writeFileSync(path.join(root,'web/app/data/memorial-index.js'),'/* Generated by tools/seed-memorials.cjs; synthetic event, real OSM roads. */\nwindow.SSKR_MEMORIAL_FIXTURE = '+JSON.stringify(publicData)+';\n');
  console.log(JSON.stringify({participants:participations.length,payments:payments.length,paidTotal:payments.reduce((n,p)=>n+p.amount,0),memorials:memorials.length,checkins:dataset.visits.length,samples:routes.reduce((n,r)=>n+r.sampleCount,0),distanceRange:[Math.min(...routes.map(r=>r.distanceMeters)),Math.max(...routes.map(r=>r.distanceMeters))]}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
