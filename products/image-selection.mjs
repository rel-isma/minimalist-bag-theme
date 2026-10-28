// Product gallery and variant media only. Never parse description HTML.
const list = value => {
  if (Array.isArray(value)) return value;
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : [value]; }
  catch { return [value]; }
};
export function selectProductImages(product, downloaded = null) {
  const candidates = [product.bigImage, ...(product.variants || []).map(v => v.variantImage),
    ...list(product.productImage), ...list(product.productImageSet)];
  const selected = [], seen = new Set();
  for (const url of candidates) {
    if (typeof url !== 'string' || !/^https:\/\//i.test(url)) continue;
    const media = downloaded?.find(item => item.sourceUrl === url && item.status === 'downloaded');
    if (downloaded && !media) continue;
    const identity = media?.sha256 || url;
    if (seen.has(identity)) continue;
    seen.add(identity); selected.push(url);
    if (selected.length === 8) break;
  }
  return selected;
}
