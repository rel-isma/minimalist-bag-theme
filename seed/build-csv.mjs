import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { csvText, parseCsv, publicImageUrl, readJson, seedDirectory } from './lib.mjs';

export async function buildCsv({ imageMap = {}, requireImages = false } = {}) {
  const catalog = await readJson('catalog.json');
  const headers = parseCsv(await readFile(new URL('shopify-product-template.csv', seedDirectory), 'utf8'))[0];
  const rows = [headers];
  const urlFor = file => {
    const url = publicImageUrl(imageMap[file]);
    if (requireImages && !url) throw new Error(`Missing uploaded public URL for ${file}.`);
    return url;
  };
  const append = values => rows.push(headers.map(header => values[header] ?? ''));
  for (const product of catalog.products) {
    const first = product.images[0];
    product.variants.forEach((variant, index) => append({
      'Title': index === 0 ? product.title : '', 'URL handle': product.handle,
      'Description': index === 0 ? `<p>${product.description}</p>` : '',
      'Vendor': index === 0 ? product.vendor : '', 'Type': index === 0 ? product.productType : '',
      'Tags': index === 0 ? product.tags.join(', ') : '',
      'Published on online store': index === 0 ? 'FALSE' : '', 'Status': index === 0 ? 'draft' : '',
      'SKU': variant.sku, 'Option1 name': 'Color', 'Option1 value': variant.color,
      'Option2 name': variant.size ? 'Size' : '', 'Option2 value': variant.size ?? '',
      'Price': variant.price, 'Compare-at price': variant.compareAtPrice ?? '', 'Charge tax': 'TRUE',
      'Inventory tracker': '', 'Inventory quantity': '', 'Continue selling when out of stock': 'DENY',
      'Weight value (grams)': variant.weightGrams, 'Weight unit for display': 'g',
      'Requires shipping': 'TRUE', 'Fulfillment service': 'manual', 'Gift card': 'FALSE',
      'Product image URL': index === 0 ? urlFor(first.file) : '',
      'Image position': index === 0 && imageMap[first.file] ? 1 : '', 'Image alt text': index === 0 && imageMap[first.file] ? first.alt : '',
      'Variant image URL': variant.color === first.color ? urlFor(first.file) : '',
      'SEO title': index === 0 ? product.seo.title : '', 'SEO description': index === 0 ? product.seo.description : ''
    }));
    for (let i = 1; i < product.images.length; i++) {
      const url = urlFor(product.images[i].file);
      if (url) append({ 'URL handle': product.handle, 'Product image URL': url, 'Image position': i + 1, 'Image alt text': product.images[i].alt });
    }
  }
  return csvText(rows);
}

async function main() {
  const args = process.argv.slice(2);
  const value = flag => { const i = args.indexOf(flag); if (i < 0) return null; if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Supply a value for ${flag}.`); return args[i + 1]; };
  const mapPath = value('--image-map');
  const output = value('--output');
  const allowed = new Set(['--image-map', '--output', '--require-images']);
  for (let i = 0; i < args.length; i++) {
    if (!allowed.has(args[i])) throw new Error(`Unknown option ${args[i]}.`);
    if (args[i] !== '--require-images') i++;
  }
  const imageMap = mapPath ? JSON.parse(await readFile(resolve(mapPath), 'utf8')) : {};
  await writeFile(output ? resolve(output) : new URL('products.csv', seedDirectory), await buildCsv({ imageMap, requireImages: args.includes('--require-images') }));
  console.log(`CSV written${mapPath ? ' with supplied image URLs' : ' without hosted images; see seed/README.md'}.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
