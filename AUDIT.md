# Phase 1 audit — Atelier Vane

Date: 2026-10-15, Africa/Casablanca. Source commit: `49b87cf`. Scope: report only, following approval of Phase 0. The owner has explicitly deferred Shopify connection. No existing theme, seed data or preview-server files were edited; no deletions, fix commits, store writes or release tag were made. New reports, audit runners and the expressly requested `scripts/package.sh` are review artifacts. The new packager was run only with `--check`; no replacement release ZIP was produced.

**Disposition: NOT ready to claim Shopify parity or complete theme-editor support.** The existing local design is preserved, static Theme Check passes, and local Lighthouse meets the requested numerical targets. Confirmed settings/editor defects, missing footer controls and missing templates need approved fixes. Native Shopify import, editor and checkout evidence remains unavailable. See [PARITY-REPORT.md](PARITY-REPORT.md).

## Evidence and interpretation

- Approved preservation baseline: [INVENTORY.md](INVENTORY.md), [MUST-NOT-LOSE](qa/MUST-NOT-LOSE.md), [screenshot gallery](qa/baseline/index.html).
- Audit tool versions: [tool-versions.json](qa/phase1/tool-versions.json).
- Current source/limit/package scan: [static-checks.json](qa/phase1/static-checks.json).
- Theme Check output: [theme-check.json](qa/phase1/theme-check.json), exactly `[]` (zero reported errors/warnings).
- Existing test suites: [10 store tests](qa/phase1/store-tests.txt), [7 seed tests](qa/phase1/seed-tests.txt), [catalog validation](qa/phase1/seed-validation.txt), all pass. These are local or mocked tests, not Admin API/Shopify E2E tests.
- Local Playwright + axe-core + HTML Validate: [browser-audit.json](qa/phase1/browser-audit.json). Nine routes at 390/1280px; synthetic DOM/editor-event probes are explicitly labeled. Phase 0 additionally covered 768/1536px and open states.
- Fresh mobile measurements: [Lighthouse results](qa/phase1/lighthouse/results.json). No competing browser workload ran during these measurements.
- Official documentation was checked on the audit date. Platform limits, Theme Store submission rules, and the owner's additional requirements are distinguished below; a custom uploaded theme is not automatically subject to every Theme Store submission rule.

## Findings requiring approval

