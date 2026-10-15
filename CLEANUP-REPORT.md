# Phase 4 — cleanup dry run

Date: 2026-10-15, Africa/Casablanca. Native candidate: `504b15f`.

**No theme file, selector, setting, translation or demo record has been removed.** This is the approved next phase's inspection report. Removal requires the owner's decision on the candidates below. Native E2E and parity remain blocked as recorded in [E2E-REPORT.md](E2E-REPORT.md); local coverage does not resolve that gate.

## Method and evidence

- [Reference graph](qa/phase4/reference-graph.json): all 96 native files, SHA-256 hashes and 99 file-reference edges from literal render/include/section/section-group calls, asset URLs, JSON section/layout declarations and literal JS section endpoints. All extracted targets exist. Dynamic app-block rendering is recorded separately. Implicit default layouts, Shopify-provided objects and runtime resource IDs cannot be resolved as literal file edges.
- The graph also records 135 global/section/block setting declarations, 57 locale leaves, 37 named JavaScript function/arrow declarations, 91 comments and exact duplicate file hashes. All 135 settings have a direct settings-property reference in the scanned scope; that is source evidence, not editor acceptance. No named-function candidate with only its declaration was found; callbacks, runtime branches and dynamic entry points cannot be proved dead by occurrence counts.
- CSS class tokens were compared with non-CSS native code after excluding schema definitions, then checked against observed DOM tokens, schema-generated wrappers, interpolated classes, JavaScript class updates and the local renderer. This is deliberately a candidate scan, not a complete Liquid/JS parser or a safe automatic purge.
- Playwright sampled local routes at 390px and 1280px, with scrolling, hover, header/mobile menus, predictive search results/no results, filters, quick view, variant selection, zoom, populated cart/quantity/remove, FAQ, browser form validation, keyboard focus, synthetic section events and the explicitly synthetic review-control fixture. [Coverage and action results](qa/phase4/coverage.json), [raw ranges](qa/phase4/coverage-raw.json), [reproduction instructions](qa/phase4/README.md).
- [Fresh Theme Check](qa/phase4/theme-check.json): zero errors/warnings (`[]`). [Preservation check](qa/phase4/preservation.json): every one of the 96 native hashes matches Phase 2, and the native ZIP hash is unchanged. This is not a post-deletion parity result: no deletion occurred.

The collector was corrected during this audit for its Playwright/V8 data format, document-scoped counters and three action-locator/state issues. Earlier attempts are not used as successful coverage evidence. Final artifacts record the corrected run. Source-character coverage measures observed rule/execution ranges; an executed outer function does not make all of its inner branches covered, and a matched CSS rule does not prove each selector/declaration is used.

The final run completed **40 page visits across 20 routes at two widths**, with zero navigation failures, action failures or uncaught JavaScript errors. All four CSS and six JS files were measured and their captured source hashes match the workspace. These are sampler results, not an assertion that all behavior was tested.

| Asset | Observed source-character coverage |
|---|---:|
| `assets/base.css` | 56.68% |
| `assets/catalog.css` | 87.34% |
| `assets/header.css` | 84.18% |
| `assets/store.css` | 82.82% |
| `assets/theme.js` | 57.69% |
| `assets/product.js` | 86.52% |
| `assets/reviews.js` | 90.93% |
| `assets/cart-drawer.js` | 74.95% |
| `assets/catalog.js` | 79.82% |
| `assets/header.js` | 81.60% |

## File candidates for a removal decision

| ID | Path | Why it looks unused | Confidence unused | Risk and recommendation |
|---|---|---|---|---|
| C01 | `assets/demo-hero.webp` — 98,180 bytes | No native Liquid/JSON/JS reference. Hero fallback uses the separate 750/1100/1600 derivatives. The image log references this original for provenance only. | High in current source | Low for current saved theme; external/merchant Custom Liquid references are unknown until store review. Candidate for explicit approval. Keep all responsive derivatives. |
| C02 | `assets/demo-story.webp` — 76,710 bytes | No native reference. Philosophy fallback uses the separate 480/750/1200 derivatives. Documentation retains the original asset's provenance. | High in current source | Low for current saved theme; same merchant/external-reference caveat. Candidate for explicit approval. Keep all responsive derivatives. |
| C03 | `assets/demo-look.webp` — 105,172 bytes | No native reference. Shop-the-look fallback uses the separate 480/900/1600 derivatives. Documentation retains provenance. | High in current source | Low for current saved theme; same merchant/external-reference caveat. Candidate for explicit approval. Keep all responsive derivatives. |

These total **280,062 uncompressed source bytes**. No ZIP saving has been measured. Approval of C01–C03 would authorize only those exact three paths, not the visible fallback imagery, seed photos or an entire directory. A later removal commit must update affected documentation, rebuild the package and verify visual preservation; native parity/E2E would still be pending until connected.

## Candidates needing more evidence — defer removal

