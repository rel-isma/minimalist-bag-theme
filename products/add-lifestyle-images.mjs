import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {ROOT,STATE,product,readJson,writeJson,digest,validateDraft,matchProduct} from '../studio/core.mjs';
import {approvalStatus,approveContent} from '../studio/approval.mjs';
import {liveShopify,hostedFile,OPERATIONS,refresh} from '../studio/integrations.mjs';
import {attachReadyGallery} from '../studio/media.mjs';
import {graphql,payload} from './shopify-client.mjs';
const recordFile=ROOT+'products/lifestyle-additions.json',record=await readJson(recordFile),apply=process.argv.includes('--apply');
const report={checkedAt:new Date().toISOString(),products:[],mode:apply?'image-only existing Shopify gallery additions':'local Studio gallery additions'};
const immutable=p=>digest({id:p.id,title:p.title,handle:p.handle,status:p.status,description:p.descriptionHtml,seo:p.seo,vendor:p.vendor,type:p.productType,tags:p.tags,template:p.templateSuffix,collections:p.collections,metafields:p.metafields,variants:p.variants.nodes.map(v=>({id:v.id,sku:v.sku,price:v.price,options:v.selectedOptions,image:v.image,tracked:v.inventoryItem.tracked,policy:v.inventoryPolicy}))});
let all=apply?await liveShopify():null;
for(const job of record.jobs){
 if(job.status!=='visually_reviewed')throw new Error('Image must be visually reviewed before adding: '+job.title);
 const bytes=await fs.readFile(ROOT+job.output);assert.equal(digest(bytes),job.sha256);const {draft:d,source}=await product(job.id);
 const im={id:digest(job.output).slice(0,16),file:job.output,url:'/media/'+job.output,alt:`${job.title} in ${job.color}, carried by an adult woman`,variantIds:[],enabled:true,kind:job.mode==='composite'?'lifestyle-composite':'lifestyle-source-edit',role:'lifestyle',sourceUrl:job.sourceUrl,sourceFile:job.reference,generated:true};
 if(!apply){
  const backup=STATE+'/lifestyle-backup/'+d.id+'.json';if(!await readJson(backup))await writeJson(backup,d);
  const wasApproved=(await approvalStatus(d)).approved;
  const others=d.images.filter(i=>i.id!==im.id&&i.file!==im.file);d.images=[others[0],im,...others.slice(1)];
  const errors=validateDraft(d,source);if(errors.length)throw new Error(errors.join('; '));await writeJson(STATE+'/drafts/'+d.id+'.json',d);
  // The owner explicitly requested this image addition. Preserve existing content/price approval only;
  // never approve a previously unapproved product or authorize its shipping/publication here.
  if(wasApproved)await approveContent(d,source,{acknowledgeNotes:true,origin:'Owner requested missing woman-carrying gallery additions, 2026-10-25; prior approved content/prices preserved'});
  await writeJson(ROOT+'products/'+d.id+'/prepared/lifestyle-addition.json',{...job,image:im,addedToStudioAt:new Date().toISOString()});
  report.products.push({id:d.id,title:d.title,studioImages:d.images.filter(i=>i.enabled).length,added:true});console.log('Prepared '+d.title);continue;
 }
 if(!d.images.some(i=>i.id===im.id))throw new Error('Prepare local gallery before applying');
 const live=matchProduct(d,all.products);if(!live){report.products.push({id:d.id,title:d.title,status:'Prepared in Studio; not listed. No Shopify product created.'});continue;}
 const old=immutable(live),oldIds=live.media.nodes.map(m=>m.id),file=await hostedFile(im),selected=[{im,mediaId:file.id}];
 const finalIds=[oldIds[0],file.id,...oldIds.slice(1).filter(id=>id!==file.id)].filter(Boolean);
 if(new Set(finalIds).size!==finalIds.length||finalIds.length>8)throw new Error('Gallery exceeds eight images or contains duplicate IDs: '+d.title);
 const journalFile=STATE+'/lifestyle-publish/'+d.id+'.json';if(!await readJson(journalFile))await writeJson(journalFile,{productId:live.id,before:live,image:im,fileId:file.id,startedAt:new Date().toISOString()});
 await attachReadyGallery({selected,productId:live.id,graphql,payload,hostedFile});
 const result=(await graphql(OPERATIONS.reorder,{id:live.id,moves:finalIds.map((id,i)=>({id,newPosition:String(i)}))})).productReorderMedia;
 if(result.mediaUserErrors.length)throw new Error(JSON.stringify(result.mediaUserErrors));
 if(result.job){let done=false;for(let attempt=0;attempt<20;attempt++){if((await graphql('query($id:ID!){job(id:$id){id done}}',{id:result.job.id})).job?.done){done=true;break;}await new Promise(r=>setTimeout(r,1500));}if(!done)throw new Error('Gallery order still processing; retry same image addition');}
 all=await liveShopify();const after=matchProduct(d,all.products);assert.equal(immutable(after),old,'Non-gallery product data changed during image-only update');assert.deepEqual(after.media.nodes.map(m=>m.id),finalIds);assert.ok(after.media.nodes.every(m=>m.status==='READY'));assert.ok(oldIds.every(id=>after.media.nodes.some(m=>m.id===id)));
 const markerFile=STATE+'/published-media/'+d.id+'.json',marker=await readJson(markerFile,{});marker[im.id]={signature:job.sha256,mediaId:file.id};await writeJson(markerFile,marker);
 const row={id:d.id,title:d.title,shopifyId:live.id,addedMediaId:file.id,galleryCount:finalIds.length,allOriginalMediaRetained:true,nonGalleryDataUnchanged:true,verifiedAt:new Date().toISOString()};await writeJson(journalFile,{...await readJson(journalFile),result:row,complete:true});report.products.push(row);console.log('Verified Shopify gallery: '+d.title);
}
await writeJson(ROOT+'products/LIFESTYLE-'+(apply?'SHOPIFY':'PREPARATION')+'-RESULTS.json',report);if(apply)await refresh();console.log(JSON.stringify(report,null,2));
