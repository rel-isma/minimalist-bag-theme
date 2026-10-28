import {fileURLToPath} from 'node:url';
export const project=fileURLToPath(new URL('../',import.meta.url));
process.loadEnvFile(project+'.env');
export const shop='s35my0-uu.myshopify.com';
let token,expires=0;
export function resetShopifyAuthentication(){token=null;expires=0;}
export async function graphql(query,variables={}){
 if((process.env.SHOPIFY_SHOP||'').replace(/\.myshopify\.com$/,'')!=='s35my0-uu')throw new Error('Unexpected Shopify store setting');
 if(!token||Date.now()>expires){const r=await fetch(`https://${shop}/admin/oauth/access_token`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',client_id:process.env.SHOPIFY_CLIENT_ID||'',client_secret:process.env.SHOPIFY_CLIENT_SECRET||''})});const t=await r.json();if(!r.ok||!t.access_token)throw new Error('Shopify authentication failed; credential response not logged');token=t.access_token;expires=Date.now()+Math.max(0,Number(t.expires_in)-120)*1000;}
 const r=await fetch(`https://${shop}/admin/api/2026-10/graphql.json`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(60000),headers:{'Content-Type':'application/json','X-Shopify-Access-Token':token},body:JSON.stringify({query,variables})});const p=await r.json();if(!r.ok)throw new Error('Shopify API HTTP '+r.status);if(p.errors)throw new Error(JSON.stringify(p.errors.map(e=>({message:e.message,path:e.path}))));return p.data;
}
export function payload(data,key){const result=data[key];if(!result||result.userErrors?.length)throw new Error(key+': '+JSON.stringify(result?.userErrors||'No response'));return result;}
