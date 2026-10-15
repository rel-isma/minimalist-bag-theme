# Phase 0 local baseline

**This is a local approximation, not a Shopify storefront baseline or a parity pass.** The owner explicitly chose “Continue with local baseline; connect Shopify later” on 2026-10-15. Native Shopify and theme-editor verification remain pending.

## How the current render is produced

- Server: unchanged `preview-server.js`, started as `PORT=3334 npm start`, bound to 127.0.0.1.
- Renderer: unchanged `seed/preview-liquid.mjs` uses LiquidJS, native theme Liquid/JSON/layout files, mocked Shopify globals/filters/forms, and `seed/catalog.json`, `collections.json`, `menus.json`, `pages.json` plus local images.
- Fixture scope: 22 products, 52 variants, eight collections, two menus, four content pages, 56 images. Cart is cookie-isolated and in memory; it is not Shopify checkout. Source/data/image hashes are in `../source-manifest.json`.
- This is **not** `shopify theme dev`. No development-store domain or credentials have been provided. No Shopify store was created, uploaded to, seeded, published or tested.
- The renderer always selects `layout/theme.liquid`; its font_face filter outputs nothing; local typography falls back to local fonts. Shopify content_for_header, native form tokens/services, accounts, enabled payment types, app blocks, real currencies and localization are not represented.
- The local preview notice above MainContent is injected by the preview renderer and is not native theme content. This is a known future parity difference.

## Capture settings

- Snapshot: `49b87cf61b72dcaa54a7d93385cc0e9a669c0e5f`.
- Tool: Playwright core 1.64.1; Chromium 147.0.7727.116; Node v26.11.1; Linux.
- Widths 390, 768, 1280, 1536; viewport height 900; DPR 1; en-US; Africa/Casablanca timezone.
- Fresh browser context per state. Phone/tablet contexts at 390/768 have mobile/touch enabled. Desktop contexts at 1280/1536 use a mouse.
- Reduced motion is enabled through the browser preference. The existing theme respects this preference; no CSS/DOM overrides or theme edits were made. Screenshots disable animations. Full pages are scrolled to load lazy images before capture; footer uses a footer element capture, and open modals/menus use viewport captures.
- Product state: visit Cove, then Line tote; select Taupe and Wide using visible option labels, record variant 1303. Demo photography exists for the primary color only. Prior visit enables Recently viewed.
- Cart state: add one Taupe/Wide Line tote through the product form and wait for the drawer; cart page uses the same populated session.
- Collection filters: modal open at phone/tablet widths; existing open sidebar at desktop widths.
- Header-menu state: desktop Shop image menu at desktop widths; responsive mobile Shop disclosure expanded at phone/tablet widths. A separate closed-Shop mobile-navigation screenshot is captured at 390/768.

## Coverage and qualifications

- 82 captured working local page/state screenshots.
- 4 password attempts: `/password` returns HTTP 404 because the existing local server has no password route. Their `password.png` screenshots record that actual 404 response. They are **not** password-page baselines.
- 2 desktop mobile-navigation cases are marked not applicable because the mobile trigger is hidden at those widths. Use desktop header-menu-open evidence.
- No failed capture states in the completed run. No uncaught JavaScript exceptions, failed network requests, broken completed images or horizontal overflow in the recorded states. Browser console messages for HTTP 404 responses are retained; do not report “zero console errors”. `http-probe.json` identifies those local responses.
- Additional preservation evidence includes philosophy, FAQ, quick view, gallery zoom, predictive search, empty cart, collections list and a policy placeholder page.
- Native password rendering/authentication, gift-card object behavior, real review records, Shopify editor, real variant image assignments, form delivery, checkout, import, new admin products, localizations and live data remain untested.
- No pixel comparison is possible until the same data/theme are available on Shopify. No parity result or Lighthouse result is claimed by this baseline.

## Screenshot matrix

