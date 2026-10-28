import fs from 'node:fs/promises';
import {ratePlan,applyRatePlan,refreshShippingAdmin} from '../../studio/shipping.mjs';
import {graphql,payload} from '../shopify-client.mjs';
const profileId='gid://shopify/DeliveryProfile/134383960383',groupId='gid://shopify/DeliveryLocationGroup/136101298495';
const raw=await fs.readFile('products/finish-launch/market-policy-operations.graphql','utf8');
const mutation=raw.slice(raw.indexOf('mutation FinishMarketUpdate'),raw.indexOf('\nquery FinishProfiles'));
const results=[];
for(const [country,amount] of [['US','19.95'],['GB','12.95']]){
 let admin=await refreshShippingAdmin();
 const group=admin.profiles.find(p=>p.id===profileId)?.profileLocationGroups.find(g=>g.locationGroup.id===groupId);
 if(!group)throw Error('Expected CJ delivery group missing');
 const zones=group.zones.filter(z=>z.zone.countries.some(c=>c.code.countryCode===country));
 const methods=zones.flatMap(z=>z.methodDefinitions.nodes);
 const exact=methods.filter(m=>m.active&&m.name==='Standard tracked shipping'&&Number(m.rateProvider?.price?.amount)===Number(amount)&&m.rateProvider?.price?.currencyCode==='USD');
 if(!exact.length){if(zones.length||methods.length)throw Error('Destination already configured differently; review before replacement');const plan=await ratePlan({profileId,groupId,country,amount,name:'Standard tracked shipping',active:true});const applied=await applyRatePlan(plan.id,true);results.push({country,rate:applied.summary,verified:applied.complete});}
 else results.push({country,amount:Number(amount),alreadyApplied:true,verified:true});
 admin=await refreshShippingAdmin();
 const markets=admin.markets.filter(m=>m.conditions?.regionsCondition?.regions.nodes.some(r=>r.code===country));
 if(markets.length!==1)throw Error('Unexpected country market coverage');
 if(markets[0].status!=='ACTIVE')payload(await graphql(mutation,{id:markets[0].id,input:{enabled:true}}),'marketUpdate');
 await fs.writeFile('products/finish-launch/shipping-applied.json',JSON.stringify({at:new Date().toISOString(),approvedByOwner:true,results},null,2));
 console.log(country+' approved rate and market applied');
}
const admin=await refreshShippingAdmin();
await fs.writeFile('products/.state/finish-launch/shipping-after.json',JSON.stringify(admin,null,2),{mode:0o600});
console.log(JSON.stringify({markets:admin.markets.map(m=>({name:m.name,status:m.status})),results},null,2));
