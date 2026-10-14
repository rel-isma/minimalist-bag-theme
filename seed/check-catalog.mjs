/** Local Liquid fixtures, not a substitute for Shopify storefront verification. */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const modulePath = process.argv[process.argv.indexOf('--liquidjs') + 1];
if (!process.argv.includes('--liquidjs')) throw new Error('Pass --liquidjs /absolute/path/to/node_modules/liquidjs (temporary QA dependency).');
const { Liquid } = createRequire(import.meta.url)(path.resolve(modulePath));
const engine = new Liquid({ root: path.join(root, 'snippets'), extname: '.liquid' });
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
engine.registerFilter('escape', esc);
const named = args => Object.fromEntries(args.filter(Array.isArray));
engine.registerFilter('money', value => `$${(Number(value) / 100).toFixed(2)}`);
engine.registerFilter('t', value => ({ 'products.product.price.sale_price': 'Sale price', 'products.product.price.regular_price': 'Regular price', 'products.product.sold_out': 'Sold out' })[value] || value);
engine.registerFilter('image_url', image => typeof image === 'string' ? image : image.src);
engine.registerFilter('image_tag', (src, ...args) => {
  const attributes = named(args);
  delete attributes.widths;
  const custom = Object.entries(attributes).map(([key, value]) => `${key}="${esc(value)}"`).join(' ');
  return `<img src="${esc(src)}" width="1120" height="1400" alt="${esc(attributes.alt || 'AI-generated demo image')}" ${custom.replace(/alt="[^"]*"/g, '')}>`;
});
engine.registerFilter('placeholder_svg_tag', (_, cls) => `<svg class="${esc(cls)}" viewBox="0 0 100 125" aria-label="Product image placeholder" role="img"><rect width="100" height="125" fill="currentColor" opacity=".08"/></svg>`);
const catalog = JSON.parse(await readFile(path.join(root, 'seed/catalog.json')));
const settings = { brand_name: catalog.brand, card_image_ratio: '3/4', card_show_second_image: true, card_show_swatches: true, card_show_quick_add: true, collection_grid_columns: '3' };
const routes = { root_url: '../seed/collection-preview.html', collections_url: '../seed/catalog-preview.html', all_products_collection_url: '../seed/collection-preview.html', cart_add_url: '/cart/add', cart_url: '/cart' };
engine.options.globals = { settings, routes };
const products = catalog.products.map((product, index) => {
  const images = product.images.map(image => ({ src: `images/${image.file}`, alt: image.alt }));
  const variants = product.variants.map((variant, vi) => ({ id: (index + 1) * 100 + vi, options: [variant.color, variant.size].filter(Boolean), title: [variant.color, variant.size].filter(Boolean).join(' / '), price: Math.round(Number(variant.price) * 100), compare_at_price: Math.round(Number(variant.compareAtPrice) * 100), available: true, featured_image: null }));
  return { id: index + 1, title: product.title, url: `preview-products/${product.handle}.html`, options: product.options.map(option => option.name), options_with_values: product.options.map((option, oi) => ({ ...option, position: oi + 1 })), tags: product.tags, images, featured_image: images[0], variants, selected_or_first_available_variant: variants[0], price: Math.min(...variants.map(v => v.price)), price_varies: false, available: true, has_only_default_variant: false };
});
const fixtureValue = (label, count, value, active = false, param = 'filter.v.option.color') => ({ label, count, value, active, param_name: param, url_to_remove: '?sort_by=manual' });
const filters = [
  { label: 'Availability', type: 'boolean', active_values: [], values: [fixtureValue('In stock', 22, '1', false, 'filter.v.availability'), fixtureValue('Out of stock', 0, '0', false, 'filter.v.availability')] },
  { label: 'Color', type: 'list', active_values: [], values: ['Bone', 'Black', 'Cognac', 'Taupe', 'Olive'].map(color => fixtureValue(color, 8, color)) },
  { label: 'Price', type: 'price_range', range_max: 12900, min_value: { value: null, param_name: 'filter.v.price.gte' }, max_value: { value: null, param_name: 'filter.v.price.lte' }, url_to_remove: '?sort_by=manual' },
  { label: 'Product type', type: 'list', active_values: [], values: [fixtureValue('Shoulder bag', 6, 'Shoulder bag', false, 'filter.p.product_type')] }
];
const collection = { title: 'The collection', description: '<p>A considered edit of bags and everyday essentials.</p>', url: 'collection-preview.html', products: products.slice(0, 12), products_count: 22, image: { src: 'images/atelier-vane-demo-collection-hero.jpg' }, filters, default_sort_by: 'manual', sort_options: [{ value: 'manual', name: 'Featured' }, { value: 'price-ascending', name: 'Price, low to high' }, { value: 'title-ascending', name: 'Alphabetically, A–Z' }] };
const context = { settings, routes, collection, cart: { currency: { iso_code: 'USD' } }, section: { id: 'fixture-collection', settings: { show_image: true, show_description: true, products_per_page: 12 } }, fixture_paginate: { pages: 2, current_page: 1, parts: [{ is_link: false, title: 1 }, { is_link: true, title: 2, url: '?page=2' }], next: { url: '?page=2' } } };
const sectionSource = (await readFile(path.join(root, 'sections/main-collection.liquid'), 'utf8')).replace(/\{% schema %\}[\s\S]*?\{% endschema %\}/g, '').replace(/\{%-? paginate .*? -?%\}/g, '{% assign paginate = fixture_paginate %}').replace(/\{%-? endpaginate -?%\}/g, '');
const renderCollection = data => engine.parseAndRender(sectionSource, data);
const normal = await renderCollection(context);
assert.equal((normal.match(/data-product-card/g) || []).length, 12);
assert.ok(normal.includes('aria-label="Pagination"'));
assert.ok(normal.includes('data-filter-open'));
assert.ok(normal.includes('action="/cart/add"'));
assert.ok(normal.includes('--card-ratio: 3/4'));
assert.ok(normal.includes('aria-current="page" aria-label="Page 1"'));
const breadcrumbs = JSON.parse(normal.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(breadcrumbs.itemListElement.length, 3);
assert.ok(normal.includes('filter.v.option.color'));
assert.ok(normal.includes('disabled>\n                <span>Out of stock'));
assert.ok(!normal.includes('$295'));
const empty = await renderCollection({ ...context, collection: { ...collection, products: [], products_count: 0, filters: [] } });
assert.ok(empty.includes('There are no products in this collection yet'));
assert.ok(!empty.includes('data-product-card'));
const active = await renderCollection({ ...context, collection: { ...collection, products: [], products_count: 0, filters: [{ ...filters[1], active_values: [fixtureValue('Bone', 0, 'Bone', true)] }] } });
assert.ok(active.includes('No products match these filters'));
assert.ok(active.includes('Clear all'));
assert.ok(active.includes('Color: Bone'));
const missing = await engine.renderFile('product-card', { product: null });
assert.equal(missing.trim(), '');
const soldOutProduct = { ...products[0], available: false, variants: products[0].variants.map(v => ({ ...v, available: false })) };
const soldOut = await engine.renderFile('product-card', { settings, routes, product: soldOutProduct, section_id: 'sold', card_index: 1 });
assert.ok(soldOut.includes('badge--sold-out'));
assert.ok(soldOut.includes('type="submit" disabled'));
assert.ok(soldOut.includes('type="radio"'));
assert.ok(!soldOut.includes('data-card-variant'));
const nativeSwatch = await engine.renderFile('product-card', { settings, routes, product: { ...products[0], options_with_values: [{ name: 'Color', position: 1, values: [{ name: 'Bone', swatch: { color: '#F5F1EA' } }] }] }, section_id: 'native', card_index: 1 });
assert.ok(nativeSwatch.includes('name="id" value="100"'));
assert.ok(nativeSwatch.includes('title="Bone"'));
const noImage = await engine.renderFile('product-card', { settings, routes, product: { ...products[0], featured_image: null, images: [] }, section_id: 'none', card_index: 1 });
assert.ok(noImage.includes('product-card__placeholder'));
const varying = { ...products[0], price_varies: true, variants: [{ price: 9900, compare_at_price: 0 }, { price: 12900, compare_at_price: 14900 }] };
const honestPrice = await engine.renderFile('price', { product: varying });
assert.ok(honestPrice.includes('From $99.00'));
assert.ok(!honestPrice.includes('<s '));
const noPrice = await engine.renderFile('price', { product: null });
assert.equal(noPrice.trim(), '');
const quickSource = (await readFile(path.join(root, 'sections/quick-view.liquid'), 'utf8')).replace(/\{% schema %\}[\s\S]*?\{% endschema %\}/g, '');
const multiOption = products.filter(product => product.options.length > 1);
await mkdir(path.join(root, 'seed/preview-products'), { recursive: true });
for (const product of multiOption) {
  const html = await engine.parseAndRender(quickSource, { ...context, product });
  assert.equal((html.match(/data-variant-option/g) || []).length, product.options.length);
  const json = html.match(/data-variants="([^"]*)"/)[1].replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
  assert.equal(JSON.parse(json).length, product.variants.length);
  // Fetching the fixture from seed/collection-preview.html keeps the parent base URL.
  await writeFile(path.join(root, 'seed/preview-products', `${catalog.products[product.id - 1].handle}.html`), html);
}
const hostile = { ...multiOption[0], variants: [{ ...multiOption[0].variants[0], options: ['</script><script>bad()</script>', 'Standard'] }] };
const safeJson = await engine.parseAndRender(quickSource, { ...context, product: hostile });
assert.ok(!safeJson.includes('<script>bad'));
assert.ok(safeJson.includes('&lt;/script&gt;'));
const dialog = `<dialog class="catalog-dialog" data-quick-view-dialog aria-label="Choose product options"><div class="catalog-dialog__header"><span class="eyebrow">Atelier Vane</span><button type="button" class="btn btn--link" data-dialog-close>Close</button></div><div data-quick-view-content role="status" aria-live="polite"></div></dialog>`;
const shell = body => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Atelier Vane — Collection local review</title><link rel="stylesheet" href="../assets/base.css"><link rel="stylesheet" href="../assets/catalog.css"><link rel="stylesheet" href="../assets/store.css"><script src="../assets/catalog.js" defer></script></head><body><div class="container" style="padding-top:2rem"><p>Local stage (b) review · AI demo imagery · cart and filters require a Shopify development store.</p><a class="btn btn--link" href="catalog-preview.html">View all 22 demo products</a></div><main>${body}</main><div hidden data-catalog-config data-cart-url="/cart" data-cart-type="drawer"></div>${dialog}</body></html>`;
// Include the two Color/Size products on the first page for local quick-view review.
const review = await renderCollection({ ...context, collection: { ...collection, products: [...products.slice(0, 10), ...multiOption] } });
await writeFile(path.join(root, 'seed/collection-preview.html'), shell(review));
await writeFile(path.join(root, 'seed/collection-empty-preview.html'), shell(empty));
await writeFile(path.join(root, 'seed/collection-filtered-preview.html'), shell(active));
await writeFile(path.join(root, 'seed/collection-sold-out-preview.html'), shell(await engine.renderFile('product-card', { ...context, product: soldOutProduct, section_id: 'sold', card_index: 1 })));
console.log('Local catalog assertions passed: cards, pagination, filters, empty/missing resources, sold out, honest varying prices, quick-view payloads, and JSON escaping. Four review pages generated.');

export { engine, products, settings, routes, context };
