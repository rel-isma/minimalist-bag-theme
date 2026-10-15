import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildCsv } from './build-csv.mjs';
import { parseCsv, csvText, publicImageUrl, productInput, assertDemoProduct, SEED_ID, seedDirectory } from './lib.mjs';
import { ShopifyAdmin } from './admin.mjs';
import { loadSeed, runSeed } from './seed.mjs';

test('CSV survives commas, quotes, Unicode, and embedded newlines', () => {
  const rows = [['Title','Description'],['Cove, Bone','A "quiet" shape.\nSecond line — demo.']];
  assert.deepEqual(parseCsv(csvText(rows)), rows);
  assert.throws(() => parseCsv('"unclosed'), /Unclosed/);
});

test('CSV URL preparation requires complete public image URLs', async () => {
  const dataOnly = parseCsv(await buildCsv());
  assert.equal(dataOnly.length - 1, 52);
  assert(dataOnly.slice(1).every(row => row[dataOnly[0].indexOf('SKU')] && !row[dataOnly[0].indexOf('Image position')]));
  await assert.rejects(buildCsv({ requireImages: true }), /Missing uploaded public URL/);
  const seed = await loadSeed();
  const map = Object.fromEntries(seed.images.map(image => [image.file, `https://cdn.shopify.com/s/files/1/0000/0000/files/${image.file}`]));
  const rows = parseCsv(await buildCsv({ imageMap: map, requireImages: true }));
  assert.equal(rows.length - 1, 74);
  const header = rows[0]; const field = (row, key) => row[header.indexOf(key)];
  assert.equal(rows.slice(1).filter(row => field(row, 'Product image URL')).length, 44);
  for (const row of rows.slice(1).filter(row => field(row, 'Variant image URL'))) {
    assert.equal(field(row, 'Option1 value').toLowerCase(), field(row, 'Variant image URL').match(/-(bone|black|taupe|olive|cognac)-front/)[1]);
  }
  assert.throws(() => publicImageUrl('http://localhost/x.jpg'), /public HTTPS/);
  assert.throws(() => publicImageUrl('https://token@example.com/x.jpg'), /credentials/);
});

test('product payloads keep every color/size combination, draft status, and untracked inventory', async () => {
  const seed = await loadSeed();
  const p = seed.catalog.products.find(p => p.handle === 'line-tote-bag');
  const input = productInput(p);
  assert.equal(input.status, 'DRAFT'); assert.equal(input.variants.length, 4);
  assert(input.variants.every(v => v.optionValues.length === 2 && v.inventoryItem.tracked === false));
  assert(input.variants.every(v => !Object.hasOwn(v, 'inventoryQuantities')));
  assert.throws(() => assertDemoProduct({ tags: ['demo'] }, p.handle), /unowned/);
});

test('GraphQL failures and user errors stop writes without retrying ambiguous server errors', async () => {
  let requests = 0;
  const admin = new ShopifyAdmin('demo-test.myshopify.com', 'fake-test-token', async () => { requests++; return new Response('{}', { status: 500 }); });
  await assert.rejects(admin.graphql('mutation { example }'), /HTTP 500/);
  assert.equal(requests, 1);
  admin.fetcher = async () => new Response(JSON.stringify({ data: { productSet: { userErrors: [{ field: ['title'], message: 'Invalid' }] } } }));
  await assert.rejects(admin.graphql('mutation { example }'), /title: Invalid/);
});

test('resource lookup follows pagination without dropping records', async () => {
  const cursors = [];
  const admin = new ShopifyAdmin('demo-test.myshopify.com', 'fake-test-token', async (url, init) => {
    const { query, variables } = JSON.parse(init.body); assert(query.includes('first: 25'));
    cursors.push(variables.cursor);
    return new Response(JSON.stringify({ data: { products: { nodes: [{ id: variables.cursor ? 'second' : 'first' }], pageInfo: { hasNextPage: !variables.cursor, endCursor: variables.cursor ? null : 'next-page' } } } }));
  });
  assert.deepEqual((await admin.all('products', 'id')).map(p => p.id), ['first', 'second']);
  assert.deepEqual(cursors, [null, 'next-page']);
});

