# Phase 3 — native end-to-end test readiness

Date: 2026-10-15, Africa/Casablanca. Candidate source: `504b15f`.

**Execution blocked: 0 passed, 0 failed, 18 blocked.** The owner approved moving to Phase 3, while the earlier instruction to connect Shopify later remains in effect. No native Playwright session, admin operation, checkout, submission or editor operation was performed. This report prepares the required tests; it does not certify Phase 3 completion.

## Connection check

Presence checks found none of `SHOPIFY_STORE`, `SHOPIFY_SHOP`, `SHOPIFY_SHOP_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN`, `SHOPIFY_ADMIN_TOKEN` or `SHOPIFY_CLI_THEME_TOKEN` configured in the current process. `.shopify/`, `shopify.theme.toml`, `.env` and `.env.local` are absent. No credential values were read into this report. These checks establish that this workspace has no configured target; they do not establish whether the owner has a development store elsewhere.

There is no recorded native theme ID, authenticated browser session, imported/published native catalog or store URL for this run. The local `npm start` server approximates Shopify services and cannot supply the required evidence. It remains stopped. Theme files, seed data and the candidate ZIP were not changed during this phase.

## Setup needed before execution

1. Connect the chosen password-protected development store and authenticate locally. Keep credentials and browser storage state outside tracked files. The existing seeder uses `SHOPIFY_STORE` and `SHOPIFY_ADMIN_TOKEN`; its dry run must be reviewed before an actual import.
2. Upload the exact candidate native ZIP through the merchant upload flow. Record store domain, theme ID, source commit, ZIP hash and upload outcome. See [Phase 2 package evidence](qa/phase2/package-manifest.json). Continue testing the uploaded unpublished theme without changing a live production theme.
3. Import and publish the test products/pages to the development storefront, configure collection membership, menus, home collection settings and published policies, and resolve actual variant IDs. Local synthetic IDs are not portable. Assign visibly different images to at least two color variants: the existing primary-color photos alone cannot prove image switching.
4. Configure test inventory, shipping rates, a documented shipping-bar threshold, an eligible test discount and Bogus Gateway on this development store. Arrange access to the contact recipient inbox and customer records to verify submissions. Test localization with more than one available country/language if those controls are to be exercised.
5. Run Playwright against the native preview with isolated sessions for cart, password and keyboard tests. Preserve the unpublished-theme preview context across navigation. Capture console/page errors, failed requests, relevant network responses and screenshots/traces. Redact customer information, tokens, cookies and checkout identifiers before sharing artifacts.
6. Record actual browser/version, viewport, locale, currency, store settings and test resource handles with each run. Use desktop and 390px mobile coverage, and repeat parity captures at 390/768/1280/1536px as specified in [PARITY-REPORT.md](PARITY-REPORT.md). That older report's Phase 1 packaging defects are historical; the current package status is in [PHASE-2-REPORT.md](PHASE-2-REPORT.md).

## Required test matrix

Every row is **BLOCKED — no connected development store**. Expected results below are acceptance criteria, not observations.

| ID | Scenario | Procedure and required proof | Result |
|---|---|---|---|
| E01 | Admin product propagation | Create a uniquely named test product in admin, with inventory, color options, images and collection/filter attributes; publish to the test storefront. Select its collection in a home section and ensure ordering/limits include it. Verify the same product appears in collection, home, indexed search and matching filters. Record indexing wait and native resource IDs. | BLOCKED |
| E02 | Sorting and filters | Compare displayed products/prices to the selected native sort order. Exercise availability, price and color filters, combined filters, clear, empty results, pagination and browser back. Verify URL state, checked labels and result counts on desktop/mobile. | BLOCKED |
| E03 | Variant/color and media | Switch distinct-image color variants on cards, quick view and product page; verify selected swatch, image/alt, price, availability, URL and submitted native variant ID. Exercise another option combination and an unavailable variant. | BLOCKED |
| E04 | Three add-to-cart paths | Independently add from a product card, quick add/view and product page. Verify selected variant, quantity and native cart contents; unavailable variants must not be added. Record requests and resulting drawer state. | BLOCKED |
| E05 | Drawer quantity/remove | Increase/decrease quantity, remove one of multiple lines, then remove the last line. Verify native cart quantities, count, totals, empty state and focus restoration; exercise stock-limit/error feedback. | BLOCKED |
| E06 | Free-shipping bar | With an explicit threshold and matching shipping setup, test below/equal/above threshold and removal back below. Verify subtotal/progress/message arithmetic; threshold zero hides the bar. A non-base presentment currency must not show an invalid base-currency promise. | BLOCKED |
| E07 | Discount display | Apply the eligible test discount through Shopify's supported flow; verify actual line/cart allocations, savings and totals in drawer/cart/checkout. Remove it or make it ineligible and verify stale savings disappear. Theme display must reflect native cart data. | BLOCKED |
| E08 | Bogus Gateway checkout | From a populated native cart, complete a successful test payment with the configured test gateway. Verify test order, variant, quantity, shipping, discount and total in admin; also exercise a failed test payment. No real charge or production order. | BLOCKED |
| E09 | Contact submission | Submit invalid then valid inputs on the native contact page. Verify validation, native success feedback and receipt in the configured inbox. A success banner alone does not prove delivery. | BLOCKED |
| E10 | Newsletter signup | Submit invalid and new valid test addresses in footer and standalone signup section. Verify feedback and corresponding native customer/subscription state and newsletter tag, accounting for configured confirmation requirements. Check an existing subscriber too. | BLOCKED |
| E11 | Predictive search | Type an indexed product term, inspect native results/links/prices and keyboard selection. Test no results, fast replacement typing, Escape, focus restoration and mobile behavior. Verify stale requests do not replace current results. | BLOCKED |
| E12 | 404 | Navigate to a genuinely nonexistent native path. Verify HTTP 404, intended template, working recovery links, header/footer and no uncaught errors. | BLOCKED |
| E13 | Password | Use a fresh locked browser context. Verify password layout, invalid feedback and successful unlock/navigation, without disclosing the store password in evidence. | BLOCKED |
| E14 | Policies | Open every published policy from the footer. Verify native policy content, working URLs, one link per policy, Contact link and keyboard access; also check behavior when policies are absent. | BLOCKED |
| E15 | Dropdown menus | Hover Shop on desktop, navigate image/category links and move pointer between trigger/panel. Test keyboard opening, focus order, Escape/close and configured/empty menu states. | BLOCKED |
| E16 | Mobile navigation | At 390px, open, expand, navigate and close mobile menu; verify focus trapping/restoration, scroll lock, visible controls, orientation/viewport changes and interaction with search/cart dialogs. | BLOCKED |
| E17 | Keyboard-only navigation | Traverse home, collection filters, product options, quick view, cart, search, forms, comparison table and footer using Tab/Shift+Tab/arrows/Enter/Space/Escape as applicable. Verify visible focus, usable controls, no unintended traps and correct modal return focus. | BLOCKED |
| E18 | Actual theme editor | Execute the section/block matrix below in Shopify's editor. Verify saved live previews and storefront reload, plus repeated load/unload/select/deselect without duplicate listeners or console errors. Synthetic events are insufficient. | BLOCKED |

