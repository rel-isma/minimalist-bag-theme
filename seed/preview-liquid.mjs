/** Local Shopify approximation for npm start. Never uploaded as theme assets. */
import { Liquid } from 'liquidjs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
export const root = path.resolve(import.meta.dirname, '..');
export const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const jsonFile = async name => JSON.parse(await readFile(path.join(root, name), 'utf8'));
const catalog = await jsonFile('seed/catalog.json');
const sourceCollections = await jsonFile('seed/collections.json');
const sourcePages = await jsonFile('seed/pages.json');
const sourceMenus = await jsonFile('seed/menus.json');
export const routes = { root_url: '/', all_products_collection_url: '/collections/all', collections_url: '/collections', search_url: '/search', predictive_search_url: '/search/suggest', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', cart_update_url: '/cart/update', product_recommendations_url: '/recommendations/products', account_url: '/account' };
export const settings = (await jsonFile('config/settings_data.json')).current;
for (const group of await jsonFile('config/settings_schema.json')) for (const value of group.settings || []) if (!(value.id in settings) && 'default' in value) settings[value.id] = value.default;
export const products = catalog.products.map((source, index) => {
  const images = source.images.map((image, ii) => ({ id: (index + 1) * 10 + ii, src: `/seed/images/${image.file}`, alt: image.alt, width: 1120, height: 1400, media_type: 'image' }));
  images.forEach(image => { image.preview_image = { ...image }; });
  const variants = source.variants.map((variant, vi) => ({ id: (index + 1) * 100 + vi, options: [variant.color, variant.size].filter(Boolean), title: [variant.color, variant.size].filter(Boolean).join(' / '), price: Math.round(Number(variant.price) * 100), compare_at_price: Math.round(Number(variant.compareAtPrice) * 100), available: true, sku: variant.sku, inventory_management: null, featured_image: variant.color === source.options[0].values[0] ? images[0] : null, url: `/products/${source.handle}?variant=${(index + 1) * 100 + vi}` }));
  const product = { id: index + 1, handle: source.handle, title: source.title, description: `<p>${esc(source.description)}</p>`, content: source.description, object_type: 'product', type: source.productType, vendor: source.vendor, url: `/products/${source.handle}`, options: source.options.map(option => option.name), options_with_values: source.options.map((option, oi) => ({ ...option, position: oi + 1 })), tags: source.tags, images, media: images, featured_image: images[0], featured_media: images[0], variants, selected_or_first_available_variant: variants[0], available: true, has_only_default_variant: false, price: Math.min(...variants.map(v => v.price)), price_min: Math.min(...variants.map(v => v.price)), price_varies: new Set(variants.map(v => v.price)).size > 1, metafields: { custom: Object.fromEntries(Object.entries(source.metafields).map(([key, value]) => [key, { value }])) } };
  return product;
});
export const productMap = Object.fromEntries(products.map(product => [product.handle, product]));
export const collections = sourceCollections.map(source => {
  const list = products.filter(product => product.tags.includes(source.ruleSet.rules[0].condition));
  return { id: source.handle, handle: source.handle, title: source.title, description: `<p>${esc(source.description)}</p>`, url: `/collections/${source.handle}`, image: { src: `/seed/images/${source.image}`, alt: source.alt, width: 1600, height: 1067 }, products: list, products_count: list.length, all_products_count: list.length, default_sort_by: 'manual', sort_options: [{ value: 'manual', name: 'Featured' }, { value: 'price-ascending', name: 'Price, low to high' }, { value: 'price-descending', name: 'Price, high to low' }, { value: 'title-ascending', name: 'Alphabetically, A–Z' }, { value: 'title-descending', name: 'Alphabetically, Z–A' }] };
});
export const collectionMap = Object.fromEntries(collections.map(collection => [collection.handle, collection]));
collectionMap.all = { ...collections[0], handle: 'all', title: 'The collection', url: '/collections/all', products, products_count: products.length, all_products_count: products.length, image: null };
export const pages = Object.fromEntries(sourcePages.map(page => [page.handle, { handle: page.handle, title: page.title, content: page.body, object_type: 'page', url: `/pages/${page.handle}`, templateSuffix: page.templateSuffix }]));
for (const [handle, title] of [['privacy-policy', 'Privacy policy'], ['terms-of-service', 'Terms of service'], ['refund-policy', 'Refund policy']]) pages[handle] = { title, content: '<p>Demo policy placeholder. The merchant must supply and verify this policy before launch.</p>', url: `/policies/${handle}`, object_type: 'page', body: '<p>Demo policy placeholder. Verify before launch.</p>' };
const link = item => ({ object: item.type === 'COLLECTION' ? collectionMap[item.handle] : null, title: item.title, url: item.url || `/${item.type === 'COLLECTION' ? 'collections' : 'pages'}/${item.handle}`, links: (item.items || []).map(link), current: false, active: false });
export const menus = Object.fromEntries(sourceMenus.map(menu => [menu.handle, { handle: menu.handle, links: menu.items.map(link) }]));
export const engine = new Liquid({ root: path.join(root, 'snippets'), extname: '.liquid' });
function preprocess(source) {
  return source.replace(/\{% schema %\}[\s\S]*?\{% endschema %\}/g, '').replace(/\{% layout none %\}/g, '').replace(/\{%-? form\s+'([^']+)'([\s\S]*?)-?%\}/g, (_, type, args) => {
    const action = type === 'product' ? routes.cart_add_url : type === 'storefront_password' ? '/password' : type === 'localization' ? '/localization' : '/contact';
    const attrs = [...args.matchAll(/([a-zA-Z0-9_-]+):\s*('[^']*'|"[^"]*"|[\w.]+)/g)].map(([, key, value]) => `${key}="${/^['"]/.test(value) ? esc(value.slice(1, -1)) : `{{ ${value} }}`}"`).join(' ');
    return `<form action="${action}" method="post" ${attrs}>`;
  }).replace(/\{%-? endform -?%\}/g, '</form>').replace(/\{%-? paginate [\s\S]*?-?%\}/g, '{% assign paginate = fixture_paginate %}').replace(/\{%-? endpaginate -?%\}/g, '');
}
engine.options.fs = { ...engine.options.fs, readFile: async file => preprocess(await readFile(file, 'utf8')) };
engine.registerFilter('escape', esc);
engine.registerFilter('asset_url', file => `/assets/${file}`);
engine.registerFilter('stylesheet_tag', url => `<link rel="stylesheet" href="${esc(url)}">`);
engine.registerFilter('font_face', () => '');
engine.registerFilter('payment_button', () => '');engine.registerFilter('payment_terms', () => '');
engine.registerFilter('default_errors', () => 'This form needs a connected Shopify store.');
engine.registerFilter('money', amount => `$${(Number(amount || 0) / 100).toFixed(2)}`);
engine.registerFilter('metafield_tag', field => `<p>${esc(field?.value || '')}</p>`);
engine.registerFilter('structured_data', product => JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: product.title, description: product.content, offers: product.variants.map(v => ({ '@type': 'Offer', price: v.price / 100, priceCurrency: 'USD', availability: v.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' })) }).replaceAll('<', '\\u003c'));
engine.registerFilter('placeholder_svg_tag', (_, cls = '') => `<svg class="${esc(cls)}" viewBox="0 0 100 125" role="img" aria-label="Image being prepared"><rect width="100" height="125" fill="currentColor" opacity=".06"/></svg>`);
engine.registerFilter('image_url', (image, ...args) => { const options = Object.fromEntries(args.filter(Array.isArray));return `${typeof image === 'string' ? image : image?.src || ''}${options.width ? `?width=${options.width}` : ''}`; });
engine.registerFilter('image_tag', (src, ...args) => {
  const options = Object.fromEntries(args.filter(Array.isArray));const widths = String(options.widths || '').split(',').map(Number).filter(Boolean);
  const width = Number(new URL(src, 'http://localhost').searchParams.get('width') || 1600);const portrait = src.includes('-front.') || src.includes('-detail.');
  const attrs = Object.entries(options).filter(([key]) => !['widths', 'alt'].includes(key)).map(([key, value]) => `${key}="${esc(value)}"`).join(' ');
  const image = products.flatMap(p => p.images).find(image => src.startsWith(image.src)) || collections.map(c => c.image).find(image => src.startsWith(image.src));
  return `<img src="${esc(src)}" width="${width}" height="${Math.round(width * (portrait ? 1.25 : 2 / 3))}" alt="${esc(options.alt ?? image?.alt ?? '')}" ${widths.length ? `srcset="${widths.map(w => `${esc(src.split('?')[0])}?width=${w} ${w}w`).join(', ')}"` : ''} ${attrs}>`;
});
const locale = await jsonFile('locales/en.default.json');
engine.registerFilter('t', (key, ...args) => { let value = key.split('.').reduce((value, part) => value?.[part], locale) || key;for (const [name, replacement] of args.filter(Array.isArray)) value = value.replaceAll(`{{ ${name} }}`, replacement);return value; });
export function cartObject(state) {
  const items = state.items.map((line, index) => {
    const product = products.find(p => p.variants.some(v => v.id === line.id));const variant = product.variants.find(v => v.id === line.id);
    return { index, key: `preview-${variant.id}`, id: variant.id, variant_id: variant.id, quantity: line.quantity, product, variant, title: `${product.title} — ${variant.title}`, product_title: product.title, variant_title: variant.title, url: variant.url, image: variant.featured_image || product.featured_image, featured_image: (variant.featured_image || product.featured_image) ? { url: (variant.featured_image || product.featured_image).src } : null, final_line_price: variant.price * line.quantity, line_level_discount_allocations: [] };
  });
  return { items, item_count: items.reduce((sum, line) => sum + line.quantity, 0), total_price: items.reduce((sum, line) => sum + line.final_line_price, 0), note: state.note, 'empty?': !items.length, currency: { iso_code: 'USD' }, taxes_included: false };
}
export function baseContext(url, state) {
  return { settings, routes, shop: { name: 'Atelier Vane', currency: 'USD', url: url.origin, description: 'Considered bags and everyday essentials.', customer_accounts_enabled: false, enabled_payment_types: [], policies: ['privacy-policy', 'terms-of-service', 'refund-policy'].map(handle => pages[handle]), privacy_policy: pages['privacy-policy'], terms_of_service: pages['terms-of-service'], refund_policy: pages['refund-policy'] }, request: { origin: url.origin, locale: { iso_code: 'en' }, design_mode: false }, cart: cartObject(state), form: {}, current_page: Number(url.searchParams.get('page') || 1), canonical_url: url.origin + url.pathname, collections, pages, linklists: menus, template: { name: 'index' } };
}
const schemaCache = new Map();
export async function schemaFor(type) {
  const file = path.join(root, `sections/${type}.liquid`);const stamp = (await stat(file)).mtimeMs;
  if (!schemaCache.has(type) || schemaCache.get(type).stamp !== stamp) { const source = await readFile(file, 'utf8');const schema = JSON.parse(source.split('{% schema %}')[1].split('{% endschema %}')[0]);schemaCache.set(type, { schema, source, stamp }); }
  return schemaCache.get(type);
}
function settingValues(schema, values) {
  const result = { ...Object.fromEntries((schema || []).filter(v => 'default' in v).map(v => [v.id, v.default])), ...values };
  for (const spec of schema || []) if (typeof result[spec.id] === 'string') {
    if (spec.type === 'collection') result[spec.id] = collectionMap[result[spec.id]] || null;
    if (spec.type === 'product') result[spec.id] = productMap[result[spec.id]] || null;
    if (spec.type === 'link_list') result[spec.id] = menus[result[spec.id]] || null;
  }
  return result;
}
export async function renderSection(type, id, values, context, blocks = {}, blockOrder = Object.keys(blocks)) {
  const { schema, source } = await schemaFor(type);
  const section = { id, settings: settingValues(schema.settings, values), blocks: blockOrder.map(id => { const block = blocks[id];return { id, type: block.type, settings: settingValues(schema.blocks?.find(b => b.type === block.type)?.settings, block.settings), shopify_attributes: '' }; }) };
  const local = { ...context, section };
  // Render has isolated locals in Shopify; these objects are global there. Use per-render globals, without mutating engine.options.
  return engine.parseAndRender(preprocess(source), local, { globals: { ...local } });
}
export async function renderTemplate(name, context, url) {
  const definition = await jsonFile(`templates/${name}.json`);
  let html = '';
  for (const id of definition.order) {
    const spec = definition.sections[id];if (spec.disabled) continue;
    let local = { ...context };
    const { schema } = await schemaFor(spec.type);const options = settingValues(schema.settings, spec.settings);
    const count = options.products_per_page || options.results_per_page || options.collections_per_page;
    const items = context.collection?.products || context.search?.results || (name === 'list-collections' ? collections : null);
    if (count && items) {
      const pagesCount = Math.max(1, Math.ceil(items.length / count));const page = Math.max(1, Math.min(pagesCount, Number(url.searchParams.get('page') || 1)));
      const pageURL = number => { const next = new URL(url);next.searchParams.set('page', number);return next.pathname + next.search; };
      local.fixture_paginate = { pages: pagesCount, current_page: page, previous: page > 1 ? { url: pageURL(page - 1) } : null, next: page < pagesCount ? { url: pageURL(page + 1) } : null, parts: Array.from({ length: pagesCount }, (_, i) => ({ title: i + 1, is_link: i + 1 !== page, url: pageURL(i + 1) })) };
      if (context.collection) local.collection = { ...context.collection, products: items.slice((page - 1) * count, page * count) };
      if (context.search) local.search = { ...context.search, results: items.slice((page - 1) * count, page * count) };
      if (name === 'list-collections') local.collections = collections.slice((page - 1) * count, page * count);
    }
    html += `<div id="shopify-section-${id}">${await renderSection(spec.type, id, spec.settings, local, spec.blocks, spec.block_order)}</div>`;
  }
  return html;
}
export async function renderStore(name, context, url) {
  const definition = await jsonFile(`templates/${name}.json`);
  const layoutName = definition.layout || 'theme';
  const body = await renderTemplate(name, context, url);
  const group = async file => { const data = await jsonFile(`sections/${file}.json`);let output = '';for (const id of data.order) { const spec = data.sections[id];output += `<div id="shopify-section-${id}" ${spec.type === 'header' ? 'class="atelier-header-section"' : ''}>${await renderSection(spec.type, id, spec.settings, context, spec.blocks, spec.block_order)}</div>`; }return output; };
  const header = layoutName === 'theme' ? await group('header-group') : '';
  const footer = layoutName === 'theme' ? await group('footer-group') : '';
  const drawer = layoutName === 'theme' ? await renderSection('cart-drawer', 'cart-drawer', {}, context) : '';
  let layout = await readFile(path.join(root, `layout/${layoutName}.liquid`), 'utf8');
  layout = layout.replace("{% sections 'header-group' %}", '{{ preview_header }}').replace("{% sections 'footer-group' %}", '{{ preview_footer }}').replace("{% section 'cart-drawer' %}", '{{ preview_drawer }}');
  const html = await engine.parseAndRender(layout, { ...context, content_for_layout: body, content_for_header: '', preview_header: header, preview_footer: footer, preview_drawer: drawer }, { globals: context });
  return html.replace('<main id="MainContent"', '<div class="local-preview-notice" role="note">Local demo preview · AI placeholder images · Checkout and contact submissions require Shopify</div><main id="MainContent"');
}
export function filteredCollection(collection, url) {
  let list = [...collection.products];const colors = url.searchParams.getAll('filter.v.option.color');const types = url.searchParams.getAll('filter.p.product_type');const availability = url.searchParams.getAll('filter.v.availability');
  const min = url.searchParams.get('filter.v.price.gte');const max = url.searchParams.get('filter.v.price.lte');
  if (colors.length) list = list.filter(p => p.variants.some(v => colors.includes(v.options[0])));
  if (types.length) list = list.filter(p => types.includes(p.type));
  if (availability.length) list = list.filter(p => availability.includes(p.available ? '1' : '0'));
  if (min) list = list.filter(p => p.price >= Number(min) * 100);if (max) list = list.filter(p => p.price <= Number(max) * 100);
  const sort = url.searchParams.get('sort_by') || 'manual';
  if (sort.startsWith('price-')) list.sort((a, b) => sort.endsWith('ascending') ? a.price - b.price : b.price - a.price);
  if (sort.startsWith('title-')) list.sort((a, b) => sort.endsWith('ascending') ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
  const value = (param, label, raw, count) => { const active = url.searchParams.getAll(param).includes(raw);const remove = new URL(url);const kept = remove.searchParams.getAll(param).filter(v => v !== raw);remove.searchParams.delete(param);remove.searchParams.delete('page');kept.forEach(v => remove.searchParams.append(param, v));return { param_name: param, label, value: raw, count, active, url_to_remove: remove.pathname + remove.search }; };
  const filter = (label, type, param, values) => { const options = values.map(([title, raw, count]) => value(param, title, raw, count));return { label, type, values: options, active_values: options.filter(v => v.active) }; };
  const clearPrice = new URL(url);clearPrice.searchParams.delete('filter.v.price.gte');clearPrice.searchParams.delete('filter.v.price.lte');clearPrice.searchParams.delete('page');
  const filters = [filter('Availability', 'boolean', 'filter.v.availability', [['In stock', '1', collection.products.length], ['Out of stock', '0', 0]]), filter('Color', 'list', 'filter.v.option.color', ['Black', 'Bone', 'Cognac', 'Taupe', 'Olive'].map(color => [color, color, collection.products.filter(p => p.variants.some(v => v.options[0] === color)).length])), { label: 'Price', type: 'price_range', range_max: 12900, min_value: { param_name: 'filter.v.price.gte', value: min ? Number(min) * 100 : null }, max_value: { param_name: 'filter.v.price.lte', value: max ? Number(max) * 100 : null }, url_to_remove: clearPrice.pathname + clearPrice.search }, filter('Product type', 'list', 'filter.p.product_type', [...new Set(collection.products.map(p => p.type))].map(type => [type, type, collection.products.filter(p => p.type === type).length]))];
  return { ...collection, products: list, products_count: list.length, filters, sort_by: sort };
}
