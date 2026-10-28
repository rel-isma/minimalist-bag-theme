// Reuse CJ's store-product mirror before creating native fulfillment connections.
// A previously synced Shopify listing already exists here even when it is unlinked.
export async function ensureStoreRegistration({cj,details,shopId,live,progress}) {
 const productId=live.id.split('/').pop();
 const image=live.media.nodes.find(m=>m.image?.url)?.image.url;
 const load=async()=>{
  const rows=await details(shopId,[productId]);
  if(rows.some(p=>String(p.shopId)!==String(shopId)||String(p.platformProductId)!==productId))throw new Error('CJ store registration returned a different shop or product');
  if(rows.length>1)throw new Error('Duplicate CJ store-product records need review');
  return rows[0]||null;
 };
 let mirror=await load();
 if(!mirror){
  if(!image)throw new Error('Shopify product has no processed image');
  await progress('Registering Shopify product with CJ');
  try{await cj('store/product/saveProduct',{}, {shopId,id:productId,title:live.title,image,description:live.descriptionHtml,priceMin:Math.min(...live.variants.nodes.map(v=>Number(v.price))),priceMax:Math.max(...live.variants.nodes.map(v=>Number(v.price))),priceCurrency:'USD'});}
  catch(e){if(Number(e.code)!==415)throw e;/* A concurrent CJ sync may have created it. Verify before continuing. */}
  mirror=await load();
  if(!mirror)throw new Error('CJ product registration could not be verified; connection stopped');
 }else await progress('Reusing the existing CJ store-product record');
 const missing=()=>live.variants.nodes.filter(v=>!mirror.variants?.some(x=>String(x.platformVariantId)===v.id.split('/').pop()));
 const assertVariants=()=>{for(const existing of mirror.variants||[]){const v=live.variants.nodes.find(v=>v.id.split('/').pop()===String(existing.platformVariantId));if(!v||existing.platformVariantSku!==v.sku)throw new Error('CJ store variant IDs/SKUs do not match Shopify; connection stopped');}};
 assertVariants();
 if(missing().length){
  await progress('Registering missing Shopify variants with CJ');
  if(!image)throw new Error('Shopify product has no processed image');
  const rows=await cj('store/product/saveVariantBatch',{}, {shopId,variants:missing().map(v=>({id:v.id.split('/').pop(),productId,title:v.selectedOptions.map(o=>o.value).join(' / '),sku:v.sku,image:v.image?.url||image,shopPrice:Number(v.price),shopPriceCurrency:'USD'}))});
  if(!Array.isArray(rows))throw new Error('Unexpected CJ variant registration response');
  mirror=await load();if(!mirror)throw new Error('CJ store-product record disappeared');assertVariants();
  if(missing().length)throw new Error('CJ did not register every Shopify variant: '+rows.filter(r=>!r.saveSuccess).map(r=>r.saveFailMessage||r.id).join('; '));
 }
 return mirror;
}
