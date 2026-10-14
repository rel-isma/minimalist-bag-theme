const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const assert=require('node:assert/strict');
const path=require('node:path');
const os=require('node:os');
const root=path.resolve(__dirname,'..');
const chrome=spawn('google-chrome',['--headless','--no-sandbox','--disable-gpu','--disable-background-networking','--no-first-run','--remote-debugging-port=9242','--user-data-dir='+path.join(os.tmpdir(),'atelier-footer-philosophy-cdp'),'about:blank'],{stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let pages;for(let i=0;i<40;i++){try{pages=await(await fetch('http://127.0.0.1:9242/json')).json();break;}catch{await pause(150)}}
 if(!pages)throw Error('Chrome did not start.');
 const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let id=0;const pending=new Map();const errors=[];
 ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text);if(d.id&&pending.has(d.id)){const {r,j}=pending.get(d.id);pending.delete(d.id);d.error?j(Error(d.error.message)):r(d.result)}});
 const send=(method,params={})=>new Promise((r,j)=>{const key=++id;pending.set(key,{r,j});ws.send(JSON.stringify({id:key,method,params}))});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
 const key=async name=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,text:name==='Enter'?'\r':undefined,windowsVirtualKeyCode:({Escape:27,Tab:9,Enter:13,ArrowDown:40,ArrowUp:38,ArrowRight:39,ArrowLeft:37})[name]||0});await send('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:({Escape:27,Tab:9,Enter:13,ArrowDown:40,ArrowUp:38,ArrowRight:39,ArrowLeft:37})[name]||0});await pause(100)};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});


 const results={scope:'Footer, philosophy and product review placement local browser QA'};
 const go=async route=>{await send('Page.navigate',{url:'http://127.0.0.1:3333'+route});for(let i=0;i<80;i++){if(await run(`!!document.querySelector('footer')&&document.readyState==='complete'`))break;await pause(200)}};
 for(const width of [1440,1025,390,320]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});await go('/');
  const check=await run(`(()=>{const f=document.querySelector('footer');const links=[...f.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));const nav=[...document.querySelectorAll('.header-menu--desktop > li')].at(-1).getBoundingClientRect();const logo=document.querySelector('.site-header__logo').getBoundingClientRect();return {width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,links,unique:new Set(links).size,newsletters:document.querySelectorAll('input[name="contact[email]"]').length,navOverlap:innerWidth>1024&&nav.right>logo.left}})()`);
  assert.equal(check.scroll,check.width);assert.equal(check.unique,check.links.length);assert.equal(check.newsletters,1);assert.equal(check.navOverlap,false);results[width]=check;
  await run(`window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})`);await pause(250);const shot=await send('Page.captureScreenshot',{format:'png'});if(width===1440||width===390)await fs.writeFile(path.join(root,'seed/footer-'+width+'.png'),Buffer.from(shot.data,'base64'));
 }
 await go('/products/line-tote-bag');results.reviewOrder=await run(`(()=>{const r=document.querySelector('#shopify-section-reviews');const recent=document.querySelector('#shopify-section-recent');return {afterRecent:!!(recent.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_FOLLOWING),beforeFooter:!!(r.compareDocumentPosition(document.querySelector('footer'))&Node.DOCUMENT_POSITION_FOLLOWING)}})()`);assert.ok(results.reviewOrder.afterRecent&&results.reviewOrder.beforeFooter);
 await go('/pages/story');results.philosophy=await run(`({h1:document.querySelector('h1').textContent,image:!!document.querySelector('.brand-story__image'),overflow:document.documentElement.scrollWidth>innerWidth})`);assert.equal(results.philosophy.h1,'Our philosophy');assert.equal(results.philosophy.image,true);assert.equal(results.philosophy.overflow,false);const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(root,'seed/philosophy-mobile.png'),Buffer.from(shot.data,'base64'));
 results.runtimeErrors=errors;assert.deepEqual(errors,[]);await fs.writeFile(path.join(root,'seed/footer-philosophy-browser-results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results));ws.close();chrome.kill('SIGTERM');
})().catch(error=>{console.error(error);chrome.kill('SIGTERM');process.exitCode=1});
