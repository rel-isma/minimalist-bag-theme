# Phase 2 — local fixes and review evidence

Date: 2026-10-15, Africa/Casablanca. Phase 1 fixes approved by the owner. **Local fixes are implemented; Shopify parity and native acceptance are still pending.** No Shopify store was connected, uploaded to, imported into or published. No Phase 3 E2E or Phase 4 cleanup was started.

## What changed

- G1: dynamic colors, font selection and width declarations now take precedence over fallback CSS. Local fallback stacks retain the original design. Real Shopify font appearance still needs approval on the development store.
- G2: reloaded fade-up content initializes and selected content is revealed; product/recommendation/history work is aborted on unload; collection media listeners and dialog locks are cleaned up. Closing one modal preserves another open modal’s lock. Selected hidden/collapsed blocks are revealed temporarily, then their state is restored.
- G3: the default footer layout is represented by editable Text, Links, Newsletter, Social, Payment and Localization blocks. Social/localization remain conditional. All published policies are deduplicated, Contact has a page-based fallback, native forms/payment icons are used, and copyright uses shop.name. Removing all content blocks no longer resurrects defaults.
- G4: required article/blog templates and main sections exist. Password explicitly selects its dedicated layout. Singleton/context restrictions, addable presets, scoped IDs, FAQ block attributes and existing main-page/cart/contact/password copy controls were added. Content sections are kept out of header/footer groups, and endpoint helpers remain deliberately non-addable.
- G5: filter-label IDs are portable, the comparison table can be scrolled with a keyboard, predictive HTML/ARIA nesting is corrected, header logo styling is no longer a body style tag, and changed variant images update alt text. Standalone text buttons have 44px targets. The announcement retains its original visible geometry with a tested 44px invisible hit area. The final CSS does not expose the progressive sorting fallback.
- G6: the local renderer respects the JSON-selected layout, `/password` now renders, localization posts remain honestly connection-required, and local favicon probing is quiet. The shipping bar is hidden for non-base presentment currencies rather than reusing an invalid base-currency promise. Large variant catalogs and real Markets behavior remain unverified.
- G7: the requested shell packager is the single release gate, npm delegates to it, development files are explicitly ignored, and the native ZIP is verified. No theme files were deleted and no release tag or GitHub push was made in this phase.

The seven planned groups were committed separately, with additional focused commits for edge cases found in validation rather than folding them into unrelated changes. The final G7 commit contains the packaging/documents/evidence.

## Recorded fix commits before G7

```text
0500f30 Fix G1: honor saved theme design settings in the CSS cascade
3e23a06 Fix G2: restore section visibility and clean up editor interactions
bab8260 Fix G3: provide editable native footer blocks and policy localization controls
d393414 Fix G4: complete required templates and scope theme editor sections and blocks
877e3dd Fix G5: correct filter labels keyboard access touch targets and markup
85c7c28 Fix G6: render native preview layouts and guard shipping currency promises
f4910b2 Fix G3 follow-up: respect removal of all footer content blocks
b26bbdc Fix G4 follow-up: restrict content presets to appropriate editor locations
acf8de2 Fix G2 follow-up: preserve modal scroll locks and selected block visibility
9eda80f Fix G5 follow-up: enlarge announcement hit area without changing the layout
c201e19 Fix sorting fallback visibility while retaining larger link targets
```

## Validation

- 20 passing existing/extended tests: 13 store tests and seven seed tests. Catalog constraints still verify 22 products, 52 variants, eight collections, two menus, four pages and 56 images.
- Theme Check: zero reported errors/warnings; [output](qa/phase2/theme-check.json).
- [Design setting probe](qa/phase2/settings.json): changed CSS tokens are actually applied.
- [Editor probes](qa/phase2/editor.json) and [modal/selection edge probes](qa/phase2/editor-edges.json): content visibility restored and scroll locks released/preserved correctly. These are synthetic browser events, not the Shopify editor.
- [Accessibility/semantic HTML probes](qa/phase2/accessibility.json): no axe violations in the targeted current mobile homepage run; Black selects the color filter; duplicate IDs are gone; comparison table responds to keyboard scrolling; selected semantic HTML checks pass on home/product/search/contact/predictive responses. This is not an exhaustive HTML/WCAG certification.
- [Shopping regression](qa/phase2/store-browser-results.json): cards/filters, variants, quantities, add/update/remove, notes, empty cart, page routing and native form fallback; no uncaught JS errors.
- [Capture index](qa/phase2/index.html): 86 current screenshots at 390/768/1280/1536px, two desktop mobile-menu cases not applicable; current password captures use the dedicated layout.
- [Content preservation](qa/phase2/preservation.json): every baseline heading and product-card count preserved across all 82 comparable states, no broken completed images, no horizontal overflow and no uncaught JS exception recorded. Other checklist requirements were reviewed by source and targeted probes, not falsely certified by a heading count alone.

