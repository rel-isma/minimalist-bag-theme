# Native Shopify storefront checks

Date: 2026-10-15. Store: `atelier-vane-test.myshopify.com`. Uploaded draft: `189100065059`, unpublished. Private password loaded from ignored `.env.shopify-test`; cookies remained in ephemeral browser contexts. No theme code, theme settings, Admin data, privacy settings, checkout, contact delivery or newsletter subscriptions were changed in this run. Browser tests changed only their own test carts/localization.

## Functional outcome

**16 scenario/viewport checks passed, zero remaining failures, zero recorded uncaught JavaScript errors.** These are eight browser scenarios at 1280 and 390 pixels, not completion of all 18 audit acceptance scenarios. [Final records](storefront-primary-results.json).

| Scenario | Desktop / mobile evidence |
|---|---|
| Home | 12 product cards, six category tiles, expected heading and no horizontal document overflow |
| Navigation | Six desktop hover-menu image links; mobile Shop expansion and Escape dismissal |
| Collection | 22 products; ascending prices verified against displayed values; price filter produces empty results |
| Product / cart | Line tote Taupe/Wide resolves native variant `55775223218467`; add one, increase to two, total $258, cart page, remove to empty |
| Card add | Native cart confirms one item |
| Quick view add | Native cart confirms one item |
| Search | Native predictive suggestions, arrow-key active option, full results and empty results |
| Content / 404 | Philosophy, FAQ accordion, Contact form presence, Shipping and returns, privacy policy and collections return 200; missing route returns 404 |

The first primary run passed 14 checks and failed two Contact assertions: Shopify gives the footer newsletter the same `contact-form` class as the main Contact form, so the assertion counted both email fields. The test now scopes to `main`; both content checks passed on rerun. No theme fix was required. Original attempts remain in [first run](storefront-primary-first-run.json) and [selector attempt](storefront-primary-content-selector-attempt.json); the [successful targeted run](storefront-primary-content-final.json) supplies the two replacement records in the combined final result.

One generic console resource-404 message was observed in each functional run; the initial primary run had no matching captured HTTP error. Their cause is unresolved. Later content navigation intentionally produces two recorded HTTP 404 responses for the missing-page test. Zero uncaught exceptions does not mean a clean console/network certification.

## Preview environment

The shared visitor preview could be unlocked, but its country/currency navigation reached a failing `/services/currency/update` path and initially presented unavailable variants for MA. These are diagnostic observations, not 14 established theme defects: [shared-host attempt](storefront-results.json). Tests continued on the original store domain with the exact uploaded draft ID pinned and US/USD active. Actual native variant availability and localization succeeded there: [availability evidence](availability-diagnosis.json). The preview helper checks the Shopify theme ID after unlocking; each screenshot checks it again.

## Four-width captures and comparison

[Manifest](captures/manifest.json): **86 captures, zero capture failures, two desktop mobile-menu cases not applicable** at 390/768/1280/1536 × 900, DPR 1, Chromium 147.0.7727.116, en-US, Africa/Casablanca, reduced motion. No recorded uncaught exceptions, document overflow or completed broken images in these captured states. This image check does not prove that every offscreen lazy image was requested.

[Comparison gallery](index.html) and [raw measurements](native-diffs.json) compare the approved Phase 2 local approximation with these native captures. No resizing or masking is applied; unequal dimensions are padded transparently at top left. Pixelmatch threshold is 0.1 with antialias differences excluded. All 86 compared pairs differ (zero identical); two cases are not applicable. Measurements do not imply parity acceptance. The original Phase 0 baseline is retained separately; it contains invalid password references and predates approved fixes.

Differences needing review include real Shopify fonts, native catalog ordering/search/recommendations, actual policy content, the store name, enabled account link, preserved Privacy Choices navigation, and the Shopify preview bar. The native filters currently contain **Availability and Price only**; local Color/Product type fixtures do not prove those filters are configured on Shopify. Quick-view product selection can differ with native pagination. Password captures use an already-unlocked context and cannot certify the locked theme or invalid-password behavior. No differences have been silently accepted as platform exceptions.

## Remaining acceptance work

- Configure Color and Product type filters, then exercise combined filters, clearing, pagination and back navigation.
- Supply distinct color-specific variant photos; verify image/availability changes and unavailable combinations across all purchase paths.
- Configure shipping rates and a matching positive shipping threshold, a test discount and Bogus Gateway; test their actual calculations and checkout.
- Verify contact delivery and newsletter customer/subscription state using agreed test addresses.
- Run the Admin product-propagation experiment, full locked-password/invalid-password flow, all policy links, exhaustive keyboard/focus journeys, and real Shopify theme-editor operations.
- Review measured visual differences before accepting parity or declaring the audit/release complete.

All 93 native source files still match `qa/phase4/post-cleanup-source-manifest.json`. The uploaded theme remains unpublished. No release tag or final acceptance is implied.