class DevelopmentStore {
  constructor() {
    this.store = 'demo-test.myshopify.com'; this.products = []; this.collections = []; this.pages = [];
    this.menus = [{ id: 'menu-original', handle: 'main-menu', title: 'Original main menu', items: [{ title: 'Home', type: 'HTTP', url: 'https://demo-test.myshopify.com/' }] }];
    this.files = new Map(); this.state = null; this.writes = 0; this.dev = true; this.currency = 'USD';
  }
  async all(connection, fields, query) {
    const records = structuredClone(this[connection]);
    return query === 'tag:demo' ? records.filter(p => p.tags.includes('demo')) : records;
  }
  async uploadImage(image, state, save) {
    if (!this.files.has(image.file)) this.files.set(image.file, { id: 'file-'+image.file, hash: 'fake-hash', url: 'https://cdn.shopify.com/'+image.file });
    state.files[image.file] = this.files.get(image.file); await save(); return state.files[image.file];
  }
  async graphql(query, vars = {}) {
    if (query.startsWith('query SeedStore')) return { shop: { id: 'shop-demo', name: 'Demo', currencyCode: this.currency, plan: { partnerDevelopment: this.dev }, state: this.state ? { value: JSON.stringify(this.state) } : null } };
    if (query.startsWith('query SeedFile')) return { node: [...this.files.values()].find(file => file.id === vars.id) ?? null };
    this.writes++;
    if (query.includes('metafieldsSet(')) { this.state = JSON.parse(vars.metafields[0].value); return { metafieldsSet: { userErrors: [] } }; }
    if (query.includes('productSet(')) {
      const old = this.products.find(p => p.handle === vars.input.handle);
      if (old) { assert.equal(vars.identifier.id, old.id); assert(vars.input.variants.every(v => old.variants.nodes.some(x => x.id === v.id && x.sku === v.sku))); }
      const product = { ...vars.input, id: old?.id ?? 'product-'+vars.input.handle, marker: { value: SEED_ID }, variants: { nodes: vars.input.variants.map(v => ({ id: v.id ?? 'variant-'+v.sku, sku: v.sku })) }, options: vars.input.productOptions.map(o => ({ id: o.id ?? 'option-'+o.name, name: o.name, optionValues: o.values.map(v => ({ id: v.id ?? 'value-'+v.name, name: v.name })) })) };
      this.products = this.products.filter(p => p.handle !== product.handle); this.products.push(product); return { productSet: { product } };
    }
    if (query.includes('collectionCreate(') || query.includes('collectionUpdate(')) {
      const c = { ...vars.input, id: vars.input.id ?? 'collection-'+vars.input.handle, marker: { value: SEED_ID } };
      this.collections = this.collections.filter(x => x.handle !== c.handle); this.collections.push(c);
      return { [query.includes('collectionCreate(') ? 'collectionCreate' : 'collectionUpdate']: { collection: c } };
    }
    if (query.includes('pageCreate(') || query.includes('pageUpdate(')) {
      const p = { ...vars.page, id: vars.id ?? 'page-'+vars.page.handle, marker: { value: SEED_ID } };
      this.pages = this.pages.filter(x => x.handle !== p.handle); this.pages.push(p);
      return { [query.includes('pageCreate(') ? 'pageCreate' : 'pageUpdate']: { page: p } };
    }
    if (query.includes('menuCreate(') || query.includes('menuUpdate(')) {
      const old = this.menus.find(m => m.id === vars.id);
      const m = { id: vars.id ?? 'menu-'+vars.handle, handle: old?.handle ?? vars.handle, title: vars.title, items: vars.items };
      this.menus = this.menus.filter(x => x.id !== m.id); this.menus.push(m);
      return { [query.includes('menuCreate(') ? 'menuCreate' : 'menuUpdate']: { menu: m } };
    }
    if (query.includes('menuDelete(')) { this.menus = this.menus.filter(m => m.id !== vars.id); return {}; }
    if (query.includes('productDelete(')) { this.products = this.products.filter(p => p.id !== vars.input.id); return {}; }
    if (query.includes('pageDelete(')) { this.pages = this.pages.filter(p => p.id !== vars.id); return {}; }
    if (query.includes('collectionDelete(')) { this.collections = this.collections.filter(c => c.id !== vars.input.id); return {}; }
    if (query.includes('fileDelete(')) { for (const [name, file] of this.files) if (vars.fileIds.includes(file.id)) this.files.delete(name); return {}; }
    throw new Error('Unexpected test operation: '+query);
  }
}

