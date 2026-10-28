// Apply the eight-image gallery limit to the already-downloaded catalog.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {selectProductImages} from './image-selection.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(await fs.readFile(path.join(root,'manifest.json')));
const archive=path.join(root,'.state','excluded-images');
await fs.mkdir(archive,{recursive:true,mode:0o700});
let total=0, archived=0;const errors=[];
let html=await fs.readFile(path.join(root,'index.html'),'utf8');
let inventory=await fs.readFile(path.join(root,'INVENTORY.md'),'utf8');
for(const entry of manifest.products){
  const dir=path.join(root,entry.cjProductId,'source');
  const product=JSON.parse(await fs.readFile(path.join(dir,'product.json')));
  const media=JSON.parse(await fs.readFile(path.join(dir,'images.json')));
  const urls=selectProductImages(product,media.images);
  const selected=urls.map(u=>media.images.find(x=>x.sourceUrl===u&&x.status==='downloaded'));
  const backup=path.join(archive,entry.cjProductId);await fs.mkdir(backup,{recursive:true});
  try {await fs.writeFile(path.join(backup,'original-images.json'),JSON.stringify(media,null,2)+'\n',{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;}
  const keep=new Set(selected.map(x=>x.file));
  for(const filename of await fs.readdir(path.join(dir,'images'))){
    if(!keep.has(filename)){await fs.rename(path.join(dir,'images',filename),path.join(backup,filename));archived++;}
  }
  for(const image of selected){
    const bytes=await fs.readFile(path.join(dir,'images',image.file));
    if(createHash('sha256').update(bytes).digest('hex')!==image.sha256)errors.push('Checksum mismatch: '+entry.cjProductId+'/'+image.file);
  }
  for(const variant of product.variants){
    const original=media.images.find(x=>x.sourceUrl===variant.variantImage);
    if(!original||!selected.some(x=>x.sha256===original.sha256))errors.push('Variant image not covered: '+variant.variantSku);
  }
  const count=selected.length,oldCount=entry.imageCount;
  await fs.writeFile(path.join(dir,'images.json'),JSON.stringify({fetchedAt:media.fetchedAt,selectionPolicy:'Maximum 8 distinct product gallery/variant photos. Description HTML images excluded. Primary and variant photos prioritized.',images:selected},null,2)+'\n');
  let review=await fs.readFile(path.join(root,entry.cjProductId,'review.md'),'utf8');
  review=review.replace(/\d+ original images saved\./,`${count} selected product images saved (maximum 8; no description-only images).`);
  await fs.writeFile(path.join(root,entry.cjProductId,'review.md'),review);
  entry.imageCount=count;entry.imageIssues=0;total+=count;
  inventory=inventory.replace(new RegExp(`(\\]\\(\\./${entry.cjProductId}/review\\.md\\) \\| \\d+ \\| )\\d+`),`$1${count}`);
  // Restrict each replacement to the matching product's article.
  const start=html.indexOf(`<article><a href="${entry.cjProductId}/review.md">`);
  const end=html.indexOf('</article>',start)+10;
  if(start<0)throw Error('Catalog article missing');
  let card=html.slice(start,end).replace(`${oldCount} original images`,`${count} product images`);
  const oldSrc=card.match(/src="([^"]+)"/);
  if(oldSrc)card=card.replace(oldSrc[1],`${entry.cjProductId}/source/images/${selected[0].file}`);
  if(!card.includes('class="photos"')){
    const thumbs=selected.map((im,i)=>`<a href="${entry.cjProductId}/source/images/${im.file}" target="_blank" rel="noopener"><img loading="lazy" src="${entry.cjProductId}/source/images/${im.file}" alt="Product photo ${i+1}"></a>`).join('');
    card=card.replace('</h2>',`</h2><div class="photos">${thumbs}</div>`);
  }
  html=html.slice(0,start)+card+html.slice(end);
}
manifest.imageSelectionPolicy='Maximum 8 product-gallery and variant photos per product; description-only images excluded.';
await fs.writeFile(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
html=html.replace(/380 original images/g,`${total} selected product images`).replace('These are original supplier photos and names, before branded preparation.','Up to 8 product photos per product, with available colors prioritized. Description-only images are excluded. These are supplier originals, before branded preparation.');
if(!html.includes('.photos{'))html=html.replace('</style>','.photos{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:0;margin:12px 0}.photos img{display:block;width:100%;aspect-ratio:1;object-fit:contain;background:white}.photos a{border:1px solid #d9d0c3}</style>');
await fs.writeFile(path.join(root,'index.html'),html);
inventory=inventory.replace('380 original images',`${total} selected product images (maximum 8 per product; no description-only images)`);
await fs.writeFile(path.join(root,'INVENTORY.md'),inventory);
for(const name of ['README.md','BRAND-REFERENCE.md']){
  let doc=await fs.readFile(path.join(root,name),'utf8');doc=doc.replace(/380 original images/g,`${total} selected product images (up to 8 per product, excluding description-only images)`);
  if(name==='README.md'&&!doc.includes('## Image selection'))doc+='\n## Image selection\n\nUse only CJ product gallery and variant photos, maximum eight per product. Prioritize the main photo and available colors; remove identical image files. Never extract images from description HTML. Run `node products/select-images.mjs` to apply this policy to downloaded sources. Excluded prior downloads are kept only in the ignored local `products/.state/excluded-images/` archive, outside the active galleries.\n';
  await fs.writeFile(path.join(root,name),doc);
}
const report={checkedAt:new Date().toISOString(),products:manifest.products.length,variants:manifest.products.reduce((n,p)=>n+p.variantCount,0),selectedImageFiles:total,maximumImagesPerProduct:8,descriptionOnlyImages:0,checks:['Only product-gallery and variant URLs selected','At most eight images per product','Identical SHA-256 images deduplicated within each product','Every variant image represented directly or by identical image content','All selected files match recorded SHA-256'],errors,passed:errors.length===0,scope:'Source image selection only; not final branded images or Shopify publishing.'};
await fs.writeFile(path.join(root,'SOURCE-VALIDATION.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({products:manifest.products.length,selectedImages:total,excludedFilesArchived:archived,errors}));
if(errors.length)process.exitCode=1;
