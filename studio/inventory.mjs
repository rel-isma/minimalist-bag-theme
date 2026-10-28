import {randomUUID} from 'node:crypto';
export const INVENTORY_OPERATIONS={
 location:`query StudioInventoryLocation($id:ID!){location(id:$id){id name isActive fulfillmentService{id serviceName inventoryManagement}}}`,
 product:`query StudioInventoryProduct($id:ID!){product(id:$id){id variants(first:100){pageInfo{hasNextPage}nodes{id sku inventoryItem{id tracked inventoryLevels(first:50){pageInfo{hasNextPage}nodes{id isActive canDeactivate location{id}quantities(names:["available","on_hand","committed","incoming","reserved"]){name quantity}}}}}}}}`,
 track:`mutation StudioTrackInventory($id:ID!){inventoryItemUpdate(id:$id,input:{tracked:true}){inventoryItem{id tracked}userErrors{field message}}}`,
 deactivate:`mutation StudioRemoveEmptyLocation($id:ID!){inventoryDeactivate(inventoryLevelId:$id){userErrors{field message}}}`,
 activate:`mutation StudioActivateCJInventory($item:ID!,$location:ID!,$key:String!){inventoryActivate(inventoryItemId:$item,locationId:$location) @idempotent(key:$key){inventoryLevel{id location{id}}userErrors{field message}}}`
};
export const INVENTORY_SCOPES=['read_inventory','write_inventory','read_locations'];
export function requireInventoryScopes(scopes){const available=new Set(scopes.map(s=>typeof s==='string'?s:s.handle));if(available.has('write_inventory'))available.add('read_inventory');const missing=INVENTORY_SCOPES.filter(s=>!available.has(s));if(missing.length)throw new Error('Automatic CJ stock setup needs Shopify permissions: '+missing.join(', ')+'. Add them to the installed app and approve the update once; then retry.');}
const gid=id=>String(id).startsWith('gid://shopify/Location/')?String(id):'gid://shopify/Location/'+id;
export async function inventoryPreflight({graphql,config,cjLocations,selectedIds=[]}){
 requireInventoryScopes(config.currentAppInstallation.accessScopes);
 const available=cjLocations.filter(l=>l.fromCj),chosen=selectedIds.length?available.filter(l=>selectedIds.map(gid).includes(gid(l.id))):available;
 if(chosen.length!==1||selectedIds.length>1)throw new Error('Choose exactly one verified CJ fulfillment location for automatic stock setup');
 const id=gid(chosen[0].id),location=(await graphql(INVENTORY_OPERATIONS.location,{id})).location;
 if(!location?.isActive||!location.fulfillmentService||!/cj\s*dropshipping/i.test(location.name+' '+location.fulfillmentService.serviceName))throw new Error('The selected Shopify location is not an active CJ fulfillment-service location');
 if(!location.fulfillmentService.inventoryManagement)throw new Error('CJ inventory management is disabled on its Shopify fulfillment service. Enable the CJ service inventory setting before retrying.');
 return location;
}
export function assertInventoryIdentity(d,live,product){
 if(!product||product.id!==live.id||product.variants.pageInfo.hasNextPage||product.variants.nodes.length!==d.variants.length)throw new Error('Incomplete Shopify inventory identity; stock setup stopped');
 for(const v of d.variants){const row=product.variants.nodes.find(x=>x.sku===v.sku),original=live.variants.nodes.find(x=>x.sku===v.sku);if(!row||row.id!==original?.id||!row.inventoryItem?.id||row.inventoryItem.inventoryLevels.pageInfo.hasNextPage)throw new Error('Shopify variant or inventory IDs changed; stock setup stopped');}
}
export async function enableCJInventory({graphql,payload,d,live,location,progress}){
 const load=async()=>{const p=(await graphql(INVENTORY_OPERATIONS.product,{id:live.id})).product;assertInventoryIdentity(d,live,p);return p;};
 let product=await load();
 // Never silently migrate a merchant's independently stocked inventory.
 for(const v of product.variants.nodes){if(v.inventoryItem.inventoryLevels.nodes.some(l=>l.location.id===location.id&&!l.isActive&&l.quantities.some(q=>q.quantity!==0)))throw new Error('Inactive CJ location has existing stock for '+v.sku+'. Review before activation to preserve quantities.');}
 for(const v of product.variants.nodes)if(v.inventoryItem.inventoryLevels.nodes.some(l=>l.location.id!==location.id&&l.quantities.some(q=>q.quantity!==0)))throw new Error('Stock exists at another location for '+v.sku+'. Review those locations before enabling CJ inventory automatically.');
 for(const v of product.variants.nodes)if(v.inventoryItem.inventoryLevels.nodes.some(l=>l.isActive&&l.location.id!==location.id&&!l.canDeactivate))throw new Error('Another inventory location cannot be safely deactivated for '+v.sku);
 for(const v of product.variants.nodes){
  if(!v.inventoryItem.tracked){await progress('Enabling quantity tracking for '+v.sku);payload(await graphql(INVENTORY_OPERATIONS.track,{id:v.inventoryItem.id}),'inventoryItemUpdate');}
  const active=v.inventoryItem.inventoryLevels.nodes.some(l=>l.isActive&&l.location.id===location.id);
  if(!active){await progress('Assigning '+v.sku+' to the CJ inventory location');payload(await graphql(INVENTORY_OPERATIONS.activate,{item:v.inventoryItem.id,location:location.id,key:randomUUID()}),'inventoryActivate');}
 }
 product=await load();
 for(const v of product.variants.nodes)for(const level of v.inventoryItem.inventoryLevels.nodes.filter(l=>l.isActive&&l.location.id!==location.id)){if(!level.canDeactivate||level.quantities.some(q=>q.quantity!==0))throw new Error('Stock or fulfillment changed at another location. Review before removing it.');await progress('Removing empty store location for '+v.sku+' so CJ handles stock');payload(await graphql(INVENTORY_OPERATIONS.deactivate,{id:level.id}),'inventoryDeactivate');}
 product=await load();
 if(product.variants.nodes.some(v=>!v.inventoryItem.tracked||!v.inventoryItem.inventoryLevels.nodes.some(l=>l.isActive&&l.location.id===location.id)||v.inventoryItem.inventoryLevels.nodes.some(l=>l.isActive&&l.location.id!==location.id)))throw new Error('Shopify did not confirm CJ inventory tracking/location setup; inspect Activity before retrying');
 return {configured:true,locationId:location.id,variants:product.variants.nodes.length,quantitiesWritten:false,available:product.variants.nodes.reduce((sum,v)=>sum+v.inventoryItem.inventoryLevels.nodes.filter(l=>l.location.id===location.id).reduce((n,l)=>n+(l.quantities.find(q=>q.name==='available')?.quantity||0),0),0)};
}
