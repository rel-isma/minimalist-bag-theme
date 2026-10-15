import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {PNG}=require('/tmp/atelier-phase0-tools/node_modules/pngjs');
const {default:pixelmatch}=await import('/tmp/atelier-phase0-tools/node_modules/pixelmatch/index.js');
const before=JSON.parse(await fs.readFile('qa/phase2/current/manifest.json'));
const after=JSON.parse(await fs.readFile('qa/shopify/captures/manifest.json'));
const results={scope:'Approved local Phase 2 approximation versus uploaded native draft. Differences are measurements, not accepted parity. Password captured in an already-unlocked context; quick-view product/data can differ.',threshold:0.1,includeAA:false,alignment:'top left; unequal dimensions padded with transparent pixels; never rescaled',pairs:[],notCompared:[]};
await fs.mkdir('qa/shopify/diffs',{recursive:true});
for(const entry of after.records){
 const prior=before.records.find(r=>r.width===entry.width&&r.state===entry.state);
 if(!prior||prior.status!=='captured'||entry.status!=='captured'){results.notCompared.push({width:entry.width,state:entry.state,reason:entry.state==='password'?'Old password response was 404, so no valid reference exists':entry.status});continue;}
 const a=PNG.sync.read(await fs.readFile(path.join('qa/phase2/current',prior.file)));
 const b=PNG.sync.read(await fs.readFile(path.join('qa/shopify/captures',entry.file)));
 const width=Math.max(a.width,b.width),height=Math.max(a.height,b.height);
 const left=new PNG({width,height}),right=new PNG({width,height}),diff=new PNG({width,height});
 PNG.bitblt(a,left,0,0,a.width,a.height,0,0);PNG.bitblt(b,right,0,0,b.width,b.height,0,0);
 const pixels=pixelmatch(left.data,right.data,diff.data,width,height,{threshold:.1,includeAA:false});
 const name=`${entry.width}-${entry.state}.png`;if(pixels)await fs.writeFile(path.join('qa/shopify/diffs',name),PNG.sync.write(diff));
 results.pairs.push({width:entry.width,state:entry.state,before:prior.file,after:entry.file,beforeSize:[a.width,a.height],afterSize:[b.width,b.height],mismatchedPixels:pixels,ratio:pixels/(width*height),diff:pixels?'diffs/'+name:null});
}
results.summary={compared:results.pairs.length,identical:results.pairs.filter(p=>p.mismatchedPixels===0).length,changed:results.pairs.filter(p=>p.mismatchedPixels>0).length,notCompared:results.notCompared.length};
await fs.writeFile('qa/shopify/native-diffs.json',JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results.summary));

const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const rows=results.pairs.map(p=>`<tr><td>${p.width} ${escape(p.state)}</td><td>${(100*p.ratio).toFixed(2)}%<br>${p.beforeSize.join('×')} → ${p.afterSize.join('×')}</td><td><a href="../phase2/current/${escape(p.before)}">Local</a></td><td><a href="captures/${escape(p.after)}">Shopify</a></td><td>${p.diff?`<a href="${escape(p.diff)}">Diff</a>`:'Identical'}</td></tr>`).join('');
await fs.writeFile('qa/shopify/index.html',`<!doctype html><html lang="en"><meta charset="utf-8"><title>Atelier Vane native comparison</title><style>body{font:16px system-ui;max-width:1100px;margin:40px auto;padding:20px}td,th{padding:10px;text-align:left;border-bottom:1px solid #ddd}table{width:100%}</style><h1>Native Shopify comparison</h1><p>${escape(results.scope)}</p><p>390 / 768 / 1280 / 1536 pixels, Chromium 147, viewport height 900, DPR 1. Raw top-left comparisons, transparent padding for unequal sizes, threshold 0.1, antialias differences excluded. No masking or resizing. Preview UI, font rendering, real data, filters and policies can differ; these require review before parity acceptance.</p><table><thead><tr><th>State</th><th>Mismatch / dimensions</th><th>Reference</th><th>Native</th><th>Pixels</th></tr></thead><tbody>${rows}</tbody></table></html>`);
