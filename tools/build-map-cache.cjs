// Refresh bundled overview tiles: node tools/build-map-cache.cjs [output-directory]
const fs=require('node:fs'),path=require('node:path'),{gzipSync}=require('node:zlib'),{createHash}=require('node:crypto');
const {tileMask,clipTile,boundaryHash}=require('../server/map/tiles');
(async()=>{
 const output=path.resolve(process.argv[2]||path.join(__dirname,'../server/map/cache'));
 fs.mkdirSync(output,{recursive:true});
 const response=await fetch('https://tiles.openfreemap.org/planet',{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Map source unavailable');
 const source=await response.json(),manifest={schemaVersion:1,boundarySha256:boundaryHash,source:source.tiles[0],generatedAt:new Date().toISOString(),zooms:[6,7,8],tiles:{}};
 const hash=b=>createHash('sha256').update(b).digest('hex');let bytes=0;
 for(const z of manifest.zooms){const n=2**z,merc=lat=>(.5-Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))/(2*Math.PI))*n;
  for(let x=Math.floor((124+180)/360*n);x<=Math.floor((132.5+180)/360*n);x++)for(let y=Math.floor(merc(39));y<=Math.floor(merc(32.5));y++){
   if(!tileMask(z,x,y).length)continue;
   const url=source.tiles[0].replace('{z}',z).replace('{x}',x).replace('{y}',y),r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Tile '+url+' '+r.status);
   const data=gzipSync(await clipTile(new Uint8Array(await r.arrayBuffer()),z,x,y)),file=`${z}-${x}-${y}.pbf.gz`;
   fs.writeFileSync(path.join(output,file),data);manifest.tiles[`${z}/${x}/${y}`]={file,sha256:hash(data),bytes:data.length};bytes+=data.length;
  }
 }
 fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({tiles:Object.keys(manifest.tiles).length,bytes,output}));
})().catch(error=>{console.error(error);process.exitCode=1;});
