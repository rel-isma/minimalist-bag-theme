// Synthetic fixture: unit tests do not require private supplier/account files.
import {initialDraft} from '../core.mjs';
const id='test-bag';
export const source={pid:id,productSku:'TEST-BAG',productNameEn:'Test leather bag',description:'Synthetic product used only for local tests.',productKeyEnSet:['Color'],variants:['Black','Brown','White'].map((color,i)=>({vid:'test-variant-'+i,variantSku:'TEST-BAG-'+i,variantKey:color,variantSellPrice:10,variantImage:'https://example.com/test-'+i+'.jpg'}))};
const images=source.variants.map((v,i)=>({id:'test-image-'+i,file:`products/${id}/source/images/test-${i}.jpg`,variantIds:[v.vid],enabled:true}));
export const draft=initialDraft(id,source,null,images);
draft.productType='Shoulder bag';
for(const variant of draft.variants)variant.proposedRetailPrice={amount:'99.00',currency:'USD'};
