(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SSKR_MAP_INTERACTION=Object.freeze(api);})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  function createWheelSession(idleMs=300){
    let last=-Infinity,mode='page';
    return(overMap,now)=>{const fresh=now-last>idleMs;if(fresh)mode=overMap?'map':'page';last=now;return{mode,fresh};};
  }
  function bindWheel({getMap,panel,signal}){
    const session=createWheelSession();let delta=0,anchor=null;
    document.addEventListener('wheel',event=>{
      if(event.ctrlKey||!event.deltaY)return;
      const map=getMap(),surface=panel();
      const gesture=session(Boolean(map&&surface?.contains(event.target)),performance.now());
      if(gesture.fresh){delta=0;anchor=gesture.mode==='map'?map.mouseEventToContainerPoint(event):null;}
      if(gesture.mode!=='map'||!map)return;
      event.preventDefault();
      const unit=event.deltaMode===1?40:event.deltaMode===2?map.getSize().y:1;
      delta=Math.max(-240,Math.min(240,delta+event.deltaY*unit));
      const steps=Math.trunc(delta/120);if(!steps)return;delta-=steps*120;
      const zoom=Math.max(map.getMinZoom(),Math.min(map.getMaxZoom(),map.getZoom()-steps));
      if(zoom!==map.getZoom())map.setZoomAround(anchor,zoom,{animate:false});
    },{capture:true,passive:false,signal});
  }
  return{createWheelSession,bindWheel};
});
