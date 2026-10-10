(() => {
  let database,photos=[];
  function db(){return database||(database=new Promise((resolve,reject)=>{const request=indexedDB.open('sskr.mock.memorial-media',1);request.onupgradeneeded=()=>request.result.createObjectStore('photos',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}));}
  async function read(){const database=await db();const rows=await new Promise((resolve,reject)=>{const request=database.transaction('photos').objectStore('photos').getAll();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});photos.forEach(p=>URL.revokeObjectURL(p.url));photos=rows.map(p=>({...p,url:URL.createObjectURL(p.blob)}));return photos;}
  async function add(file,{account,item,visitId}) {
    if(!window.SSKR_MEMORIAL_STORE.isOwner(item,account))throw Error('내 기록에만 사진을 추가할 수 있습니다.');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024)throw Error('15MB 이하 JPG·PNG·WebP 사진을 선택해 주세요.');
    const source=URL.createObjectURL(file);let blob;
    try {const img=new Image();img.src=source;await img.decode();const scale=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.86));if(!blob||blob.type!=='image/webp')throw Error('이 브라우저에서 사진 변환을 지원하지 않습니다. WebP 사진을 사용해 주세요.');}finally{URL.revokeObjectURL(source);}
    const photo={id:'local-photo-'+crypto.randomUUID(),ownerUserId:account.id,memorialId:item.id,visitId,blob,status:'READY',moderationStatus:'APPROVED',sourceKind:'MOCK_UPLOAD',visibility:'PRIVATE',createdAt:new Date().toISOString()};
    const database=await db();await new Promise((resolve,reject)=>{const tx=database.transaction('photos','readwrite');tx.objectStore('photos').put(photo);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});const hydrated={...photo,url:URL.createObjectURL(blob)};photos.push(hydrated);return hydrated;
  }
  window.SSKR_MEMORIAL_MEDIA={read,add,all:()=>photos};
})();
