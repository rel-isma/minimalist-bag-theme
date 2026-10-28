import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const project=fileURLToPath(new URL('../',import.meta.url));
try { process.loadEnvFile(project+'.env'); } catch(e) { if(e.code!=='ENOENT')throw e; }
const target='s35my0-uu.myshopify.com';
const shop=(process.env.SHOPIFY_SHOP||'').trim().replace(/\.myshopify\.com$/,'')+'.myshopify.com';
const id=(process.env.SHOPIFY_CLIENT_ID||'').trim(),secret=(process.env.SHOPIFY_CLIENT_SECRET||'').trim();
async function run(){
 if(shop!==target)throw new Error('SHOPIFY_SHOP must be s35my0-uu. No request sent.');
 if(!id||!secret||/your-|replace/i.test(id+' '+secret))throw new Error('Save real SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET in the ignored local .env file first. Never paste them into chat.');
 const response=await fetch(`https://${shop}/admin/oauth/access_token`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',client_id:id,client_secret:secret})});
 const token=await response.json().catch(()=>({}));
 if(!response.ok||!token.access_token){if(token.error==='shop_not_permitted'||String(token.error_description||'').includes('shop_not_permitted'))throw new Error('Shopify requires the app and store to belong to the same organization for client credentials. Use the official OAuth authorization flow for this store instead; do not create a replacement store.');throw new Error(`Shopify authentication failed (HTTP ${response.status}). Check the installed app, credentials and organization. Credentials and response details are not logged.`);}
 const result=await fetch(`https://${shop}/admin/api/2026-10/graphql.json`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),headers:{'Content-Type':'application/json','X-Shopify-Access-Token':token.access_token},body:JSON.stringify({query:'query ConnectionCheck { shop { name myshopifyDomain currencyCode } currentAppInstallation { accessScopes { handle } } }'})});
 const payload=await result.json().catch(()=>({}));
 if(!result.ok||payload.errors||!payload.data?.shop)throw new Error(`Shopify read-only connection check failed (HTTP ${result.status}). No product changes performed.`);
 const store=payload.data.shop;if(store.myshopifyDomain!==target)throw new Error('Shopify returned an unexpected store. Stopped.');
 const granted=payload.data.currentAppInstallation.accessScopes.map(s=>s.handle).sort();
 const required=['read_products','write_products','read_files','write_files','read_publications','write_publications','read_themes'];
 const missing=required.filter(s=>!granted.includes(s));
 const report={checkedAt:new Date().toISOString(),method:'terminal_client_credentials',store:store.myshopifyDomain,name:store.name,currency:store.currencyCode,adminAuthorizationVerified:true,grantedScopes:granted,missingScopes:missing,expectedCurrency:'USD',currencyMatches:store.currencyCode==='USD',shopifyChanged:false};
 await fs.writeFile(project+'products/SHOPIFY-CONNECTION-STATUS.json',JSON.stringify(report,null,2)+'\n');
 console.log(`Connected: ${store.name} · ${store.myshopifyDomain} · ${store.currencyCode}`);
 console.log('Granted scopes: '+granted.join(', '));console.log('No products changed. Token kept in memory only.');
 if(missing.length){console.log('Missing scopes: '+missing.join(', '));process.exitCode=1;}
 if(store.currencyCode!=='USD'){console.log('Currency differs from the USD batch; upload must stop.');process.exitCode=1;}
}
run().catch(e=>{console.error(e instanceof TypeError?'Connection failed. Check network access; no credentials are logged.':e.message);process.exitCode=1});
