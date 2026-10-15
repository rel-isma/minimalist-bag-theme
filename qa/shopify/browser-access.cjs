const {chromium}=require('/tmp/atelier-phase0-tools/node_modules/playwright-core');
async function openPreview(width=1280){
 const shared=process.env.SHOPIFY_PREVIEW_URL;
 if(!shared||!new URL(shared).hostname.endsWith('.shopifypreview.com'))throw Error('Set the owner-provided preview URL.');
 const target=process.env.NATIVE_PRIMARY_PREVIEW==='1'?'https://atelier-vane-test.myshopify.com/?preview_theme_id=189100065059':shared;
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width,height:900},locale:'en-US',timezoneId:'Africa/Casablanca',reducedMotion:'reduce'});
 const page=await context.newPage();page.setDefaultTimeout(12000);
 const redact=text=>{
  let value=String(text).replaceAll(new URL(shared).hostname,'[shared-preview-host]');
  if(process.env.SHOPIFY_STOREFRONT_PASSWORD)value=value.replaceAll(process.env.SHOPIFY_STOREFRONT_PASSWORD,'[redacted]');
  return value;
 };
 try{
  await page.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
  if(await page.locator('input[name="password"]').count()){
   if(!process.env.SHOPIFY_STOREFRONT_PASSWORD)throw Error('Local storefront password is missing.');
   try{
    const form=page.locator('form').filter({has:page.locator('input[name="password"]')}).first();
    if(!await form.locator('input[name="password"]').isVisible()){
     const button=page.getByRole('button',{name:/enter.*password|password.*enter/i}).first();
     if(await button.count())await button.click();
     else await page.getByText(/enter using password/i).first().click();
    }
    await form.locator('input[name="password"]').fill(process.env.SHOPIFY_STOREFRONT_PASSWORD);
    await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded',timeout:30000}),form.locator('button[type="submit"],input[type="submit"],button:not([type])').first().click()]);
   }catch{throw Error('Private storefront unlock did not complete; input call log omitted.');}
   await page.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
  }
  await page.locator('[data-header]').waitFor();
  await page.waitForFunction(()=>!!window.AtelierTheme,{timeout:15000});
  const themeId=await page.evaluate(()=>window.Shopify?.theme?.id);
  if(String(themeId)!=='189100065059')throw Error('Browser is not rendering the intended uploaded draft theme.');
  const origin=new URL(page.url()).origin;
  const go=async route=>{
   const url=new URL(route,origin);if(process.env.NATIVE_PRIMARY_PREVIEW==='1')url.searchParams.set('preview_theme_id','189100065059');
   const response=await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('main').first().waitFor();
   await page.evaluate(()=>document.fonts.ready);
   return response;
  };
  return {browser,context,page,go,redact,origin};
 }catch(error){await browser.close();throw Error(redact(error.message));}
}
module.exports={openPreview};
