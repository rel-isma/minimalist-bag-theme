# Lune listing repair — 25 October 2026

The native CJ listing succeeded, established all three fulfillment links and supplied stock. Studio then failed to apply its final presentation because the CJ size value ended in a space while Shopify saved the trimmed value. The product also had five FAILED CJ-created media records alongside three original supplier images. Shopify reported only `UNKNOWN / Media processing failed` for those records; their underlying processing cause is not established.

The repair resumed the original approved job (`ed1d1ae1-79ed-4654-8a5e-15b7199ff39a`, CJ listing `2610251400020659400`). It did not submit another listing.

Verified final result:

- Existing Shopify product `15464176746815`, Lune zip handbag; exactly one SKU-matching listing.
- Five approved branded images, all READY at 1086 × 1448, in the reviewed order. Includes the two woman-carrying photographs.
- Each of the three variants points to its matching branded color photograph.
- Saved theme fields: material, dimensions, explicit Black/Brown/Light Gray swatches and original CJ product ID. No supplier care instructions were invented.
- Original Shopify variant IDs, SKUs and stored Color/Size options unchanged.
- All three native CJ variant links and CJ inventory-management flags verified. Total supplier-synced inventory at verification: 18,850 (Black 5,820; Brown 7,271; Light Gray 5,759). No stock quantity was manually assigned.
- Original job now Complete, without its previous error. The draft theme remains unpublished; other products were not listed.

Permanent Studio fixes:

1. Option comparison tolerates surrounding whitespace and option ordering; real name/value changes, missing options and duplicates remain rejected. Original CJ source records are preserved.
2. Approved images are uploaded/processed as Shopify Files, cached by local content hash and attached to the existing product by READY file ID. Retrying reuses recorded files. Old gallery removal happens only after approved-file readiness is verified.
3. READY supplier media are detached through `fileUpdate`. FAILED records cannot use `fileUpdate` (live API error: `Non-ready files cannot be updated`), so only those failed product records use the still-supported, deprecated `productDeleteMedia` operation. No ready shared file is globally deleted.
4. Future native CJ creation uses CJ's source gallery for initial registration; the finishing step directly attaches approved branded files and verifies the final gallery and theme fields. This avoids relying on CJ to re-import Shopify-hosted branded URLs.
5. Resume clears stale errors while running. Finished-job snapshots trigger a second UI refresh once the live connection refresh actually finishes.

Validation: Shopify 2026-10 GraphQL schema checks passed (deprecated cleanup operation warning acknowledged); full product/connection/inventory/workflow/media regression suites and HTTP security checks passed. Headless Chrome verified the draft storefront: five product slides, Light Gray rendered as a colored circle with no fallback letter, and the saved material text present. Verification detail is stored privately in `.state/lune-repair-verification.json`.