| ID | Priority / certainty | Finding, evidence and consequence | Proposed fix group |
|---|---|---|---|
| F01 | High / confirmed | `layout/theme.liquid:19–40` and `layout/password.liquid` emit dynamic `:root` design values **before** `assets/base.css:6–47`, whose later rules override them. A browser probe changed the earlier declaration to background `#123456`, width `1440px`, body `monospace`; computed values remained `#F5F1EA`, `1320px` and the hardcoded font stack. Color, width and typography editor controls do not reliably affect the storefront. | G1: correct cascade order/default ownership. Preserve the approved initial palette and proportions. Verify chosen font appearance on native Shopify before accepting any typography difference. |
| F02 | High / confirmed synthetic reproduction | `assets/theme.js:7–38` initializes `.fade-up` only on DOMContentLoaded. Cloning/reloading the Our philosophy section, removing old visibility state and dispatching editor load/select leaves content at opacity 0. Merchant edits can make content disappear until page reload. The hero has no `.fade-up` and passed the same probe; that is not evidence that all sections work. | G2: scoped load initialization, cleanup and selection visibility for animated sections. |
| F03 | High / confirmed synthetic reproduction | `assets/product.js` and `assets/catalog.js` do not handle section unload. Removing a product while zoom is open, or a collection while filters are open, leaves `body.style.overflow = hidden` with zero dialogs remaining. Product recommendations/recent requests and collection media listeners also lack prompt unload cleanup. Header does implement load/unload cleanup, but there are no section/block select/deselect handlers anywhere. | G2: close/release on unload; abort scoped work and detach listeners; appropriate select/deselect handling. Native accordions do not need redundant initialization, but selecting a collapsed FAQ/material block should reveal it. |
| F04 | High / confirmed source gap against brief E | Footer has no blocks, social output or localization form. It lists only three specific policies, contact depends on the menu, and copyright uses editable brand_name rather than shop.name. Empty social settings already exist but are unused. This fails the requested footer contract, although these are not all universal Shopify upload requirements. | G3: editable footer blocks for the requested content types, all published policies, stable Contact fallback, conditional social/localization, and shop.name copyright. Match the current default footer and leave new conditional controls hidden until data warrants them. |
| F05 | Medium / confirmed | `templates/article.json` and `templates/blog.json` are absent. All other templates specified in the brief exist. The requested package check refuses release on these two missing files. | G4: minimal native blog/article support using the existing design; no new navigation or promotional feature. |
| F06 | Medium / confirmed | Header, announcement and footer have no presets, so the existing JSON instances do not give merchants the promised add/remove workflow. Product recommendations/recently viewed also lack presets. No section has enabled_on/disabled_on. Several IDs are fixed (`BrandStory`, `Faq`, contact fields, QuickViewTitle, cart IDs); duplicating or placing inappropriate sections can collide. | G4: add/restrict merchant-facing presets where needed, limits for singleton components, scoped IDs. Keep mandatory main sections and AJAX helper endpoints deliberately controlled; do not blindly add every helper to the picker. |
| F07 | Medium / confirmed | FAQ blocks in `sections/faq-accordion.liquid:14–23` are rendered through a snippet without `block.shopify_attributes`; the snippet does not output them either. Individual question blocks lack preview-inspector identification. Other block-bearing sections contain the required attributes. | G4: pass/output FAQ block attributes on the actual accordion wrapper, retain question layout and native disclosure behavior. |
| F08 | Medium / confirmed local, native unknown | Local collection output repeats `Filter-main--1` through `--5`; clicking the Black label toggles Availability instead. `snippets/collection-filters.liquid` uses `forloop.parentloop.index`, which Shopify documents as valid; local LiquidJS does not reproduce it in this render. This is a confirmed local preview defect, **not a proven Shopify defect**. | G5: use an explicit outer-loop identifier or correct local renderer semantics; retain unique section/filter/value IDs in both environments and retest native Shopify. |
| F09 | Medium / confirmed automated local | Current axe-core flags `.comparison-table-wrap` on the 390px homepage as `scrollable-region-focusable`: the horizontally scrolling comparison table lacks keyboard access. Lighthouse's bundled accessibility engine does not flag it. | G5: focusable, labeled scroll region and visible focus; preserve table layout and horizontal overflow behavior. |
| F10 | Medium / measured against owner's 44px rule | Standalone announcement CTA measures 129×28px; some View all / product-detail link buttons are about 21px high. Most bag/search/filter/swatch/stepper controls are 44px or have a 44px label. These small independent actions fail the brief's 44px target requirement; an axe AA pass does not establish that stricter criterion. Inline prose links need separate judgment rather than padding every word. | G5: enlarge actual hit regions without overlapping neighbors or changing typography. Recheck at every baseline width. |
| F11 | Medium / source + validator evidence | `sections/header.liquid` emits a style element inside the section's body div; HTML Validate flags its placement. `sections/predictive-search.liquid:9` wraps `render 'price'` (a div) in a span, an invalid content model that the browser can repair differently. Generic spans receive aria-label on cart count/current-page pagination. | G5: valid element nesting, scoped style/custom property delivery, appropriate text/ARIA semantics. Preserve visual output. |
| F12 | Medium / confirmed editability gaps | Main cart/contact/password/page sections have no section settings; many labels, guidance strings, headings, main-product eyebrow and cart messages are hardcoded or only in locale files. FAQ and philosophy pages use section copy and ignore admin page bodies. Not all visible content is directly editable through the theme editor as requested. | G4: expose the necessary existing copy/options without adding a second competing source of visible content. Keep product metafields, page content and locale ownership explicit. |
| F13 | Medium / confirmed data/renderer parity constraint | Local preview auto-resolves fixture data, always uses theme layout, suppresses font_face/content_for_header, has no native password route and injects a local notice. Seed API deliberately leaves products draft and pages unpublished. Uploading the ZIP alone therefore produces missing/empty storefront resources and different platform behavior. | G6 + store setup: preserve accurate local limitations; resolve/import/publish only the development-store demo resources and configure Shopify before parity capture. Password preview work is a local tooling fix, separate from any native password defect. |
| F14 | Medium / store-dependent risk | Free-shipping threshold is one number in “store currency,” multiplied by 100 and compared with Liquid cart totals. There is no market-specific threshold/conversion strategy. Multicurrency correctness is unverified. Product/card data serializes `product.variants`; large Shopify catalogs/variant sets may exceed the demo's assumptions. | G6: test supported Markets/variant configurations on the dev store and document scope; fix only demonstrated gaps. Do not claim multicurrency or large-variant readiness from this 52-variant fixture. |
| F15 | Low / confirmed | `.shopifyignore` predates `qa/`, `INVENTORY.md` and the new audit reports/scripts. Explicit packaging is safe, but CLI tooling should have an explicit development-file exclusion policy. Original `seed/package-theme.mjs` lacks the comprehensive release gates of the requested shell wrapper. | G7: consolidate packaging/ignore rules after approval; keep full-project friend ZIP distinct from Shopify-upload ZIP. |

