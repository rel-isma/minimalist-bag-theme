# Replace before launch

This development catalog must stay unpublished or behind a storefront password. The local multi-product implementation is complete. Demo content and live-store verification still prevent a production launch.

## Every demo product

For every row, replace or delete the entire demo product: title, handle, original demo description, SEO title/description, prices and compare-at prices, Color/Size choices, SKU, weight, tags, material/dimensions/care metafields, and both AI photos. Confirm actual composition, measurements, capacity, closure, and fit using physical samples. Do not reuse demo SKUs for production stock.

| Demo product | Handle | Demo price | Variants | Demo compare-at |
| --- | --- | --- | --- | --- |
| Cove shoulder bag | `cove-shoulder-bag` | $99.00 | 3 | None |
| Fold shoulder bag | `fold-shoulder-bag` | $109.00 | 2 | None |
| Drift shoulder bag | `drift-shoulder-bag` | $89.00 | 2 | $109.00 |
| Arc shoulder bag | `arc-shoulder-bag` | $119.00 | 3 | None |
| Ledge shoulder bag | `ledge-shoulder-bag` | $129.00 | 2 | None |
| Nest shoulder bag | `nest-shoulder-bag` | $95.00 | 1 | None |
| Path crossbody bag | `path-crossbody-bag` | $89.00 | 3 | None |
| Loop crossbody bag | `loop-crossbody-bag` | $79.00 | 2 | $99.00 |
| Field crossbody bag | `field-crossbody-bag` | $99.00 | 2 | None |
| Vale crossbody bag | `vale-crossbody-bag` | $109.00 | 2 | None |
| Plane tote bag | `plane-tote-bag` | $119.00 | 3 | None |
| Gather tote bag | `gather-tote-bag` | $109.00 | 2 | None |
| Line tote bag | `line-tote-bag` | $129.00 | 4 | None |
| Open tote bag | `open-tote-bag` | $99.00 | 1 | None |
| Dusk clutch | `dusk-clutch` | $69.00 | 2 | $89.00 |
| Petal mini bag | `petal-mini-bag` | $79.00 | 2 | None |
| Frame mini bag | `frame-mini-bag` | $89.00 | 3 | None |
| Slip cardholder | `slip-cardholder` | $39.00 | 3 | None |
| Turn wallet | `turn-wallet` | $59.00 | 2 | None |
| Keep zip wallet | `keep-zip-wallet` | $49.00 | 2 | None |
| Reach shoulder strap | `reach-shoulder-strap` | $45.00 | 4 | None |
| Pebble bag charm | `pebble-bag-charm` | $39.00 | 2 | None |

All 22 products carry `demo`. API cleanup deletes every exact `demo`-tagged product, including demo products outside this package. Never use `demo` on a real product. See `seed/README.md` for API ownership cleanup and menu restoration. For manual/CSV cleanup, filter Products by exact tag `demo`, select all matching products, choose the delete action, and confirm only after reviewing the selection.

## Every page and collection text

- `seed/pages.json`: Story (`story`, template `page.story`), FAQ (`faq`, `page.faq`), Contact (`contact`, `page.contact`), and Shipping and returns (`shipping-returns`, `page.shipping`). Replace all four page bodies. Configure a monitored customer-service email; establish response times and merchant policies.
- `seed/collections.json`: all eight editable demo descriptions and eight collection banners. Confirm category membership and intentional merchandising assignments.
- `seed/catalog.json`: all 22 product descriptions, SEO fields, and three `custom` metafield values per product.
- `seed/menus.json`: review all titles, child items, and links; replace demo collection/page references with the production resources. Set real policies under Shopify Settings > Policies.
- `new-arrival` and `featured`: reassess their demo assignments for the real catalog. Remove all demo compare-at prices unless there is a genuine, supported retail price comparison.
- `seed/catalog-preview.html`: a local review artifact; do not publish it as a customer-facing store.

## Storefront content and settings

- `templates/index.json`, hero/category/featured/story/shop-the-look/newsletter text: replace demo editorial copy and all image-picker selections. The three fallback homepage scenes and their responsive WebP variants in `assets/` are AI images; see IMAGE-LOG.md.
- Confirm every home collection picker and product hotspot on the development store. Empty resources render safely. Do not add pins unless the photographed real product matches the selected product.
- Shipping threshold defaults to 0 and its message stays hidden. Enable only after verifying the real store's shipping rules and currency. Announcement and benefits are hidden/empty until verified content is supplied.
- Reviews default to unpublished, have no seeded blocks, and require authentic name/text. Verified buyer defaults to false; enable only for independently verified purchase records.
- Replace all draft policy placeholders in Shopify admin, including shipping, returns, privacy and terms. Configure actual enabled payment methods and a monitored contact address.
- All 22 demo prices, three compare-at prices, weights and material/dimension/care metafields remain illustrative. Demo imagery shows only the first color. Supply each real variant's photographs before launch.
- `seed/legacy-images/` preserves the old single-product imagery and intermediate JPEG copies for provenance. Those assets, single-product landing sections, fabricated customer quotes and hardcoded manufacturing/service claims have been removed from the active theme.
- The local preview notice and simulated endpoints exist only in `preview-server.js`/`seed/preview-liquid.mjs`, which are excluded from Shopify upload. No local preview purchase, subscription, contact message or login is real.

## Required live verification

Import into a fresh password-protected Shopify development store; inspect variant/image associations and metafields; enable native filters and assign menus/templates; test theme-editor settings, recommendations/complementary products, currencies/localized routes, contact/newsletter delivery, cart/checkout, gift cards and customer accounts. Run storefront Lighthouse there. Keep the password while any demo data or placeholder remains.

## Restored Inquiries and review setup

The five homepage FAQ answers were restored verbatim at the user's request. They include phone-capacity, full-grain-leather/weather, 24-hour dispatch/US 2–4-day delivery, 30-day/prepaid-return, and fixed 28 cm strap claims. Verify or replace every statement for the real multi-product catalog before launch; these are not measurements or policies established by the demo data. Honest Construction comparison rows are editable and use neutral specification guidance until real construction details are confirmed.

Product reviews currently have no real records. Add only authentic reviews, select the exact reviewed product, use ISO dates and independently confirm verified-buyer flags. `seed/reviews-test-preview.html` and `seed/reviews-test-controls.png` contain conspicuously labeled synthetic QA records only; they are not customer reviews, are never seeded, and are excluded from the theme ZIP/upload.
