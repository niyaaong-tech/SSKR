'use strict';
const sharp=require('sharp');
const {randomUUID}=require('node:crypto');
const {BackendError}=require('./config');
const {call}=require('./service-db');
const BUCKET='sskr-visit-photos',MAX_BYTES=8*1024*1024;
async function sanitizePhoto(bytes) {
  if(bytes.length>MAX_BYTES)throw new BackendError('PHOTO_TOO_LARGE','사진은 8MB 이하로 올려 주세요.');
  try {
    const image=sharp(bytes,{limitInputPixels:24000000,failOn:'warning'}),info=await image.metadata();
    if(!['jpeg','png','webp'].includes(info.format)||info.pages>1)throw Error('format');
    return await image.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:82}).timeout({seconds:8}).toBuffer();
  }catch{throw new BackendError('INVALID_PHOTO','열 수 있는 JPG·PNG·WebP 사진을 선택해 주세요.');}
}
const mediaDto=m=>({id:m.id,visitId:m.visitId,ownerUserId:m.ownerUserId,memorialId:m.memorialId,sourceKind:'USER_UPLOAD',status:m.status,
  moderationStatus:m.moderationStatus,visibility:'PRIVATE',url:'/api/backend?resource=photo&id='+encodeURIComponent(m.id)});
function createMedia(db,workflow) {
  const storage=db.storage.from(BUCKET);
  async function handle(account,body) {
    if(body.action==='RESERVE') {
      if(!['image/jpeg','image/png','image/webp'].includes(body.type)||!Number.isSafeInteger(body.size)||body.size<1||body.size>MAX_BYTES)throw new BackendError('INVALID_PHOTO','8MB 이하의 JPG·PNG·WebP 사진을 선택해 주세요.');
      const id='photo-'+randomUUID();
      const result=await workflow.mutate(account,body.eventId,'PHOTO_RESERVE',r=>{
        const m=r.snapshot.memorial;if(!m?.visits.some(v=>v.id===body.visitId))throw new BackendError('NOT_FOUND','방문 기록을 찾을 수 없습니다.',404);
        const photos=r.snapshot.media||=[];
        if(photos.filter(p=>p.visitId===body.visitId&&p.status!=='REMOVED').length>=5)throw new BackendError('PHOTO_LIMIT','방문당 최대 5장의 사진을 추가할 수 있습니다.');
        photos.push({id,visitId:body.visitId,ownerUserId:account.id,memorialId:m.id,status:'UPLOADING',moderationStatus:'PENDING',createdAt:new Date().toISOString()});
      });
      const path=result.snapshot.event.id+'/'+account.id+'/'+id+'/original';
      const {data,error}=await storage.createSignedUploadUrl(path,{upsert:false});
      if(error){await workflow.mutate(account,body.eventId,'PHOTO_RESERVE_FAILED',r=>{r.snapshot.media.find(p=>p.id===id).status='REMOVED';});throw new BackendError('STORAGE_UNAVAILABLE','사진 업로드를 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.',503);}
      return {ok:true,id,uploadUrl:data.signedUrl};
    }
    if(body.action==='FINALIZE') {
      const s=await workflow.read(account,body.eventId),m=s.state.media?.find(p=>p.id===body.id);
      if(!m)throw new BackendError('NOT_FOUND','사진을 찾을 수 없습니다.',404);
      if(m.status==='READY')return {ok:true,photo:mediaDto(m)};
      if(m.status!=='UPLOADING')throw new BackendError('INVALID_PHOTO','이 사진은 사용할 수 없습니다.');
      const prefix=s.event.id+'/'+account.id+'/'+m.id;
      const {data,error}=await storage.download(prefix+'/original');
      if(error||!data)throw new BackendError('UPLOAD_INCOMPLETE','사진 업로드가 끝나지 않았습니다. 다시 시도해 주세요.',409);
      let image;try{image=await sanitizePhoto(Buffer.from(await data.arrayBuffer()));}
      catch(error){await handle(account,{action:'REMOVE',eventId:s.event.id,id:m.id});throw error;}
      const upload=await storage.upload(prefix+'/display.webp',image,{contentType:'image/webp',upsert:true});
      if(upload.error)throw new BackendError('STORAGE_UNAVAILABLE','사진을 저장하지 못했습니다.',503);
      const result=await workflow.mutate(account,s.event.id,'PHOTO_READY',r=>{
        const p=r.snapshot.media.find(p=>p.id===body.id);if(p.status==='REMOVED')throw new BackendError('NOT_FOUND','삭제한 사진입니다.',404);p.status='READY';
      });
      return {ok:true,photo:mediaDto(result.snapshot.state.media.find(p=>p.id===body.id))};
    }
    if(body.action==='REMOVE') {
      const result=await workflow.mutate(account,body.eventId,'PHOTO_REMOVE',r=>{const m=r.snapshot.media?.find(p=>p.id===body.id);if(!m)throw new BackendError('NOT_FOUND','사진을 찾을 수 없습니다.',404);m.status='REMOVED';for(const v of r.snapshot.memorial?.visits||[])v.media=(v.media||[]).filter(p=>p.id!==m.id);});
      const prefix=result.snapshot.event.id+'/'+account.id+'/'+body.id;
      const removed=await storage.remove([prefix+'/original',prefix+'/display.webp']);
      if(removed.error)throw new BackendError('STORAGE_UNAVAILABLE','사진 공개는 해제했습니다. 파일 정리는 다시 시도합니다.',503);
      return {ok:true};
    }
    throw new BackendError('INVALID_INPUT','지원하지 않는 사진 동작입니다.');
  }
  async function image(account,id) {
    const info=await call(db,'media',null,null,{},null,id);
    let operator=false;if(info&&account?.id&&info.ownerId!==account.id&&!info.public){try{await call(db,'operations',account.id,info.eventId);operator=true;}catch{}}
    if(!info||info.media.status!=='READY'||!(info.public||info.ownerId===account?.id||operator))throw new BackendError('NOT_FOUND','사진을 찾을 수 없습니다.',404);
    const {data,error}=await storage.download(info.eventId+'/'+info.ownerId+'/'+id+'/display.webp');
    if(error||!data)throw new BackendError('NOT_FOUND','사진을 찾을 수 없습니다.',404);
    return Buffer.from(await data.arrayBuffer());
  }
  async function cleanup(account,body){
    // Signed upload tokens expire after two hours. Wait three before removing
    // originals, and recheck state after the inventory was read.
    const result=await workflow.mutate(account,body.eventId,'PHOTO_EXPIRED',r=>{
      const m=r.snapshot.media?.find(p=>p.id===body.id);
      if(!m||!['UPLOADING','REMOVED'].includes(m.status)||Date.parse(m.createdAt)>Date.now()-10800000)throw new BackendError('PHOTO_CHANGED','사진 상태가 바뀌었습니다.',409);
      m.status='REMOVED';
    });
    const prefix=result.snapshot.event.id+'/'+account.id+'/'+body.id;
    const removed=await storage.remove([prefix+'/original',prefix+'/display.webp']);
    if(removed.error)throw new BackendError('STORAGE_UNAVAILABLE','사진 파일 정리를 다시 시도합니다.',503);
    await workflow.mutate(account,body.eventId,'PHOTO_PURGED',r=>{r.snapshot.media.find(p=>p.id===body.id).purgedAt=new Date().toISOString();});
  }
  return {handle,image,cleanup};
}
module.exports={createMedia,sanitizePhoto,mediaDto,BUCKET,MAX_BYTES};
