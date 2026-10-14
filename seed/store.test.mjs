import test from 'node:test';
import assert from 'node:assert/strict';
import { renderStore, renderSection, baseContext, productMap, collectionMap, filteredCollection, settings, products } from './preview-liquid.mjs';
const url = new URL('http://localhost:3333/');
const context = baseContext(url, { items: [], note: '' });
test('home uses six collections, two shared-card rows and no sample reviews', async () => {
  const html = await renderStore('index', { ...context, page_title: 'Atelier Vane' }, url);
  assert.equal((html.match(/class="category-tile"/g) || []).length, 6);
  assert.equal((html.match(/data-product-card/g) || []).length, 12);
  assert.equal((html.match(/class="shop-look__pin"/g) || []).length, 2);
  assert.ok(html.includes('Shop Plane tote bag'));
  assert.ok(html.includes('Shop Turn wallet'));
  assert.ok(!html.includes('review-card__quote'));
  assert.ok(html.includes('Honest Construction'));
  assert.ok(html.includes('Frequently Asked Questions'));
  assert.ok(html.includes('Can the shoulder strap length be adjusted?'));
  assert.ok(!html.includes('data-card-variant'));
  assert.ok(!html.includes('$295'));
});
test('empty resources show honest collection states and omit buying controls', async () => {
  const html = await renderSection('featured-collection', 'empty', { collection: null }, context);
  assert.ok(html.includes('being prepared'));
  assert.ok(!html.includes('data-catalog-add-form'));
  const missing = await renderSection('main-product', 'missing', {}, { ...context, product: null });
  assert.ok(missing.includes('Product unavailable'));
  assert.ok(!missing.includes('data-product-form'));
});
test('product Color/Size, native quantity association and metadata are rendered', async () => {
  const product = productMap['line-tote-bag'];
  const html = await renderStore('product', { ...context, product, page_title: product.title }, new URL(url.origin + product.url));
  assert.equal((html.match(/data-product-option/g) || []).length, 2);
  assert.ok(html.includes('data-reviews'));
  assert.ok(html.includes('No ratings yet'));
  assert.ok(html.includes('color-swatch-item--color'));
  assert.ok(html.includes('form="ProductForm-main"'));
  assert.ok(html.includes(product.metafields.custom.material.value));
  const structured = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map(s => JSON.parse(s.replace(/<\/?script[^>]*>/g, '')));
  assert.ok(structured.some(value => value['@type'] === 'Product'));
  assert.ok(structured.some(value => value['@type'] === 'BreadcrumbList'));
});
test('native filters combine Color/type/price and sorting and preserve counts', () => {
  const result = filteredCollection(collectionMap.all, new URL(url.origin + '/collections/all?filter.v.option.color=Bone&filter.p.product_type=Shoulder%20bag&sort_by=price-ascending'));
  assert.ok(result.products.length > 0);
  assert.ok(result.products.every(p => p.type === 'Shoulder bag' && p.variants.some(v => v.options[0] === 'Bone')));
  assert.deepEqual(result.products.map(p => p.price), result.products.map(p => p.price).sort((a, b) => a - b));
  assert.equal(result.products_count, result.products.length);
  assert.equal(filteredCollection(collectionMap.all, new URL(url.origin + '/collections/all?filter.v.price.lte=1')).products.length, 0);
});
test('shipping threshold is hidden by default and calculated from all cart lines', async () => {
  const hidden = await renderSection('cart-drawer', 'cart-drawer', {}, context);
  assert.ok(!hidden.includes('data-free-shipping-bar'));
  const scoped = { ...context, settings: { ...settings, free_shipping_threshold: 150 }, cart: { ...context.cart, total_price: 12900 } };
  const partial = await renderSection('cart-drawer', 'cart-drawer', {}, scoped);
  assert.ok(partial.includes('$21.00'));assert.ok(partial.includes('aria-valuenow="86"'));
  const unlocked = await renderSection('cart-drawer', 'cart-drawer', {}, { ...scoped, cart: { ...scoped.cart, total_price: 22800 } });
  assert.ok(unlocked.includes('aria-valuenow="100"'));
});
test('recommendations and authentic reviews remain absent when no content exists', async () => {
  const rec = await renderSection('product-recommendations', 'rec', {}, { ...context, product: products[0], recommendations: { products_count: 0, products: [] } });
  assert.ok(rec.includes('hidden'));assert.ok(!rec.includes('data-product-card'));
  const reviews = await renderSection('product-reviews', 'reviews', { publish_reviews: true }, context);
  assert.equal(reviews.trim(), '');
});
test('review summary is scoped to the product and calculated from complete records', async () => {
  const blocks = {
    a: { type: 'review', settings: { product: 'cove-shoulder-bag', reviewer_name: 'QA reviewer A', review_text: 'Synthetic test record only.', rating: 5, date: '2026-10-01' } },
    b: { type: 'review', settings: { product: 'cove-shoulder-bag', reviewer_name: 'QA reviewer B', review_text: 'Synthetic test record only.', rating: 4, date: '2026-10-02' } },
    other: { type: 'review', settings: { product: 'line-tote-bag', reviewer_name: 'Excluded reviewer', review_text: 'Different product test record.', rating: 1 } },
    incomplete: { type: 'review', settings: { product: 'cove-shoulder-bag', reviewer_name: 'Incomplete reviewer', review_text: '', rating: 1 } }
  };
  const html = await renderSection('product-reviews', 'test-reviews', { publish_reviews: true }, { ...context, product: products[0] }, blocks);
  assert.ok(html.includes('4.5'));
  assert.equal((html.match(/data-review data-rating/g) || []).length, 2);
  assert.ok(!html.includes('Excluded reviewer'));
  assert.ok(!html.includes('Incomplete reviewer'));
  assert.ok(html.includes('width: 50'));
  assert.ok(html.includes('data-review-rating'));
  assert.ok(html.includes('data-review-sort'));
});
