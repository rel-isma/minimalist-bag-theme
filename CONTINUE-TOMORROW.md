# Atelier Vane — continue from here

Updated: 15 October 2026. Intended next session: 16 October 2026.

## Where we stopped

The theme is uploaded to the Shopify development store, the demo catalog is available, and native storefront browser checks have run. The owner then followed the setup/manual-testing instructions and reported **“everything is good.”** We stopped at **reviewing the native-versus-local screenshot differences**. The owner has `qa/shopify/index.html` open for that review.

**Start tomorrow with the visual review. Do not restart the import, rebuild the theme from scratch, or repeat the completed setup.** No visual differences have yet been explicitly accepted, and final release approval has not been given.

## Store and current version

- Development store: `atelier-vane-test.myshopify.com`.
- Uploaded theme: `atelier-vane-theme`, theme ID `189100065059`.
- Last verified theme state: **unpublished draft**, store password enabled. Continue using the draft preview.
- Original-domain draft URL: `https://atelier-vane-test.myshopify.com/?preview_theme_id=189100065059`.
- Latest local commit at this checkpoint: `671a92a` — `qa: record native Shopify storefront checks and visual comparisons`.
- Native theme ZIP: `dist/atelier-vane-theme.zip` (generated/ignored), 93 native files.
- ZIP SHA-256: `60339d2acdcdf8184a4ccfb8fe2763dde81e7baf06129d2630e462fa60357429`.
- All 93 native source files matched `qa/phase4/post-cleanup-source-manifest.json` after browser QA. This checks local source integrity; it does not prove that later merchant editor changes were pulled.
- This session did not publish the theme, push the QA commit to GitHub, or create a release tag.

## Completed work and what went well

The existing theme was audited and hardened locally through the approved phases. Approved cleanup removed three unused images, with the local screenshots unchanged after cleanup. Earlier evidence is retained in `AUDIT.md`, `PHASE-2-REPORT.md`, `CLEANUP-REPORT.md`, and `qa/phase4/POST-CLEANUP.md`.

The owner uploaded the native ZIP. Shopify CLI/Admin access was connected and the uploaded draft was checked. The approved import created 22 demo products, 52 variants, 56 image records, eight collections, and three new pages. Existing Contact was reused; Main/Footer menus were updated with backups, while Privacy Choices and account navigation were preserved. See `qa/shopify/IMPORT-REPORT.md`. Its Draft/hidden statuses describe the historical import, not current publication.

The owner made the 22 products Active and available to Online Store, made the imported collections available, and made the new pages visible. Read-only native checks confirmed the published products/pages. See `qa/shopify/post-publication-state.json`.

The storefront password saved locally worked. Native Playwright checks then ran against the original store domain with the exact uploaded draft ID pinned, using US/USD.

### Automated results

**16 scenario/viewport checks passed: eight scenarios at 1280px and 390px. Zero remaining assertion failures and zero recorded uncaught JavaScript errors.**

- Home: 12 product cards, six category tiles, expected heading, no horizontal document overflow.
- Navigation: desktop image mega menu and mobile Shop disclosure/Escape dismissal.
- Collection: 22 products, verified ascending prices, empty-result price filtering.
- Product/cart: Line tote Taupe/Wide selected the real native variant, added successfully, increased to two with a $258 total, appeared on the cart page, and removed to empty.
- Product-card add and quick-view add: native cart contents verified.
- Search: native predictive suggestions, arrow-key active selection, full results and no results.
- Content: Philosophy, FAQ accordion, Contact form presence, Shipping and returns, privacy policy, collections, and genuine HTTP 404.

The initial Contact assertion counted both the main Contact email input and the footer newsletter email input because Shopify assigns both forms the `contact-form` class. Scoping the test to `main` resolved it. This was a test-selector correction; no theme change was needed. Initial failures and successful targeted reruns are retained, and the combined final result identifies its rerun provenance.

**86 native screenshots were captured at 390/768/1280/1536px, with zero capture failures and two desktop mobile-menu cases not applicable.** Captures recorded no uncaught exceptions, document overflow, or completed broken images. That image check does not establish that every lazy image was requested.

One generic console resource-404 message was observed per functional run without an established cause. Missing-page checks also intentionally returned HTTP 404. Do not describe this as a completely clean console/network certification.

### Owner-reported manual results

The owner first explicitly confirmed Line tote color/size selection, product-page add, cart quantity changes, removal and empty state worked.

After receiving detailed instructions for Search & Discovery filters, shipping/free-shipping settings, a test discount, test checkout, Contact/newsletter delivery, and editor testing, the owner reported **“everything is good.”** Record this as a broad owner-reported manual confirmation. Exact saved values, test order IDs, delivery receipts, and an exhaustive editor matrix were not supplied or independently checked after that message. Do not turn this confirmation into additional automated passes or assert that the suggested example settings were definitely used.

## The visual review still needs completion

