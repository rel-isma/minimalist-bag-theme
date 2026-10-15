# Native parity review — measured, awaiting acceptance

**Current native browser update (2026-10-15):** Password access now works. The uploaded unpublished draft passed 16 desktop/mobile scenario checks after correcting a Contact test selector; 86 native screenshots were captured at four widths with zero capture failures. Native-versus-local pixel measurements are available, but visual parity and the complete 18-scenario acceptance matrix are not certified. Color/Product type filters, alternate-color media, shipping/discount/checkout, form delivery and actual editor operations still need configuration or verification. See [current storefront report](qa/shopify/STOREFRONT-REPORT.md) and [comparison gallery](qa/shopify/index.html).

---

## Historical checkpoints (superseded where noted above)


**Native setup update (2026-10-15):** The owner has since created the development store, uploaded the updated 93-file ZIP and connected CLI/Admin API access. The native uploaded draft was pulled and checked, and the approved catalog import passed native Admin API verification: see [import evidence](qa/shopify/IMPORT-REPORT.md). Products remain drafts/new pages hidden; resource publication, verified native theme screenshots and pixel parity remain pending. The Phase 1 account of an unavailable store below is retained as historical evidence, not current connection status.

Date: 2026-10-15, Africa/Casablanca. Commit: `49b87cf`.

**No Shopify-side pixel comparison has been run.** The owner explicitly selected “Continue with local baseline; connect Shopify later.” There is no connected development store, uploaded test theme, imported native dataset or Shopify screenshot set. No measured differences or zero-difference claim can be produced.

## Available evidence

- [Local baseline index](qa/baseline/index.html): 82 working local screenshots at widths 390/768/1280/1536; four actual local `/password` 404 responses; two desktop mobile-menu cases not applicable.
- [Baseline provenance](qa/baseline/README.md), [manifest](qa/baseline/manifest.json), [source/data hashes](qa/source-manifest.json).
- [Native ZIP inspection](qa/phase1/static-checks.json): existing native ZIP has valid roots, 92 files, passes ZIP integrity and matches source. This does not prove merchant-upload acceptance.
- [Audit](AUDIT.md): local runtime and static findings, 17 passing tests, Theme Check zero reports, mobile local Lighthouse 95/96/96 performance and 100 accessibility. None is a Shopify parity test.

No files were placed in `qa/shopify` to impersonate a native capture. The directory and its screenshots will be created only when a real store is available.

## Differences: observed versus predicted

Observed local-vs-Shopify differences: **unknown; native side unavailable**. The following are source-established parity risks, not measured screenshot results:

| Cause | Type | Expected impact / required reconciliation |
|---|---|---|
| Local injected preview notice | Preview code | Notice exists only locally; explicitly approve its exclusion from native visual comparisons. Do not add development warnings to the merchant theme |
| Font_face removed by local renderer; CSS root defaults override saved design settings | Code + font configuration | Native font loading may change text shape/wrapping; fix cascade under G1, then compare real font output before accepting parity |
| Local seed resolves all fixtures; native resources must exist and be published to the storefront | Store data | Category tiles, product rows, pins, links and search can be empty after ZIP upload alone. Match handles, tags, variant options/prices, photos, metafields and collection membership |
| Seeder intentionally drafts products/unpublishes pages | Store data/setup | Seed completion does not make the native storefront match the local catalog. Make demo resources available only on the password-protected test development store and chosen channel; leave production untouched |
| Images in seed/images are not embedded product/collection database images in native ZIP | Store data/CDN | Upload/associate the logged images and collection banners. Expect CDN encoding/cropping differences; classify them only after measured comparison |
| Local renderer always uses theme layout and has no password route | Preview code | Current `/password` screenshot is a 404, not native password baseline. Capture real password layout and approve the correct baseline before claiming parity |
| Local forloop.parentloop output produces duplicate filter IDs | Preview rendering / compatibility | Black label selects Availability locally. Shopify documents this parent-loop feature, so the same native defect is not established. Resolve identifier portability and compare label behavior on both sides |
| Local recommendations/search/filtering/cart use approximate deterministic logic | Platform/data | Real native indexing, publication, inventory, relevance, recommendation configuration, currency and discounts can differ. Configure data, then distinguish a data difference from a theme bug |
| Local fonts/clock/currency/service content differ from Shopify globals | Environment/platform | Match browser engine, timezone, currency, locale and viewport. Document unavoidable platform banners or services explicitly rather than ignoring arbitrary regions |
| Theme editor load/unload behavior | Code | Confirmed synthetic failures require actual editor verification; normal page screenshots do not establish editor parity |

