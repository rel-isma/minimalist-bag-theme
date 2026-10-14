#!/usr/bin/env node
import { writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ShopifyAdmin } from './admin.mjs';
import { API_VERSION, SEED_ID, MARKER, readJson, productInput, assertDemoProduct, assertOwned, digest, seedDirectory } from './lib.mjs';

const markerFields = 'marker: metafield(namespace: "atelier_vane_demo", key: "seed_id") { value }';
const menuFields = 'id handle title items { id title type url resourceId tags items { id title type url resourceId tags items { id title type url resourceId tags } } }';
const menuInput = items => items.map(item => ({ title: item.title, type: item.type, ...(item.resourceId ? { resourceId: item.resourceId } : {}), ...(!item.resourceId && item.url ? { url: item.url } : {}), ...(item.tags?.length ? { tags: item.tags } : {}), ...(item.items?.length ? { items: menuInput(item.items) } : {}) }));
const menuHash = menu => digest({ title: menu.title, items: menuInput(menu.items) });

export async function loadSeed() {
  const [catalog, collections, menus, pages, images] = await Promise.all(['catalog.json', 'collections.json', 'menus.json', 'pages.json', 'images.json'].map(readJson));
  return { catalog, collections, menus, pages, images };
}

export async function runSeed(admin, seed, { deleteDemo = false, replaceMenus = false, writeImageMap = true } = {}) {
  const { shop } = await admin.graphql('query SeedStore { shop { id name currencyCode plan { partnerDevelopment } state: metafield(namespace: "atelier_vane_demo", key: "manifest") { value } } }');
  if (!shop.plan.partnerDevelopment) throw new Error('This seeder only writes to a Shopify partner development store.');
  if (!deleteDemo && shop.currencyCode !== 'USD') throw new Error('Demo prices are in USD. Configure USD as the development store currency before seeding, or revise the catalog intentionally.');
  const state = shop.state ? JSON.parse(shop.state.value) : { version: 1, seedId: SEED_ID, files: {}, menus: {}, pages: {}, collections: {} };
  if (state.seedId !== SEED_ID) throw new Error('Unexpected seed manifest; refusing to overwrite it.');
  const save = async () => admin.graphql('mutation SaveManifest($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { id } userErrors { field message } } }', { metafields: [{ ownerId: shop.id, namespace: 'atelier_vane_demo', key: 'manifest', type: 'json', value: JSON.stringify(state) }] });
  console.log(`Development store: ${shop.name}; currency: ${shop.currencyCode}; API ${API_VERSION}.`);

  if (deleteDemo) return cleanup(admin, state, save);

  const [existingProducts, existingCollections, existingPages] = await Promise.all([
    admin.all('products', `id handle tags ${markerFields} variants(first: 20) { nodes { id sku } } options { id name optionValues { id name } }`),
    admin.all('collections', `id handle ${markerFields}`), admin.all('pages', `id handle ${markerFields}`)
  ]);
  const allMenus = await admin.all('menus', menuFields);
  const existingMenus = Object.fromEntries(seed.menus.map(menu => [menu.handle, allMenus.find(m => m.handle === menu.handle) ?? null]));
  // Complete collision checks before any upload, product or menu mutation.
  for (const p of seed.catalog.products) assertDemoProduct(existingProducts.find(x => x.handle === p.handle), p.handle);
  for (const c of seed.collections) assertOwned(existingCollections.find(x => x.handle === c.handle), 'collection', c.handle);
  for (const p of seed.pages) assertOwned(existingPages.find(x => x.handle === p.handle), 'page', p.handle);
  for (const [handle, menu] of Object.entries(existingMenus)) {
    const recorded = state.menus[handle];
    if (menu && !recorded && !replaceMenus) throw new Error(`Menu ${handle} already exists. Inspect it, then use --replace-menus only if you intend to replace this development menu.`);
    if (menu && recorded?.hash && menuHash(menu) !== recorded.hash) throw new Error(`Menu ${handle} was edited after seeding. Reconcile it before running again.`);
  }
  for (const image of seed.images) await admin.uploadImage(image, state, save);
  const fileIds = Object.fromEntries(Object.entries(state.files).map(([name, file]) => [name, file.id]));

  for (const product of seed.catalog.products) {
    const existing = existingProducts.find(p => p.handle === product.handle);
    const input = productInput(product, fileIds);
    if (existing) {
      const ids = new Map(existing.variants.nodes.map(v => [v.sku, v.id]));
      for (const v of input.variants) if (ids.has(v.sku)) v.id = ids.get(v.sku);
      for (const option of input.productOptions) {
        const old = existing.options.find(o => o.name === option.name);
        if (old) { option.id = old.id; for (const value of option.values) { const matched = old.optionValues.find(v => v.name === value.name); if (matched) value.id = matched.id; } }
      }
    }
    await admin.graphql('mutation Product($input: ProductSetInput!, $identifier: ProductSetIdentifiers!) { productSet(input: $input, identifier: $identifier, synchronous: true) { product { id handle } userErrors { field message } } }', { input, identifier: existing ? { id: existing.id } : { handle: product.handle } });
    console.log(`Draft product: ${product.handle}`);
  }

  for (const collection of seed.collections) {
    const existing = existingCollections.find(c => c.handle === collection.handle);
    const input = { title: collection.title, handle: collection.handle, descriptionHtml: `<p>${collection.description}</p>`, ruleSet: collection.ruleSet, sortOrder: 'MANUAL', metafields: [MARKER], ...(collection.image ? { image: { src: state.files[collection.image].url, altText: collection.alt } } : {}) };
    const operation = existing ? 'collectionUpdate' : 'collectionCreate';
    const result = await admin.graphql(`mutation Collection($input: CollectionInput!) { ${operation}(input: $input) { collection { id handle } userErrors { field message } } }`, { input: { ...input, ...(existing ? { id: existing.id } : {}) } });
    state.collections[collection.handle] = result[operation].collection.id; await save();
  }
  for (const page of seed.pages) {
    const existing = existingPages.find(p => p.handle === page.handle);
    const input = { title: page.title, handle: page.handle, body: page.body, templateSuffix: page.templateSuffix, isPublished: false, metafields: [MARKER] };
    const result = existing
      ? await admin.graphql('mutation Page($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { page { id handle } userErrors { field message } } }', { id: existing.id, page: input })
      : await admin.graphql('mutation Page($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle } userErrors { field message } } }', { page: input });
    state.pages[page.handle] = (result.pageUpdate ?? result.pageCreate).page.id; await save();
  }

  const resolveItems = items => items.map(item => ({ title: item.title, type: item.type,
    ...(item.type === 'HTTP' ? { url: new URL(item.url, `https://${admin.store}`).href } : { resourceId: (item.type === 'COLLECTION' ? state.collections : state.pages)[item.handle] }),
    ...(item.items ? { items: resolveItems(item.items) } : {}) }));
  for (const menu of seed.menus) {
    const existing = existingMenus[menu.handle];
    if (!state.menus[menu.handle]) { state.menus[menu.handle] = { original: existing ? { id: existing.id, title: existing.title, items: menuInput(existing.items) } : null }; await save(); }
    const result = existing
      ? await admin.graphql(`mutation Menu($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $title, items: $items) { menu { ${menuFields} } userErrors { field message } } }`, { id: existing.id, title: menu.title, items: resolveItems(menu.items) })
      : await admin.graphql(`mutation Menu($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) { menuCreate(title: $title, handle: $handle, items: $items) { menu { ${menuFields} } userErrors { field message } } }`, { title: menu.title, handle: menu.handle, items: resolveItems(menu.items) });
    const created = (result.menuUpdate ?? result.menuCreate).menu;
    state.menus[menu.handle].id = created.id; state.menus[menu.handle].hash = menuHash(created); await save();
  }
  if (writeImageMap) await writeFile(new URL('image-urls.json', seedDirectory), JSON.stringify(Object.fromEntries(Object.entries(state.files).map(([name, file]) => [name, file.url])), null, 2) + '\n');
  console.log('Seed complete. Products remain draft; pages remain unpublished. Collection publication and password-protected preview are manual steps.');
}

