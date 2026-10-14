import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export const API_VERSION = '2026-10';
export const SEED_ID = 'atelier-vane-demo-v1';
export const MARKER = { namespace: 'atelier_vane_demo', key: 'seed_id', type: 'single_line_text_field', value: SEED_ID };
export const seedDirectory = new URL('./', import.meta.url);
export const readJson = async name => JSON.parse(await readFile(new URL(name, seedDirectory), 'utf8'));
export const digest = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

export function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === '') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (quoted) throw new Error('Unclosed CSV quote.');
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export function csvText(rows) {
  return rows.map(row => row.map(value => {
    const s = String(value ?? '');
    return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
  }).join(',')).join('\r\n') + '\r\n';
}

export function publicImageUrl(value) {
  if (!value) return '';
  const url = new URL(value);
  if (url.protocol !== 'https:' || /^(localhost|127\.|0\.|\[?::1)/.test(url.hostname) || url.username || url.password) {
    throw new Error('Image URLs must be public HTTPS URLs without credentials.');
  }
  return url.href;
}

export function productInput(product, fileIds = {}) {
  const primary = product.images[0];
  return {
    handle: product.handle, title: product.title, descriptionHtml: `<p>${product.description}</p>`,
    vendor: product.vendor, productType: product.productType, tags: product.tags,
    status: 'DRAFT', seo: product.seo,
    productOptions: product.options.map((option, index) => ({ name: option.name, position: index + 1, values: option.values.map(name => ({ name })) })),
    variants: product.variants.map(variant => ({
      optionValues: [{ optionName: 'Color', name: variant.color }, ...(variant.size ? [{ optionName: 'Size', name: variant.size }] : [])],
      price: variant.price, compareAtPrice: variant.compareAtPrice, sku: variant.sku,
      inventoryPolicy: 'DENY', taxable: true,
      inventoryItem: { tracked: false, requiresShipping: true, measurement: { weight: { value: variant.weightGrams, unit: 'GRAMS' } } },
      ...(variant.color === primary.color && fileIds[primary.file] ? { file: { id: fileIds[primary.file] } } : {})
    })),
    metafields: [MARKER, ...Object.entries(product.metafields).map(([key, value]) => ({ namespace: 'custom', key, type: 'multi_line_text_field', value }))],
    ...(Object.keys(fileIds).length ? { files: product.images.map(image => ({ id: fileIds[image.file], alt: image.alt })) } : {})
  };
}

export function assertDemoProduct(existing, handle) {
  if (existing && (!existing.tags?.includes('demo') || existing.marker?.value !== SEED_ID)) {
    throw new Error(`Refusing to overwrite unowned product ${handle}. CSV imports must be kept separate or deleted before API seeding.`);
  }
}

export function assertOwned(existing, kind, handle) {
  if (existing && existing.marker?.value !== SEED_ID) throw new Error(`Refusing to overwrite unowned ${kind} ${handle}.`);
}
