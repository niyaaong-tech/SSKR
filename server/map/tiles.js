const fs=require('node:fs');
const path=require('node:path');
const {gzipSync,gunzipSync}=require('node:zlib');
const {createHash}=require('node:crypto');
const clipping=require('polygon-clipping');
const encode=require('vt-pbf');
const boundaryBytes=fs.readFileSync(path.join(__dirname,'../../web/shared/map/korea.geojson'));
const boundaryHash=createHash('sha256').update(boundaryBytes).digest('hex');
const boundary=JSON.parse(boundaryBytes).features[0].geometry.coordinates;
// Cached files are valid only for the exact clipping boundary and cache schema.
const cacheDir=path.join(__dirname,'cache');
let manifest;try{manifest=JSON.parse(fs.readFileSync(path.join(cacheDir,'manifest.json'),'utf8'));}catch{}
if(manifest?.schemaVersion!==1||manifest?.boundarySha256!==boundaryHash)manifest=null;
const projected=boundary.map(poly=>poly.map(ring=>ring.map(([lon,lat])=>{const sin=Math.sin(lat*Math.PI/180);return [(lon+180)/360,.5-Math.log((1+sin)/(1-sin))/(4*Math.PI)];})));
const libraries=Promise.all([import('@mapbox/vector-tile'),import('pbf')]);
const cache=new Map(),pending=new Map();let sourcePromise;
const used=new Set(['water','waterway','landcover','landuse','park','building','transportation','transportation_name','boundary','place','water_name','aeroway','aerodrome_label']);
function tileMask(z,x,y,extent=4096){
 const scale=2**z;const polys=projected.map(poly=>poly.map(ring=>ring.map(p=>[(p[0]*scale-x)*extent,(p[1]*scale-y)*extent])));
 return clipping.intersection(polys,[[[-64,-64],[extent+64,-64],[extent+64,extent+64],[-64,extent+64],[-64,-64]]]);
}
function inRing(p,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function contains(p,polys){return polys.some(poly=>inRing(p,poly[0])&&!poly.slice(1).some(r=>inRing(p,r)));}
function clipLines(lines,polys){
 const edges=polys.flatMap(poly=>poly.flatMap(r=>r.slice(1).map((b,i)=>[r[i],b]))),out=[];
 for(const line of lines){let current=[];for(let i=1;i<line.length;i++){
  const a=line[i-1],b=line[i],dx=b[0]-a[0],dy=b[1]-a[1],ts=[0,1];
  for(const [c,d] of edges){const ex=d[0]-c[0],ey=d[1]-c[1],den=dx*ey-dy*ex;if(Math.abs(den)<1e-9)continue;const t=((c[0]-a[0])*ey-(c[1]-a[1])*ex)/den,u=((c[0]-a[0])*dy-(c[1]-a[1])*dx)/den;if(t>0&&t<1&&u>=0&&u<=1)ts.push(t);}
  ts.sort((a,b)=>a-b);
  for(let j=1;j<ts.length;j++){const lo=ts[j-1],hi=ts[j];if(hi-lo<1e-9)continue;
   if(contains([a[0]+dx*(lo+hi)/2,a[1]+dy*(lo+hi)/2],polys)){const start=[a[0]+dx*lo,a[1]+dy*lo],end=[a[0]+dx*hi,a[1]+dy*hi];if(!current.length)current.push(start);else if(Math.hypot(current.at(-1)[0]-start[0],current.at(-1)[1]-start[1])>.01){out.push(current);current=[start];}current.push(end);}else if(current.length){out.push(current);current=[];}
  }
 }if(current.length)out.push(current);}
 return out.filter(l=>l.length>1);
}
function feature(type,properties,geometry,id){return {type,properties,id,loadGeometry:()=>geometry.map(r=>r.map(([x,y])=>({x:Math.round(x),y:Math.round(y)})))};}
function layer(name,features,extent=4096){return {name,version:2,extent,length:features.length,feature:i=>features[i]};}
async function clipTile(bytes,z,x,y){
 const [{VectorTile,classifyRings},pbf]=await libraries;const Reader=pbf.PbfReader||pbf.default;
 const input=new VectorTile(new Reader(bytes)),layers={},masks=new Map();
 const maskFor=extent=>{if(!masks.has(extent))masks.set(extent,tileMask(z,x,y,extent));return masks.get(extent);};
 const land=maskFor(4096);if(!land.length)return Buffer.alloc(0);
 layers.sskr_land=layer('sskr_land',[feature(3,{},land.flat())]);
 for(const [name,source] of Object.entries(input.layers)){
  if(!used.has(name))continue;const mask=maskFor(source.extent),features=[];
  for(let i=0;i<source.length;i++){
   const f=source.feature(i);if(f.properties.class==='ferry'||f.properties.subclass==='ferry'||f.properties.maritime===1)continue;
   const raw=f.loadGeometry();let geometry=[];
   if(f.type===1)geometry=raw.map(r=>r.map(p=>[p.x,p.y]).filter(p=>contains(p,mask))).filter(r=>r.length);
   else if(f.type===2)geometry=clipLines(raw.map(r=>r.map(p=>[p.x,p.y])),mask);
   else if(f.type===3){const polys=classifyRings(raw).map(poly=>poly.map(r=>r.map(p=>[p.x,p.y])));geometry=clipping.intersection(polys,mask).flat();}
   if(!geometry.length)continue;
   const properties={};for(const [key,value] of Object.entries(f.properties)){if(/^name[:_]/.test(key)&&!['name:ko','name:latin','name:nonlatin'].includes(key))continue;properties[key]=value;}
   features.push(feature(f.type,properties,geometry,f.id));
  }
  if(features.length)layers[name]=layer(name,features,source.extent);
 }
 return Buffer.from(encode({layers}));
}
async function tile(z,x,y){
 const key=`${z}/${x}/${y}`;if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);return v;}if(pending.has(key))return pending.get(key);
 const task=(async()=>{if(!tileMask(z,x,y).length)return Buffer.alloc(0);
  const stored=manifest?.tiles[key];
  if(stored){const bytes=fs.readFileSync(path.join(cacheDir,stored.file));if(createHash('sha256').update(bytes).digest('hex')===stored.sha256){const result=gunzipSync(bytes);cache.set(key,result);while(cache.size>96)cache.delete(cache.keys().next().value);return result;}}
  if(!sourcePromise)sourcePromise=fetch('https://tiles.openfreemap.org/planet',{signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw Error('Tile source unavailable');return r.json();}).catch(e=>{sourcePromise=null;throw e;});
  const source=await sourcePromise,url=source.tiles[0].replace('{z}',z).replace('{x}',x).replace('{y}',y);
  const r=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Tile upstream '+r.status);
  const result=await clipTile(new Uint8Array(await r.arrayBuffer()),z,x,y);cache.set(key,result);while(cache.size>96)cache.delete(cache.keys().next().value);return result;
 })();pending.set(key,task);try{return await task;}finally{pending.delete(key);}
}
async function handler(req,res){
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 const u=new URL(req.url,'http://localhost'),values=['z','x','y'].map(k=>u.searchParams.get(k));
 if(values.some(v=>!/^\d{1,5}$/.test(v||''))){res.writeHead(400);return res.end('Invalid tile');}
 const [z,x,y]=values.map(Number);if(z<6||z>14||x>=2**z||y>=2**z){res.writeHead(400);return res.end('Invalid tile');}
 try{const bytes=await tile(z,x,y);res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800');res.setHeader('Vary','Accept-Encoding');res.setHeader('Content-Type','application/vnd.mapbox-vector-tile');if(!bytes.length){res.statusCode=204;return res.end();}
  const gzip=(req.headers['accept-encoding']||'').includes('gzip');if(gzip)res.setHeader('Content-Encoding','gzip');res.statusCode=200;res.end(req.method==='HEAD'?undefined:gzip?gzipSync(bytes):bytes);
 }catch(error){console.error('Korea tile failed:',error.message);res.writeHead(502,{'Cache-Control':'no-store'});res.end('Map tile unavailable');}
}
module.exports={handler,clipTile,tileMask,contains,clipLines,tile,boundaryHash};
