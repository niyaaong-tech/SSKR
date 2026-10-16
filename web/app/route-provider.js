(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SSKR_ROUTE_PROVIDER=Object.freeze(api);})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  function decode(shape){
    if(typeof shape!=='string')throw Error('경로 데이터 형식을 확인해 주세요.');
    const points=[];let index=0,lat=0,lng=0;
    function value(){let n=0,shift=0,b;do{if(index>=shape.length||shift>30)throw Error('도로 좌표가 손상되었습니다.');b=shape.charCodeAt(index++)-63;if(b<0||b>63)throw Error('도로 좌표가 손상되었습니다.');n|=(b&31)<<shift;shift+=5;}while(b>=32);return n&1?~(n>>1):n>>1;}
    while(index<shape.length){lat+=value();lng+=value();if(Math.abs(lat)>90e6||Math.abs(lng)>180e6)throw Error('도로 좌표 범위를 확인해 주세요.');points.push([lat/1e6,lng/1e6]);}
    return points;
  }
  function expandShape(legs,id,seen=new Set()){
    const leg=legs?.[id];
    if(!leg||typeof leg.shape!=='string'||seen.has(id))throw Error('저장된 도로 형식을 확인해 주세요.');
    if(leg.base===undefined)return leg.shape;
    if(typeof leg.base!=='string'||!Number.isSafeInteger(leg.prefix)||leg.prefix<0)throw Error('도로 압축 정보가 손상되었습니다.');
    seen.add(id);const base=expandShape(legs,leg.base,seen);seen.delete(id);
    if(leg.prefix>base.length)throw Error('도로 압축 정보가 손상되었습니다.');
    return base.slice(0,leg.prefix)+leg.shape;
  }
  function create({base='/web/shared/routes',supplement=null,fetcher=globalThis.fetch?.bind(globalThis)}={}){
    if(supplement)return combined(create({base,fetcher}),create({base:supplement,fetcher}));
    let manifest,loading;const rows=new Map(),pending=new Map();let indices=new Map();
    async function json(url){
      const response=await fetcher(url);if(!response.ok)throw Error('도로 데이터를 불러오지 못했습니다. 다시 시도해 주세요.');
      if(url.endsWith('.gz')){
        const bytes=new Uint8Array(await response.arrayBuffer());
        // Hosts may serve a .gz file as gzip-encoded or as an opaque asset.
        if(bytes[0]===31&&bytes[1]===139){
          if(typeof DecompressionStream==='undefined')throw Error('최신 브라우저에서 도로 경로를 확인해 주세요.');
          return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json();
        }
        return JSON.parse(new TextDecoder().decode(bytes));
      }
      return response.json();
    }
    function ready(){
      if(manifest)return Promise.resolve(manifest);
      if(!loading)loading=json(base+'/manifest.json').then(data=>{
        if(data.schemaVersion!==1||!data.version||!Array.isArray(data.placeIds)||!Array.isArray(data.distances)||!Array.isArray(data.durations)||data.distances.length!==data.placeIds.length||data.durations.length!==data.placeIds.length||new Set(data.placeIds).size!==data.placeIds.length)throw Error('도로 데이터 버전을 확인해 주세요.');
        if(data.distances.some(row=>row.length!==data.placeIds.length)||data.durations.some(row=>row.length!==data.placeIds.length))throw Error('도로 거리 데이터가 손상되었습니다.');
        manifest=data;indices=new Map(data.placeIds.map((id,i)=>[id,i]));return data;
      }).catch(error=>{loading=null;throw error;});
      return loading;
    }
    function summary(fromId,toId){
      const a=indices.get(fromId),b=indices.get(toId);if(a===undefined||b===undefined)return null;
      const distanceMeters=manifest.distances[a][b],durationSeconds=manifest.durations[a][b];
      return Number.isFinite(distanceMeters)&&distanceMeters>=0&&Number.isFinite(durationSeconds)&&durationSeconds>=0?{distanceMeters,durationSeconds}:null;
    }
    async function row(fromId){
      if(rows.has(fromId)){const data=rows.get(fromId);rows.delete(fromId);rows.set(fromId,data);return data;}
      if(!pending.has(fromId))pending.set(fromId,json(base+'/legs/'+encodeURIComponent(fromId)+(manifest.dataFileSuffix==='.json.gz'?'.json.gz':'.json')).then(data=>{
        if(data.version!==manifest.version||data.fromId!==fromId||!data.legs)throw Error('도로 데이터가 갱신되었습니다. 화면을 새로고침해 주세요.');
        rows.set(fromId,data);while(rows.size>16)rows.delete(rows.keys().next().value);return data;
      }).finally(()=>pending.delete(fromId)));
      return pending.get(fromId);
    }
    function check(signal){if(signal?.aborted)throw new DOMException('Aborted','AbortError');}
    async function route(ids,{signal}={}){
      await ready();check(signal);const legs=[];
      // Bound fetch/decode work, while sharing an origin request across edits.
      for(let i=0;i<ids.length-1;i++){
        check(signal);const fromId=ids[i],toId=ids[i+1],metric=summary(fromId,toId);
        if(!metric){legs.push({fromId,toId,status:'unavailable',coordinates:[],distanceMeters:null,durationSeconds:null});continue;}
        if(fromId===toId){legs.push({fromId,toId,status:'ready',coordinates:[],...metric});continue;}
        const data=await row(fromId);check(signal);const leg=data.legs[toId];
        if(!leg||typeof leg.shape!=='string')throw Error('연결된 도로 구간을 불러오지 못했습니다. 다시 시도해 주세요.');
        const coordinates=decode(expandShape(data.legs,toId));if(coordinates.length<2)throw Error('연결된 도로 좌표가 부족합니다. 다시 시도해 주세요.');
        legs.push({fromId,toId,status:'ready',coordinates,...metric});
      }
      check(signal);const valid=ids.length>=2&&legs.every(leg=>leg.status==='ready');
      return {legs,valid,version:manifest.version,distanceMeters:valid?legs.reduce((n,l)=>n+l.distanceMeters,0):null,durationSeconds:valid?legs.reduce((n,l)=>n+l.durationSeconds,0):null};
    }
    return {ready,summary,route,get version(){return manifest?.version||'';},get catalogVersion(){return manifest?.catalogVersion||'';},get manifest(){return manifest||null;},accessPoint(id){return manifest?.accessPoints?.[id]||null;}};
  }
  // Supplemental places connect through shared, surveyed road access points.
  // Existing national legs keep their original geometry and directional costs.
  function combined(national,local){
    let loaded=false,baseIds=new Set(),extraIds=new Set(),anchors=[];
    async function ready(){
      const [a,b]=await Promise.all([national.ready(),local.ready()]);
      if(b.parentVersion!==a.version)throw Error('도로 데이터가 갱신되었습니다. 화면을 새로고침해 주세요.');
      baseIds=new Set(a.placeIds);extraIds=new Set(b.placeIds);anchors=b.placeIds.filter(id=>baseIds.has(id));loaded=true;
      return {...a,version:version(),placeIds:[...new Set([...a.placeIds,...b.placeIds])]};
    }
    const version=()=>national.version&&local.version?national.version+'+'+local.version:'';
    function path(a,b){
      if(!loaded)return null;
      if(baseIds.has(a)&&baseIds.has(b))return national.summary(a,b)?[{provider:national,from:a,to:b}]:null;
      if(extraIds.has(a)&&extraIds.has(b)&&local.summary(a,b))return [{provider:local,from:a,to:b}];
      let best=null;
      for(const anchor of anchors){
        const edges=baseIds.has(a)?[{provider:national,from:a,to:anchor},{provider:local,from:anchor,to:b}]:[{provider:local,from:a,to:anchor},{provider:national,from:anchor,to:b}];
        const costs=edges.map(e=>e.provider.summary(e.from,e.to));if(costs.some(c=>!c))continue;
        const distance=costs.reduce((n,c)=>n+c.distanceMeters,0),duration=costs.reduce((n,c)=>n+c.durationSeconds,0);
        if(!best||distance<best.distance||distance===best.distance&&duration<best.duration)best={edges,distance,duration};
      }
      return best?.edges||null;
    }
    function summary(a,b){const edges=path(a,b);return edges?edges.reduce((sum,e)=>{const cost=e.provider.summary(e.from,e.to);return {distanceMeters:sum.distanceMeters+cost.distanceMeters,durationSeconds:sum.durationSeconds+cost.durationSeconds};},{distanceMeters:0,durationSeconds:0}):null;}
    async function route(ids,options={}){
      const check=()=>{if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');};
      await ready();check();const legs=[];
      for(let i=0;i<ids.length-1;i++){
        const a=ids[i],b=ids[i+1],edges=path(a,b),metric=summary(a,b);
        if(!edges){legs.push({fromId:a,toId:b,status:'unavailable',coordinates:[],distanceMeters:null,durationSeconds:null});continue;}
        const parts=[];for(const edge of edges){const r=await edge.provider.route([edge.from,edge.to],options);parts.push(...r.legs);}
        legs.push({fromId:a,toId:b,status:parts.every(p=>p.status==='ready')?'ready':'unavailable',coordinates:parts.flatMap(p=>p.coordinates),...metric});
      }
      check();const valid=ids.length>=2&&legs.every(l=>l.status==='ready');
      return {legs,valid,version:version(),distanceMeters:valid?legs.reduce((n,l)=>n+l.distanceMeters,0):null,durationSeconds:valid?legs.reduce((n,l)=>n+l.durationSeconds,0):null};
    }
    return {ready,summary,route,get version(){return version();},get catalogVersion(){return national.catalogVersion;},get manifest(){return national.manifest;},accessPoint:id=>local.accessPoint(id)||national.accessPoint(id)};
  }
  return {create,decode,expandShape};
});
