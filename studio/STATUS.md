# Resume here — Catalog Studio

The local React app is ready at http://127.0.0.1:4310 after `npm start`. Its compiled frontend is in `studio/dist/`; rebuild after interface changes with `npm run build`.

Verified on 2026-10-23 using read-only live account calls:

- Shopify: Atelier Veyne, s35my0-uu.myshopify.com, USD.
- CJ: the authorized Shopify shop is selected explicitly, separately from the API shop named studio.
- 16 saved CJ products: **10 fully connected products, 32 native variant links, 0 existing listings needing connections, 6 not listed**.
- Marlow's three native variant connections and CJ fulfillment/inventory-management status were verified.
- CJ account reports inventory synchronization enabled with a 50% synchronization rate; this has not been changed.
- The user's approved three-file dynamic color adapter was uploaded to draft theme 189635821887 and read back byte-for-byte. It remains UNPUBLISHED. The theme ZIP includes those same snippets.
- After the owner confirmed the batch, the CJ code 415 registration failure was repaired. All nine previously unlinked listings were connected and read back successfully using the approved China → US / CJPacket Fast US settings. Shopify product content, stock quantities, delivery profiles and shipping rates were not manually changed. Nine newly linked listings still need CJ inventory-management configuration; Marlow is the one confirmed inventory-managed product.

Next: complete CJ Fulfillment/inventory-management configuration for the nine newly connected products, then Refresh connections to verify that status. The latest successful jobs are in Activity; earlier failed jobs remain as history. Evidence: `studio/connection-repair.json`.

For six unlisted products, review their supplier warnings and edit the content/photos/prices before listing. New listings use CJ's native async API followed by exact Shopify/CJ identity verification and extra theme-field updates. The batch connection write path has passed a live run for all nine remaining listings. Native creation of a new product still needs its first reviewed live run.

Passed: 17 core assertions plus 6 connection regression checks, local HTTP security/persistence checks, official Shopify 2026-10 GraphQL schema validation, production React build, and desktop/mobile Playwright checks at 390, 768 and 1440px. Evidence is in `browser-results.json`, `server-results.json`, `graphql-validation.json` and `theme-deployment.json`. These checks do not claim live publishing success.

Read `studio/README.md` for workflow, points usage, interrupted-job recovery and private backup instructions.

Automatic stock setup was added after the connection repair: Connect now enables quantity tracking and the CJ inventory location; Connections has an Enable CJ stock sync batch action for the nine existing linked products. Live activation is currently blocked by missing Shopify scopes (`read_inventory`, `write_inventory`, `read_locations`). The owner approved the work in chat, but Shopify still reports only the original scopes. Add/release those scopes in the installed app before testing the first activation. Six inventory regression tests and the official schema validator pass. This does not claim CJ supplier stock synchronization is already enabled.

2026-10-23 inventory follow-up: Shopify scopes were approved and read back successfully. Elin tracking and sole CJ stock location were verified live, but CJ still reports inventoryItemStatus 0 and no quantities arrived. The owner chose CJ native 24/7 synchronization rather than a computer-dependent studio poller. Latest snapshot shows Marlow and Alder inventory-managed with stock (35,092 and 21,387 respectively); eight products remain pending CJ inventory-management confirmation. The studio now explicitly explains that Shopify setup alone does not complete this CJ setting. No manually supplied stock quantities were written. Complete the one-time CJ Fulfillment batch configuration for the eight pending products, then verify all supplier and Shopify states.

Latest storefront follow-up: all 10 imported products now have confirmed native CJ inventory management and positive stock. Marlow and Esme were verified with positive `sellableOnlineQuantity` for every variant. The shared draft preview renders Shopify.country MA with variant.available false and Sold out, and US with variant.available true and Add to bag. This is country-specific market/shipping availability; the theme follows Shopify's own availability flag. Shipping/market settings were not changed because intended delivery destinations remain a merchant decision. For the existing US setup, use View as → United States in the preview bar. Enable Morocco market/shipping coverage only if the merchant intends to deliver there. Evidence: studio/storefront-availability.json.
