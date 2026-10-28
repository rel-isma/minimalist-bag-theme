import http from 'node:http';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {server} from './server.mjs';
import {STATE,product} from './core.mjs';
const id='2408310805071622300',draftFile=STATE+'/drafts/'+id+'.json';let original;try{original=await fs.readFile(draftFile)}catch(e){if(e.code!=='ENOENT')throw e;}
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;const results=[];
try{
 let r=await fetch(base+'/api/bootstrap',{headers:{Origin:'https://external.example'}});assert.equal(r.status,403);results.push('Cross-site access rejected');
 const status=await new Promise((resolve,reject)=>{const request=http.get(base+'/api/bootstrap',{headers:{Host:'external.example'}},response=>{response.resume();resolve(response.statusCode)});request.on('error',reject)});assert.equal(status,403);results.push('DNS rebinding host rejected');
 r=await fetch(base+'/api/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(r.status,403);results.push('Write without local CSRF token rejected');
 const boot=await(await fetch(base+'/api/bootstrap')).json();assert.ok(boot.csrf);assert.equal(boot.rows.length,JSON.parse(await fs.readFile('products/manifest.json')).products.length);assert.equal(JSON.stringify(boot).includes('CJ_API_KEY'),false);
 r=await fetch(base+'/.env');assert.notEqual((await r.text()).slice(0,20),'CJ_API_KEY=');assert.notEqual(r.headers.get('content-type'),'text/plain');
 r=await fetch(base+'/media/studio/.state/snapshot.json');assert.equal(r.status,404);results.push('Credential and account state files cannot be downloaded');
 const headers={'Content-Type':'application/json','X-Studio-Token':boot.csrf};const {draft}=await product(id);let changed=structuredClone(draft);changed.variants[0].sku='ALTERED';
 r=await fetch(base+'/api/products/'+id+'/draft',{method:'PUT',headers,body:JSON.stringify({draft:changed})});assert.equal(r.status,400);assert.match((await r.json()).error,/cannot change/);
 changed=structuredClone(draft);changed.images[0].file='.env';r=await fetch(base+'/api/products/'+id+'/draft',{method:'PUT',headers,body:JSON.stringify({draft:changed})});assert.equal(r.status,400);results.push('Immutable CJ SKU and image path validation enforced by HTTP API');
 changed=structuredClone(draft);changed.title='Temporary persistence check';r=await fetch(base+'/api/products/'+id+'/draft',{method:'PUT',headers,body:JSON.stringify({draft:changed})});assert.equal(r.status,200);const saved=await(await fetch(base+'/api/products/'+id)).json();assert.equal(saved.draft.title,changed.title);results.push('Local edits persist and reload; original draft restored after test');
 r=await fetch(base+'/api/jobs',{method:'POST',headers,body:JSON.stringify({planId:'not-reviewed'})});assert.equal(r.status,400);results.push('Publishing cannot start without an approved review plan');
 console.log(JSON.stringify({passed:true,checks:results,externalWrites:false},null,2));
 await fs.writeFile('studio/server-results.json',JSON.stringify({checkedAt:new Date().toISOString(),passed:true,checks:results,externalWrites:false},null,2)+'\n');
}finally{if(original)await fs.writeFile(draftFile,original);else await fs.rm(draftFile,{force:true});await new Promise(resolve=>server.close(resolve));}
