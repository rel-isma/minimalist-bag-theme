const fs=require('node:fs/promises');const {openPreview}=require('./browser-access.cjs');
(async()=>{
 const access=await openPreview();const {page,go,browser,redact}=access;
 const result={at:new Date().toISOString(),scope:'Native session availability diagnosis; no Admin writes',responses:[]};
 page.on('response',r=>{if(r.status()>=400){const url=new URL(r.url());result.responses.push({status:r.status(),host:url.hostname.endsWith('shopifypreview.com')?'[shared-preview-host]':url.hostname,path:url.pathname});}});
 try{
  const inspect=()=>page.evaluate(()=>({country:window.Shopify?.country,currency:window.Shopify?.currency?.active,variantId:document.querySelector('[data-product-variant-id]')?.value,submit:document.querySelector('[data-product-submit]')?.textContent.trim(),variants:[...document.querySelectorAll('[data-product-variants]')].map(e=>JSON.parse(e.dataset.variants)),formActions:[...document.querySelectorAll('form')].map(f=>({action:new URL(f.action).pathname,type:f.querySelector('[name="form_type"]')?.value}))}));
  await go('/products/line-tote-bag');result.before=await inspect();
  result.localization=await page.evaluate(async()=>{
   const body=new URLSearchParams({form_type:'localization',_method:'put',utf8:'✓',country_code:'US',language_code:'en',return_to:'/products/line-tote-bag'});
   const r=await fetch('/localization',{method:'POST',body,redirect:'follow'});return {status:r.status,path:new URL(r.url).pathname};
  });
  await go('/products/line-tote-bag');result.after=await inspect();
  await go('/products/line-tote-bag?country=US');result.countryQuery=await inspect();
  result.previewFrames=page.frames().map(f=>{try{const u=new URL(f.url());return {host:u.hostname.endsWith('shopifypreview.com')?'[shared-preview-host]':u.hostname,path:u.pathname};}catch{return {path:'blank'}}});
 }catch(error){result.failure=redact(error.message);}finally{await browser.close();}
 const safe=JSON.stringify(result,null,2).replaceAll(new URL(process.env.SHOPIFY_PREVIEW_URL).hostname,'[shared-preview-host]');
 await fs.writeFile('qa/shopify/availability-diagnosis.json',safe+'\n');console.log(safe);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
