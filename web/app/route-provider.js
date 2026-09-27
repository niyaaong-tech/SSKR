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
  function create({base='/web/shared/routes',fetcher=globalThis.fetch?.bind(globalThis)}={}){
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
  return {create,decode,expandShape};
});