## Pending merchant-upload procedure

1. Connect or create a fresh password-protected Shopify development store. This has not happened; a domain/account connection is still required later.
2. Apply only approved code fixes. Build the native ZIP with `bash scripts/package.sh`; it currently stops because article/blog templates required by the brief are missing. Keep the complete-project friend ZIP separate.
3. Upload that exact native ZIP through **Online Store → Themes → Add theme → Upload ZIP**, recording the ZIP SHA-256, upload result and native theme ID. Preview the unpublished uploaded theme; do not substitute `theme dev` for the merchant-upload test.
4. Import the chosen seed route once, upload/associate the images/metafields, match product options/tags/prices, collections, menus, content, navigation, recommendation settings and template assignments. Resolve real variant IDs by product handle/options; fixture ID 1303 is not portable.
5. Make the matching test resources available to the development storefront, preserving its password. Record exact data/publication/config state; all products must be storefront-accessible for this visual comparison.
6. Capture native screenshots into `qa/shopify` at the baseline widths/heights (390/768/1280/1536 × 900, DPR 1), same Chromium, locale, timezone and motion preference. Unlock the storefront once per context as needed. Password capture uses a separate locked context; do not confuse the unlock screen with a missing route.
7. Match the states below, not just URLs. Product must switch to Taupe/Wide, gallery state/history must match, cart must contain one Line tote Taupe/Wide, and search term is bag. Native recommendation differences require explicit data/config evidence.
8. Pixel-diff with Playwright snapshots or pixelmatch, recording threshold, dimensions, mismatched pixel count/ratio and an actual diff image for every pair. Preserve originals. Do not mask content/layout differences to force a pass. Version/platform/currency/date differences must be listed and justified separately.
9. Record every difference with screenshot pair, source/data cause, correction and retest. Approval requires all MUST-NOT-LOSE content present and only explicitly accepted data/platform differences remaining.

## Native capture matrix — every cell pending

| Required state | 390 | 768 | 1280 | 1536 |
|---|---|---|---|---|
| Home | Pending | Pending | Pending | Pending |
| Collection, filters open | Pending | Pending | Pending sidebar | Pending sidebar |
| Product, variant switched | Pending | Pending | Pending | Pending |
| Populated cart drawer | Pending | Pending | Pending | Pending |
| Populated cart page | Pending | Pending | Pending | Pending |
| Search initial | Pending | Pending | Pending | Pending |
| Search results | Pending | Pending | Pending | Pending |
| General content page | Pending | Pending | Pending | Pending |
| Contact | Pending | Pending | Pending | Pending |
| 404 | Pending | Pending | Pending | Pending |
| Password | Pending, local reference invalid | Pending, local reference invalid | Pending, local reference invalid | Pending, local reference invalid |
| Header Shop menu open | Pending mobile equivalent | Pending mobile equivalent | Pending image menu | Pending image menu |
| Mobile navigation open | Pending | Pending | Not applicable | Not applicable |
| Footer | Pending | Pending | Pending | Pending |

Supplemental local states (philosophy, FAQ, quick view, zoom, predictive search, empty cart, collections list and policy) must be repeated to preserve that evidence. Native gift card/account, actual reviews, Markets and editor/service states need their own valid data and are not proved by the local fixture.

## Honest completion status

Fresh store: not created/connected. Merchant ZIP upload: not performed. Native seed import/publication: not performed. Shopify screenshots: none. Pixel diffs: none. Native editor and E2E/checkout/form delivery: not tested. Phase 1 code audit is reviewable; the live parity portion remains blocked until the store connection is available. No runtime token or credential is included in these reports.
