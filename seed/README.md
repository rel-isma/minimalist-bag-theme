# Demo catalog tooling

Use this package on a Shopify development store only. It contains 22 demo products, 52 variants, eight tag-based automated collections, four editable pages, two menu definitions, and 56 AI placeholder images. All products carry `demo`; inventory is untracked. Three products have compare-at prices. Descriptions, prices, weights, materials, and visuals must be replaced before launch.

## Choose one import route

**CSV:** follow the root README’s image-upload, URL-mapping and product-import steps. `products.csv` is prepared for a data-only import with 52 variant rows and intentionally blank image URLs. To import images, upload them to Shopify Files and build `products.with-images.csv` using their real public URLs; that version has 52 variant rows plus 22 additional image rows. Only the first listed color is pictured; other colors intentionally have no assigned variant image. Live import acceptance remains untested.

**API:** the optional `seed.mjs` uses Shopify Admin GraphQL `2026-10`. It uploads local JPEGs through `stagedUploadsCreate`, creates reusable Shopify Files, waits for processing, then upserts products using `productSet`. It creates automated collections, unpublished pages, and nested menus. Products remain draft; collections are not automatically published.

Do not run API seeding over this CSV import. Existing resources without the script’s ownership marker are protected. Reusing the API route is supported; the script preserves matching variant IDs and reuses its existing image uploads.

## CSV header provenance

