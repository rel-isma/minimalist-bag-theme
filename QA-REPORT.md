# QA report — completed local preparation

Date: October 14, 2026. Brand: Atelier Vane. Stages (a)–(g) are complete locally. No Shopify store was connected, changed or published. Live-store acceptance remains pending at the user's request to connect later.

## Delivered

The native theme now has an editable multi-product homepage, six category tiles, New arrivals/Featured rows, preserved brand-story layout, shop-the-look pins, empty-by-default benefits/reviews, newsletter, nested desktop/mobile navigation, predictive search, filtered/paginated collections, shared product cards, Color/Size product options, metafield accordions, related/complementary recommendations, bounded recently viewed history, page bodies/contact, collections index, 404, cart page/drawer and gift-card validity states. Existing palette, font settings, buttons and spacing are retained. Obsolete single-product sections, sample customer quotes and hardcoded material/origin/service claims were removed.

The package is `dist/atelier-vane-theme.zip`. `dist/package-manifest.json` records file count, byte size and SHA-256. ZIP integrity and required entries pass; only assets/config/layout/locales/sections/snippets/templates are included. Seed data, docs, Node modules, environment files, local server and QA artifacts are excluded.

## Local checks

| Check | Result and scope |
| --- | --- |
| Theme Check | Shopify CLI 4.9.3 returns `[]`: zero errors and warnings on the completed native theme. |
| Seed integrity | 22 products, 52 variants, eight automated collections, two menus, four pages, exact official 61-column CSV header; all demo products tagged `demo`, untracked inventory, USD $39–$129, exactly three compare-at products. Data-only CSV has 52 variant rows; URL-complete fixture has 74 rows/44 product image entries. |
| Seed tests | Seven tests pass: CSV quoting, URL/image preparation, Color/Size payloads, API/error/pagination checks, development-store/USD and ownership protection, idempotent IDs, cleanup/menu restoration. API calls are mocked. |
| Store fixture tests | Seven tests pass: configured homepage/cards/no reviews, missing resources, Color/Size/native quantity association/metafields/JSON-LD, combined filter/sort behavior, hidden/partial/unlocked shipping threshold, and hidden empty recommendations/reviews. `npm test` runs both suites. |
| Demo images | 56 JPEGs decode; product ratios 4:5, banners/hero/lifestyle 3:2, longest side <=1600 and each <300KB. Three logged hero/lifestyle images have compressed WebP storefront derivatives and nine real responsive sizes. No new AI images were generated during stages (d)–(g). Old JPEGs are archived outside the theme. |
| Running store | `npm start` serves the actual Liquid sections through a local renderer at http://localhost:3333. Fixture objects/filters approximate Shopify. Static file serving is limited to public assets, image/review files; contacts, newsletter, account and checkout never report real success locally. |
| Browser flows | Chrome desktop 1440px, mobile 390px and 320px: no horizontal overflow on home, collection, product, cart and contact. Six home categories, 12 home cards, two product pins positioned on their matching demo tote/wallet, no reviews, no completed broken-image loads; all 22 collection products paginate 12/10. Active price filter yields an honest empty state. |
| Products/cart | Line tote Color/Size selects Taupe/Wide ID 1303; quantity 2 adds $258.00. Drawer increment, note persistence, a second product, subtotal/item counts, removal and empty-cart checkout visibility pass. Native cart page renders both lines and the note. Totals/lines use Liquid section rendering, avoiding hardcoded JavaScript currency or missing-image failures. |
| Optional features | Related and complementary fixture rows appear only with results. Recently viewed displays previous products, excludes current items and survives malformed storage. Gallery selection and native zoom dialog open/close pass. JavaScript-disabled product loads retain the full variant selector and quantity's form association. |
| Header/search | Nested native disclosures, six category links, centered logo, mobile modal, transparent/scroll state, focus restoration, predictive request debounce, stale-response protection, keyboard selection, Escape behavior, failed/empty suggestions and ordinary search fallback were tested. Header unload/load simulation renews listeners and releases scrolling; a cart click dispatches once. |
| General | Syntax checks and `git diff --check` pass. Server/session simulation and LiquidJS are development-only; storefront uses native CSS/JS. Backup of the original repository remains in `/home/rel-isma/goinfre/tmp/theme-backups/`. |

Machine-readable results: `seed/store-browser-results.json`, `seed/stage-c-browser-results.json`, `seed/image-audit.json`, `seed/lighthouse/results.json`. Screenshots: `seed/store-desktop.png`, `seed/store-mobile.png`. Historical stage-a/b fixture results remain for traceability; the complete store browser suite supersedes the earlier drawer mock.

## Mobile Lighthouse

The final local runs are recorded in `seed/lighthouse/results.json` and full `home.json`, `collection.json`, `product.json`. Targets are performance >=85 and accessibility >=95. These measure the local fixture server with 22 products, local font fallbacks and simulated services; they do not establish scores on Shopify with its configured fonts/apps/services.

