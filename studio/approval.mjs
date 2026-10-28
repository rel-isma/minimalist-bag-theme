import {STATE,digest,readJson,writeJson,validateDraft,safeId} from './core.mjs';

// Shipping and save timestamps can change without changing the approved presentation.
export function contentSignature(d){
 const keys=['id','cjProductSku','title','handle','description','vendor','productType','tags','seo','material','dimensions','care','variants','swatches','images','reviewNotes','replaceGallery','collectionIds','templateSuffix','taxable'];
 return digest(Object.fromEntries(keys.map(k=>[k,d[k]])));
}
export function shippingSignature(f){return digest({sourceCountryCode:f.sourceCountryCode,defaultArea:f.defaultArea,targetCountryCode:f.targetCountryCode,logistics:f.logistics,locationIds:f.locationIds,deliveryProfileId:f.deliveryProfileId});}
export async function approveContent(d,source,{acknowledgeNotes=false,origin='Studio review'}={}){
 const errors=validateDraft(d,source);if(errors.length)throw new Error(errors.join('\n'));
 if(d.reviewNotes?.length&&!acknowledgeNotes)throw new Error('Acknowledge the supplier notes and omitted facts before approving content.');
 const approval={productId:safeId(d.id),signature:contentSignature(d),approvedAt:new Date().toISOString(),scope:'Product presentation and USD retail prices; not shipping or publication',origin};
 await writeJson(STATE+'/approvals/'+d.id+'.json',approval);return approval;
}
export async function approvalStatus(d){const approval=await readJson(STATE+'/approvals/'+safeId(d.id)+'.json');return {approved:!!approval&&approval.signature===contentSignature(d),approval:approval?{approvedAt:approval.approvedAt,scope:approval.scope}:null};}
export async function assertApproval(d){if(!(await approvalStatus(d)).approved)throw new Error('Content or prices need approval. Save the draft, approve it in Studio, then review the listing.');}
