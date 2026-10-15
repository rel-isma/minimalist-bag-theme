import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {PNG}=require('/tmp/atelier-phase0-tools/node_modules/pngjs');
const {default:pixelmatch}=await import('/tmp/atelier-phase0-tools/node_modules/pixelmatch/index.js');
const before=JSON.parse(await fs.readFile('qa/baseline/manifest.json'));
const after=JSON.parse(await fs.readFile('qa/phase2/current/manifest.json'));
const results={scope:'Local before/after only. Not Shopify parity.',threshold:0.1,includeAA:false,alignment:'top left; unequal dimensions padded with transparent pixels; never rescaled',pairs:[],notCompared:[]};
await fs.mkdir('qa/phase2/diffs',{recursive:true});
for(const entry of after.records){
 const prior=before.records.find(r=>r.width===entry.width&&r.state===entry.state);
 if(!prior||prior.status!=='captured'||entry.status!=='captured'){results.notCompared.push({width:entry.width,state:entry.state,reason:entry.state==='password'?'Old password response was 404, so no valid reference exists':entry.status});continue;}
 const a=PNG.sync.read(await fs.readFile(path.join('qa/baseline',prior.file)));
 const b=PNG.sync.read(await fs.readFile(path.join('qa/phase2/current',entry.file)));
 const width=Math.max(a.width,b.width),height=Math.max(a.height,b.height);
 const left=new PNG({width,height}),right=new PNG({width,height}),diff=new PNG({width,height});
 PNG.bitblt(a,left,0,0,a.width,a.height,0,0);PNG.bitblt(b,right,0,0,b.width,b.height,0,0);
 const pixels=pixelmatch(left.data,right.data,diff.data,width,height,{threshold:.1,includeAA:false});
 const name=`${entry.width}-${entry.state}.png`;if(pixels)await fs.writeFile(path.join('qa/phase2/diffs',name),PNG.sync.write(diff));
 results.pairs.push({width:entry.width,state:entry.state,before:prior.file,after:entry.file,beforeSize:[a.width,a.height],afterSize:[b.width,b.height],mismatchedPixels:pixels,ratio:pixels/(width*height),diff:pixels?'diffs/'+name:null});
}
results.summary={compared:results.pairs.length,identical:results.pairs.filter(p=>p.mismatchedPixels===0).length,changed:results.pairs.filter(p=>p.mismatchedPixels>0).length,notCompared:results.notCompared.length};
await fs.writeFile('qa/phase2/local-diffs.json',JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results.summary));
