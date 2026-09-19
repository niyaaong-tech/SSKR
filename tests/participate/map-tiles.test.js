const test=require('node:test');
const assert=require('node:assert/strict');
const encode=require('vt-pbf');
const {gzipSync}=require('node:zlib');
const {clipTile,tile,tileMask,clipLines,handler}=require('../../server/map/tiles');
const xy=([lon,lat])=>{const sin=Math.sin(lat*Math.PI/180);return [(64*(lon+180)/360-54)*4096,(64*(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))-24)*4096];};
const feature=(type,properties,geometry)=>({type,properties,loadGeometry:()=>geometry.map(r=>r.map(([x,y])=>({x:Math.round(x),y:Math.round(y)})))});
const layer=(name,features)=>({name,version:2,extent:4096,length:features.length,feature:i=>features[i]});
test('foreign tiles return no bytes without contacting the map provider',async()=>{
 const original=global.fetch;global.fetch=()=>{throw Error('Unexpected network request');};
 try{for(const [z,x,y] of [[6,56,24],[7,112,48],[8,180,98]]){assert.equal(tileMask(z,x,y).length,0);assert.equal((await tile(z,x,y)).length,0);}}finally{global.fetch=original;}
});
test('line clipping preserves connected domestic portions and removes foreign segments and holes',()=>{
 const mask=[[[[0,0],[10,0],[10,10],[0,10],[0,0]],[[4,4],[6,4],[6,6],[4,6],[4,4]]]];
 assert.deepEqual(clipLines([[[-2,5],[12,5]]],mask),[[[0,5],[4,5]],[[6,5],[10,5]]]);
 assert.deepEqual(clipLines([[[1,1],[2,2],[3,3]]],mask),[[[1,1],[2,2],[3,3]]]);
});
test('encoded Korea tiles retain domestic places and roads, clipping border polygons and removing ferries',async()=>{
 const locations=[['서울',[126.98,37.56]],['평양',[125.75,39.03]],['중국',[124.2,37.0]]];
 const localLine=[xy([126.8,37.4]),xy([127.1,37.4])];
 const input=Buffer.from(encode({layers:{
  place:layer('place',locations.map(([name,p])=>feature(1,{name,'name:ko':name,'name:de':'unused'},[[xy(p)]]))),
  transportation:layer('transportation',[feature(2,{class:'primary'},[localLine]),feature(2,{class:'ferry'},[localLine]),feature(2,{class:'path'},[[xy([125.75,39.03]),xy([126.98,37.56])]])]),
  landcover:layer('landcover',[feature(3,{class:'wood'},[[[0,0],[4096,0],[4096,4096],[0,4096],[0,0]]])])
 }}));
 const bytes=await clipTile(input,6,54,24),{VectorTile}=await import('@mapbox/vector-tile'),{PbfReader}=await import('pbf'),result=new VectorTile(new PbfReader(bytes));
 assert.equal(result.layers.place.length,1);assert.equal(result.layers.place.feature(0).properties.name,'서울');assert.equal(result.layers.place.feature(0).properties['name:de'],undefined);
 assert.equal(result.layers.transportation.length,2);assert.deepEqual(result.layers.transportation.feature(0).loadGeometry().map(r=>r.map(p=>[p.x,p.y])),[localLine.map(p=>p.map(Math.round))]);
 const cross=result.layers.transportation.feature(1).loadGeometry()[0];assert.notEqual(cross[0].y,Math.round(xy([125.75,39.03])[1]));
 assert.ok(result.layers.sskr_land.length);assert.ok(result.layers.landcover.feature(0).loadGeometry().flat().length>5);
 assert.ok(gzipSync(bytes).length>0);
});
test('tile endpoint rejects malformed coordinates and unsupported methods',async()=>{
 for(const [method,url,status] of [['POST','/api/map-tile?z=7&x=109&y=49',405],['GET','/api/map-tile?z=20&x=0&y=0',400],['GET','/api/map-tile?z=7&x=-1&y=49',400],['GET','/api/map-tile?z=7&x=128&y=0',400]]){
  let actual;await handler({method,url},{writeHead(s){actual=s;},end(){}});assert.equal(actual,status);
 }
});
