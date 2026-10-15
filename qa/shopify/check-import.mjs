import { readFile, readdir, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { ShopifyCliAdmin } from '../../seed/cli-admin.mjs';
import { loadSeed } from '../../seed/seed.mjs';
import { SEED_ID } from '../../seed/lib.mjs';

const store = 'atelier-vane-test.myshopify.com';
const admin = new ShopifyCliAdmin(store, { cli: process.env.SHOPIFY_CLI_PATH || 'shopify' });
const { shop, onlineStore } = await admin.graphql('query ImportStatus { shop { id currencyCode plan { partnerDevelopment } state: metafield(namespace: "atelier_vane_demo", key: "manifest") { value } } onlineStore { passwordProtection { enabled } } }');
const state = shop.state ? JSON.parse(shop.state.value) : null;
const progress = { at: new Date().toISOString(), store, passwordProtected: onlineStore.passwordProtection.enabled,
  savedFiles: Object.keys(state?.files ?? {}).length, savedCollections: Object.keys(state?.collections ?? {}).length,
  savedPageReferences: Object.keys(state?.pages ?? {}).length, completedMenuWrites: Object.values(state?.menus ?? {}).filter(menu => menu.hash).length };
if (process.argv.includes('--progress')) {
  console.log(JSON.stringify(progress));
} else {
  const seed = await loadSeed();
  const marker = 'marker: metafield(namespace: "atelier_vane_demo", key: "seed_id") { value }';
  const products = await admin.all('products', `id handle status tags ${marker} images(first: 10) { nodes { id url } } variants(first: 20) { nodes { id sku price compareAtPrice selectedOptions { name value } inventoryItem { tracked } } }`);
  const collections = await admin.all('collections', `id handle image { url altText } ruleSet { appliedDisjunctively rules { column relation condition } } ${marker}`);
  const pages = await admin.all('pages', `id handle title body templateSuffix isPublished ${marker}`);
  const menus = await admin.all('menus', 'id handle title items { id title type url resourceId tags items { id title type url resourceId tags items { id title type url resourceId tags } } }');
  const backupDirectory = new URL('../../seed/store-backups/', import.meta.url);
  const backupFile = (await readdir(backupDirectory)).filter(name => name.startsWith(store + '-') && name.endsWith('.json')).sort()[0];
  const backup = JSON.parse(await readFile(new URL(backupFile, backupDirectory), 'utf8'));
  const failures = [];
  const check = (ok, message) => { if (!ok) failures.push(message); };
  check(shop.plan.partnerDevelopment && shop.currencyCode === 'USD' && progress.passwordProtected, 'Development/USD/privacy guard');
  const ownedProducts = products.filter(product => product.marker?.value === SEED_ID);
  check(ownedProducts.length === 22, 'Expected 22 owned products');
  check(ownedProducts.reduce((count, product) => count + product.variants.nodes.length, 0) === 52, 'Expected 52 variants');
  for (const expected of seed.catalog.products) {
    const actual = ownedProducts.find(product => product.handle === expected.handle);
    check(!!actual, 'Missing product: ' + expected.handle);
    if (!actual) continue;
    check(actual.status === 'DRAFT', 'Not draft: ' + expected.handle);
    check(actual.tags.includes('demo'), 'Missing demo tag: ' + expected.handle);
    check(actual.images.nodes.length === expected.images.length, 'Image count mismatch: ' + expected.handle);
    check(isDeepStrictEqual(actual.variants.nodes.map(v => v.sku).sort(), expected.variants.map(v => v.sku).sort()), 'Variant SKU mismatch: ' + expected.handle);
    for (const variant of actual.variants.nodes) {
      const planned = expected.variants.find(v => v.sku === variant.sku);
      check(!variant.inventoryItem.tracked, 'Unexpected tracked inventory: ' + variant.sku);
      if (planned) check(Number(variant.price) === Number(planned.price), 'Price mismatch: ' + variant.sku);
      if (planned) check((variant.compareAtPrice === null ? null : Number(variant.compareAtPrice)) === (planned.compareAtPrice === null || planned.compareAtPrice === undefined ? null : Number(planned.compareAtPrice)), 'Compare-at mismatch: ' + variant.sku);
    }
  }
  check(collections.filter(c => c.marker?.value === SEED_ID).length === 8, 'Expected eight owned collections');
  for (const expected of seed.collections) {
    const actual = collections.find(c => c.handle === expected.handle && c.marker?.value === SEED_ID);
    check(!!actual?.image?.url, 'Collection banner missing: ' + expected.handle);
    if (actual) check(isDeepStrictEqual(actual.ruleSet, expected.ruleSet), 'Collection rules differ: ' + expected.handle);
  }
  const ownedPages = pages.filter(page => page.marker?.value === SEED_ID);
  check(ownedPages.length === 3 && ownedPages.every(page => !page.isPublished), 'Expected three new hidden pages');
  for (const handle of ['contact', 'data-sharing-opt-out']) {
    const prior = backup.pages.find(page => page.handle === handle);
    const actual = pages.find(page => page.handle === handle);
    const { marker: ignored, ...content } = actual ?? {};
    check(isDeepStrictEqual(content, prior), 'Existing page changed: ' + handle);
    check(!actual?.marker, 'Existing page incorrectly claimed by importer: ' + handle);
  }
  check(isDeepStrictEqual(menus.find(m => m.handle === 'customer-account-main-menu'), backup.menus.find(m => m.handle === 'customer-account-main-menu')), 'Account menu changed');
  for (const handle of ['main-menu', 'footer']) {
    const actual = menus.find(menu => menu.handle === handle);
    const prior = backup.menus.find(menu => menu.handle === handle);
    check(actual?.id === prior?.id, 'Menu ID changed: ' + handle);
    check(state?.menus[handle]?.original?.id === prior?.id && !!state?.menus[handle]?.hash, 'Missing menu restoration record: ' + handle);
  }
  check(menus.find(menu => menu.handle === 'footer')?.items.some(item => item.url.endsWith('/pages/data-sharing-opt-out')), 'Privacy Choices link missing from footer');
  check(state?.reusedPages?.contact === 'gid://shopify/Page/164134158627', 'Contact reuse reference missing');
  check(progress.savedFiles === 56, 'Expected 56 uploaded image records');
  const result = { ...progress, scope: 'Native Admin API import verification; not storefront/editor E2E.',
    products: ownedProducts, ownedCollections: collections.filter(c => c.marker?.value === SEED_ID),
    newHiddenPageHandles: ownedPages.map(page => page.handle), preservedPages: ['contact', 'data-sharing-opt-out'],
    preservedAccountMenu: !failures.includes('Account menu changed'), updatedMenus: ['main-menu', 'footer'], failures, ok: failures.length === 0 };
  await writeFile(new URL('import-results.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ ...progress, products: ownedProducts.length, variants: ownedProducts.reduce((n, p) => n + p.variants.nodes.length, 0), failures, ok: result.ok }));
  if (!result.ok) process.exitCode = 1;
}
