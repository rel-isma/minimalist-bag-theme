/* Report-only local audits. Browser DOM clones simulate editor events; no theme source changes. */
const {chromium}=require('/tmp/atelier-phase0-tools/node_modules/playwright-core');
const {HtmlValidate}=require('/tmp/atelier-phase0-tools/node_modules/html-validate');
const fs=require('node:fs/promises');
const axePath=require.resolve('/tmp/atelier-phase0-tools/node_modules/axe-core/axe.min.js');
const base='http://127.0.0.1:3334';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 const results={scope:'Local Liquid fixture; synthetic editor event probes are not Shopify editor tests',pages:[],editorProbes:[]};
 const validate=new HtmlValidate({extends:['html-validate:recommended'],rules:{'no-inline-style':'off','prefer-native-element':'off','no-trailing-whitespace':'off','void-style':'off','doctype-style':'off','attr-quotes':'off','no-raw-characters':'off','long-title':'off'}});
 try {
 for(const width of [390,1280]){
  for(const [name,route]of[['home','/'],['collection','/collections/all'],['product','/products/line-tote-bag'],['cart','/cart'],['search','/search?q=bag'],['faq','/pages/faq'],['contact','/pages/contact'],['password','/password'],['404','/not-a-real-page']]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(base+route,{waitUntil:'networkidle'});const raw=await response.text();
   const html=await validate.validateString(raw);await page.addScriptTag({path:axePath});
   const axe=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(x=>({id:x.id,nodes:x.nodes.length})),passes:r.passes.length}});
   const dom=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return {duplicateIds:[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))],smallTargets:[...document.querySelectorAll('a,button,input:not([type="hidden"]),select,summary')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&!e.classList.contains('visually-hidden')).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,text:(e.textContent||e.getAttribute('aria-label')||e.getAttribute('name')||'').trim().slice(0,70),class:e.className,width:Math.round(r.width),height:Math.round(r.height)}}).filter(e=>e.width<44||e.height<44),scripts:[...document.scripts].filter(e=>e.src).map(e=>e.src)}});
   const entry={width,name,route,status:response.status(),errors,axe,dom,html:{valid:html.valid,errorCount:html.errorCount,warningCount:html.warningCount,messages:html.results.flatMap(r=>r.messages).map(m=>({rule:m.ruleId,message:m.message,line:m.line,selector:m.selector,severity:m.severity}))}};
   results.pages.push(entry);console.log(width,name,'axe',axe.violations.map(v=>v.id).join(','),'HTML errors',html.errorCount);
   await context.close();
  }
 }
 const context=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'no-preference'});const page=await context.newPage();page.setDefaultTimeout(10000);
 await page.goto(base+'/',{waitUntil:'networkidle'});
 results.editorProbes.push(await page.evaluate(async()=>{
  const old=document.querySelector('#shopify-section-hero');const fresh=old.cloneNode(true);fresh.querySelectorAll('.fade-up').forEach(n=>n.classList.remove('is-visible'));old.dispatchEvent(new CustomEvent('shopify:section:unload',{bubbles:true,detail:{sectionId:'hero'}}));old.replaceWith(fresh);fresh.dispatchEvent(new CustomEvent('shopify:section:load',{bubbles:true,detail:{sectionId:'hero'}}));fresh.dispatchEvent(new CustomEvent('shopify:section:select',{bubbles:true,detail:{sectionId:'hero'}}));await new Promise(r=>setTimeout(r,500));const heading=fresh.querySelector('h1');return {probe:'Hero re-render then select',visibleClass:heading.closest('.fade-up')?.classList.contains('is-visible'),opacity:getComputedStyle(heading.closest('.fade-up')||heading).opacity,expectation:'Edited hero content remains visible'};
 }));
 await page.goto(base+'/products/line-tote-bag',{waitUntil:'networkidle'});await page.locator('.is-active [data-product-zoom]').click();
 results.editorProbes.push(await page.evaluate(()=>{const section=document.querySelector('#shopify-section-main');section.dispatchEvent(new CustomEvent('shopify:section:unload',{bubbles:true,detail:{sectionId:'main'}}));section.remove();return {probe:'Unload product while zoom open',bodyOverflow:document.body.style.overflow,openDialogs:document.querySelectorAll('dialog[open]').length,expectation:'No stale body scroll lock after editor re-render'};}));
 await page.goto(base+'/collections/all',{waitUntil:'networkidle'});await page.locator('[data-filter-open]').click();
 results.editorProbes.push(await page.evaluate(()=>{const section=document.querySelector('#shopify-section-main');section.dispatchEvent(new CustomEvent('shopify:section:unload',{bubbles:true,detail:{sectionId:'main'}}));section.remove();return {probe:'Unload collection while filters open',bodyOverflow:document.body.style.overflow,openDialogs:document.querySelectorAll('dialog[open]').length,expectation:'No stale body scroll lock after editor re-render'};}));
 await context.close();
 }finally{await browser.close();}
 await fs.writeFile('qa/phase1/browser-audit.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results.editorProbes));
})().catch(e=>{console.error(e);process.exitCode=1});
