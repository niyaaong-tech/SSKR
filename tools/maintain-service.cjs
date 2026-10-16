'use strict';
// Server-only reconciliation/expired-upload cleanup. Dry-run unless --apply.
// Load the target environment explicitly with node --env-file before invoking.
const {config}=require('../server/backend/config');
const {serviceDb}=require('../server/backend/service-db');
const {createWorkflows}=require('../server/backend/workflows');
const {createMedia}=require('../server/backend/media');
async function main(){
  const cfg=config();if(cfg.mode!=='supabase')throw Error('Supabase mode is required.');
  const db=serviceDb(cfg),{data,error}=await db.rpc('sskr_maintenance');
  if(error)throw Error('Maintenance inventory unavailable.');
  const result={apply:process.argv.includes('--apply'),orders:data.orders.length,photos:data.photos.length,checked:0,purged:0,failed:0};
  if(result.apply){const service=createWorkflows({db}),media=createMedia(db,service);
    for(const o of data.orders)try{await service.handle({id:o.ownerId,linked:true},'payment',{action:'REFRESH',orderId:o.id});result.checked++;}catch{result.failed++;}
    for(const p of data.photos)try{await media.cleanup({id:p.ownerId,linked:true},p);result.purged++;}catch{result.failed++;}
  }
  console.log(JSON.stringify(result));if(result.failed)process.exitCode=1;
}
main().catch(()=>{console.error('Service maintenance failed; inspect the configured development project and retry.');process.exitCode=1;});