async function cleanup(admin, state, save) {
  // Restore navigation before removing resources it links to. Merchant edits are protected.
  const menus = await admin.all('menus', menuFields);
  for (const [handle, record] of Object.entries(state.menus)) {
    const menu = menus.find(m => m.handle === handle);
    if (menu) {
      if (!record.hash || menuHash(menu) !== record.hash) throw new Error(`Menu ${handle} changed or its last write was interrupted. Reconcile it before cleanup.`);
      if (record.original) await admin.graphql('mutation RestoreMenu($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $title, items: $items) { menu { id } userErrors { field message } } }', record.original);
      else await admin.graphql('mutation DeleteMenu($id: ID!) { menuDelete(id: $id) { deletedMenuId userErrors { field message } } }', { id: menu.id });
    }
    delete state.menus[handle]; await save();
  }
  const products = await admin.all('products', 'id handle tags', 'tag:demo');
  for (const product of products.filter(p => p.tags.includes('demo'))) {
    await admin.graphql('mutation DeleteProduct($input: ProductDeleteInput!) { productDelete(input: $input) { deletedProductId userErrors { field message } } }', { input: { id: product.id } });
    console.log(`Deleted demo product: ${product.handle}`);
  }
  // Recover owned pages/collections even if interrupted before recording their IDs.
  for (const [connection, field, mutation, inputType] of [['pages','page','pageDelete',null],['collections','collection','collectionDelete','CollectionDeleteInput!']]) {
    const resources = await admin.all(connection, `id handle ${markerFields}`);
    for (const resource of resources.filter(r => r.marker?.value === SEED_ID)) {
      if (inputType) await admin.graphql(`mutation Delete($input: ${inputType}) { ${mutation}(input: $input) { deletedCollectionId userErrors { field message } } }`, { input: { id: resource.id } });
      else await admin.graphql('mutation DeletePage($id: ID!) { pageDelete(id: $id) { deletedPageId userErrors { field message } } }', { id: resource.id });
      delete state[connection][resource.handle]; await save();
    }
  }
  for (const [filename, file] of Object.entries(state.files)) {
    const { node } = await admin.graphql('query SeedFile($id: ID!) { node(id: $id) { id } }', { id: file.id });
    if (node) await admin.graphql('mutation DeleteFiles($fileIds: [ID!]!) { fileDelete(fileIds: $fileIds) { deletedFileIds userErrors { field message } } }', { fileIds: [file.id] });
    delete state.files[filename]; await save();
  }
  console.log('Removed products tagged demo and this seed’s owned collections, pages and files; original menus restored where applicable.');
}

