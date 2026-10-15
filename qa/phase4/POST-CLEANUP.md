# Approved C01–C03 removal — verification

Date: 2026-10-15, Africa/Casablanca. The owner approved the three exact paths recommended in `CLEANUP-REPORT.md`. The audit decision record was committed as `4eb07b7` before deletion. This verification was collected with the approved deletions in the working tree; [the native source manifest](post-cleanup-source-manifest.json) records the exact candidate independently of the pre-commit HEAD.

## Applied scope

Removed only:

- C01: `assets/demo-hero.webp` — 98,180 bytes.
- C02: `assets/demo-story.webp` — 76,710 bytes.
- C03: `assets/demo-look.webp` — 105,172 bytes.

All nine responsive fallback WebPs, the seed catalog and image originals, CSS, JS, settings, templates, sections, snippets and locales remain unchanged. `IMAGE-LOG.md` records the removals and preserves provenance. Historical Phase 0–4 inventory/graph/coverage reports are retained as pre-cleanup evidence rather than silently regenerated to hide the three removed nodes.

## Checks

| Check | Observed result |
|---|---|
| Native source comparison | Exactly three approved removals; all 93 surviving files have identical SHA-256 hashes to Phase 2; no native additions or modified surviving files. [Evidence](post-cleanup-preservation.json). |
| Reference check | No incoming edges to the removed assets in the approved graph; no remaining literal filename references in native text files. [Evidence](post-cleanup-reference-check.json). |
| Local tests | `npm test` passed, covering the existing 13 store and seven seed tests. [Output](post-cleanup-tests.txt). |
| Seed validation | Passed: 22 products, 52 variants, eight collections, two menus, four pages and 56 images. [Output](post-cleanup-seed-validation.txt). |
| Theme Check | Zero errors/warnings. [Output](post-cleanup-theme-check.json). |
| Local shopping browser regression | Passed card/filter rendering, variant/quantity/cart update/remove, notes, routing, responsive layout, modal and fallback checks; zero recorded runtime errors. [Results](post-cleanup-store-browser-results.json). This uses the existing local approximation, not Shopify services. |
| Four-width local visual comparison | **86/86 PNG hashes identical** to Phase 2, at 390/768/1280/1536px. Pixelmatch also reports zero changed pixels in every pair (threshold 0.1, antialias excluded, no masks/scaling). Two desktop mobile-navigation cases intentionally not applicable. [Pairs](post-cleanup-diffs.json), [visual index](post-cleanup-index.html), [capture manifest](after/manifest.json). |
| ZIP integrity | 93 native entries, ZIP integrity clean; every member and hash matches the current source manifest; no development/seed/QA files. [Package](post-cleanup-package.json). |

The byte-identical image hashes are stronger evidence than the configured Pixelmatch threshold alone. No old screenshot was replaced. The post-cleanup browser screenshots and all capture metadata are separate from Phase 2 evidence.

## Rebuilt native candidate

- Path: `dist/atelier-vane-theme.zip`.
- File count: **93**.
- Size: **515,734 bytes** (280,508 bytes smaller than the Phase 2 ZIP).
- SHA-256: `60339d2acdcdf8184a4ccfb8fe2763dde81e7baf06129d2630e462fa60357429`.
- Built by `bash scripts/package.sh`. The package remains ignored by Git as designed; cloning requires rebuilding it. No complete-project friend ZIP was regenerated.

## Reproduction

With the temporary browser/CLI tooling described in [README.md](README.md) available:

```sh
npm test
npm run seed:validate
bash scripts/package.sh
/tmp/atelier-theme-tools/node_modules/.bin/shopify theme check --output json
PORT=3334 npm start
```

In another terminal:

```sh
node qa/phase4/capture-after.cjs
node qa/phase4/compare-after.mjs
node qa/phase4/check-store-after.cjs
```

Stop the temporary preview after checking results. Regeneration updates these post-cleanup artifacts; historical baseline and Phase 2 images remain untouched.

## Remaining gates

The approved image cleanup is complete locally. CSS/locale candidates and every protected item remain deferred. No Shopify development store was connected, so native E2E, real editor/checkout/submission tests and Shopify pixel parity were **not run**. No native pass or release certification is claimed. Phase 5 delivery/release tagging has not started; no GitHub push, publication or release tag was made. The temporary local preview is stopped after verification.
