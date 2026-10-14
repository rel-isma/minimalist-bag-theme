const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const assert=require('node:assert/strict');
const path=require('node:path');
const os=require('node:os');
const root=path.resolve(__dirname,'..');
const chrome=spawn('google-chrome',['--headless','--no-sandbox','--disable-gpu','--disable-background-networking','--no-first-run','--remote-debugging-port=9241','--user-data-dir='+path.join(os.tmpdir(),'atelier-header-refresh-cdp'),'about:blank'],{stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let pages;for(let i=0;i<40;i++){try{pages=await(await fetch('http://127.0.0.1:9241/json')).json();break;}catch{await pause(150)}}
 if(!pages)throw Error('Chrome did not start.');
 const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let id=0;const pending=new Map();const errors=[];
 ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text);if(d.id&&pending.has(d.id)){const {r,j}=pending.get(d.id);pending.delete(d.id);d.error?j(Error(d.error.message)):r(d.result)}});
 const send=(method,params={})=>new Promise((r,j)=>{const key=++id;pending.set(key,{r,j});ws.send(JSON.stringify({id:key,method,params}))});
 const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
 const key=async name=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,text:name==='Enter'?'\r':undefined,windowsVirtualKeyCode:({Escape:27,Tab:9,Enter:13,ArrowDown:40,ArrowUp:38,ArrowRight:39,ArrowLeft:37})[name]||0});await send('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:({Escape:27,Tab:9,Enter:13,ArrowDown:40,ArrowUp:38,ArrowRight:39,ArrowLeft:37})[name]||0});await pause(100)};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});

 const results={scope:'Header layout, hover image menu, keyboard and mobile announcement QA'};
 const metrics=async width=>send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
 await metrics(1440);await send('Page.navigate',{url:'http://127.0.0.1:3333/'});for(let i=0;i<80;i++){if(await run(`!!document.querySelector('.site-header__logo') && document.readyState==='complete'`))break;await pause(200);}
 results.desktop=await run(`(()=>{const box=s=>document.querySelector(s).getBoundingClientRect();const logo=box('.site-header__logo');return {center:logo.x+logo.width/2,viewport:document.documentElement.clientWidth,navRight:box('.site-header__nav').right,logoLeft:logo.left,actionsLeft:box('.site-header__actions').left,logoRight:logo.right,overflow:document.documentElement.scrollWidth>innerWidth,images:document.querySelectorAll('.mega-menu__image img').length,cta:document.querySelector('.announcement-bar__cta').getAttribute('href'),closed:!document.querySelector('.header-menu__disclosure--mega').open}})()`);
 assert.equal(results.desktop.center,results.desktop.viewport/2);assert.ok(results.desktop.navRight<=results.desktop.logoLeft);assert.ok(results.desktop.actionsLeft>=results.desktop.logoRight);assert.equal(results.desktop.images,6);assert.equal(results.desktop.cta,'/collections/all');assert.equal(results.desktop.closed,true);assert.equal(results.desktop.overflow,false);
 const point=await run(`(()=>{const r=document.querySelector('.header-menu--desktop summary').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await pause(300);assert.ok(await run(`document.querySelector('.header-menu__disclosure--mega').open`));
 const card=await run(`(()=>{const r=document.querySelector('.mega-menu__card').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',...card});await pause(250);
 assert.ok(await run(`document.querySelector('.header-menu__disclosure--mega').open`));assert.ok(await run(`[...document.querySelectorAll('.mega-menu__image img')].every(i=>i.complete&&i.naturalWidth>0)`));
 let shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(root,'seed/header-shop-menu.png'),Buffer.from(shot.data,'base64'));
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1400,y:850});await pause(300);assert.equal(await run(`document.querySelector('.header-menu__disclosure--mega').open`),false);
 await run(`document.querySelector('.header-menu--desktop summary').focus()`);await key('Enter');assert.ok(await run(`document.querySelector('.header-menu__disclosure--mega').open`));await key('Tab');assert.ok(await run(`document.activeElement.classList.contains('header-menu__parent')`));await key('Escape');assert.equal(await run(`document.querySelector('.header-menu__disclosure--mega').open`),false);assert.equal(await run(`document.activeElement.tagName`),'SUMMARY');
 results.hoverAndKeyboard=true;
 for(const width of [1025,390,320]){await metrics(width);await pause(250);const check=await run(`({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,center:(()=>{const r=document.querySelector('.site-header__logo').getBoundingClientRect();return r.x+r.width/2})()})`);assert.equal(check.scroll,check.width);assert.ok(Math.abs(check.center-check.width/2)<1);results[width]=check;}
 await run(`document.querySelector('[data-mobile-menu-toggle]').click()`);assert.ok(await run(`document.querySelector('[data-mobile-nav-drawer]').open`));assert.equal(await run(`document.querySelector('[data-mobile-nav-drawer]').querySelectorAll('.header-menu--mobile > li').length`),4);await key('Escape');
 shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(root,'seed/header-mobile.png'),Buffer.from(shot.data,'base64'));
 results.runtimeErrors=errors;assert.deepEqual(errors,[]);await fs.writeFile(path.join(root,'seed/header-refresh-browser-results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results));ws.close();chrome.kill('SIGTERM');
})().catch(error=>{console.error(error);chrome.kill('SIGTERM');process.exitCode=1});
