// Local read-only browser coverage; no Admin/API writes and no native E2E claims.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const {chromium} = require('/tmp/atelier-phase0-tools/node_modules/playwright-core');
const base = 'http://127.0.0.1:3334';
const out = __dirname;
const records = [], collected = [], tokens = new Set();
const routes = ['/', '/collections/all', '/collections/all?page=2', '/collections/all?filter.v.price.lte=1',
 '/products/cove-shoulder-bag', '/products/line-tote-bag', '/cart', '/search', '/search?q=bag', '/search?q=zzznomatch',
 '/pages/story', '/pages/faq', '/pages/contact', '/pages/shipping-returns', '/collections',
 '/policies/privacy-policy', '/not-a-real-page', '/password', '/blogs/journal', '/seed/reviews-test-preview.html'];
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
function merge(ranges) {
 const result=[];
 for (const r of ranges.sort((a,b)=>a.start-b.start||a.end-b.end)) {
  const last=result.at(-1);
  if (last && r.start<=last.end) last.end=Math.max(last.end,r.end); else result.push({...r});
 }
 return result;
}
function executedJS(functions) {
 // V8 ranges nest: an unexecuted inner branch overrides an executed parent.
 const ranges=functions.flatMap(f=>f.ranges);
 const bounds=[...new Set(ranges.flatMap(r=>[r.startOffset,r.endOffset]))].sort((a,b)=>a-b);
 const used=[];
 for(let i=0;i<bounds.length-1;i++){
  const start=bounds[i],end=bounds[i+1];
  const active=ranges.filter(r=>r.startOffset<=start&&r.endOffset>=end).sort((a,b)=>(a.endOffset-a.startOffset)-(b.endOffset-b.startOffset));
  if(active[0]?.count>0)used.push({start,end});
 }
 return merge(used);
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-background-networking']});
 const meta={scope:'LOCAL approximation only. Native editor, services, platform states and all-content coverage unavailable.',browser:browser.version(),at:new Date().toISOString(),widths:[390,1280],records,files:[],gaps:['Actual theme editor','Gift card object','Article with real content','Authentic reviews','App blocks','Video/external media','Native discounts/checkout/form responses','Markets/localization/payment icons','Unconfigured addable sections and all merchant settings combinations','JavaScript-disabled rendering']};
 try {
  for(const width of meta.widths) {
   const context=await browser.newContext({viewport:{width,height:900},locale:'en-US',reducedMotion:'reduce'});
   const page=await context.newPage();page.setDefaultTimeout(5000);
   let record;
   page.on('pageerror',error=>record?.errors.push(error.message));
   const sample=async name=>{
    record.states.push(name);
    for(const token of await page.evaluate(()=>[...new Set([...document.querySelectorAll('[class]')].flatMap(e=>[...e.classList]))])) tokens.add(token);
   };
   const step=async(name,fn)=>{
    try {await fn();await page.waitForTimeout(180);await sample(name);}
    catch(error){record.actionFailures.push({name,error:error.message});}
   };
   for(const route of routes) {
    record={width,route,states:[],errors:[],actionFailures:[]};records.push(record);
    await page.coverage.startCSSCoverage({resetOnNavigation:true});
    await page.coverage.startJSCoverage({resetOnNavigation:true,reportAnonymousScripts:false});
    try {
     const response=await page.goto(base+route,{waitUntil:'networkidle'});record.httpStatus=response.status();
     await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,15));}scrollTo(0,0)});
     await sample('render and scroll');
     if(route==='/') {
      await step('header navigation',async()=>{
       if(width>1024){await page.locator('.site-header__nav summary').first().hover();await page.locator('.header-menu__disclosure--mega[open]').waitFor();}
       else{await page.locator('[data-mobile-menu-toggle]').click();await page.locator('[data-mobile-nav-drawer] summary').first().click();}
      });
      await page.keyboard.press('Escape');await page.mouse.move(0,899);
      await step('predictive search results',async()=>{await page.locator('[data-header-search-open]').click();await page.locator('[data-header-search-dialog] input[type="search"]').fill('bag');await page.locator('[data-header-search-dialog] [role="option"]').first().waitFor();await page.keyboard.press('ArrowDown');});
      await step('predictive no results',async()=>{await page.locator('[data-header-search-dialog] input[type="search"]').fill('zzznomatch');await page.waitForTimeout(600);});
      await page.locator('[data-header-search-dialog] [data-header-dialog-close]').click();
     }
     if(route==='/collections/all') {
      await step('filter open',async()=>{if(width<=989)await page.locator('[data-filter-open]').click();else await page.locator('.collection-sidebar').waitFor();});
      await page.keyboard.press('Escape');
      await step('card hover',()=>page.locator('[data-product-card]').first().hover());
     }
     if(route==='/collections/all?page=2'){
      await step('quick view',async()=>{await page.locator('[data-quick-view]').first().click();await page.locator('[data-variant-form]').waitFor();});
      await page.keyboard.press('Escape');
     }
     if(route==='/products/line-tote-bag') {
      await step('variant switching',async()=>{for(const value of ['Taupe','Wide'])await page.locator('[data-product-option] label').filter({has:page.locator(`input[value="${value}"]`)}).click();});
      await step('zoom',async()=>{await page.locator('[data-media-select]').nth(1).click();await page.locator('.is-active [data-product-zoom]').click();await page.locator('[data-product-zoom-dialog][open]').waitFor();});
      await page.keyboard.press('Escape');
      await step('add and drawer',async()=>{await page.locator('[data-product-form] [data-product-submit]').click();await page.locator('[data-cart-drawer].is-open').waitFor();});
      await step('drawer quantity',async()=>{await page.locator('[data-cart-quantity-step="1"]').click();await page.waitForTimeout(400);});
      await page.keyboard.press('Escape');
      await step('synthetic editor lifecycle',()=>page.evaluate(()=>{
       const root=document.querySelector('#shopify-section-main');
       for(const name of ['select','deselect','unload','load'])root.dispatchEvent(new CustomEvent('shopify:section:'+name,{bubbles:true,detail:{sectionId:'main'}}));
      }));
     }
     if(route==='/cart') {
      await step('drawer remove',async()=>{await page.locator('[data-cart-drawer-trigger]').click();await page.locator('[data-cart-remove]').click();await page.waitForTimeout(400);});
      await page.keyboard.press('Escape');
     }
     if(route==='/pages/faq'||route==='/')await step('FAQ accordion',()=>page.locator('.faq-list summary').first().click());
     if(route==='/pages/contact')await step('contact invalid validation',()=>page.locator('.contact-form button[type="submit"]').click());
     if(route==='/seed/reviews-test-preview.html')await step('synthetic review filter/sort',async()=>{
      await page.locator('[data-review-sort]').selectOption('lowest');await page.locator('[data-review-rating]').selectOption('5');await page.locator('[data-review-clear]').click();
     });
     await step('keyboard focus',()=>page.keyboard.press('Tab'));
    }catch(error){record.navigationFailure=error.message;}
    const [css,js]=await Promise.all([page.coverage.stopCSSCoverage(),page.coverage.stopJSCoverage()]);
    collected.push(...css.map(e=>({...e,kind:'css',route,width})),...js.map(e=>({...e,kind:'js',route,width})));
    console.log(width,route,record.navigationFailure?'FAILED':record.actionFailures.length+' action gaps');
   }
   await context.close();
  }
 }finally{await browser.close();}
 await fs.writeFile(path.join(out,'coverage-states.json'),JSON.stringify(meta,null,2)+'\n');
 await fs.writeFile(path.join(out,'coverage-raw.json'),JSON.stringify(collected.filter(e=>e.url.startsWith(base+'/assets/')))+'\n');
 const grouped=new Map();
 for(const e of collected){
  const url=new URL(e.url);if(!url.pathname.startsWith('/assets/'))continue;
  const text=e.text??e.source;
  const source=url.pathname.slice(1),hash=sha(text),key=source+hash;
  if(!grouped.has(key))grouped.set(key,{source,sha256:hash,kind:e.kind,length:text.length,ranges:[],observations:0});
  const g=grouped.get(key);g.ranges.push(...(e.kind==='css'?e.ranges:executedJS(e.functions)));g.observations++;
 }
 for(const g of grouped.values()){
  g.ranges=merge(g.ranges);g.usedCharacters=g.ranges.reduce((n,r)=>n+r.end-r.start,0);g.usedPercent=Number((100*g.usedCharacters/g.length).toFixed(2));
  g.matchesSource=sha(await fs.readFile(path.resolve(out,'../..',g.source),'utf8'))===g.sha256;
  meta.files.push(g);
 }
 meta.observedClassTokens=[...tokens].sort();
 meta.summary={navigations:records.length,navigationFailures:records.filter(r=>r.navigationFailure).length,actionFailures:records.flatMap(r=>r.actionFailures).length,runtimeErrors:records.flatMap(r=>r.errors).length};
 await fs.writeFile(path.join(out,'coverage.json'),JSON.stringify(meta,null,2)+'\n');
 console.log(JSON.stringify({summary:meta.summary,files:meta.files.map(({source,usedPercent})=>({source,usedPercent}))}));
})().catch(e=>{console.error(e);process.exitCode=1;});
