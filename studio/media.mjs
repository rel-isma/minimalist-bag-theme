import {ASSOCIATE_FILES,PRODUCT_MEDIA,REMOVE_FAILED_MEDIA} from './repair-operations.mjs';
// Attach existing READY files. Never ask Shopify to download its own CDN again.
export async function attachReadyGallery({selected,productId,graphql,payload,hostedFile,wait=ms=>new Promise(r=>setTimeout(r,ms))}){
 for(const item of selected){if(item.mediaId)continue;const file=await hostedFile(item.im);if(file.fileStatus!=='READY'||!file.id)throw new Error('Approved image is not ready; existing gallery retained');item.mediaId=file.id;}
 payload(await graphql(ASSOCIATE_FILES,{files:selected.map(item=>({id:item.mediaId,alt:item.im.alt||'',referencesToAdd:[productId]}))}),'fileUpdate');
 for(let attempt=0;attempt<20;attempt++){
  const current=(await graphql(PRODUCT_MEDIA,{id:productId})).product.media.nodes;
  // Failed unrelated CJ imports do not invalidate our already processed files.
  const approved=selected.map(item=>current.find(m=>m.id===item.mediaId));
  if(approved.some(m=>m?.status==='FAILED'))throw new Error('An approved image failed processing; existing gallery retained');
  if(approved.every(m=>m?.status==='READY'))return;
  await wait(1500);
 }
 throw new Error('Approved gallery is still attaching; existing gallery retained. Resume this job.');
}

export async function removeOldGallery({media,selected,productId,graphql,payload}){
 const remove=media.filter(m=>!selected.some(s=>s.mediaId===m.id)),failed=remove.filter(m=>m.status==='FAILED'),ready=remove.filter(m=>m.status==='READY');
 if(remove.some(m=>!['READY','FAILED'].includes(m.status)))throw new Error('An earlier product image is still processing. Resume when it finishes; approved images are retained.');
 if(ready.length)payload(await graphql(ASSOCIATE_FILES,{files:ready.map(m=>({id:m.id,referencesToRemove:[productId]}))}),'fileUpdate');
 if(failed.length){const result=(await graphql(REMOVE_FAILED_MEDIA,{productId,mediaIds:failed.map(m=>m.id)})).productDeleteMedia;if(result.mediaUserErrors?.length||result.deletedMediaIds?.length!==failed.length)throw new Error('Failed product image cleanup did not complete: '+JSON.stringify(result.mediaUserErrors||[]));}
}
