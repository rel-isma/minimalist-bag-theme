// Native UI checks. Only this ephemeral browser's cart/localization is mutated.
const fs=require('node:fs/promises');const assert=require('node:assert/strict');
const {openPreview}=require('./browser-access.cjs');
(async()=>{
 const access=await openPreview();const {page,browser,redact,origin}=access;
 const output=process.env.NATIVE_PRIMARY_PREVIEW==='1'?'qa/shopify/storefront-primary-results.json':'qa/shopify/storefront-results.json';
 const result={at:new Date().toISOString(),scope:'Native Shopify preview, US/USD, browser checks only; no Admin changes, checkout or form delivery.',country:'US',records:[],runtimeErrors:[],consoleErrors:[],httpErrors:[],gaps:['Admin product creation/propagation experiment','Alternate-color image proof: only primary-color images supplied','Positive shipping threshold','Applied discount','Bogus Gateway checkout','Contact/newsletter submission and delivery','Actual theme editor operations','Locked native theme password page/error validation','Exhaustive keyboard-only journey','Markets outside US']};
 page.on('pageerror',e=>result.runtimeErrors.push(redact(e.message)));
 page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(redact(m.text()));});
 page.on('response',r=>{if(r.status()>=400){const u=new URL(r.url());result.httpErrors.push({status:r.status(),host:u.hostname.endsWith('.shopifypreview.com')?'[shared-preview-host]':u.hostname,path:u.pathname});}});
 const go=async route=>{const url=new URL(route,origin);url.searchParams.set('country','US');return access.go(url.pathname+url.search);};
 const cart=()=>page.evaluate(async()=>{const r=await fetch('/cart.js');if(!r.ok)throw Error('Cart read HTTP '+r.status);return r.json();});
 const clear=()=>page.evaluate(async()=>{const r=await fetch('/cart/clear.js',{method:'POST',headers:{Accept:'application/json'}});if(!r.ok)throw Error('Cart clear HTTP '+r.status);});
 const record=async(width,name,fn)=>{
  if(process.env.NATIVE_CASES&&!process.env.NATIVE_CASES.split(',').includes(name))return;
  const r={width,name};result.records.push(r);
  try{r.evidence=await fn();r.status='pass';}
  catch(error){r.status='fail';r.error=redact(error.message);await page.screenshot({path:`qa/shopify/${width}-${name}-failure.png`,fullPage:true}).catch(()=>{});}
  await fs.writeFile(output,JSON.stringify(result,null,2)+'\n');console.log(width,name,r.status);
 };
 try{
 for(const width of process.env.NATIVE_WIDTHS?process.env.NATIVE_WIDTHS.split(',').map(Number):[1280,390]){
  await page.setViewportSize({width,height:900});
  await record(width,'home',async()=>{
   await go('/');await page.waitForFunction(()=>window.Shopify?.country==='US');
   assert.equal(await page.locator('[data-product-card]').count(),12);
   assert.equal(await page.locator('.category-tile').count(),6);
   assert.equal((await page.locator('h1').textContent()).trim(),'Quietly essential.');
   await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){scrollTo(0,y);await new Promise(r=>setTimeout(r,25));}scrollTo(0,0)});
   await page.screenshot({path:`qa/shopify/native-home-${width}.png`,fullPage:true,animations:'disabled'});
   const size=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));assert.ok(size.document<=size.viewport);
   return {cards:12,categories:6,...size};
  });
  await record(width,'navigation',async()=>{
   await go('/');
   if(width>1024){await page.locator('.site-header__nav summary').first().hover();await page.locator('.header-menu__disclosure--mega[open]').waitFor();assert.equal(await page.locator('.header-menu--desktop .mega-menu__card').count(),6);await page.screenshot({path:`qa/shopify/native-menu-${width}.png`});await page.mouse.move(0,899);}
   else{await page.locator('[data-mobile-menu-toggle]').click();await page.locator('[data-mobile-nav-drawer][open]').waitFor();await page.locator('[data-mobile-nav-drawer] summary').first().click();await page.screenshot({path:`qa/shopify/native-menu-${width}.png`});await page.keyboard.press('Escape');assert.equal(await page.locator('[data-mobile-nav-drawer][open]').count(),0);}
   return {kind:width>1024?'Desktop hover image menu':'Mobile dialog and Shop disclosure'};
  });
  await record(width,'collection',async()=>{
   await go('/collections/all');assert.ok((await page.locator('.collection-toolbar p').textContent()).includes('22'));
   if(width<=989){await page.locator('[data-filter-open]').click();await page.locator('[data-filter-dialog][open]').waitFor();}
   const filters=await page.locator('.collection-filter summary').allTextContents();
   await page.screenshot({path:`qa/shopify/native-collection-${width}.png`,fullPage:width>989});
   if(width<=989)await page.keyboard.press('Escape');
   await page.locator('[data-collection-sort]').selectOption('price-ascending');await page.waitForURL(u=>u.searchParams.get('sort_by')==='price-ascending');
   const prices=await page.locator('[data-card-price]').allTextContents();const numbers=prices.map(t=>Number(t.match(/\$([\d,.]+)/)?.[1]?.replaceAll(',','')));
   assert.ok(numbers.length>0&&numbers.every(Number.isFinite));assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b));
   await go('/collections/all?filter.v.price.lte=1');assert.equal(await page.locator('[data-product-card]').count(),0);
   return {filters,sortedPrices:numbers,emptyPriceFilter:true,colorAndTypeFiltersConfigured:filters.some(t=>/color/i.test(t))&&filters.some(t=>/type/i.test(t))};
  });
  await record(width,'product-cart',async()=>{
   await go('/products/line-tote-bag');await clear();await go('/products/line-tote-bag');
   const data=await page.locator('[data-main-product] [data-product-variants]').getAttribute('data-variants');const variants=JSON.parse(data);const expected=variants.find(v=>v.options[0]==='Taupe'&&v.options[1]==='Wide');assert.ok(expected?.available);
   for(const value of ['Taupe','Wide'])await page.locator('[data-product-option] label').filter({has:page.locator(`input[value="${value}"]`)}).click();
   assert.equal(await page.locator('[data-product-variant-id]').inputValue(),String(expected.id));
   await page.locator('[data-product-form] [data-product-submit]').click();await page.locator('[data-cart-drawer].is-open').waitFor();await page.locator('[data-cart-item]').first().waitFor();
   let value=await cart();assert.equal(value.item_count,1);assert.equal(value.items[0].variant_id,expected.id);
   await page.locator('[data-cart-quantity-step="1"]').first().click();await page.waitForFunction(()=>document.querySelector('[data-cart-quantity]')?.value==='2');
   value=await cart();assert.equal(value.item_count,2);assert.equal(value.total_price,25800);
   await page.screenshot({path:`qa/shopify/native-cart-${width}.png`});
   await page.keyboard.press('Escape');await go('/cart');assert.equal(await page.locator('[data-cart-page] [data-cart-item]').count(),1);
   await page.locator('[data-cart-drawer-trigger]').click();await page.locator('[data-cart-remove]').first().click();await page.waitForFunction(()=>document.querySelectorAll('[data-cart-drawer] [data-cart-item]').length===0);
   value=await cart();assert.equal(value.item_count,0);await page.keyboard.press('Escape');
   return {variantId:expected.id,selectedOptions:expected.options,totalAtQuantityTwo:25800,removedToEmpty:true,freeShippingBarCount:await page.locator('[data-free-shipping-bar]').count()};
  });
  await record(width,'card-add',async()=>{
   await go('/collections/all');await clear();await go('/collections/all');
   const form=page.locator('[data-catalog-add-form]').first();await form.locator('button[type="submit"]').click();await page.locator('[data-cart-drawer].is-open [data-cart-item]').first().waitFor();
   const value=await cart();assert.equal(value.item_count,1);await page.keyboard.press('Escape');await clear();return {added:1};
  });
  await record(width,'quick-view-add',async()=>{
   await go('/products/line-tote-bag');await clear();
   // Native alphabetical pagination differs from the deterministic local fixture.
   await go('/collections/all');let link=page.locator('[data-quick-view]').first();
   if(!await link.count()){await go('/collections/all?page=2');link=page.locator('[data-quick-view]').first();}
   await link.click();await page.locator('[data-variant-form]').waitFor();await page.locator('[data-variant-submit]').click();await page.locator('[data-cart-drawer].is-open [data-cart-item]').first().waitFor();
   const value=await cart();assert.equal(value.item_count,1);await page.keyboard.press('Escape');await clear();return {added:1};
  });
  await record(width,'search',async()=>{
   await go('/');await page.locator('[data-header-search-open]').click();const input=page.locator('[data-header-search-dialog] input[type="search"]');await input.fill('bag');await page.locator('[data-header-search-dialog] [role="option"]').first().waitFor();
   const suggestions=await page.locator('[data-header-search-dialog] [role="option"]').count();await input.press('ArrowDown');const active=await input.getAttribute('aria-activedescendant');assert.ok(active);
   await page.screenshot({path:`qa/shopify/native-search-${width}.png`});await page.locator('[data-header-search-dialog] [data-header-dialog-close]').click();
   await go('/search?q=bag');assert.ok(await page.locator('[data-product-card]').count()>0);
   await go('/search?q=zzznomatch123');assert.equal(await page.locator('[data-product-card]').count(),0);return {suggestions,keyboardActiveOption:active,fullResults:true,noResults:true};
  });
  await record(width,'content-and-404',async()=>{
   const observed=[];
   for(const route of ['/pages/story','/pages/faq','/pages/contact','/pages/shipping-returns','/policies/privacy-policy','/collections','/not-a-real-page']){
    const response=await go(route);assert.equal(response.status(),route==='/not-a-real-page'?404:200);const heading=(await page.locator('h1').first().textContent()).trim();assert.ok(heading);observed.push({route,status:response.status(),heading});
    if(route==='/pages/faq'){await page.locator('.faq-list summary').first().click();assert.equal(await page.locator('.faq-list details').first().getAttribute('open'),'');}
    if(route==='/pages/contact')assert.equal(await page.locator('main .contact-form input[name="contact[email]"]:visible').count(),1);
   }return observed;
  });
 }
 }finally{await browser.close();}
 result.summary={passed:result.records.filter(r=>r.status==='pass').length,failed:result.records.filter(r=>r.status==='fail').length,runtimeErrors:result.runtimeErrors.length};
 result.hostScope=process.env.NATIVE_PRIMARY_PREVIEW==='1'?'Original myshopify.com domain, uploaded draft ID pinned':'Shared visitor preview';
 await fs.writeFile(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result.summary));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
