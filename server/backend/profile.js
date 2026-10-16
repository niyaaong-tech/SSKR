'use strict';
const {BackendError}=require('./config');
async function saveProfile(current,body){
 const v=body.profile||{},profile={name:String(v.name||'').trim(),email:String(v.email||'').trim(),phone:String(v.phone||'').replace(/\D/g,'')};
 if(!profile.name||profile.name.length>100||profile.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)||!/^01\d{8,9}$/.test(profile.phone))throw new BackendError('INVALID_INPUT','이름·이메일·휴대전화 번호를 확인해 주세요.');
 const {data,error}=await current.db.rpc('sskr_profile',{p_data:profile,p_revision:body.revision});
 if(error)throw new BackendError(error.message==='CONFLICT'?'CONFLICT':'PROFILE_UNAVAILABLE',error.message==='CONFLICT'?'다른 화면에서 연락처가 바뀌었습니다. 새로 불러온 뒤 수정해 주세요.':'연락처를 저장하지 못했습니다.',error.message==='CONFLICT'?409:503);
 return {...current.account,profile:{...current.account.profile,...data.profile},profileRevision:data.revision};
}
module.exports={saveProfile};