The first collection audit found a layout shift of 0.931 as filters moved into the mobile drawer. The completed layout reserves the enhanced state before deferred scripts initialize; subsequent collection CLS is 0. The homepage's oversized fallback photo initially scored below the performance target; real responsive WebP files fixed that load. Accessible payment-group and cart/product labels were corrected. Final mobile scores:

| Page | Performance | Accessibility | CLS |
| --- | ---: | ---: | ---: |
| Home | 96 | 100 | 0 |
| Collection | 96 | 100 | 0 |
| Product | 98 | 100 | 0 |

All three meet the local targets. All three accessibility scores remain 100; full audit details are saved with the reports.

## Not tested on Shopify

- Fresh-store CSV acceptance/import report, real Admin GraphQL mutations/staged uploads, image processing, variant/metafield associations, automated collection population and menu idempotency/cleanup.
- `shopify theme dev`, native filter/search indexing and relevance, native pagination, actual section rendering, real recommendation/complementary results, Shopify product-option drops, app blocks and the theme editor itself. Editor events were simulated locally.
- Localized routes, currencies/market pricing, dynamic checkout/payment terms, customer accounts, real contact/newsletter delivery, checkout/payment, shipping eligibility and gift-card issuance/redemption. Gift-card markup is checked, not a real gift-card transaction.
- Screen-reader/manual assistive-device coverage, actual mobile hardware/network and cross-browser coverage. Chrome keyboard/device emulation and Lighthouse are the local evidence.
- Production photography, manufacturing details, merchant policies, price comparisons or launch readiness. Every demo item/text/image remains listed in REPLACE-BEFORE-LAUNCH.md.

Local preparation is ready for review. Connect a password-protected development store, import/configure resources and run the live checks in README before publishing.

## Requested refinements — Inquiries, construction, swatches and reviews

The homepage restores the supplied five FAQ answers under Inquiries and an editable Honest Construction table. The requested FAQ text is not evidence of actual fit/material/dispatch/return terms; it is registered for verification in REPLACE-BEFORE-LAUNCH.md. Construction rows retain the original table style with editable specification guidance, without invented competitor claims.

Color-only cards use circular native radio inputs, directly submitting the selected variant; product details and quick view use labeled Color/Size radio buttons. The full native variant select is hidden when JavaScript enhances the product page and remains available when JavaScript is disabled. Tests cover correct card/product/quick-view IDs, keyboard radio selection and subsequent cart submission.

The product review panel shows no invented reviews or average when empty. Product-bound complete records alone drive counts, average and 5–1-star proportions. A scoped renderer test excludes unrelated/incomplete records and checks the calculated average/progress. An explicitly labeled synthetic QA page exercises sorting, star filtering, clear and zero matches; none of those records are seeded or shown on actual product pages. Browser evidence is in `seed/refinements-browser-results.json`; the full store suite was adapted to radio controls and passed. JavaScript/CSS are not cached in the local dev server after this update, and browser QA disables caches to avoid testing stale controls.

No live review app, submission service, verified-purchase lookup or Shopify store was connected. Authentic reviews currently require merchant-managed blocks with a matching product, up to 50 per section. Updated tests total 14 (seven seed and seven store tests). The theme ZIP has been refreshed.

The follow-up product audit also removed an unnecessary forced layout read during initial header setup. Latest local mobile scores after the requested refinements are recorded in the table above. Swatch selection now recognizes both media IDs and preview-image IDs when switching galleries, and the zoom link follows a replaced variant image.

## Header refresh

The header now uses a single desktop row with left navigation, centered brand and right search/cart actions. The Shop disclosure includes six linked collection image cards and a view-all link. Mouse hover opens it; click/keyboard activation remains available. Pointer exit, focus exit, Escape, outside click and breakpoint changes close it. Mobile retains the native menu dialog. The enabled announcement includes an editable CTA. `seed/check-header-refresh-browser.cjs` checks centering and overflow at 1440/1025/390/320 px, hover continuity, image loading, keyboard/Escape, mobile navigation and the CTA destination. Screenshot artifacts: `seed/header-shop-menu.png` and `seed/header-mobile.png`. Previous Lighthouse scores predate this header change.

## Footer and philosophy refinement

Customer reviews now finish the product template after recommendations and recently viewed. The footer uses separate Shop and Client care columns, one newsletter form, and real policy links along the bottom. Link destinations are deduplicated across nested menu entries and automatic policies. The homepage’s repeated newsletter section is removed. Our philosophy replaces Story in navigation and uses the image-and-text editorial section on `/pages/story`, with a single page heading and editable design copy. Two additional store tests verify deduplication, newsletter visibility, review ordering and the philosophy template. `seed/check-footer-philosophy-browser.cjs` verifies these layouts at 1440/1025/390/320 px without overflow or browser exceptions. Existing Lighthouse scores predate these refinements.

## FAQ page alignment

The FAQ page now uses the same Inquiries accordion section and five supplied answers as the homepage. Its page title is “Frequently Asked Questions” with one H1, while the homepage uses H2. The two placements are independently editable in the theme editor; content and shipping claims need merchant verification. A store test checks matching questions, accessible heading structure and five FAQ disclosures.
