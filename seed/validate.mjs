import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { readJson, parseCsv, seedDirectory } from './lib.mjs';

const catalog = await readJson('catalog.json');
const collections = await readJson('collections.json');
const menus = await readJson('menus.json');
const pages = await readJson('pages.json');
const images = await readJson('images.json');
assert.equal(catalog.products.length, 22);
const expected = { 'shoulder-bag': 6, 'crossbody-bag': 4, 'tote-bag': 4, 'mini-bag': 3, wallet: 3, accessory: 2 };
const handles = new Set(); const skus = new Set(); let variants = 0; let sales = 0;
for (const product of catalog.products) {
  assert(!handles.has(product.handle)); handles.add(product.handle);
  assert.match(product.handle, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const words = product.description.split(/\s+/).length;
  assert(words >= 60 && words <= 90, `${product.handle}: ${words} description words`);
  assert.equal(product.vendor, 'Atelier Vane');
  assert(product.tags.includes('demo')); assert(product.tags.includes(product.categoryTag));
  for (const tag of product.tags) assert.match(tag, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(!product.tags.some(tag => /bestseller|limited|low-stock/.test(tag)));
  assert.equal(product.options[0].name, 'Color');
  assert(product.options[0].values.length >= 1 && product.options[0].values.length <= 3);
  assert.equal(product.images.length, 2);
  const combinations = new Set();
  for (const variant of product.variants) {
    assert(!skus.has(variant.sku)); skus.add(variant.sku); variants++;
    assert.equal(variant.tracked, false);
    assert(Number(variant.price) >= 39 && Number(variant.price) <= 129);
    assert(variant.weightGrams > 0);
    assert(product.options[0].values.includes(variant.color));
    if (variant.size) assert(product.options[1].values.includes(variant.size));
    const key = JSON.stringify([variant.color, variant.size]); assert(!combinations.has(key)); combinations.add(key);
    if (variant.compareAtPrice) assert(Number(variant.compareAtPrice) > Number(variant.price));
  }
  assert.equal(product.variants.length, product.options.reduce((n, option) => n * option.values.length, 1));
  if (product.variants.some(v => v.compareAtPrice)) sales++;
  assert(product.seo.title.length <= 70); assert(product.seo.description.length <= 160);
}
assert.equal(sales, 3);
for (const [category, count] of Object.entries(expected)) assert.equal(catalog.products.filter(p => p.categoryTag === category).length, count);
assert.equal(collections.length, 8);
for (const c of collections) { assert.equal(c.ruleSet.rules[0].column, 'TAG'); assert.equal(c.ruleSet.rules[0].relation, 'EQUALS'); }
assert.deepEqual(menus.map(m => m.handle), ['main-menu', 'footer']);
assert.equal(menus[0].items[0].items.length, 6);
for (const item of menus.flatMap(menu => menu.items)) {
  const check = link => { if (link.type === 'COLLECTION') assert(collections.some(c => c.handle === link.handle)); if (link.type === 'PAGE') assert(pages.some(p => p.handle === link.handle)); for (const child of link.items ?? []) check(child); }; check(item);
}
assert.equal(pages.find(p => p.handle === 'contact').templateSuffix, 'contact');
assert.equal(images.length, 56);
assert.equal(new Set(images.map(image => image.file)).size, images.length);
for (const image of images) {
  const file = new URL(`images/${image.file}`, seedDirectory);
  assert((await stat(file)).size < 300000, image.file);
  const bytes = await readFile(file); assert.equal(bytes[0], 0xff); assert.equal(bytes[1], 0xd8);
  assert(image.alt.includes('demo placeholder'));
}
const headers = parseCsv(await readFile(new URL('shopify-product-template.csv', seedDirectory), 'utf8'))[0];
const csv = parseCsv(await readFile(new URL('products.csv', seedDirectory), 'utf8'));
assert.deepEqual(csv[0], headers);
for (const row of csv.slice(1)) assert.equal(row.length, headers.length);
const field = (row, name) => row[headers.indexOf(name)];
const variantRows = csv.slice(1).filter(row => field(row, 'SKU'));
assert.equal(variantRows.length, variants);
assert.equal(csv.slice(1).filter(row => field(row, 'Title')).length, 22);
assert.equal(csv.length - 1, variants);
for (const row of variantRows) assert.equal(field(row, 'Inventory tracker'), '');
for (const row of csv.slice(1).filter(row => field(row, 'Title'))) { assert.equal(field(row, 'Status'), 'draft'); assert.equal(field(row, 'Published on online store'), 'FALSE'); }
console.log(`PASS: 22 products, ${variants} variants, 8 collections, 2 menus, 4 pages, 56 images; official CSV headers and all catalog constraints verified.`);