test('development-store and collision checks finish before any mutation', async () => {
  const seed = await loadSeed(); const admin = new DevelopmentStore();
  admin.dev = false; await assert.rejects(runSeed(admin, seed), /development store/); assert.equal(admin.writes, 0);
  admin.dev = true; admin.currency = 'EUR'; await assert.rejects(runSeed(admin, seed), /Demo prices are in USD/); assert.equal(admin.writes, 0);
  admin.currency = 'USD'; await assert.rejects(runSeed(admin, seed), /already exists/); assert.equal(admin.writes, 0);
  admin.products.push({ id: 'unowned', handle: seed.catalog.products[0].handle, tags: ['demo'] });
  await assert.rejects(runSeed(admin, seed, { replaceMenus: true }), /unowned product/); assert.equal(admin.writes, 0);
});

test('repeat seed preserves product/variant IDs; cleanup restores menus and keeps unrelated resources', async () => {
  const seed = await loadSeed(); const admin = new DevelopmentStore();
  const original = structuredClone(admin.menus[0]);
  await runSeed(admin, seed, { replaceMenus: true, writeImageMap: false });
  const ids = admin.products.map(p => p.id).sort();
  await runSeed(admin, seed, { writeImageMap: false });
  assert.deepEqual(admin.products.map(p => p.id).sort(), ids);
  assert.equal(admin.products.length, 22); assert.equal(admin.collections.length, 8); assert.equal(admin.pages.length, 4); assert.equal(admin.menus.length, 2); assert.equal(admin.files.size, 56);
  admin.products.push({ id: 'real-product', handle: 'real-product', tags: [] }, { id: 'other-demo', handle: 'other-demo', tags: ['demo'] });
  admin.pages.push({ id: 'real-page', handle: 'real-page' }); admin.collections.push({ id: 'real-collection', handle: 'real-collection' });
  admin.files.delete(seed.images[0].file); // Recover a stale manifest after a prior deletion.
  await runSeed(admin, seed, { deleteDemo: true });
  assert.deepEqual(admin.products.map(p => p.id), ['real-product']);
  assert.deepEqual(admin.pages.map(p => p.id), ['real-page']); assert.deepEqual(admin.collections.map(c => c.id), ['real-collection']);
  assert.deepEqual(admin.menus, [original]); assert.equal(admin.files.size, 0);
  await runSeed(admin, seed, { deleteDemo: true });
  assert.deepEqual(admin.products.map(p => p.id), ['real-product']); assert.deepEqual(admin.menus, [original]);
});

test('reviewed page reuse preserves content and IDs through import, rerun and cleanup', async () => {
  const seed = await loadSeed(); const admin = new DevelopmentStore();
  const contact = { id: 'existing-contact', handle: 'contact', title: 'Contact', body: '', templateSuffix: 'contact' };
  admin.pages.push(structuredClone(contact));
  await assert.rejects(runSeed(admin, seed, { replaceMenus: true, reusePages: { contact: 'wrong-id' } }), /reviewed existing page ID/);
  assert.equal(admin.writes, 0);
  await runSeed(admin, seed, { replaceMenus: true, writeImageMap: false, reusePages: { contact: contact.id } });
  assert.deepEqual(admin.pages.find(p => p.handle === 'contact'), contact);
  assert.equal(admin.state.pages.contact, contact.id);
  assert.equal(admin.state.reusedPages.contact, contact.id);
  await runSeed(admin, seed, { writeImageMap: false });
  assert.deepEqual(admin.pages.find(p => p.handle === 'contact'), contact);
  await runSeed(admin, seed, { deleteDemo: true });
  assert.deepEqual(admin.pages, [contact]);
});
