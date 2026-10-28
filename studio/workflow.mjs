import fs from 'node:fs/promises';
import {STATE,readJson,writeJson,product,safeId,matchProduct,classify,validateDraft,digest} from './core.mjs';
import {approvalStatus,shippingSignature} from './approval.mjs';
import {cj} from './cj.mjs';
import {freight,cjShop} from './integrations.mjs';

const cacheFile=id=>STATE+'/shipping-checks/'+safeId(id)+'.json';
export function setupSignature(d){return digest({id:d.id,source:d.fulfillment.sourceCountryCode,area:d.fulfillment.defaultArea,destination:d.fulfillment.targetCountryCode,locations:d.fulfillment.locationIds,collections:d.collectionIds,variants:d.variants.map(v=>v.cjVariantId)});}
export async function launchWorkspace(){
 const settings=await readJson(STATE+'/workflow-settings.json',{destination:'US'}),snapshot=await readJson(STATE+'/snapshot.json'),rows=[];
 const names=await fs.readdir(STATE+'/approvals').catch(()=>[]);
 const jobs=await Promise.all((await fs.readdir(STATE+'/jobs').catch(()=>[])).filter(n=>n.endsWith('.json')).map(n=>readJson(STATE+'/jobs/'+n)));
 for(const name of names.filter(n=>n.endsWith('.json'))){const {draft:d,source}=await product(safeId(name.slice(0,-5)));let live=null,conflict=null;try{live=snapshot&&matchProduct(d,snapshot.products);}catch(e){conflict=e.message;}
  const approval=await approvalStatus(d),status=classify(d,live,snapshot?.cj.links,snapshot?.cj.details),pending=jobs.filter(j=>j.productId===d.id&&j.status!=='complete'&&(j.listedId||j.nativePublishIntent)&&!['PRODUCT_FAIL','PRODUCT_CANCEL'].includes(j.listingStatus)).sort((a,b)=>b.startedAt.localeCompare(a.startedAt))[0];
  const errors=validateDraft(d,source),shippingReviewed=d.fulfillment.shippingReviewSignature===shippingSignature(d.fulfillment),shipping=await readJson(cacheFile(d.id));
  rows.push({id:d.id,title:d.title,sku:d.cjProductSku,image:d.images.find(i=>i.enabled)?.url,variants:d.variants.length,photos:d.images.filter(i=>i.enabled).length,price:d.variants[0]?.proposedRetailPrice.amount,approval,status,conflict,errors,notes:d.reviewNotes,fulfillment:d.fulfillment,shippingReviewed,pendingJob:pending?{id:pending.id,status:pending.status,error:pending.error}:null,shippingCheck:shipping&&shipping.signature===setupSignature(d)?shipping:null});
 }
 return {destination:settings.destination||'US',rows,checkedAt:snapshot?.checkedAt||null};
}
export async function checkShipping(id,{countryCode}={}){
 const {draft:d}=await product(id);d.fulfillment={...d.fulfillment,targetCountryCode:countryCode||(await readJson(STATE+'/destinations/'+safeId(id)+'.json'))?.countries?.[0]||d.fulfillment.targetCountryCode||'US'};
 const shop=await cjShop(),locations=(await cj('shop/location/queryList',{}, {shopId:shop.id})).filter(l=>l.fromCj);
 const selected=locations.filter(l=>d.fulfillment.locationIds.includes(String(l.id)));
 if(selected.length!==1){if(locations.length!==1)throw new Error('Choose the correct CJ fulfillment location in the product Fulfillment tab, then check again.');d.fulfillment.locationIds=[String(locations[0].id)];}
 const quotes=await freight(d);if(!Array.isArray(quotes)||!quotes.length)throw new Error('CJ returned no available shipping methods to the selected country for these variants.');
 const profiles=await cj('listed/queryShopAvailableProfiles',{}, {shopId:shop.id,shopLocationIds:d.fulfillment.locationIds,sources:'PUBLISH',collectionIds:d.collectionIds});
 const result={checkedAt:new Date().toISOString(),signature:setupSignature(d),location:{id:d.fulfillment.locationIds[0],name:locations.find(l=>String(l.id)===d.fulfillment.locationIds[0])?.name},quotes,profiles:profiles?.profiles||[],profileRequired:!!profiles?.isNeedBindProfile};
 d.savedAt=new Date().toISOString();await writeJson(STATE+'/drafts/'+d.id+'.json',d);await writeJson(cacheFile(d.id),result);return result;
}
export async function chooseShipping(id,{logistics,deliveryProfileId='',acknowledgeRates=false}){
 const {draft:d}=await product(id),check=await readJson(cacheFile(id));
 validateShippingChoice(d,check,{logistics,deliveryProfileId,acknowledgeRates});
 d.fulfillment={...d.fulfillment,logistics,deliveryProfileId};d.fulfillment.shippingReviewSignature=shippingSignature(d.fulfillment);d.savedAt=new Date().toISOString();await writeJson(STATE+'/drafts/'+id+'.json',d);return d.fulfillment;
}

export function validateShippingChoice(d,check,{logistics,deliveryProfileId='',acknowledgeRates=false},now=Date.now()){
 if(!check||check.signature!==setupSignature(d)||!Number.isFinite(Date.parse(check.checkedAt))||now-Date.parse(check.checkedAt)>15*60*1000||Date.parse(check.checkedAt)>now+60000)throw new Error('Shipping check expired or settings changed. Check shipping for this country again.');
 if(!check.quotes.some(q=>q.logisticName===logistics))throw new Error('Choose a method returned by the current CJ shipping check.');
 if(check.profileRequired&&!deliveryProfileId)throw new Error('Choose a compatible delivery profile.');
 if(deliveryProfileId&&!check.profiles.some(p=>String(p.id)===deliveryProfileId))throw new Error('Choose a profile returned by CJ for this location.');
 if(!acknowledgeRates)throw new Error('Review the selected shipping method and delivery profile rates before continuing.');
 return true;
}
