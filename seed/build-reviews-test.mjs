// Explicit test-only records; never seeded as customer reviews or uploaded to Shopify.
import { writeFile } from 'node:fs/promises';
import { renderSection, baseContext, products } from './preview-liquid.mjs';
const context = { ...baseContext(new URL('http://localhost:3333/'), { items: [], note: '' }), product: products[0] };
const blocks = Object.fromEntries([[5, '2026-01-01'], [4, '2026-02-01'], [2, '2026-03-01']].map(([rating, date], index) => [`test-${index}`, { type: 'review', settings: { product: 'cove-shoulder-bag', reviewer_name: `QA test record ${index + 1}`, review_text: 'Synthetic QA record. This is not a customer review.', rating, date } }]));
const section = await renderSection('product-reviews', 'review-test', { publish_reviews: true }, context, blocks);
await writeFile(new URL('./reviews-test-preview.html', import.meta.url), `<!doctype html><html lang="en" class="js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Review controls — synthetic QA fixture</title><link rel="stylesheet" href="/assets/base.css"><link rel="stylesheet" href="/assets/store.css"><script src="/assets/reviews.js" defer></script></head><body><div class="container"><p>QA TEST FIXTURE ONLY — These records are synthetic, not customer reviews. No records are seeded or published.</p></div>${section}</body></html>`);