Open **`qa/shopify/index.html`**. It links each local reference, native capture, and pixel-diff image. Measurements are in `qa/shopify/native-diffs.json`.

- All 86 compared pairs differ; zero are pixel-identical.
- Reference set: approved Phase 2 local approximation in `qa/phase2/current`, not a native Shopify baseline.
- Comparison uses raw top-left alignment, transparent padding for different dimensions, pixelmatch threshold 0.1, and antialias exclusion. No resizing or masking was used.
- Differences include real Shopify fonts, catalog/search/recommendation behavior, actual privacy policy content, store name, account link, preserved Privacy Choices navigation, and Shopify's preview bar.
- At the automated run, only Availability and Price filters were configured. The owner later reported success after the filter instructions; recheck current Color/Product type configuration before calling that gap closed.
- Quick-view product selection can differ because native catalog pagination differs from the local fixture.
- Password screenshots were captured in an already-unlocked context. They do not certify a fresh locked theme screen or invalid-password behavior.
- Native color-specific image switching was not proven: imported photos did not provide distinct images for each color. Gallery media switching is a different check.

These differences have been measured, but their individual causes and acceptance have not all been reviewed. A nonzero pixel difference is not automatically a theme defect or an accepted platform exception.

## Exact plan for tomorrow

1. Read this file, `qa/shopify/STOREFRONT-REPORT.md`, and the current Git status. Preserve any changes the owner made after this checkpoint.
2. Review the screenshot gallery, starting with home, product details, cart, collection filters, header menu and footer at desktop/mobile widths. Inspect actual image pairs rather than accepting all differences together.
3. Classify material differences as store data/configuration, platform/browser rendering, test-state mismatch, or a theme defect. Record the evidence and any explicit owner acceptance. Make focused fixes within the existing audit scope if a defect is confirmed; avoid redesign or new features.
4. Recheck current store settings affected by the owner's manual work. Keep manual confirmations separate from independently observed evidence. Remaining audit coverage includes combined filters/pagination/back navigation, distinct-color media/unavailable variants, shipping thresholds, discount allocations, test checkout, form delivery/subscription state, new-product propagation, locked-password behavior, all policies, full keyboard/focus journeys, and actual editor coverage. Some may already have been exercised manually; verify before repeating or marking complete.
5. If changing native theme files, first pull the current draft into an isolated temporary directory and inspect merchant editor changes. Preserve settings/template/group changes. Do not overwrite the store with an old local configuration.
6. Rerun only relevant checks after fixes, update the reports, and keep the draft unpublished. Final acceptance/release remains pending the completed review and verified coverage.

## Files to use

| File | Purpose |
|---|---|
| `qa/shopify/STOREFRONT-REPORT.md` | Main native browser report and limitations |
| `qa/shopify/index.html` | Local/native/diff screenshot gallery — current stopping point |
| `qa/shopify/storefront-primary-results.json` | Combined final 16-check result, with rerun provenance |
| `qa/shopify/captures/manifest.json` | 86 native captures, environment, state evidence and hashes |
| `qa/shopify/native-diffs.json` | Raw comparison measurements |
| `qa/shopify/browser-source-integrity.json` | Last local source integrity check |
| `qa/shopify/README.md` | Commands and local tool dependencies |
| `E2E-REPORT.md`, `PARITY-REPORT.md` | Audit acceptance context; older checkpoints are labeled historical |
| `qa/MUST-NOT-LOSE.md` | Existing design/content that must be preserved |

## Access and rerun notes

The storefront password is in ignored `.env.shopify-test`. Load it locally; never print it, paste it into chat, commit it, or save authenticated browser storage into QA evidence. Shopify CLI manages its own credentials.

The temporary visitor-preview URL was provided earlier but is deliberately not stored here. If rerunning scripts, set `SHOPIFY_PREVIEW_URL` privately in the process environment; the URL may need renewal. With `NATIVE_PRIMARY_PREVIEW=1`, the helper navigates the original store domain and pins draft `189100065059`. Shared-preview country/currency navigation previously failed at `/services/currency/update`; use the documented original-domain approach for comparable US/USD checks.

```sh
# SHOPIFY_PREVIEW_URL must already be set locally.
NATIVE_PRIMARY_PREVIEW=1 node --env-file=.env.shopify-test qa/shopify/check-storefront.cjs
NATIVE_PRIMARY_PREVIEW=1 node --env-file=.env.shopify-test qa/shopify/capture-native.cjs
node qa/shopify/compare-native.mjs
```

These commands overwrite current result/capture files, so preserve prior evidence if a new run needs comparison. The functional runner also supports `NATIVE_CASES` and `NATIVE_WIDTHS` for targeted reruns. Playwright/PNG tools currently live under `/tmp/atelier-phase0-tools/node_modules`, and Chrome is `/usr/bin/google-chrome`; temporary dependencies might need restoring after a restart.

No development server was left running at this checkpoint. The local preview is an approximation; native Shopify evidence remains the basis for Shopify acceptance.
