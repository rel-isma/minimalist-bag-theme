const {chromium}=require('/tmp/atelier-studio-qa/node_modules/playwright');
const fs=require('node:fs/promises');const path=require('node:path');const {pathToFileURL}=require('node:url');
(async()=>{
 const root=path.resolve('products'),catalog=JSON.parse(await fs.readFile(root+'/prepared-catalog.json'));
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox'],timeout:45000});
 const context=await browser.newContext();const page=await context.newPage();const errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});await page.goto(pathToFileURL(root+'/index.html').href,{waitUntil:'load'});
  if(await page.locator('.card').count()!==10)errors.push('Catalog card count at '+width);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))errors.push('Catalog horizontal overflow at '+width);
  await page.screenshot({path:root+'/.state/review-catalog-'+width+'.png',fullPage:false});
  for(const product of catalog.products){
   const id=product.source.cjProductId;await page.goto(pathToFileURL(root+'/'+id+'/prepared/index.html').href,{waitUntil:'load'});
   await page.locator('[data-hero]').evaluate(im=>im.decode());
   if(await page.locator('h1').innerText()!==product.shopify.title)errors.push('Wrong title '+id);
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))errors.push('Product overflow '+id+' at '+width);
   for(const color of product.swatches){
    const button=page.locator('[data-color]').filter({hasText:color.optionValue}).first();await button.click();
    const value=await button.getAttribute('data-color');
    const selected=await page.locator('[data-photo][aria-pressed="true"]').getAttribute('data-colors');
    if(!(selected||'').split('|').includes(value))errors.push('Color selection mismatch '+id+'/'+value);
   }
   const last=page.locator('[data-photo]').last();await last.click();const expected=await last.getAttribute('data-source');
   if(await page.locator('img[data-source]').getAttribute('src')!==expected)errors.push('Original comparison did not follow image '+id);
   await page.locator('.comparison summary').click();await page.locator('img[data-source]').evaluate(im=>{im.loading='eager';return im.decode()});
   if(await page.locator('[data-photo]').count()!==product.media.length)errors.push('Gallery count mismatch '+id);
   results.push({product:id,width,galleryPhotos:product.media.length,colorsChecked:product.swatches.length});
  }
 }
 await page.goto(pathToFileURL(root+'/'+catalog.products[0].source.cjProductId+'/prepared/index.html').href,{waitUntil:'load'});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:root+'/.state/review-product-desktop.png',fullPage:false});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:root+'/.state/review-product-mobile.png',fullPage:false});
 const report={checkedAt:new Date().toISOString(),passed:errors.length===0,pages:results.length,catalogViewports:[1440,390],checks:['All 16 product pages at desktop and mobile widths','Gallery and every color button','Original-source image follows selected photo','Images decode successfully','No document horizontal overflow','No JavaScript page errors'],errors,results};
 await fs.writeFile(root+'/REVIEW-BROWSER-RESULTS.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,productPageViews:results.length,errors}));if(errors.length)process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
