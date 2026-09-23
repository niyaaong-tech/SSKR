const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {tileMask,contains,tile,boundaryHash}=require('../../server/map/tiles');
const catalog=require('../../web/app/spot-catalog');
const project=(lng,lat,z)=>{const n=2**z,s=Math.sin(lat*Math.PI/180),x=(lng+180)/360*n,y=(.5-Math.log((1+s)/(1-s))/(4*Math.PI))*n;return {x:Math.floor(x),y:Math.floor(y),point:[(x-Math.floor(x))*4096,(y-Math.floor(y))*4096]};};
test('all 158 catalog places are retained, including ports, beaches and coastal approaches',()=>{
 assert.equal(catalog.length,158);
 for(const place of catalog)for(const z of [6,8,12,14]){const p=project(place.lng,place.lat,z);assert.ok(contains(p.point,tileMask(z,p.x,p.y)),place.name+' at '+z);}
 for(const [lng,lat] of [[126.554,37.97],[125.75,39.03],[124.38,40.13],[129.287,34.205],[130.4,33.59],[121.47,31.23]]){const p=project(lng,lat,8);assert.equal(contains(p.point,tileMask(8,p.x,p.y)),false);}
});
test('bundled overview tiles match the active boundary and can be served without upstream requests',async()=>{
 const dir=path.join(__dirname,'../../server/map/cache'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
 assert.equal(manifest.boundarySha256,boundaryHash);assert.deepEqual(manifest.zooms,[6,7,8]);
 const saved=global.fetch;global.fetch=()=>{throw Error('Overview must not fetch upstream');};
 try{for(const [key,entry] of Object.entries(manifest.tiles)){const data=fs.readFileSync(path.join(dir,entry.file));assert.equal(createHash('sha256').update(data).digest('hex'),entry.sha256);assert.ok((await tile(...key.split('/').map(Number))).length);}}finally{global.fetch=saved;}
});
test('map CSS selectors are scoped and every live map consumer uses the shared component',()=>{
 const read=p=>fs.readFileSync(path.join(__dirname,'../../',p),'utf8');
 const css=read('web/shared/map/map.css');
 for(const match of css.matchAll(/([^{}]+)\{/g)){const selectors=match[1].trim();if(selectors.startsWith('@'))continue;for(const s of selectors.split(','))assert.match(s.trim(),/^\.sskr-map(?:\b|-return)/);}
 for(const file of ['web/app/spots.js','web/app/memorial-journey.js','web/explore/app.js']){const code=read(file);assert.match(code,/SSKR_MAP/);assert.doesNotMatch(code,/L\.map\(|L\.tileLayer\(|maplibreGL\(/);}
 for(const file of ['web/app/index.html','web/explore/index.html']){const html=read(file);assert.match(html,/\/web\/shared\/map\/map\.css/);assert.match(html,/\/web\/shared\/map\/map\.js/);}
});