| State | 390 | 768 | 1280 | 1536 |
|---|---|---|---|---|
| home | [captured](390/home.png) | [captured](768/home.png) | [captured](1280/home.png) | [captured](1536/home.png) |
| collection-filters-open | [captured](390/collection-filters-open.png) | [captured](768/collection-filters-open.png) | [captured](1280/collection-filters-open.png) | [captured](1536/collection-filters-open.png) |
| product-variant-switched | [captured](390/product-variant-switched.png) | [captured](768/product-variant-switched.png) | [captured](1280/product-variant-switched.png) | [captured](1536/product-variant-switched.png) |
| cart-drawer | [captured](390/cart-drawer.png) | [captured](768/cart-drawer.png) | [captured](1280/cart-drawer.png) | [captured](1536/cart-drawer.png) |
| cart-page | [captured](390/cart-page.png) | [captured](768/cart-page.png) | [captured](1280/cart-page.png) | [captured](1536/cart-page.png) |
| search | [captured](390/search.png) | [captured](768/search.png) | [captured](1280/search.png) | [captured](1536/search.png) |
| search-results | [captured](390/search-results.png) | [captured](768/search-results.png) | [captured](1280/search-results.png) | [captured](1536/search-results.png) |
| page | [captured](390/page.png) | [captured](768/page.png) | [captured](1280/page.png) | [captured](1536/page.png) |
| contact | [captured](390/contact.png) | [captured](768/contact.png) | [captured](1280/contact.png) | [captured](1536/contact.png) |
| 404 | [captured](390/404.png) | [captured](768/404.png) | [captured](1280/404.png) | [captured](1536/404.png) |
| password | [blocked](390/password.png) | [blocked](768/password.png) | [blocked](1280/password.png) | [blocked](1536/password.png) |
| header-menu-open | [captured](390/header-menu-open.png) | [captured](768/header-menu-open.png) | [captured](1280/header-menu-open.png) | [captured](1536/header-menu-open.png) |
| mobile-navigation-open | [captured](390/mobile-navigation-open.png) | [captured](768/mobile-navigation-open.png) | not-applicable | not-applicable |
| footer | [captured](390/footer.png) | [captured](768/footer.png) | [captured](1280/footer.png) | [captured](1536/footer.png) |
| philosophy | [captured](390/philosophy.png) | [captured](768/philosophy.png) | [captured](1280/philosophy.png) | [captured](1536/philosophy.png) |
| faq | [captured](390/faq.png) | [captured](768/faq.png) | [captured](1280/faq.png) | [captured](1536/faq.png) |
| quick-view | [captured](390/quick-view.png) | [captured](768/quick-view.png) | [captured](1280/quick-view.png) | [captured](1536/quick-view.png) |
| gallery-zoom | [captured](390/gallery-zoom.png) | [captured](768/gallery-zoom.png) | [captured](1280/gallery-zoom.png) | [captured](1536/gallery-zoom.png) |
| predictive-search | [captured](390/predictive-search.png) | [captured](768/predictive-search.png) | [captured](1280/predictive-search.png) | [captured](1536/predictive-search.png) |
| cart-empty | [captured](390/cart-empty.png) | [captured](768/cart-empty.png) | [captured](1280/cart-empty.png) | [captured](1536/cart-empty.png) |
| collections-list | [captured](390/collections-list.png) | [captured](768/collections-list.png) | [captured](1280/collections-list.png) | [captured](1536/collections-list.png) |
| policy | [captured](390/policy.png) | [captured](768/policy.png) | [captured](1280/policy.png) | [captured](1536/policy.png) |

## Reproduce without modifying project dependencies

```sh
npm ci
PORT=3334 npm start
```

In another terminal (Google Chrome must be installed):

```sh
npm install --prefix /tmp/atelier-phase0-tools --no-audit --no-fund playwright-core
PLAYWRIGHT_MODULE=/tmp/atelier-phase0-tools/node_modules/playwright-core BASELINE_URL=http://127.0.0.1:3334 node qa/capture-baseline.cjs
```

The baseline runner is local-preview-specific: it relies on fixture variant 1303 and the local cart/recommendation approximation. A real-store runner must resolve actual imported variant IDs and storefront access once connected, after approval.

## Review files

- `../../INVENTORY.md`: complete file/schema/reference inventory.
- `../MUST-NOT-LOSE.md`: owner confirmation checklist.
- `index.html`: visual screenshot index; open in a browser.
- `manifest.json`: URLs, statuses, DOM headings/sections, selected variant, errors, image hashes and capture provenance.
- `http-probe.json`: supplemental HTTP/console provenance.
- `../inventory-data.json`: machine-readable schemas/settings/locale keys/reference graph.
- `../source-manifest.json`: source and local fixture hashes.

Earlier capture-attempt diagnostics remain as evidence and are excluded from the completed manifest and visual index: `390-cart-drawer-failure.png`, `390-product-variant-switched-failure.png`. The first attempt targeted visually hidden radio inputs; the completed runner clicks their visible labels. No theme fix was applied.