The exact header row in `shopify-product-template.csv` was downloaded on October 14, 2026 from Shopify’s [official sample](https://help.shopify.com/cdn/shopifycloud/product-knowledge/production/csv/product_template.csv), linked by the [product CSV documentation](https://help.shopify.com/en/manual/products/import-export/using-csv). Only the header is retained; Shopify’s unrelated sample products and imagery are not imported.

The downloaded sample currently labels its barcode column `Variant Barcodes`; the documentation table uses `Barcodes`. This package follows the actual downloaded sample, leaves barcode fields empty, and does not depend on either column for its demo data.

## API setup

For the connected development-store run, `cli-admin.mjs` can reuse a locally authorized Shopify CLI `store auth` session through `store execute`, without exporting a token. Instantiate `ShopifyCliAdmin` with the store and CLI executable path; it is read-only by default and accepts `allowMutations: true` only for a deliberately authorized import. It inherits the existing image-upload/pagination helpers. `node --test seed/cli-admin.test.mjs` checks private argument files, mutation gating, user-error propagation and cleanup after failures. The actual native preflight and unresolved existing-content decisions are recorded in `qa/shopify/README.md`; no import has been performed at that checkpoint.

1. Create/use a partner development store, set its currency to USD for these demo prices, and keep its storefront password enabled.
2. Create an app or integration with Admin API access. Give it product, file, page/content, and online-store navigation read/write access: `read_products`, `write_products`, `read_files`, `write_files`, `read_content`, `write_content`, `read_online_store_navigation`, and `write_online_store_navigation`. Page access can alternatively use `read_online_store_pages`/`write_online_store_pages`.
3. Set `SHOPIFY_STORE` to the store’s `.myshopify.com` domain, without a scheme or path. Set `SHOPIFY_ADMIN_TOKEN` in your local environment or secret manager. Do not put tokens in source files or chat. `.env` files are ignored; these scripts do not load them automatically. On Node 22+, `node --env-file=/your/private/file ...` is an option.
4. Review the local dry run; it needs no credentials and sends no network requests:

   ```sh
   node seed/seed.mjs --dry-run
   ```

5. To write to the development store:

   ```sh
   node seed/seed.mjs --apply
   ```

6. A fresh Shopify store usually already has a main and footer menu. The script refuses to replace existing unowned menus by default. Inspect them first. If you intend to replace these development menus, use:

   ```sh
   node seed/seed.mjs --apply --replace-menus
   ```

7. The original menu contents are stored in the shop’s `atelier_vane_demo.manifest` JSON metafield before replacement. Seeded pages/collections/products carry `atelier_vane_demo.seed_id`. This ownership record lets cleanup protect unrelated resources and restore navigation.
8. A successful seed writes `seed/image-urls.json` with real CDN URLs. You can use this mapping for a CSV on a **different** empty development store.
9. Create the three `custom` product metafield definitions described in the root README so the seeded values are conveniently editable in admin.

All resource collision checks finish before uploads or resource mutations. The script checks `shop.plan.partnerDevelopment` and refuses production stores. It stops on API/user errors and does not retry an ambiguous failed creation; a rerun reconciles resources by handle and files by their distinctive filename/alt text. Do not run two seeding processes simultaneously. If a merchant changes a seeded menu, reconcile it before reseeding or deleting the demo package.

Editing source catalog content and rerunning will reset owned products to draft, owned pages to unpublished, and replace their demo fields. New filenames should be used for changed assets, or clean up the existing demo seed before replacing its images. Preserve the shop manifest until cleanup completes.

For a deliberately reviewed existing page, the programmatic `runSeed` option `reusePages: { handle: exactNativePageId }` reuses its ID without changing its body, template, publication state or ownership marker. The ID must match before any upload/write; the reuse reference is saved for reruns. Cleanup continues to delete only owned pages, so the reused page survives. Unspecified collisions still stop the import. The owner-approved development-store runner is `qa/shopify/import-demo.mjs`; it backs up pages/menus locally under ignored `seed/store-backups/`, preserves Contact/Privacy Choices/account navigation and retains a Privacy Choices link in the updated Footer menu. `qa/shopify/check-import.mjs` verifies the native results without writing store data.

The runner checks password protection through Shopify's [`onlineStore.passwordProtection.enabled`](https://shopify.dev/docs/api/admin-graphql/latest/objects/onlinestorepasswordprotection) field rather than relying on a storefront HTML request that can be rate-limited. It never publishes resources or the theme.

## Cleanup

Review a local cleanup plan:

```sh
node seed/seed.mjs --delete-demo --dry-run
```

Perform cleanup on the development store:

```sh
node seed/seed.mjs --delete-demo --apply
```

This deletes **every product with the exact `demo` tag**, including demo products created outside this package. Do not tag real products `demo`. It also removes this API seed’s owned pages, collections and uploaded files, and restores replaced original menus if they have not been edited since seeding. Existing unrelated pages, collections, menus and files are retained. CSV/manual uploads have no API ownership record: remove their demo pages, collections and files manually using the registry in `REPLACE-BEFORE-LAUNCH.md`.

## Image processing and logs

The built-in image generation tool creates original packshots. Detail views use each product’s first packshot as the reference. Banners and lifestyle images use relevant product references. `image-sources.json` records generation prompts, original local output paths and reference filenames; raw originals remain at their generated location. `prepare-images.py` performs only the requested aspect-ratio normalization, resizing and JPEG compression:

```sh
python3 seed/prepare-images.py --sources seed/image-sources.json
```

Those original absolute paths are specific to the authoring environment; the final portable deliverables are the JPEGs in `images/`. See `IMAGE-LOG.md` and `images.json` for alt text, dimensions, and usage. `catalog-preview.html` is a local review artifact, not a Shopify template.

## References and validation limits

- [Stable API release](https://shopify.dev/changelog/release-notes/2026-10)
- [Product upserts](https://shopify.dev/docs/api/admin-graphql/2026-10/mutations/productSet)
- [Staged uploads](https://shopify.dev/docs/api/admin-graphql/2026-10/mutations/stagedUploadsCreate)
- [File creation](https://shopify.dev/docs/api/admin-graphql/2026-10/mutations/fileCreate)
- [Menus](https://shopify.dev/docs/api/admin-graphql/2026-10/queries/menus)

Local tests exercise CSV integrity, catalog constraints, collision protection, repeat seeding, and cleanup using mocked responses. They do not establish that a real store accepts every mutation, processes every image, or imports the CSV. Live API/import testing remains pending until a development store is connected.

## Completed local store

From the project root, run `npm install` then `npm start` and open http://localhost:3333. The server renders the native theme with this catalog and approximates Shopify services. Checkout, account and contact/newsletter delivery still require a connected store. Local QA evidence is in `store-browser-results.json` and `lighthouse/`; see the root QA report for scope. The storefront never loads LiquidJS or any seed scripts.