## A. Packaging and documented limits

Existing `dist/atelier-vane-theme.zip` is a valid native-only archive: **92 entries, 790,308 bytes**, seven native directories, no corrupt member, and byte-for-byte matching current native source. It contains no seed/qa/docs/dependencies/Git files. Optional `blocks/` is absent because this theme has no theme block files. The 27,930,079-byte **complete-project ZIP** is a friend/developer bundle with a parent folder and demo data; it must not be uploaded as a Shopify theme.

The requested [scripts/package.sh](scripts/package.sh) is supplied as a new, reviewable packaging utility. Run `bash scripts/package.sh --check` for validation only; default mode would write `dist/atelier-vane-shopify.zip`. It whitelists native directories including optional blocks, rejects symlinks, validates JSON/references/block counts, checks the required-by-brief file list and size limits, and integrity-checks the ZIP. Its current check intentionally fails for F05. It was **not** used to create a release. It supplements, not replaces, Theme Check and Shopify upload verification.

| Verified limit | Current theme | Result |
|---|---|---|
| Compressed upload 50 MB; total non-asset code 250 MB | 790,308-byte native ZIP; 139,218 non-asset bytes | Within limits |
| 100,000 files; 1,000 JSON templates | 92 native files; 16 JSON templates | Within limits |
| 25 sections/template; 20 groups; 25 sections/group | Maximum 10/template; two groups; maximum two sections/group | Within limits |
| 50 blocks/section; 1,250 blocks/template/group | Maximum nine saved blocks/section; schema review limit 50 | Within limits |
| 300 theme block files; nesting depth eight | No blocks/ directory or theme block nesting | Not used |
| Template/group/settings schema 512 KB; settings data/locales 1.5 MB; Liquid 256 KB | Largest template 6,983 bytes; largest Liquid 7,755 bytes; all checked files below limits | Within limits |
| Schema section/block names 25 characters | Existing schema names fit | Within limits |
| Asset size 20 MB in Theme Check's MaxFileSize rule | Largest asset 105,172 bytes | Within limit |

