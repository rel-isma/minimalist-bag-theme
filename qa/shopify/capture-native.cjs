const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');
const {openPreview}=require('./browser-access.cjs');
(async()=>{
 const {page,browser,go:rawGo,redact}=await openPreview();
 const out=path.join(__dirname,'captures');await fs.mkdir(out,{recursive:true});
 const manifest={at:new Date().toISOString(),scope:'Actual Shopify draft 189100065059, original store domain, US/USD; no simulated Liquid.',themeId:189100065059,widths:[390,768,1280,1536],height:900,reducedMotion:'reduce',browser:browser.version(),records:[]};
 let record;
 page.on('pageerror',error=>record?.errors.push(redact(error.message)));
 const go=async route=>{const url=new URL(route,'https://atelier-vane-test.myshopify.com');url.searchParams.set('country','US');const response=await rawGo(url.pathname+url.search);record.route=route;record.httpStatus=response.status();return response;};
 const clear=async()=>{await page.evaluate(async()=>{localStorage.clear();const r=await fetch('/cart/clear.js',{method:'POST'});if(!r.ok)throw Error('Cart reset HTTP '+r.status);});};
 const populate=async()=>{
  await go('/products/line-tote-bag');
  for(const value of ['Taupe','Wide'])await page.locator('[data-product-option] label').filter({has:page.locator(`input[value="${value}"]`)}).click();
  await page.locator('[data-product-form] [data-product-submit]').click();await page.locator('[data-cart-drawer].is-open [data-cart-item]').first().waitFor();
 };
 const states=['home','collection-filters-open','product-variant-switched','cart-drawer','cart-page','search','search-results','page','contact','404','password','header-menu-open','mobile-navigation-open','footer','philosophy','faq','quick-view','gallery-zoom','predictive-search','cart-empty','collections-list','policy'];
 try{
  for(const width of manifest.widths){
   await page.setViewportSize({width,height:900});await fs.mkdir(path.join(out,String(width)),{recursive:true});
   for(const state of states){
    record={width,state,errors:[]};manifest.records.push(record);
    if(state==='mobile-navigation-open'&&width>1024){record.status='not-applicable';continue;}
    try{
     await clear();let fullPage=true,target;
     switch(state){
      case 'home':await go('/');break;
      case 'collection-filters-open':await go('/collections/all');if(width<=989){await page.locator('[data-filter-open]').click();await page.locator('[data-filter-dialog][open]').waitFor();fullPage=false;}break;
      case 'product-variant-switched':await go('/products/cove-shoulder-bag');await go('/products/line-tote-bag');for(const value of ['Taupe','Wide'])await page.locator('[data-product-option] label').filter({has:page.locator(`input[value="${value}"]`)}).click();record.variant=await page.locator('[data-product-variant-id]').inputValue();break;
      case 'cart-drawer':await populate();fullPage=false;break;
      case 'cart-page':await populate();await go('/cart');break;
      case 'search':await go('/search');break;
      case 'search-results':await go('/search?q=bag');break;
      case 'page':await go('/pages/shipping-returns');break;
      case 'contact':await go('/pages/contact');break;
      case '404':await go('/not-a-real-page');break;
      case 'password':await go('/password');record.note='Actual native password template route in the already-unlocked browser context; locked/invalid-password behavior is not certified by this capture.';break;
      case 'header-menu-open':await go('/');fullPage=false;if(width<=1024){await page.locator('[data-mobile-menu-toggle]').click();await page.locator('[data-mobile-nav-drawer] summary').first().click();}else{await page.locator('.site-header__nav summary').first().hover();await page.locator('.header-menu__disclosure--mega[open]').waitFor();}break;
      case 'mobile-navigation-open':await go('/');await page.locator('[data-mobile-menu-toggle]').click();fullPage=false;break;
      case 'footer':await go('/');target=page.locator('footer');await target.scrollIntoViewIfNeeded();break;
      case 'philosophy':await go('/pages/story');break;
      case 'faq':await go('/pages/faq');break;
      case 'quick-view':await go('/collections/all');if(!await page.locator('[data-quick-view]').count())await go('/collections/all?page=2');await page.locator('[data-quick-view]').first().click();await page.locator('[data-variant-form]').waitFor();record.note='Native alphabetical catalog may put the first multi-option product on a different page from the local fixture.';fullPage=false;break;
      case 'gallery-zoom':await go('/products/line-tote-bag');await page.locator('[data-media-select]').nth(1).click().catch(async()=>page.locator('[data-media-select]').first().click());await page.locator('.is-active [data-product-zoom]').click();await page.locator('[data-product-zoom-dialog][open]').waitFor();fullPage=false;break;
      case 'predictive-search':await go('/');await page.locator('[data-header-search-open]').click();await page.locator('[data-header-search-dialog] input[type="search"]').fill('bag');await page.locator('[data-header-search-dialog] [role="option"]').first().waitFor();fullPage=false;break;
      case 'cart-empty':await go('/cart');break;
      case 'collections-list':await go('/collections');break;
      case 'policy':await go('/policies/privacy-policy');break;
     }
     if(fullPage&&!target)await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,35));}scrollTo({top:0,behavior:'instant'});});
     await page.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.filter(i=>i.closest('dialog[open]')||(i.getBoundingClientRect().height&&(i.loading!=='lazy'||i.complete))).map(i=>i.decode().catch(()=>{})));});
     await page.waitForTimeout(150);
     record.dom=await page.evaluate(()=>({themeId:window.Shopify?.theme?.id,country:window.Shopify?.country,title:document.title,viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,text:e.textContent.trim()})),products:document.querySelectorAll('[data-product-card]').length,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>new URL(i.src).pathname)}));
     if(String(record.dom.themeId)!=='189100065059')throw Error('Capture left the intended draft theme.');
     const png=target?await target.screenshot({animations:'disabled'}):await page.screenshot({fullPage,animations:'disabled'});
     record.file=`${width}/${state}.png`;await fs.writeFile(path.join(out,record.file),png);record.sha256=crypto.createHash('sha256').update(png).digest('hex');record.status='captured';
    }catch(error){record.status='failed';record.reason=redact(error.message);}
    await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(width,state,record.status);
   }
  }
 }finally{await browser.close();}
 manifest.summary=Object.fromEntries(['captured','failed','not-applicable'].map(status=>[status,manifest.records.filter(r=>r.status===status).length]));await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest.summary));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
