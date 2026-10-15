// Anonymous native preview observation only; does not attempt a password/login.
const fs = require('node:fs/promises');
const {chromium} = require('/tmp/atelier-phase0-tools/node_modules/playwright-core');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 const result={scope:'Partial native password screen observation; successful unlock and full E13 pending.',themeId:189100065059,at:new Date().toISOString(),captures:[],runtimeErrors:[]};
 try{
  const context=await browser.newContext({viewport:{width:390,height:900},locale:'en-US',reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',error=>result.runtimeErrors.push(error.message));
  const response=await page.goto('https://atelier-vane-test.myshopify.com/?preview_theme_id=189100065059',{waitUntil:'domcontentloaded',timeout:45000});
  result.status=response.status();result.finalUrl=page.url();
  result.uploadedPasswordMarkup=await page.locator('body.template-password .password-main input[id^="PasswordInput-"]').count()>0;
  result.heading=await page.locator('h1').first().textContent().catch(()=>null);
  if(response.status()===200&&result.uploadedPasswordMarkup){
   await page.evaluate(()=>document.fonts.ready);
   for(const width of [390,768,1280,1536]){
    await page.setViewportSize({width,height:900});
    await page.screenshot({path:`qa/shopify/password-${width}.png`,fullPage:true,animations:'disabled'});
    result.captures.push({width,file:`password-${width}.png`});
   }
  }else result.blocked='No verified uploaded-theme password markup; no screenshots treated as native theme evidence.';
 }catch(error){result.blocked=error.message;}finally{await browser.close();}
 await fs.writeFile('qa/shopify/password-observation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(error=>{console.error(error);process.exitCode=1;});
