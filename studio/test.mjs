import {parseCJ} from './cj.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {validateDraft,classify,matchProduct,assertConnections,safeId} from './core.mjs';
import {draft,source} from './fixtures/product.mjs';const make=()=>structuredClone(draft);const live={id:'gid://shopify/Product/1',handle:draft.handle,status:'ACTIVE',metafields:{nodes:[]},variants:{nodes:draft.variants.map((v,i)=>({id:'gid://shopify/ProductVariant/'+(i+1),sku:v.sku,inventoryQuantity:10}))}};
const links=draft.variants.map((v,i)=>({shopId:'real-shop',cjProductId:draft.id,cjVariantId:v.cjVariantId,platformProductId:'1',platformVariantId:String(i+1)}));
test('saved supplier variants pass preparation checks',()=>assert.deepEqual(validateDraft(draft,source),[]));
test('CJ SKU edits are rejected',()=>{const d=make();d.variants[0].sku='WRONG';assert.match(validateDraft(d,source).join(),/cannot change/)});
test('every variant must have a selected image',()=>{const d=make();d.images.forEach(im=>im.variantIds=[]);assert.match(validateDraft(d,source).join(),/Select a product image/)});
test('reject paths outside owned product image folders',()=>{const d=make();d.images[0].file='.env';assert.match(validateDraft(d,source).join(),/Invalid local/);assert.throws(()=>safeId('../.env'))});
test('stock never substitutes for verified fulfillment links',()=>{const c=classify(draft,live,[],[]);assert.equal(c.state,'needs-link');assert.equal(c.inventoryManaged,false)});
test('partial or incorrect CJ mappings never count as fully linked',()=>{assert.equal(classify(draft,live,links.slice(0,2),[]).state,'needs-link');const bad=structuredClone(links);bad[0].cjVariantId='different';assert.equal(classify(draft,live,bad,[]).linked,2);assert.throws(()=>assertConnections(draft,live,bad),/Conflicting/)});
test('full links and inventory management are distinct checks',()=>{assert.equal(classify(draft,live,links,[]).state,'connected');assert.equal(classify(draft,live,links,[]).inventoryManaged,false);assert.equal(classify(draft,live,links,[{platformProductId:'1',variants:links.map(v=>({platformVariantId:v.platformVariantId,inventoryItemStatus:'2'}))}]).inventoryManaged,true)});
test('duplicate matches stop without creating replacements',()=>{assert.equal(matchProduct(draft,[live]).id,live.id);assert.throws(()=>matchProduct(draft,[live,{...live,id:'gid://shopify/Product/2'}]),/Ambiguous/)});
test('live SKU mismatch stops instead of recreating variant IDs',()=>{const bad=structuredClone(live);bad.variants.nodes[0].sku='other';assert.throws(()=>matchProduct(draft,[bad]),/do not exactly match/)});
test('prices and gallery limits are enforced',()=>{const d=make();d.variants[0].proposedRetailPrice.amount='0';assert.match(validateDraft(d,source).join(),/positive USD/);d.images=Array.from({length:9},()=>d.images[0]);assert.match(validateDraft(d,source).join(),/eight/)});
test('listing unresolved supplier claims is blocked; connection repair is independent',()=>{assert.match(validateDraft(draft,source,{publish:true}).join(),/Review each supplier/);assert.equal(validateDraft(draft,source).length,0)});

test('CJ 19-digit IDs are parsed without losing precision',()=>{assert.deepEqual(parseCJ('{"id":2408310805071622300,"text":"2408310805071622300","items":[1840000000000000001],"price":19.07}'),{id:'2408310805071622300',text:'2408310805071622300',items:['1840000000000000001'],price:19.07});});
test('duplicate CJ variant references cannot replace a missing source variant',()=>{const d=make();d.variants[1]=structuredClone(d.variants[0]);assert.match(validateDraft(d,source).join(),/cannot change/);});
test('another product image folder is not allowed',()=>{const d=make();d.images[0].file='studio/.state/uploads/other-product/secret.png';assert.match(validateDraft(d,source).join(),/Invalid local/);});
test('color renames require a matching explicit color mapping',()=>{const d=make();d.variants[0].optionValues[0].value='Custom color';assert.match(validateDraft(d,source).join(),/color circle/);});
test('non-finite prices are not valid retail prices',()=>{const d=make();d.variants[0].proposedRetailPrice.amount='Infinity';assert.match(validateDraft(d,source).join(),/positive USD/);});

test('inventory confirmation requires the exact Shopify variant IDs',()=>{assert.equal(classify(draft,live,links,[{platformProductId:'1',variants:links.map(()=>({platformVariantId:'wrong',inventoryItemStatus:'2'}))}]).inventoryManaged,false)});
