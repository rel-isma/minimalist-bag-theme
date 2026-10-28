# Product workspace

This folder is versioned with the repository, including supplier records, prepared content, original/generated product photos, reviews, research, workflow scripts and launch handoffs. Studio drafts, uploads and recovery journals under `studio/.state/` are also versioned. Cloning the repository restores this work without a separate archive.

Authentication tokens and real credentials are excluded. Configure `.env` locally using `.env.example`, start Studio, then refresh connections before changing the store. Existing quotes and plans can expire; do not replay an old operation blindly or recreate an already-listed product.

Product identity lives in `products/<CJ product ID>/source/product.json`; originals stay in `source/images/`, prepared content/images in `prepared/`. Preserve CJ IDs, variant IDs and SKUs. Stock remains managed by CJ.

The entire products folder is excluded from Shopify theme uploads. Research and generated-image candidates are not automatically approved listings. See the launch review for outstanding supplier confirmations and operational checks.
