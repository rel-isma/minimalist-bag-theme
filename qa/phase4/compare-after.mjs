import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {PNG}=require('/tmp/atelier-phase0-tools/node_modules/pngjs');
const {default:pixelmatch}=await import('/tmp/atelier-phase0-tools/node_modules/pixelmatch/index.js');
const beforeRoot='qa/phase2/current',afterRoot='qa/phase4/after';
const before=JSON.parse(await fs.readFile(path.join(beforeRoot,'manifest.json')));
const after=JSON.parse(await fs.readFile(path.join(afterRoot,'manifest.json')));
const report={scope:'Local Phase 2 versus approved C01–C03 cleanup. Not native Shopify parity.',threshold:.1,includeAA:false,alignment:'Top left; unequal dimensions padded, never scaled; no masking',pairs:[],notCompared:[]};
await fs.mkdir('qa/phase4/cleanup-diffs',{recursive:true});
for(const entry of after.records){
 const prior=before.records.find(r=>r.width===entry.width&&r.state===entry.state);
 if(entry.status==='not-applicable'&&prior?.status==='not-applicable'){
  report.notCompared.push({width:entry.width,state:entry.state,reason:'Desktop mobile navigation intentionally not applicable'});continue;
 }
 if(!prior||entry.status!=='captured'||prior.status!=='captured')throw Error('Missing comparable working state: '+entry.width+' '+entry.state);
 const a=PNG.sync.read(await fs.readFile(path.join(beforeRoot,prior.file)));
 const b=PNG.sync.read(await fs.readFile(path.join(afterRoot,entry.file)));
 const width=Math.max(a.width,b.width),height=Math.max(a.height,b.height);
 const left=new PNG({width,height}),right=new PNG({width,height}),diff=new PNG({width,height});
 PNG.bitblt(a,left,0,0,a.width,a.height,0,0);PNG.bitblt(b,right,0,0,b.width,b.height,0,0);
 const count=pixelmatch(left.data,right.data,diff.data,width,height,{threshold:.1,includeAA:false});
 const file=`cleanup-diffs/${entry.width}-${entry.state}.png`;
 if(count)await fs.writeFile('qa/phase4/'+file,PNG.sync.write(diff));
 report.pairs.push({width:entry.width,state:entry.state,before:'../phase2/current/'+prior.file,after:'after/'+entry.file,beforeSize:[a.width,a.height],afterSize:[b.width,b.height],mismatchedPixels:count,ratio:count/(width*height),samePNGHash:prior.sha256===entry.sha256,diff:count?file:null});
}
report.summary={compared:report.pairs.length,identical:report.pairs.filter(p=>p.mismatchedPixels===0).length,changed:report.pairs.filter(p=>p.mismatchedPixels>0).length,notCompared:report.notCompared.length};
await fs.writeFile('qa/phase4/post-cleanup-diffs.json',JSON.stringify(report,null,2)+'\n');
const cards=report.pairs.map(p=>`<article><h2>${p.width}px · ${p.state} — ${p.mismatchedPixels} changed pixels</h2><div><a href="${p.before}"><img loading="lazy" src="${p.before}" alt="Phase 2 ${p.state} at ${p.width} pixels"></a><a href="${p.after}"><img loading="lazy" src="${p.after}" alt="After cleanup ${p.state} at ${p.width} pixels"></a></div>${p.diff?`<p><a href="${p.diff}">Difference image</a></p>`:''}</article>`).join('\n');
await fs.writeFile('qa/phase4/post-cleanup-index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Approved image cleanup — local comparison</title><style>body{font:16px system-ui;margin:2rem;background:#f5f1ea;color:#1b1a18}article{border-top:1px solid #d9d0c3;padding:1rem 0}article div{display:grid;grid-template-columns:1fr 1fr;gap:1rem}img{max-width:100%;height:auto}h2{font-size:1.1rem}</style></head><body><h1>Approved image cleanup — local comparison</h1><p>Left: Phase 2. Right: after C01–C03 removal. ${report.summary.identical}/${report.summary.compared} pairs unchanged at Pixelmatch threshold 0.1, antialias excluded. No masking or scaling. This is not native Shopify parity.</p>${cards}</body></html>`);
console.log(report.summary);
if(report.summary.changed)process.exitCode=1;
