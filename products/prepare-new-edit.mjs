import fs from 'node:fs/promises';
import {product,writeJson,STATE,ROOT,validateDraft,digest,formatDescription} from '../studio/core.mjs';

// Local preparation only: this script never submits a Shopify or CJ listing.
const choices=[{
 id:'2602240521431615000',title:'Lune zip handbag',handle:'lune-zip-handbag',price:'109.00',type:'Shoulder bag',
 description:'Lune brings a softly rounded shape to everyday dressing. Its pebbled surface, curved zip opening and pared-back front keep the silhouette quietly defined. Carry it by the twin handles or use the longer strap for another way to wear it.\n\nA zippered interior pocket and phone pocket help keep smaller belongings together. Available in Black, Brown and Light Gray.',
 material:'Leather exterior with polyester lining.',dimensions:'32 × 11 × 22 cm (length × width × height), as stated by the supplier.',
 seo:'A softly rounded leather handbag with twin handles, a curved zip opening and a longer strap. Discover Lune by Atelier Veyne in three colors.',
 colors:{Black:'#1B1A18',Brown:'#3E2B22','Light Gray':'#C4BEAC'},
 notes:['Price is a USD retail proposal; shipping, fees and margin require approval before listing.','The supplier uses a full-grain claim that has not been independently verified. Final copy deliberately says leather only.','Supplier product dimensions (32 × 11 × 22 cm) are used; variant logistics dimensions are larger and are not used as product dimensions.','Supplier care instructions are absent. The care field remains empty; no treatment instructions have been invented.','Compare generated photographs with the CJ originals before publication.'],
}, {
 id:'2604020624051609200',title:'Reed baguette bag',handle:'reed-baguette-bag',price:'89.00',type:'Shoulder bag',
 description:'A long, low silhouette gives Reed its understated character. Smooth leather, elongated twin handles and pointed handle attachments create a clean line against everyday layers. A paired zip opening follows the top of the bag, while an internal phone pocket gives a small essential its own place.\n\nChoose Black, Coffee or Wine Red. The quiet shape moves easily from a simple daytime outfit to an evening look.',
 material:'Split cowhide leather exterior with polyester-cotton lining.',dimensions:'',
 seo:'Discover Reed, a slim leather baguette bag with long twin handles and a paired zip opening. Available in Black, Coffee and Wine Red at Atelier Veyne.',
 colors:{Black:'#1B1A18',Coffee:'#583A2C','Wine Red':'#65242D'},
 notes:['Price is a USD retail proposal; shipping, fees and margin require approval before listing.','Product dimensions are not supplied in the product facts. Variant shipping dimensions are not treated as product measurements. Dimensions remain empty pending confirmation.','Supplier identifies second-layer cowhide; final copy uses split cowhide and does not claim full-grain or top-grain leather.','Supplier care instructions are absent. The care field remains empty.','Compare generated photographs with the CJ originals before publication. The saved gallery has no verified open-interior view; do not invent one.'],
}, {
 id:'2608221231211620900',title:'Alba mini crossbody bag',handle:'alba-mini-crossbody-bag',price:'99.00',type:'Crossbody bag',
 description:'A small crescent shape, a curved zip opening and a softly pebbled surface give Alba its quiet character. The short handle keeps the silhouette compact, while the longer strap offers another way to carry it. Silver-tone hardware adds a restrained finishing detail.\n\nInside, a zippered pocket and card compartment help separate smaller belongings. At 15 × 10 × 14 cm, Alba is a compact choice for a light everyday carry.',
 material:'Leather exterior with polyester-cotton lining.',dimensions:'15 × 10 × 14 cm, as stated by the supplier.',
 seo:'Meet Alba, a compact crescent crossbody bag with a curved zip opening, short handle and longer strap. Explore six colors at Atelier Veyne.',
 colors:{'Chick Yellow':'#E3D26B','Milk Shake Powder':'#DDC6CD','Matcha Green':'#B7C6AF','Milkshake White':'#E7E1D4',Black:'#1B1A18','Elephant Gray':'#A79780'},
 notes:['Price is a USD retail proposal; shipping, fees and margin require approval before listing.','Supplier states 15 × 10 × 14 cm. This is a mini bag; no phone-fit or large-capacity promise is made.','CJ color labels are retained exactly, including Milk Shake Powder. Proposed swatches follow the source photographs.','Supplier full-grain claim is not independently verified; final copy says leather only.','Supplier care instructions are absent; the care field remains empty. Compare edited photos with their CJ originals before publication.'],
}, {
 id:'2607070313251623100',title:'Ellis long-handle bag',handle:'ellis-long-handle-bag',price:'109.00',type:'Shoulder bag',
 description:'Ellis pairs a rounded rectangular body with long twin handles and a softly pebbled finish. A curved zip opening follows its upper edge, while the uncluttered front keeps the shape understated. Choose Black or Brown for an easy companion to everyday layers.\n\nA zippered inner pocket, phone pocket and card pocket give smaller belongings their own place. The long handles offer an easy way to carry it through the day.',
 material:'Leather exterior with polyester-cotton lining.',dimensions:'33 × 12 × 21 cm, as stated by the supplier.',
 seo:'Discover Ellis, a pebbled leather bag with long twin handles and a curved zip opening. Available in Black and Brown at Atelier Veyne.',
 colors:{Black:'#1B1A18',Brown:'#44312B'},
 notes:['Price is a USD retail proposal; shipping, fees and margin require approval before listing.','Supplier says no separate shoulder strap. Copy describes only the long handles visible in the photos; no detachable strap is promised.','The Brown variant is called Coffee in the description. Original variant label Brown is retained; verify against photos.','Supplier full-grain claim is unverified; final copy says leather only.','Supplier care instructions are absent; compare generated photographs with originals before publication.'],
}, {
 id:'2606280932411629600',title:'Iris soft shoulder bag',handle:'iris-soft-shoulder-bag',price:'99.00',type:'Shoulder bag',
 description:'Iris brings a soft, gently tapered shape to an everyday shoulder bag. A single handle follows the curve of its folded front, finished with a small silver-tone turn lock. The pebbled surface and pared-back outline keep the focus on the silhouette.\n\nAvailable in Beige, Elephant Gray, Pink, Brown, Black and Blue, Iris adds a quiet accent to simple layers.',
 material:'Leather exterior with polyester-cotton lining.',dimensions:'',
 seo:'Explore Iris, a softly shaped leather shoulder bag with a single handle and discreet silver-tone turn lock. Six colors, by Atelier Veyne.',
 colors:{Beige:'#E8DFD2','Elephant Gray':'#B6A08A',Pink:'#E7BBC7',Brown:'#4B363A',Black:'#24252A',Blue:'#AFC9DF'},
 notes:['Price is a USD retail proposal; shipping, fees and margin require approval before listing.','Supplier product measurements are absent. Dimensions remain empty; shipping-package dimensions are not substituted.','The source title calls this a tote; photos show a single-handle shoulder bag. Product type is Shoulder bag, with original CJ title retained in source records.','Supplier title uses top-grain wording without supporting detail; final material copy says leather only.','Supplier care instructions are absent; verify edited images and color swatches against originals before publication.'],
}, {
 id:'2608040718451626300',title:'Wren bowling bag',handle:'wren-bowling-bag',price:'129.00',type:'Shoulder bag',
 description:'Wren gives the bowling-bag silhouette a restrained everyday expression. Its softly rounded body, pebbled finish and long twin handles create a clean profile, with a zip opening along the top and a small hanging leather detail.\n\nA phone pocket and zippered compartment help organize the interior. Choose from Ebony Colors, Black, Milkshake White, Golden Brown and Dark Gray.',
 material:'Cowhide leather exterior with synthetic-leather lining.',dimensions:'',
 seo:'Meet Wren, a pebbled leather bowling bag with long twin handles and a zip opening. Discover five colors in the Atelier Veyne collection.',
 colors:{'Ebony Colors':'#453C32',Black:'#1B1A18','Milkshake White':'#E6DECE','Golden Brown':'#A66D38','Dark Gray':'#746A60'},
 notes:['Price is a USD retail proposal; shipping, fees and margin require approval before listing.','Product measurements are absent. Dimensions remain empty pending supplier confirmation.','Lining is described as synthetic leather, not fabric or genuine leather; final copy retains that distinction.','Supplier top-layer/full-grain wording is unverified. Final copy does not promise a leather grade.','Original color label Ebony Colors is retained. Care instructions are absent; verify every edited photo against its CJ original.'],
}];
const records=JSON.parse(await fs.readFile(ROOT+'products/new-edit-image-records.json'));
for(const c of choices){
 if(process.argv.includes('--only-new')&&['2602240521431615000','2604020624051609200'].includes(c.id))continue;
 const p=await product(c.id),old=await fs.readFile(STATE+'/drafts/'+c.id+'.json').catch(()=>null);
 if(old)await fs.writeFile(STATE+'/drafts/'+c.id+'.before-new-edit.json',old,{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
 const selected=records.records.filter(r=>r.file.includes('/'+c.id+'/'));
 const sourceImages=JSON.parse(await fs.readFile(ROOT+'products/'+c.id+'/source/images.json')).images;
 const additional=await fs.readFile(ROOT+'products/'+c.id+'/source/additional-gallery-review.json','utf8').then(JSON.parse).catch(e=>{if(e.code==='ENOENT')return {images:[]};throw e;});
 sourceImages.push(...additional.images);
 const images=selected.map(r=>{const original=sourceImages.find(im=>r.source.endsWith('/'+im.file));if(!original)throw new Error('Missing source record '+r.source);const variantIds=p.source.variants.filter(v=>v.variantImage===original.sourceUrl).map(v=>String(v.vid));return {id:digest(r.file).slice(0,16),file:r.file,url:'/media/'+r.file,alt:`${c.title} — ${r.label||variantIds.map(id=>p.source.variants.find(v=>String(v.vid)===id)?.variantKey.split('-')[0]).join(', ')||r.role||'editorial detail'}`,variantIds,enabled:true,kind:'branded',role:r.role,sourceUrl:original.sourceUrl,sourceFile:r.source};});
 const d={...p.draft,title:c.title,handle:c.handle,description:c.description,vendor:'Atelier Veyne',productType:c.type,tags:['cj-import',c.type==='Crossbody bag'?'crossbody-bag':'shoulder-bag','everyday','new-arrival'],seo:{title:c.title+' | Atelier Veyne',description:c.seo},material:c.material,dimensions:c.dimensions,care:'',images,swatches:Object.entries(c.colors).map(([optionValue,proposedHex])=>({optionValue,proposedHex})),variants:p.draft.variants.map(v=>({...v,proposedRetailPrice:{amount:c.price,currency:'USD'}})),reviewNotes:c.notes,resolvedNotes:[],savedAt:new Date().toISOString(),replaceGallery:true};
 const errors=validateDraft(d,p.source);if(errors.length)throw new Error(c.title+': '+errors.join('; '));
 await writeJson(STATE+'/drafts/'+c.id+'.json',d);
 const base=ROOT+'products/'+c.id+'/prepared/';
 await writeJson(base+'new-edit.json',{preparedAt:d.savedAt,publishingApproved:false,ownerApproved:false,pricingApproved:false,draft:d,shopifyDescriptionHtml:formatDescription(d.description),source:{pid:c.id,sku:d.cjProductSku},reviewNotes:c.notes});
 console.log(c.title+': saved '+images.length+' images, '+d.variants.length+' original CJ variants; validation passed.');
}
