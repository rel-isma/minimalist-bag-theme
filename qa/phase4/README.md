# Phase 4 cleanup audit evidence

Read `../../CLEANUP-REPORT.md` and `CANDIDATES.md`. The graph, coverage and candidate appendix below are the pre-removal dry-run snapshot. C01–C03 were subsequently approved and applied; see [POST-CLEANUP.md](POST-CLEANUP.md) for current hashes, package and visual verification. CSS/locale candidates remain deferred.

Reproduce the static graph with Python 3:

```sh
python3 qa/phase4/audit.py > qa/phase4/static-summary.json
```

Browser prerequisites match Phase 2: `/tmp/atelier-phase0-tools/node_modules/playwright-core` 1.64.1 and `/usr/bin/google-chrome`. Start `PORT=3334 npm start`, then:

```sh
node qa/phase4/coverage.cjs
python3 qa/phase4/candidates.py
```

Stop the preview when finished. No dependency or production code changes are needed. Theme Check was run using the temporary Shopify CLI from Phase 2:

```sh
/tmp/atelier-theme-tools/node_modules/.bin/shopify theme check --output json > qa/phase4/theme-check.json
```

Artifacts:

- `reference-graph.json`: 96 native file hashes, literal Liquid/JSON/JS endpoint edges, dynamic render observations, settings references, locale calls, comments, named-function counts, identical files and heuristic missing CSS tokens.
- `static-summary.json`: compact subset for inspection. Definitions/stored values do not count as consuming a setting. The class scan is heuristic, not a complete Liquid/JS parser; generated schema and interpolated classes are manually protected in the appendix.
- `coverage-raw.json`: native asset entries from Playwright CSS coverage and V8 JS function/block coverage, collected before each navigation can discard the previous document's counters. Public source text is included for reproducibility; no browser cookies/storage state or credentials are exported.
- `coverage.json`: source-hash-verified union of executed/used character ranges across the sampled local routes and widths, observed DOM class tokens, action records and explicit gaps. JS nested ranges use the innermost range's execution count so an unexecuted branch is not counted just because its enclosing script ran. CSS coverage reports rule usage, not whether every selector/declaration in a matched rule was useful. Percentages count source characters, not compressed bytes or functions.
- `coverage-states.json`: action log before aggregation. `coverage.json` additionally has final totals. Only the final successful run is represented; earlier collector failures are described in the main report.
- `CANDIDATES.md`: every flagged CSS token/locale key, confidence, risk and protection decisions.
- `preservation.json`: all native hashes compared with the Phase 2 manifest and candidate ZIP hash.
- `theme-check.json`: fresh CLI output.

These measurements cannot establish all-state coverage. Native services/editor, unconfigured sections/settings, real review data, apps and media types require a connected Shopify store. Local synthetic review controls and synthetic section events are explicitly labeled. A range absent from coverage is never sufficient evidence to remove it.