## Fresh local mobile Lighthouse

| Page | Performance | Accessibility | LCP | CLS |
|---|---:|---:|---:|---:|
| home | 91 | 100 | 2.6 s | 0 |
| collection | 96 | 100 | 2.6 s | 0 |
| product | 97 | 100 | 2.4 s | 0 |

All meet the requested 85+/95+ local targets. Full results are in [qa/phase2/lighthouse](qa/phase2/lighthouse/results.json). Home/product were measured after the announcement layout correction; collection was measured again after correcting sorting fallback visibility. No Shopify fonts, apps or platform services are represented by those scores.

## Visual comparison — differences are not hidden

Pixelmatch compared 82 original working references with the fixed local rendering, threshold 0.1 and antialias exclusion. **52 pairs are pixel-identical; 30 differ.** The pair list includes raw pixel counts, ratios, before/after dimensions and actual diff files. Unequal sizes are padded, never scaled. Nothing was masked to force a pass.

- The announcement height and text/menu layout are preserved; desktop header-menu screenshots match.
- Larger Close, Enlarge and View full details/link-button targets intentionally affect modal/link-row geometry. The default homepage height changes by 15–18px through the shop-the-look link row. Typography, palette, images, product counts and section order are retained.
- Predictive search uses valid price-wrapper markup, with corresponding result/dialog layout changes.
- Footer images have the same dimensions/content but small element-capture pixel rounding differences; the rounding cause is inferred from visual review, not a native parity measurement.
- The original 390px zoom reference captured before the zoom image decoded. It is not a valid fully loaded zoom reference. The current runner explicitly awaits dialog image decoding. Both original and current evidence are retained; the bad original is not silently replaced.
- Four password references were invalid local 404 responses; the new working local password page is not compared as if the original were a password screen. Two desktop mobile-menu states are not applicable.

Review [the visual index](qa/phase2/index.html) and [every measured pair](qa/phase2/local-diffs.json) before adopting the current captures as a revised reference. This is **local before/after**, not the requested local-vs-Shopify comparison, and it is not a zero-visual-difference claim.

## Candidate native ZIP

- File: `dist/atelier-vane-theme.zip`; 96 native files, 796,242 bytes.
- SHA-256: `1518bd351fa386f1d7961158d72b938a3222268348803f23fd16463f339d67fc`.
- Integrity and every archived member match the final source manifest. Root directories contain native theme files only; no seed data, qa, docs, scripts, node_modules or Git metadata. Optional blocks/ is supported by the packager but unused in this theme.
- [Package evidence](qa/phase2/package-manifest.json), [preflight](qa/phase2/package-check.json), [final native source hashes](qa/phase2/source-manifest.json).
- This is a review candidate, not a Shopify-certified release. Merchant upload, seed import/publication, real editor and checkout checks have not been performed. The older complete-project ZIP is a separate developer bundle and is not updated/certified by this native package.

## Finding disposition and remaining gates

| Findings | Local disposition | Remaining native proof |
|---|---|---|
| F01 | Cascade fixed and browser-probed | Real font loading/appearance and editor changes |
| F02–03 | Lifecycle, visibility, cleanup and modal edge probes pass | Actual editor add/remove/reorder/select/deselect |
| F04 | Requested footer contracts implemented with conditional defaults | Published policies, contact, payments, delivery and Markets |
| F05–07 | Templates, placement, presets, IDs and FAQ inspector attributes implemented; package/Theme Check pass | Merchant ZIP upload and real editor workflow |
| F08–11 | Filter, keyboard/table, hit-area and semantic probes pass | Native filters, actual media and broader device/a11y validation |
| F12 | Existing copy controls/section ownership improved | Merchant editing of all real content and native previews |
| F13 | Local password/layout mismatch repaired; local limitations kept explicit | Full development-store data and same-state pixel comparison |
| F14 | Incorrect cross-currency shipping promise prevented | Real Markets, shipping rules and large-variant catalogs still unverified |
| F15 | Single packager and ignores implemented | Merchant upload result |

No full unused-code deletion or coverage certification is claimed. Required templates, endpoint sections, addable presets and MUST-NOT-LOSE components remain. Phase 4 still requires its separate dry-run report and explicit removal approval.

## Stop point

Phase 2 local changes are ready for review. Native parity cannot be completed while store connection remains deferred, as the owner requested. Approval of this local report must not turn pending native checks into passes. Phase 3 E2E and subsequent cleanup/release tagging remain gated by the brief. The temporary QA preview is stopped after verification.
