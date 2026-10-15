/** Phase 0 evidence only. Does not change theme code or seed/admin data. */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/atelier-phase0-tools/node_modules/playwright-core');
const base = process.env.BASELINE_URL || 'http://127.0.0.1:3334';
const out = path.resolve(__dirname, 'baseline');
const widths = [390, 768, 1280, 1536];
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
 await fs.mkdir(out, {recursive:true});
 const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless:true, args:['--no-sandbox','--disable-background-networking']});
 const manifest = {scope:'Local approximation only; NOT Shopify theme dev and NOT Shopify parity evidence', commit:cp.execSync('git rev-parse HEAD').toString().trim(), capturedAt:new Date().toISOString(), base, tool:'Playwright core '+require((process.env.PLAYWRIGHT_MODULE || '/tmp/atelier-phase0-tools/node_modules/playwright-core')+'/package.json').version, browser:browser.version(), viewportHeight:900, deviceScaleFactor:1, reducedMotion:'reduce', source:'npm start / preview-server.js + seed/preview-liquid.mjs with seed JSON/images', records:[]};
 try {
 for (const width of widths) {
  const states = ['home','collection-filters-open','product-variant-switched','cart-drawer','cart-page','search','search-results','page','contact','404','password','header-menu-open','mobile-navigation-open','footer','philosophy','faq','quick-view','gallery-zoom','predictive-search','cart-empty','collections-list','policy'];
  for (const state of states) {
   const record = {width,height:900,state,errors:[],consoleErrors:[],failedRequests:[]};
   manifest.records.push(record);
   if (state==='mobile-navigation-open' && width>1024) {record.status='not-applicable';record.reason='Mobile menu trigger is intentionally hidden at desktop widths; see header-menu-open at this width.';continue;}
   const context = await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,isMobile:width<=768,hasTouch:width<=768,reducedMotion:'reduce',locale:'en-US',timezoneId:'Africa/Casablanca'});
   const page = await context.newPage();
   page.setDefaultTimeout(12000);
   page.on('pageerror',e=>record.errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error')record.consoleErrors.push(m.text());});
   page.on('requestfailed',r=>record.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
   const go = async route => {
    const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:30000});
    record.url=route;record.httpStatus=response.status();
    await page.evaluate(()=>document.fonts.ready);
   };
   const populate = async () => {
    await go('/products/line-tote-bag');
    await page.locator('[data-product-option] label').filter({has:page.locator('input[value="Taupe"]')}).click();
    await page.locator('[data-product-option] label').filter({has:page.locator('input[value="Wide"]')}).click();
    await page.locator('[data-product-form] [data-product-submit]').click();
    await page.locator('[data-cart-drawer].is-open').waitFor({state:'visible'});
   };
   let fullPage=true, target;
   try {
    switch (state) {
     case 'home':await go('/');break;
     case 'collection-filters-open':
      await go('/collections/all');
      if(width<=989) {await page.locator('[data-filter-open]').click();await page.locator('[data-filter-dialog][open]').waitFor();fullPage=false;}
      else {await page.locator('.collection-sidebar').waitFor({state:'visible'});record.note='Desktop filters are an open sidebar, not a modal.';}
      break;
     case 'product-variant-switched':
      await go('/products/cove-shoulder-bag');await go('/products/line-tote-bag');
      await page.locator('[data-product-option] label').filter({has:page.locator('input[value="Taupe"]')}).click();
      await page.locator('[data-product-option] label').filter({has:page.locator('input[value="Wide"]')}).click();
      record.selectedVariant=await page.locator('[data-product-variant-id]').inputValue();
      record.note='Taupe / Wide. Demo photos exist for the primary color only; no invented variant photo is substituted. A prior Cove visit enables recently viewed.';break;
     case 'cart-drawer':await populate();fullPage=false;break;
     case 'cart-page':await populate();await go('/cart');break;
     case 'search':await go('/search');break;
     case 'search-results':await go('/search?q=bag');break;
     case 'page':await go('/pages/shipping-returns');break;
     case 'contact':await go('/pages/contact');break;
     case '404':await go('/not-a-real-page');break;
     case 'password':
      await go('/password');record.status='blocked';record.reason='Existing local preview has no password route and returns 404. Screenshot records the actual response, not a native password page. Shopify capture pending.';break;
     case 'header-menu-open':
      await go('/');fullPage=false;
      if(width<=1024) {await page.locator('[data-mobile-menu-toggle]').click();await page.locator('[data-mobile-nav-drawer] summary').first().click();record.note='Responsive equivalent: mobile menu with Shop expanded. Desktop image menu is intentionally hidden.';}
      else {await page.locator('.site-header__nav summary').first().hover();await page.locator('.header-menu__disclosure--mega[open]').waitFor();}
      break;
     case 'mobile-navigation-open':await go('/');await page.locator('[data-mobile-menu-toggle]').click();fullPage=false;break;
     case 'footer':await go('/');target=page.locator('footer');await target.scrollIntoViewIfNeeded();break;
     case 'philosophy':await go('/pages/story');break;
     case 'faq':await go('/pages/faq');break;
     case 'quick-view':
      await go('/collections/all?page=2');await page.locator('[data-quick-view]').first().click();await page.locator('[data-variant-form]').waitFor();fullPage=false;break;
     case 'gallery-zoom':
      await go('/products/line-tote-bag');await page.locator('[data-media-select]').nth(1).click();await page.locator('.is-active [data-product-zoom]').click();await page.locator('[data-product-zoom-dialog][open]').waitFor();fullPage=false;break;
     case 'predictive-search':
      await go('/');await page.locator('[data-header-search-open]').click();await page.locator('[data-header-search-dialog] input[type="search"]').fill('bag');await page.locator('[data-header-search-dialog] [role="option"]').first().waitFor();fullPage=false;break;
     case 'cart-empty':await go('/cart');break;
     case 'collections-list':await go('/collections');break;
     case 'policy':await go('/policies/privacy-policy');break;
    }
    if(fullPage && !target) {
     await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,35));}window.scrollTo({top:0,behavior:'instant'});});
    }
    await page.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.filter(i=>i.getBoundingClientRect().height && (i.loading!=='lazy'||i.complete)).map(i=>i.decode().catch(()=>{})));});
    await wait(150);
    record.dom=await page.evaluate(()=>({title:document.title,viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,text:e.textContent.trim()})),renderedSections:[...document.querySelectorAll('[id^="shopify-section-"]')].map(e=>({id:e.id,visible:!!e.getClientRects().length,classes:e.firstElementChild?.className})),visibleDialogs:[...document.querySelectorAll('dialog[open]')].map(e=>({id:e.id,label:e.getAttribute('aria-label')})),products:document.querySelectorAll('[data-product-card]').length,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src'))}));
    record.file=`${width}/${state}.png`;await fs.mkdir(path.join(out,String(width)),{recursive:true});
    const buffer=target?await target.screenshot({animations:'disabled'}):await page.screenshot({fullPage,animations:'disabled'});
    await fs.writeFile(path.join(out,record.file),buffer);record.sha256=crypto.createHash('sha256').update(buffer).digest('hex');
    record.status=record.status||'captured';
   } catch(error) {
    record.status='failed';record.reason=error.message;
    await page.screenshot({path:path.join(out,`${width}-${state}-failure.png`)}).catch(()=>{});
   } finally {await context.close();}
   await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
   console.log(`${width} ${state}: ${record.status}`);
  }
 }
 } finally {await browser.close();}
 const counts={};for(const r of manifest.records)counts[r.status]=(counts[r.status]||0)+1;
 manifest.counts=counts;await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(counts));
 if(counts.failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
