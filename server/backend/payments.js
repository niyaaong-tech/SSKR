'use strict';
const { BackendError } = require('./config');
function createPayments(env=process.env,fetcher=fetch) {
  const clientKey=env.TOSS_CLIENT_KEY,secret=env.TOSS_SECRET_KEY;
  const ready=!!clientKey&&!!secret&&/^(test|live)_gck_/.test(clientKey)&&/^(test|live)_gsk_/.test(secret)&&clientKey.split('_')[0]===secret.split('_')[0];
  async function request(path,method='GET',body,key) {
    if(!ready)throw new BackendError('PAYMENT_NOT_CONFIGURED','참가 접수를 준비하고 있습니다.',503);
    let response,data;
    try {
      response=await fetcher('https://api.tosspayments.com/v1/payments'+path,{method,
        headers:{Authorization:'Basic '+Buffer.from(secret+':').toString('base64'),'Content-Type':'application/json',...(key?{'Idempotency-Key':key}:{})},
        body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)});
      data=await response.json();
    }catch{throw new BackendError('PAYMENT_PENDING','결제 결과를 확인 중입니다. 다시 결제하지 말고 잠시 후 상태를 확인해 주세요.',202);}
    if(!response.ok) {
      if(response.status===404&&method==='GET')return null;
      // A timeout or ambiguous PG error never releases a possibly paid slot.
      throw new BackendError('PAYMENT_PENDING','결제 결과를 확인 중입니다. 잠시 후 상태를 확인해 주세요.',202);
    }
    return data;
  }
  return {ready,clientKey,environment:clientKey?.startsWith('live_')?'live':'test',
    confirm:({id,amount},paymentKey)=>request('/confirm','POST',{orderId:id,amount,paymentKey},'confirm-'+id),
    lookup:id=>request('/orders/'+encodeURIComponent(id)),
    cancel:(order,reason)=>request('/'+encodeURIComponent(order.paymentKey)+'/cancel','POST',{cancelReason:reason},'refund-'+order.id)};
}
function verifyPayment(data,order) {
  if(!data||data.orderId!==order.id||data.totalAmount!==order.amount||data.currency!=='KRW'||typeof data.paymentKey!=='string')throw new BackendError('PAYMENT_MISMATCH','결제 내역 확인이 필요합니다. 다시 결제하지 말고 운영자에게 문의해 주세요.',409);
  return data;
}
module.exports={createPayments,verifyPayment};