| Group | Paths / scope | Why flagged | Confidence unused | Risk and decision |
|---|---|---|---|---|
| C04 | `assets/base.css`, `catalog.css`, `header.css`, `store.css`; individual class selector branches listed as CSS IDs in the appendix | 83 class tokens lack an exact non-CSS native token under the heuristic scan. Some are historical product/Color Story/Detail Close-ups/sticky-cart styles; three are known false positives, explicitly protected below. | Medium for remaining entries; false for protected entries | Medium/high. Never remove whole files or a shared selector rule from this scan. Merchant content, Custom Liquid, native/editor states and utility classes need review. Defer all CSS removal until full native coverage and parity can be rerun. |
| C05 | `locales/en.default.json`; LOC IDs in appendix | 33 of 57 leaves have no literal translation call or schema `t:` reference. Current code often uses literal copy instead. | Medium | Medium/high for dynamic translations and plural parent keys. Defer; inspect each key and all parent/schema references before approval. Do not remove the locale file. |
| C06 | `templates/page.json`, `page.privacy.json`, `page.refund.json`, `page.shipping.json`, `page.terms.json` | The five files have identical bytes. | High that content is duplicated; not evidence of disuse | High. Keep required `page.json` and every alternate template pending actual merchant assignment review. Template names are a platform/content contract; identical content does not make them safely interchangeable. |
| C07 | `assets/base.css:1` introductory comment | Still calls this a single-product theme despite the current multi-product catalog. | High that wording is stale | Low. Optional comment-only correction; no CSS declaration removal. Descriptive comments elsewhere are not treated as commented-out code. |
| C08 | `seed/legacy-images/` — 15 archived JPEGs | Not native runtime assets; retained as documented originals/intermediates. | High that they are outside native ZIP/runtime | Medium archival/provenance risk, no native package benefit. Keep unless the owner separately requests archive removal; retain image-log history. |

[The candidate appendix](qa/phase4/CANDIDATES.md) gives the exact path/class or locale key, evidence, confidence and risk for every CSS/locale item. CSS row IDs identify review units, not approved deletion ranges. Generic heading/spacing utilities are explicitly higher risk.

## False positives and protected content

- `sections/quick-view.liquid`, `predictive-search.liquid` and `recent-product-card.liquid` are fetched through JavaScript `section_id` requests. They have real incoming endpoint edges and must stay. Product recommendations use the configured section's runtime ID; the graph does not mislabel that dynamic request as a missing literal file.
- `sections/newsletter.liquid` and `custom-liquid.liquid` have no saved-template incoming edge but have addable presets. They must stay. [The appendix](qa/phase4/CANDIDATES.md) lists **all 16 preset sections** for the owner's review; none is proposed for deletion.
- `.atelier-header-section` is generated from the header schema's `class`; `.header-menu--mobile` comes from `header-menu--{{ mode }}`; `.local-preview-notice` is inserted by `seed/preview-liquid.mjs`. These three class-scan hits are confirmed false positives. Keep their styling, including the documented local preview marker on MUST-NOT-LOSE.
- Keep required templates, native gift-card/password states, product media/app/dynamic-checkout paths, empty-resource fallbacks, localization/payment/policy controls, authentic-review behavior and all [MUST-NOT-LOSE](qa/MUST-NOT-LOSE.md) components. Lack of fixture data is not disuse.
- The nine responsive `demo-*.webp` derivatives are referenced fallbacks and remain visible when merchant images are unset. The 56 seed catalog images and shared seed data are required for the reproducible friend/local preview and later import. AI placeholders and unverified shipping/leather/fit claims remain in [REPLACE-BEFORE-LAUNCH.md](REPLACE-BEFORE-LAUNCH.md); removing them in this phase would change approved content/design.
- No font binary files exist in native assets. Font pickers use Shopify-generated `font_face` output; do not delete those settings or fallback font stacks because local font loading is approximated.
- No `console.log`, `TODO` or `FIXME` hits were found in the 96-file native scan. The 91 comments are design headings, explanatory annotations and snippet contracts; review found no abandoned commented-out executable block to remove. No exact duplicate JS asset files were found. Similar dialog/lifecycle code is not approved for refactoring during this cleanup.

## Coverage limits and remaining gates

This is **partial local coverage**, not the requested coverage across every page/state in Shopify. Actual editor interactions, article content, gift-card objects, apps, video/external media, native discount/shipping/form states, Markets/payment methods, all merchant content and all setting combinations are unavailable. The review fixture demonstrates synthetic controls only. Card/quick-add submission and every loading/network-error branch were not exhausted in this coverage sampler; earlier local shopping tests are separate evidence. Two viewport widths do not replace the four-width visual parity matrix.

Do not infer “unused” from an uncovered range, and do not certify that all unused code is gone. Native E2E and parity have not passed. The highest-confidence source candidates are C01–C03; C04/C05 need the missing native/content evidence. No production store was modified, no native cleanup was committed, no push/publication/release tag was made, and Phase 5 has not started.

## Approval boundary

The audit brief says: **“For each candidate give: path, why it looks unused, confidence, risk. Wait for my approval. Then delete in a separate commit, and re-run theme check, E2E tests and the parity diff. No visual difference allowed.”**

Stop here for the owner's candidate decisions. Approval to inspect this phase is not approval to delete every scan hit. If C01–C03 are approved, remove only those files in a focused commit and perform the available local checks; keep native acceptance explicitly pending. Keep deferred/protected candidates unless separately approved with the missing evidence resolved.