async function main() {
  const args = new Set(process.argv.slice(2));
  for (const arg of args) if (!['--apply', '--dry-run', '--delete-demo', '--replace-menus', '--help'].includes(arg)) throw new Error(`Unknown flag ${arg}.`);
  if (args.has('--apply') && args.has('--dry-run')) throw new Error('Choose --apply or --dry-run.');
  if (args.has('--help')) { console.log('node seed/seed.mjs [--dry-run | --apply] [--replace-menus] [--delete-demo]\nDefault: local dry run, no credentials or network. See seed/README.md.'); return; }
  const seed = await loadSeed();
  if (!args.has('--apply')) {
    console.log(JSON.stringify({ mode: 'local dry run; no writes or requests', apiVersion: API_VERSION, action: args.has('--delete-demo') ? 'remove every remote product tagged demo plus owned seed resources when --apply is added' : 'seed unpublished demo catalog', products: seed.catalog.products.map(p => ({ handle: p.handle, variants: p.variants.length, status: 'DRAFT' })), collections: seed.collections.map(c => ({ handle: c.handle, rules: c.ruleSet.rules })), menus: seed.menus.map(m => m.handle), pages: seed.pages.map(p => p.handle), images: seed.images.length }, null, 2)); return;
  }
  // Verify all local inputs/assets before contacting Shopify.
  for (const image of args.has('--delete-demo') ? [] : seed.images) {
    if (!/^atelier-vane-demo-[a-z0-9-]+\.jpg$/.test(image.file)) throw new Error(`Invalid demo filename ${image.file}.`);
    const bytes = await readFile(new URL(`images/${image.file}`, seedDirectory));
    if (bytes.length >= 300000) throw new Error(`Image ${image.file} exceeds 300KB.`);
  }
  const admin = new ShopifyAdmin(process.env.SHOPIFY_STORE, process.env.SHOPIFY_ADMIN_TOKEN);
  await runSeed(admin, seed, { deleteDemo: args.has('--delete-demo'), replaceMenus: args.has('--replace-menus') });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
