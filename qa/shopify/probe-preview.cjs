// Supply the temporary share link in the environment; never persist cookies/tokens.
const fs=require('node:fs/promises');
const {chromium}=require('/tmp/atelier-phase0-tools/node_modules/playwright-core');
(async()=>{
 const target=process.env.SHOPIFY_PREVIEW_URL;
 if(!target||new URL(target).hostname.endsWith('.shopifypreview.com')===false)throw Error('Set the owner-provided Shopify preview URL.');
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 const result={at:new Date().toISOString(),scope:'Native shared preview access probe; no checkout/forms/Admin writes.',errors:[],consoleErrors:[]};
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900},locale:'en-US',reducedMotion:'reduce'});
  page.on('pageerror',e=>result.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text().replaceAll(new URL(target).hostname,'[shared-preview-host]'));});
  let response=await page.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
  result.httpStatus=response.status();
  if(await page.locator('input[name="password"]').count()){
   if(process.env.SHOPIFY_STOREFRONT_PASSWORD){
    try{
     const form=page.locator('form').filter({has:page.locator('input[name="password"]')}).first();
     await form.locator('input[name="password"]').fill(process.env.SHOPIFY_STOREFRONT_PASSWORD,{timeout:10000});
     await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded',timeout:30000}),form.locator('button[type="submit"], input[type="submit"]').first().click()]);
     // Reopen the shared draft after unlocking, retaining only in-memory cookies.
     response=await page.goto(target,{waitUntil:'domcontentloaded',timeout:45000});result.httpStatus=response.status();
     result.localPasswordSubmitted=true;
    }catch{
     // Playwright call logs can contain fill arguments: never persist that error.
     result.failure='Local storefront password submission did not complete; no credential or input call log recorded.';
    }
   }else result.accessBlocker='Storefront password required. Enter it locally in ignored .env.shopify-test, never in chat.';
  }
  await page.locator('h1').first().waitFor({timeout:15000}).catch(()=>{});
  result.dom=await page.evaluate(()=>({title:document.title,headings:[...document.querySelectorAll('h1,h2')].map(e=>e.textContent.trim()),nativeTheme:!!document.querySelector('[data-header]'),cards:document.querySelectorAll('[data-product-card]').length,passwordForm:!!document.querySelector('input[name="password"]'),bodyExcerpt:document.body.innerText.slice(0,600)}));
  result.accessible=result.httpStatus===200&&result.dom.nativeTheme&&result.dom.cards>0;
  if(result.accessible){await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'qa/shopify/preview-access-home.png',fullPage:true,animations:'disabled'});}
 }catch(error){result.failure=error.message.replaceAll(new URL(target).hostname,'[shared-preview-host]');}
 finally{await browser.close();}
 await fs.writeFile('qa/shopify/preview-access.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
