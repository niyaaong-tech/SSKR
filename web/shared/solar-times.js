(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SSKR_SOLAR_TIMES=Object.freeze(api);})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  const SOURCE='https://gml.noaa.gov/grad/solcalc/solareqns.PDF';
  const VERSION='noaa-fractional-year-1';
  const validDate=value=>value&&Number.isFinite(Date.parse(value));
  function dateKey(value,timezone='Asia/Seoul'){
    if(!validDate(value))return null;
    try{const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value)).map(part=>[part.type,part.value]));return `${p.year}-${p.month}-${p.day}`;}catch{return null;}
  }
  function midnight(date,timezone='Asia/Seoul'){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;
    const utc=Date.parse(date+'T00:00:00Z');
    if(!Number.isFinite(utc)||new Date(utc).toISOString().slice(0,10)!==date)return null;
    let name;try{name=new Intl.DateTimeFormat('en',{timeZone:timezone,timeZoneName:'longOffset'}).formatToParts(new Date(utc)).find(p=>p.type==='timeZoneName')?.value||'GMT';}catch{return null;}
    const match=name.match(/GMT([+-])(\d{2}):(\d{2})/),offset=match?(match[1]==='-'?-1:1)*(+match[2]*60 + +match[3]):0;
    return {utc:utc-offset*60000,offset};
  }
  const coordinates=p=>p&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&Math.abs(p.lat)<=90&&Math.abs(p.lng)<=180;
  // Approximate mock times from NOAA's published equations, not official almanac data.
  function calculate({date,lat,lng,timezone='Asia/Seoul'}){
    if(!coordinates({lat,lng}))return null;
    const day=midnight(date,timezone);if(!day)return null;
    const year=+date.slice(0,4),days=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
    const ordinal=(Date.parse(date+'T00:00:00Z')-Date.UTC(year,0,1))/86400000+1,radian=Math.PI/180;
    function minute(rise){
      let local=rise?360:1080;
      for(let i=0;i<3;i++){
        const g=2*Math.PI/days*(ordinal-1+(local/60-12)/24);
        const eq=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
        const decl=.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g);
        const angle=Math.cos(90.833*radian)/(Math.cos(lat*radian)*Math.cos(decl))-Math.tan(lat*radian)*Math.tan(decl);
        if(Math.abs(angle)>1)return null;
        local=720-4*(lng+(rise?1:-1)*Math.acos(angle)/radian)-eq+day.offset;
      }
      return rise?Math.ceil(local):Math.floor(local);
    }
    const rise=minute(true),set=minute(false);if(rise==null||set==null||set<=rise)return null;
    return {date,lat,lng,timezone,sunriseAt:new Date(day.utc+rise*60000).toISOString(),sunsetAt:new Date(day.utc+set*60000).toISOString(),verification:'CALCULATED_MOCK',sourceUrl:SOURCE,calculationVersion:VERSION,rounding:'start-ceil-end-floor'};
  }
  function windowFor(event,start,finish){
    const timezone=event.timezone||'Asia/Seoul',date=dateKey(event.eventStartAt,timezone),saved=event.sunlight;
    if(!date||!coordinates(start)||!coordinates(finish))return {state:'UNAVAILABLE'};
    if(saved){
      const rise=saved.starts?.find(p=>p.locationId===start.id),set=saved.finish;
      const matches=(record,place)=>record&&record.locationId===place.id&&record.lat===place.lat&&record.lng===place.lng;
      const timestamp=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value);
      if(!Number.isInteger(event.configVersion)||event.configVersion<1||saved.eventId!==event.id||saved.date!==date||saved.timezone!==timezone||saved.configVersion!==event.configVersion||saved.verification!=='REVIEWED'||!saved.sourceUrl||!saved.calculationVersion||!matches(rise,start)||!matches(set,finish)||!timestamp(rise?.sunriseAt)||!timestamp(set?.sunsetAt)||dateKey(rise?.sunriseAt,timezone)!==date||dateKey(set?.sunsetAt,timezone)!==date||Date.parse(rise.sunriseAt)>=Date.parse(set.sunsetAt))return {state:'STALE'};
      return {state:'REVIEWED',sunriseAt:rise.sunriseAt,sunsetAt:set.sunsetAt,sourceUrl:saved.sourceUrl,calculationVersion:saved.calculationVersion};
    }
    if(event.sunlightMode!=='CALCULATED_MOCK')return {state:'UNAVAILABLE'};
    const rise=calculate({date,timezone,...start}),set=calculate({date,timezone,...finish});
    return rise&&set?{state:'CALCULATED_MOCK',sunriseAt:rise.sunriseAt,sunsetAt:set.sunsetAt,sourceUrl:SOURCE,calculationVersion:VERSION}:{state:'UNAVAILABLE'};
  }
  return {calculate,dateKey,midnight,windowFor};
});
