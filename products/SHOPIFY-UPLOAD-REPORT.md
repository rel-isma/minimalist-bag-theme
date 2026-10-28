# Shopify product upload

Verified 2026-10-23T11:53:40.496Z. Store: **Atelier Veyne · s35my0-uu.myshopify.com · USD**. Terminal authentication uses locally stored app credentials; tokens stay in memory. No ChatGPT connector is required.

**Uploaded and verified: 10 draft products, 32 variants and 34 branded images.** All images are READY at 1086 × 1448. Six excluded products were not uploaded. All 22 existing products are unchanged; the catalog now contains 32 products. Neither live nor draft theme was changed.

| Product in Shopify Admin | Variants | Images | Status |
| --- | ---: | ---: | --- |
| [Marlow top-handle bag](https://admin.shopify.com/store/s35my0-uu/products/15459351593279) | 3 | 3 | Draft |
| [Alder bucket bag](https://admin.shopify.com/store/s35my0-uu/products/15459352117567) | 2 | 2 | Draft |
| [Sora bucket bag](https://admin.shopify.com/store/s35my0-uu/products/15459352281407) | 4 | 4 | Draft |
| [Elin bucket bag](https://admin.shopify.com/store/s35my0-uu/products/15459352412479) | 3 | 3 | Draft |
| [Orla barrel bag](https://admin.shopify.com/store/s35my0-uu/products/15459352478015) | 5 | 5 | Draft |
| [Linden zip handbag](https://admin.shopify.com/store/s35my0-uu/products/15459352674623) | 4 | 4 | Draft |
| [Rhea crossbody bag](https://admin.shopify.com/store/s35my0-uu/products/15459352838463) | 1 | 2 | Draft |
| [Luma shoulder bag](https://admin.shopify.com/store/s35my0-uu/products/15459353002303) | 2 | 3 | Draft |
| [Esme crossbody bag](https://admin.shopify.com/store/s35my0-uu/products/15459353133375) | 3 | 3 | Draft |
| [Milo compact crossbody](https://admin.shopify.com/store/s35my0-uu/products/15459353362751) | 5 | 5 | Draft |

## Verified

- Product titles, descriptions, SEO, vendors, prices and original source options match the reviewed batch. Shopify only normalizes insignificant whitespace between HTML tags.
- Original CJ product IDs, variant IDs and SKUs are saved on each listing/variant; exact Shopify-to-CJ IDs are recorded in SHOPIFY-UPLOAD-RESULTS.json. This preserves references but does not establish automatic CJ fulfillment.
- Every variant points to its matching approved image; all 34 images are processed.
- Source-backed material/dimension metafields use the existing theme structure. Unconfirmed care information and missing dimensions were not invented.
- Products belong to the correct tag-based bag collections and New arrivals. New arrivals tag was added as these are new catalog additions.
- Inventories are tracked, with no quantity supplied and overselling denied. No fake stock, weight or compare-at discounts were entered.

## Still required before sale

1. Connect these 32 Shopify variants to their corresponding CJ variants in CJ Authorization/Connection and verify fulfillment links. SKU equality alone is not sufficient.
2. Confirm actual stock and shipping destinations/rates/delivery information. Shipping was previously deferred.
3. Fix color-chip rendering for Milkshake White, Elephant Gray, Caramel Mocha, Angora Red, Earthy yellow and Reddish Brown. Their proposed hex values are already saved in each listing's custom.color_swatches JSON. The existing theme only understands its built-in names, and this app lacks theme-write permissions. A ready-to-copy replacement snippet is saved in theme-compatibility/color-swatch.liquid; it has not been applied to Shopify.
4. Check the existing bag/add-on discount eligibility for these newly added product IDs; no discount settings were changed.
5. Inspect the uploaded product pages in the Atelier Veyne draft theme, then activate and publish the verified listings to Online Store. They remain drafts now. Do not publish the unrelated Helio theme or remove the storefront password as part of this upload.

## Safe continuation

The exact source batch is upload-batch.json. Keep it unchanged while resuming this import; the private upload journal pins its SHA256. The uploader skips completed journal entries and checks existing handles/SKUs before creating anything. Run node products/check-shopify.mjs to verify terminal access and node products/verify-shopify-upload.mjs for a read-only live check. Do not rerun fetch/initial preparation or image generation to continue publishing.

## Color swatch fix applied

The owner explicitly approved a one-file Shopify CLI upload on 23 October 2026. snippets/color-swatch.liquid is now updated on atelier-veyne-theme (#189635821887); the theme remains UNPUBLISHED. Read-back confirms its content exactly matches the validated local snippet. Milkshake White, Elephant Gray, Caramel Mocha, Angora Red, Earthy yellow and Reddish Brown now have color-circle mappings. No product, SKU, inventory, shipping, or publication changes were performed by this fix. The local theme ZIP contains the same update.
