// Targeted, owner-approved import. Never publishes the theme or catalog.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { ShopifyCliAdmin } from '../../seed/cli-admin.mjs';
import { loadSeed, runSeed } from '../../seed/seed.mjs';
import { digest, SEED_ID } from '../../seed/lib.mjs';

const store = 'atelier-vane-test.myshopify.com';
const contactId = 'gid://shopify/Page/164134158627';
const cli = process.env.SHOPIFY_CLI_PATH || 'shopify';
const flags = new Set(process.argv.slice(2));
if (!flags.has('--apply') || [...flags].some(flag => !['--apply', '--resume-content'].includes(flag))) throw new Error('Use --apply [--resume-content] only for the reviewed development-store import.');
const admin = new ShopifyCliAdmin(store, { cli, allowMutations: true });
const { shop, onlineStore } = await admin.graphql('query VerifyTarget { shop { id currencyCode plan { partnerDevelopment } state: metafield(namespace: "atelier_vane_demo", key: "manifest") { value } } onlineStore { passwordProtection { enabled } } }');
if (shop.id !== 'gid://shopify/Shop/100505420067' || !shop.plan.partnerDevelopment || shop.currencyCode !== 'USD') throw new Error('Target store/development/USD guard failed.');
if (!onlineStore.passwordProtection.enabled) throw new Error('Storefront password protection is disabled; no import performed.');
const before = {
  pages: await admin.all('pages', 'id handle title body templateSuffix isPublished'),
  menus: await admin.all('menus', 'id handle title items { id title type url resourceId tags items { id title type url resourceId tags items { id title type url resourceId tags } } }')
};
if (before.pages.find(page => page.handle === 'contact')?.id !== contactId) throw new Error('The reviewed Contact page ID changed; no import performed.');
if (!before.pages.some(page => page.handle === 'data-sharing-opt-out')) throw new Error('Expected Privacy Choices page missing; no import performed.');
const backupDirectory = new URL('../../seed/store-backups/', import.meta.url);
await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
const backupName = `${store}-${Date.now()}.json`;
await writeFile(new URL(backupName, backupDirectory), JSON.stringify({ store, capturedAt: new Date().toISOString(), ...before }, null, 2) + '\n', { mode: 0o600 });
console.log('Saved local page/menu backup before import. Contact, Privacy Choices and account menu will be preserved.');
const seed = await loadSeed();
if (flags.has('--resume-content')) {
  const state = shop.state ? JSON.parse(shop.state.value) : null;
  if (state?.seedId !== SEED_ID) throw new Error('Missing matching seed state; cannot skip completed work.');
  for (const image of seed.images) {
    const file = state.files[image.file];
    const bytes = await readFile(new URL('../../seed/images/' + image.file, import.meta.url));
    if (!file?.id || !file.url || file.hash !== digest(bytes.toString('base64'))) throw new Error('Completed image does not match current source: ' + image.file);
  }
  const products = await admin.all('products', 'id handle status marker: metafield(namespace: "atelier_vane_demo", key: "seed_id") { value } variants(first: 20) { nodes { sku } }');
  for (const expected of seed.catalog.products) {
    const actual = products.find(product => product.handle === expected.handle);
    if (!actual || actual.marker?.value !== SEED_ID || actual.status !== 'DRAFT' || JSON.stringify(actual.variants.nodes.map(v => v.sku).sort()) !== JSON.stringify(expected.variants.map(v => v.sku).sort())) throw new Error('Completed product differs from plan: ' + expected.handle);
  }
  seed.images = [];
  seed.catalog.products = [];
  console.log('Verified completed image hashes and draft product variants; resuming collections/pages/menus only.');
}
const footer = seed.menus.find(menu => menu.handle === 'footer');
footer.items.push({ title: 'Your Privacy Choices', type: 'HTTP', url: '/pages/data-sharing-opt-out' });
await runSeed(admin, seed, { replaceMenus: true, reusePages: { contact: contactId } });
console.log('Approved import finished; verify counts, preservation and draft/publication state next.');
