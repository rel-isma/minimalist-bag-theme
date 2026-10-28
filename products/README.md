# Private product workspace

Git includes only the shared Shopify client, gallery-selection helper and a small launch handoff. Product records, downloaded/generated photos, reviews, quotes, account snapshots and one-off migration scripts remain local and are excluded from Git and Shopify theme uploads.

To continue with the existing edits on another computer, restore the private workspace archive described in the [root README](../README.md). It preserves `products/` and `studio/.state/`; copy `.env` separately. Do not delete these local folders before verifying the restored copy.

Product identity lives in `products/<CJ product ID>/source/product.json`; originals stay in `source/images/`, prepared data/images in `prepared/`. Studio keeps ongoing drafts, uploads and resumable job journals under `studio/.state/`.

On a fresh clone without a private backup, Studio starts with an empty local catalog. Fetch saved CJ account products and refresh Shopify connections. This does not recover the old computer's branded photos or unpublished edits.

Never recreate an existing Shopify product merely because local data is missing. Refresh connections and check native CJ product/variant mappings first. Stock must come from CJ; do not invent quantities.