Limits verified against [Shopify Theme limits](https://shopify.dev/docs/storefronts/themes/architecture/limits) and [MaxFileSize](https://shopify.dev/docs/storefronts/themes/tools/theme-check/checks/max-file-size). The shell utility uses conservative full Liquid file byte sizes; Shopify's checker may exclude embedded schema bytes. Future theme blocks would need full nesting validation in addition to this wrapper.

## B. Templates, saved configuration and resources

- All specified templates except article/blog exist; all saved JSON section types resolve to real section files, JSON parses, and saved section/block counts fit the limits. `gift_card.liquid` exists with layout none.
- `config/settings_schema.json` and `settings_data.json` exist. Current palette, fonts, page width, brand and cart settings are saved. Template section order/content and header/footer groups also form part of the saved design; preserving settings_data alone is insufficient.
- No literal `shopify://` resource URLs or `gid://` IDs were found in the native theme. Saved handles are intentional data references: six category collections, new/featured rows, two product pins, main-menu and footer. They must resolve against real destination-store data.
- Header/footer group instances select main-menu/footer, but the actual schema `link_list` declarations have no defaults. Fix F06 should supply defaults in the supported handles; Shopify documents these choices in [input settings](https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings#link_list).
- Product, image, collection and menu missing-resource branches are present (unavailable/placeholder/Shop all/empty collection). Local tests exercise key cases. No native missing-resource validation has occurred; decorative color circles and Compare/From states still need real Shopify objects.
- Blog/article are required by this brief and also by [Shopify Theme Store template support requirements](https://shopify.dev/docs/storefronts/themes/store/requirements#template-support-requirements). Their absence is not described here as proof that every custom theme ZIP will be rejected on upload.
- Gift card native object, currency, enabled/expired state and print behavior are source-reviewed only. Accounts are conditionally rendered when enabled.

## C. Theme editor, schemas and lifecycle

All 29 section schemas parse. Names generally use sentence case; FAQ is an acronym and Liquid a language name, not actionable case defects. Existing schema limits fit. All 15 local block-type declarations are inventoried in Phase 0. The following 11 sections already have addable presets and must be retained:

`brand-story`, `category-tiles`, `comparison-table`, `custom-liquid`, `faq-accordion`, `featured-collection`, `hero`, `newsletter`, `product-reviews`, `shop-the-look`, `trust-strip`.

Helper endpoints `predictive-search`, `quick-view`, `recent-product-card` should not automatically become merchant-addable. Mandatory main sections should be assessed separately from optional content; their missing presets are not automatically a schema syntax error. Singleton header/footer/announcement placement and optional recommendations/history do need the requested editor workflow.

| Component | Load | Unload | Select/deselect / finding |
|---|---|---|---|
| Header + predictive search | Scoped initialization | Abort listeners/requests and close dialogs | No select/deselect reveal behavior |
| Fade-up content | DOMContentLoaded only | No cleanup | Confirmed invisible re-rendered philosophy content (F02) |
| Product options/gallery | Load supported | No dialog/scroll cleanup | Confirmed scroll lock after unload (F03) |
| Recommendations/history | Load supported; checks isConnected | Requests not aborted on unload | No editor visibility/selection handling |
| Collection/quick view/cards | Load supported; delegated forms | No coordinated unload cleanup | Confirmed filter scroll lock; media listener survives until later breakpoint change |
| Reviews | Load supported | WeakSet prevents duplicate initialization on same root, but no explicit lifecycle handling | No select/deselect visibility logic; review records remain conditional |
| Cart drawer | Delegated/global controls work on replacement | Static layout section; no editor cleanup lifecycle | Selection/reorder/remove behavior untested |
| Native accordions and product pins | Native disclosure/links do not need slider initialization | No persistent timer to clean up | Selected collapsed block is not automatically revealed; FAQ block attributes missing |

Shopify documents the need to reinitialize dynamically rendered sections, clean up unloads, identify blocks and keep selections visible in [editor integration](https://shopify.dev/docs/storefronts/themes/best-practices/editor/integrate-sections-and-blocks). Presets and placement options are described in [section schema](https://shopify.dev/docs/storefronts/themes/architecture/sections/section-schema).

Actual Shopify editor zero-console status is **not tested**. Synthetic probes demonstrate source defects, but cannot certify Shopify's app blocks, editor inspectors, resource pickers or real wrapper IDs. Phase 2 should add only meaningful lifecycle handling; no-op handlers on every event would not satisfy the intent.

## D. Section groups

PASS by source: `layout/theme.liquid` renders `{% sections 'header-group' %}` and `{% sections 'footer-group' %}`. Their JSON files contain the saved announcement/header and footer instances. Reordering those saved instances is represented correctly. Preset/placement gaps limit promised removal/re-add workflows (F06).

Cart drawer remains a static `{% section 'cart-drawer' %}` outside the groups; quick view is a layout-level dialog. These are not dead files. Do not delete or relocate them without preserving cart/quick-view behavior and approving the editor strategy.

## E. Footer acceptance matrix

This is the owner's explicit footer contract; it must not be mislabeled as a universal Shopify upload mandate. Shopify's [Dawn footer reference](https://github.com/Shopify/dawn/blob/main/sections/footer.liquid) demonstrates comparable native patterns but need not be copied or redesigned.

| Requirement | Current state |
|---|---|
| Footer section group | Present; PASS |
| Blocks for link lists/text/newsletter/social/payment/localization | None; FAIL against brief |
| link_list default footer | Group assignment yes; schema default absent |
| All published policies | Only privacy/terms/refund; no loop over shop.policies; FAIL |
| Contact link | Present with supplied menu; absent-menu fallback is only Shop all; conditional FAIL |
| Enabled payment icons, full color | Uses shop.enabled_payment_types and payment_type_svg_tag; no grayscale CSS found; PASS by source, not exercised with real enabled methods |
| Native customer newsletter, newsletter tag, success/errors | Present; PASS by source; actual delivery not tested |
| Social settings with blank defaults | Instagram/Pinterest settings exist with no placeholder URLs; no footer output |
| Country/language localization form | Absent; FAIL against brief; should show only when alternatives exist, use explicit submission and accessible labels |
| Copyright shop.name/current year | Current year yes; brand setting instead of shop.name; partial |
| Unmodified powered_by_link if used | Not used; no requirement to introduce it |
| Added tracking/cookie banner | None found in theme source; PASS |

Shopify exposes the published policy collection through [shop.policies](https://shopify.dev/docs/api/liquid/objects/shop#shop-policies). Localization uses the native form/object; see [multiple currencies and languages](https://shopify.dev/docs/storefronts/themes/markets/multiple-currencies-languages). Approval of G3 is approval to meet these specifically requested controls, preserving current defaults, not authorization to invent unrelated footer features.

## F. Quality, accessibility, performance and SEO

### Automated result summary

| Check | Result / limits |
|---|---|
| Theme Check | Zero reported errors/warnings; does not prove native parity/editor behavior |
| Existing local tests | 17 pass; no live Admin API/service calls |
| Phase 0 responsive screenshots | No recorded horizontal overflow/broken completed images/uncaught JS exceptions across the captured states; password route is 404 |
| Current local axe at 390/1280 | Serious comparison-table scrolling finding at 390 home; no other violations in the nine-route scan; incomplete/manual checks retained |
| HTML Validate recommended-rule scan | Reports 11–68 messages per page, including nonvalidating style preferences; these totals are **not counts of distinct HTML defects**. See F08/F11 and rule-by-rule qualification below |
| 44px hit targets | Not met by all independent CTA/link buttons (F10) |
| Contrast | No automated color-contrast violation in this local axe sample. Manual, real-font, hover, selected, disabled, image-overlay and native-platform state coverage is incomplete; no blanket 4.5:1 certification |
| External scripts / Sass / minified theme JS | No external script source, Sass file or minified theme JS found in native source. Injected Shopify content_for_header is platform-managed and absent locally |
| Images | Existing picture/srcset/sizes/lazy/eager paths and text alternatives reviewed. Local media objects/resize outputs are approximations. Variant fallback replacement does not update alt in the product-page edge path; verify with real differently colored media |
| SEO | Title/description/canonical/OG/Twitter in shared layout; product structured data delegates to Shopify. Password and standalone gift-card documents have their own reduced heads; native validity and structured-data richness remain untested |

HTML findings require triage: `defer="defer"`, explicit label for plus wrapped input, checkbox group names and some hidden-landmark messages are style/tool-policy issues rather than browser-breaking errors. Repeated checkbox names are intentional Shopify filter form behavior. Preserve explicit radio/label associations. The contact autocapitalize-on-email warning needs native semantic review. Do not blindly rewrite all validator output. Duplicate filter IDs are a genuine **local** defect; Shopify documents [forloop.parentloop](https://shopify.dev/docs/api/liquid/objects/forloop#forloop-parentloop), so a native result is still needed before attributing the same collision to Shopify.

Predictive result markup also needs the F11 content-model repair. The normal browser repairs invalid nesting, which is precisely why reading only the post-parsed DOM is insufficient. Alt text for real images, meaningful keyboard order, success/error announcements and touch-target geometry must be checked again after approved fixes.

### Fresh mobile Lighthouse — local approximation only

| Page | Performance | Accessibility | LCP | CLS |
|---|---:|---:|---:|---:|
| Home | 95 | 100 | 2.5 s | 0 |
| Collection | 96 | 100 | 2.6 s | 0 |
| Product | 96 | 100 | 2.7 s | 0 |

These runs meet 85+/95+ numerically for the current local renderer. They do not certify Shopify fonts, apps, platform scripts or live data. Lighthouse and the newer separately installed axe engine differ; the 100 accessibility score must not hide F09.

Browser console baseline retains 404 messages for the intentionally missing page/password route and a favicon request. No new uncaught JS exceptions appeared during local route scanning. The native password template itself exists and is not proven broken by the local routing gap. Real keyboard/screen-reader, Safari, Firefox, devices and Shopify editor testing remain pending.

## G. Shopify parity

**BLOCKED / NOT RUN.** The owner selected local preparation and has not supplied a development-store connection. No fresh store exists in this session; no merchant ZIP upload, real seed import, Shopify screenshots, pixelmatch comparison or visual parity acceptance took place. [PARITY-REPORT.md](PARITY-REPORT.md) records this explicitly with the exact pending capture matrix and expected code/data differences. A green local screenshot run cannot substitute for the requested merchant-upload parity test.

## Proposed fix commits — only after approval

| Group | Scope | Validation required before its commit |
|---|---|---|
| G1 | Design-setting cascade and verified default font/palette preservation (F01) | Change setting → visible result; initial appearance compared with approved baseline; native fonts reviewed |
| G2 | Editor lifecycle, animation/selection visibility, dialogs/scroll cleanup (F02–03) | Targeted reload/unload probes; actual editor load/select/deselect/add/remove/reorder once connected |
| G3 | Requested footer blocks, policy/contact/social/localization behavior (F04) | Current default layout screenshots; empty/multiple locales; real form and enabled-payment tests |
| G4 | Required templates, presets/placement/IDs, FAQ attributes and editable existing copy (F05–07, F12) | Schema/Template Check; duplicate-section IDs; editor content workflow; preserve optional endpoint functionality |
| G5 | Filter identifier portability, keyboard table scrolling, hit targets, HTML/ARIA/media details (F08–11) | Label interaction, keyboard/axe/HTML triage, 4 baseline widths and native Shopify objects |
| G6 | Local/native parity preparation and demonstrated Markets/data issues (F13–14) | Password/layout preview accuracy; real imported data/media/localized routes; same-state Shopify capture/diff |
| G7 | Packaging/ignore consolidation and release gating (F15) | Required-template, file/byte and ZIP-root tests; merchant upload; no development files |

One Git commit per approved fix group. Do not fold cleanup into these groups. Phase 3 native E2E tests and Phase 4 dry-run cleanup/coverage still follow their own approval gates. No unused-file deletion is authorized by static reference absence; preserve addable presets, required templates and the MUST-NOT-LOSE components.

## Approval gate

Review this report and [PARITY-REPORT.md](PARITY-REPORT.md). Approving fixes while Shopify remains deferred can authorize the locally reproducible groups, but **cannot** convert blocked parity/editor/E2E checks into passes. Your brief requires stopping after each phase, so no theme changes will begin until you approve Phase 1 and its fix scope. The already-supplied local baseline remains the preservation reference until a native baseline is approved.