## Editor coverage for E18

For each permitted addable section: add, edit its settings, reorder, select/deselect, remove and re-add in a disposable test configuration. Check empty resources as well as configured content. For sections with blocks: add/edit/reorder/remove each supported block type and verify inspector selection, including hidden/collapsed content. Save, reload the editor and compare the storefront preview. Restore the starting configuration after recording results.

| Location/type | Every section to exercise | Additional checks | Result |
|---|---|---|---|
| Header group | `announcement-bar`, `header` | CTA/menu/logo settings, singleton restrictions, group order and dialog behavior after reload. | BLOCKED |
| Footer group | `footer` | Text, Links, Newsletter, Social links, Payment icons, Country and language blocks; remove all blocks, then restore; empty links, policies, enabled payments and localization conditions. | BLOCKED |
| Index-only addable | `hero` | Images, copy, links and settings; unavailable in other template contexts. | BLOCKED |
| Main-template addable | `brand-story`, `category-tiles`, `comparison-table`, `custom-liquid`, `faq-accordion`, `featured-collection`, `newsletter`, `product-reviews`, `shop-the-look`, `trust-strip` | Every setting and collection, construction-detail, FAQ, review, pin and benefit block. Only authentic review content in merchant previews; no fabricated customer reviews. | BLOCKED |
| Product-only addable | `product-recommendations`, `recently-viewed` | Native recommendations and browser history, empty states, section reload cleanup and placement restrictions. | BLOCKED |
| Context main sections (no addable preset) | `main-404`, `main-article`, `main-blog`, `main-cart`, `main-collection`, `main-contact`, `main-list-collections`, `main-page`, `main-password`, `main-product`, `main-search` | Edit each in its owning template. Test template remove/reorder where the editor permits; record any platform restriction instead of forcing removal. Product blocks: title, price, variant picker, quantity, buy buttons, description, accordion and Custom Liquid; `@app` additionally requires an installed compatible test app. | BLOCKED |
| Runtime/endpoint helpers (no addable preset) | `cart-drawer`, `predictive-search`, `quick-view`, `recent-product-card` | Exercise through their owning UI, including after editor reloads. Verify they are not offered as merchant-addable sections. | BLOCKED |

This matrix covers all 31 current section files. Actual editor restrictions must be observed, not inferred solely from schema validation.

## Existing local evidence and limits

[Phase 2](PHASE-2-REPORT.md) records 20 passing local tests, clean Theme Check, local screenshots, shopping regression and synthetic editor probes. Those checks are useful preparation and have not been rerun as native tests. In particular, local forms do not deliver submissions, local checkout does not create an order, and mock IDs/data do not demonstrate admin propagation. No local result has been promoted to a native pass.

Native visual parity also remains pending. Phase 2 approval does not supply the missing Shopify screenshots or establish zero visual differences.

## Stop point

Phase 3 is prepared but cannot be executed until the development store is connected. Resume with the setup above, replace each blocked result with observed pass/fail and linked evidence, fix failures in focused commits, and retest. No Phase 4 cleanup, deletion, release tag, push or publication was performed. Phase 4 remains a separate report-and-approval step.
