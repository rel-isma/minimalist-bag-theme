# Phase 2 verification

Read `../../PHASE-2-REPORT.md` and open `index.html` for the current screenshots and raw differences. These are local approximation checks, not a Shopify parity or E2E pass.

Prerequisites: Node 26, Python 3 for packaging, Google Chrome at `/usr/bin/google-chrome` (Linux). The temporary audit packages are deliberately outside project dependencies:

```sh
npm install --prefix /tmp/atelier-phase0-tools playwright-core@1.64.1 axe-core@4.14.0 html-validate@11.16.2 pixelmatch pngjs
npm install --prefix /tmp/atelier-qa-tools lighthouse@12.8.2
PORT=3334 npm start
```

In another terminal, run the desired focused checks:

```sh
node qa/phase2/check-settings.cjs
node qa/phase2/check-editor.cjs
node qa/phase2/check-editor-edges.cjs
node qa/phase2/check-accessibility.cjs
node qa/phase2/check-store-browser.cjs
node qa/phase2/capture-current.cjs
node qa/phase2/compare-local.mjs
node qa/phase2/run-lighthouse.mjs
bash scripts/package.sh --check
```

Run Lighthouse alone, after capture/comparison tools finish. `CAPTURE_STATES=collection-filters-open,quick-view` supports targeted recapture and records its commit/time in the manifest. The final target-only update checks the last CSS visibility correction; all other default states are unchanged by that correction. Historical failure and replaced diff files remain as diagnostics; only manifest-linked files are current evidence. Original Phase 0 references are untouched.

The source/ZIP hashes refer to the current native candidate. The capture manifest records the full-run commit and targeted source updates; no live Shopify screenshots are included. Native IDs, data/publication, real fonts, forms, checkout and editor tests require a development store later.
