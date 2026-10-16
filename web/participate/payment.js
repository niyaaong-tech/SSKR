(()=>{'use strict';
  const api=window.SSKR_BACKEND,status=document.querySelector('#payment-status'),button=document.querySelector('#pay'),check=document.querySelector('#check-payment');
  let orderId,widgets,checkout;
  const request=(action,data={})=>api.request('payment','POST',{action,...data});
  function completed(result){if(result.participation?.state==='ACTIVE'){status.textContent='참가가 확정되었습니다.';button.hidden=true;check.hidden=true;const a=document.createElement('a');a.href='/app/preparation';a.className='button button-primary';a.textContent='참가 준비로 이동';status.append(document.createElement('br'),a);return true;}return false;}
  check.onclick=async()=>{check.disabled=true;try{const result=await request('REFRESH',{orderId});if(!completed(result))status.textContent=result.payment?.state==='FAILED'?'결제가 완료되지 않았습니다. 참가 신청으로 돌아가 다시 진행해 주세요.':'결제 결과를 확인하고 있습니다. 다시 결제하지 말고 잠시 후 확인해 주세요.';}catch(e){status.textContent=e.message;}finally{check.disabled=false;}};
  button.onclick=async()=>{button.disabled=true;try{await widgets.requestPayment({orderId:checkout.orderId,orderName:checkout.orderName,successUrl:location.origin+'/participate/payment.html',failUrl:location.origin+'/participate/payment.html'});}catch(e){status.textContent=e.code==='USER_CANCEL'?'결제를 취소했습니다. 준비된 금액을 확인한 뒤 다시 진행할 수 있습니다.':'결제창을 열지 못했습니다. 잠시 후 다시 시도해 주세요.';}finally{button.disabled=false;}};
  (async()=>{try{
    await api.initialize();if(api.mode!=='supabase')throw Error('실제 서버가 연결된 환경에서 결제할 수 있습니다.');
    const params=new URLSearchParams(location.search),key=params.get('paymentKey');orderId=params.get('orderId');history.replaceState({},'',location.pathname);
    if(key&&orderId){check.hidden=false;const result=await request('CONFIRM',{orderId,paymentKey:key});if(!completed(result))status.textContent='결제 결과를 확인하고 있습니다.';return;}
    if(params.has('code')){status.textContent='결제가 완료되지 않았습니다. 참가 신청으로 돌아가 다시 진행해 주세요.';return;}
    const context=await api.request('context');if(completed(context))return;
    const result=await request('START');checkout=result.checkout;orderId=checkout.orderId;
    widgets=TossPayments(checkout.clientKey).widgets({customerKey:checkout.customerKey});await widgets.setAmount({currency:'KRW',value:checkout.amount});
    await widgets.renderPaymentMethods({selector:'#payment-methods',variantKey:'DEFAULT'});await widgets.renderAgreement({selector:'#payment-agreement',variantKey:'AGREEMENT'});
    status.textContent=(checkout.environment==='test'?'테스트 결제 · ':'')+checkout.amount.toLocaleString('ko-KR')+'원';button.hidden=false;
  }catch(e){status.textContent=e.message;if(orderId)check.hidden=false;}})();
})();
