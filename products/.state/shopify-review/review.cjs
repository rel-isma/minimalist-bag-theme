const {chromium}=require('/tmp/atelier-studio-qa/node_modules/playwright');
const fs=require('node:fs/promises');
const out=__dirname;
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();
 await page.goto('https://ayoihw5vp0pbqsn1-100585832767.shopifypreview.com',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForTimeout(3000);
 const inspect=async()=>await page.evaluate(()=>{
 const pick=s=>[...document.querySelectorAll(s)].slice(0,30).map(e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return {tag:e.tagName,text:e.textContent.trim().slice(0,180),font:c.fontFamily,size:c.fontSize,color:c.color,background:c.backgroundColor,width:Math.round(r.width),height:Math.round(r.height)}});
 return {url:new URL(location.href).origin+location.pathname,title:document.title,headings:pick('h1,h2,h3'),bodyStyle:pick('body'),links:[...document.querySelectorAll('a[href]')].map(a=>({text:a.textContent.trim().slice(0,80),href:a.getAttribute('href')})).filter(a=>a.text||/products|collections/.test(a.href)),images:[...document.images].filter(i=>i.naturalWidth>100).slice(0,35).map(i=>({alt:i.alt,width:i.naturalWidth,height:i.naturalHeight,src:i.currentSrc})),text:document.body.innerText.slice(0,16000),cssVariables:[...getComputedStyle(document.documentElement)].filter(p=>p.startsWith('--')).map(p=>[p,getComputedStyle(document.documentElement).getPropertyValue(p).trim()])};});
 let home=await inspect();await fs.writeFile(out+'/home.json',JSON.stringify(home,null,2));
 if(new URL(page.url()).pathname==='/password'){console.log('Preview reached password gate; saved page inspection.');await browser.close();return;}
 // Close only visible preview offer dialogs; no email submission or cart changes.
 for(const selector of ['[data-welcome-close]','[data-offers-close]','button[aria-label="Close"]']){const b=page.locator(selector).first();if(await b.isVisible().catch(()=>false))await b.click().catch(()=>{});}
 await page.screenshot({path:out+'/home-desktop.png',fullPage:true});
 const products=[...new Set(home.links.filter(a=>a.href?.includes('/products/')).map(a=>a.href.split('?')[0]))].slice(0,2);
 const collection=home.links.find(a=>a.href?.includes('/collections/')&&!a.href.includes('shopify.com'));
 const pages=[];
 for(const [index,href]of [...products,...(collection?[collection.href]:[])].entries()){
  await page.goto(new URL(href,page.url()).href,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(1800);
  const data=await inspect();pages.push(data);await page.screenshot({path:out+'/page-'+index+'.png',fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});
 if(products[0]){await page.goto(new URL(products[0],page.url()).href,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(1000);await page.screenshot({path:out+'/product-mobile.png',fullPage:true});}
 await fs.writeFile(out+'/pages.json',JSON.stringify(pages,null,2));
 console.log(JSON.stringify({homeTitle:home.title,homePath:new URL(home.url).pathname,productAndCollectionPages:pages.map(p=>({title:p.title,url:p.url})),screenshotsSaved:true}));await browser.close();
})().catch(e=>{console.error(e.message);process.exitCode=1});
