# Approved native demo import

Date: 2026-10-15. Target: `atelier-vane-test.myshopify.com`, Shopify shop ID `100505420067`. The owner approved reusing Contact and updating Main/Footer while preserving Privacy Choices and account navigation.

**Import and native Admin API verification passed.** This is catalog setup evidence, not a storefront/editor E2E or visual parity pass. [Machine-readable verification](import-results.json), [operation log](import-log.txt).

## Observed native results

| Resource | Verified result |
|---|---|
| Products | 22 owned demo products, all **Draft**; demo tags and exact planned variant SKUs present. |
| Variants | 52; planned prices/compare-at values match, inventory tracking off. Native IDs are recorded in the verification file. |
| Product images | Each product has its planned image count; no invented alternate-color photos were added. |
| Uploaded images | 56 completed image records, reused by native files/products/collections. |
| Collections | Eight owned automated collections; each has its banner and the planned tag rule. Collection channel publication was not configured. |
| New pages | Three owned **hidden** pages: Our philosophy, FAQ, Shipping and returns. |
| Contact | Existing page ID `164134158627` reused; title/body/template/publication state unchanged, no ownership marker added. |
| Privacy Choices | Existing page/body/template/publication state unchanged; link retained in the updated Footer menu. |
| Main/Footer | Two existing menus updated in place; IDs retained, original contents backed up locally and in the shop manifest before replacement. |
| Account navigation | Customer account menu exactly unchanged. |
| Store guards | Native API confirms development store, USD and password protection enabled. |
| Theme | Uploaded draft `189100065059` remains unpublished. No native code or editor content was pushed or published. |

Local page/menu snapshots are under ignored `seed/store-backups/` with private file permissions. Do not commit these store-specific backups or credentials. The shop's `atelier_vane_demo.manifest` also stores menu restoration data and Contact reuse references. Cleanup only deletes owned pages; it does not acquire ownership of reused Contact.

## Interruption and recovery

1. An initial anonymous storefront request returned HTTP 429, so the import stopped before any data write. The privacy guard now uses Shopify's documented [`onlineStore.passwordProtection.enabled`](https://shopify.dev/docs/api/admin-graphql/latest/objects/onlinestorepasswordprotection) through the authorized Admin API.
2. All 56 images and 22 draft products were created. Shopify then returned an explicit image-download user error for the Featured collection banner, stopping the first catalog run. Pages/menus were still untouched.
3. The Featured CDN image subsequently returned HTTP 200. `--resume-content` verified the complete saved image hashes against local sources and verified every existing draft product's ownership and variant SKUs, then resumed only collections/pages/menus. It did not recreate or reset completed products.
4. The final read-only verification reports **zero failures**, including all eight collection images, prices, product image counts, native SKU counts, page preservation, menu IDs/backups and password protection.

These failures were not recorded as passes or retried blindly after an ambiguous mutation. The completed native verification is the acceptance evidence for this import.

## Tooling and checks

`runSeed` now accepts explicit reviewed page IDs through `reusePages`. Mismatched IDs and all unspecified unowned collisions still stop before resource writes. The saved references survive a rerun; owned-page cleanup preserves reused pages. A meaningful regression test exercises wrong-ID rejection, import, rerun and cleanup against an existing Contact page.

The seed/store/CLI-adapter test files passed: [test output](import-tool-tests.txt). [Theme Check of the actual downloaded upload](uploaded-theme-check.json) reports zero errors/warnings. All 93 native workspace file hashes remain the same as the post-cleanup candidate; the ZIP is unchanged. Shopify's input schema was checked directly: [schema fields](import-schema-check.json).

The targeted runner and verifier use CLI-managed authentication and private temporary argument files. No token, storefront password or browser storage state is included in these artifacts.

## Still pending

- Products remain Draft and new pages hidden. The catalog is visible in admin but not yet ready for normal storefront browsing. Activate/publish only the imported demo resources to the password-protected development storefront before testing; keep the theme unpublished.
- Native filters, shipping rules/threshold, a test discount, Bogus Gateway, form delivery, localization/payment conditions and real editor behavior still need setup/testing.
- An anonymous Playwright observation did not verify the uploaded draft's password markup; [that result](password-observation.json) is explicitly blocked, with no screenshot masquerading as native theme evidence. Successful storefront unlock was not tested.
- Full four-width native screenshot parity and the 18 native E2E scenarios remain pending. Admin import verification is not E01's full admin-to-home/collection/search/filter test while products are drafts.
- No release tag, GitHub push or Phase 5 release was made.
