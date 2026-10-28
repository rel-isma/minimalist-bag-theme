# Atelier Veyne — prepared product inventory

Prepared 23 October 2026: **16 products, 61 variants and 65 new branded image candidates**. Each product has 3–7 new images, within the eight-image limit. Inputs came only from CJ product-gallery and variant photos; no description-only images were used. All 119 selected originals remain in their source folders.

**Ten selected products are uploaded as Shopify drafts; nothing published for sale.** Titles, descriptions, SEO, specifications, native options, proposed swatches, source SKUs and CJ variant mappings are saved per product. USD retail prices are suggestions you requested, not approved prices.

[Open the prepared catalog](./index.html) · [Original source catalog](./source-index.html) · [Store reference](./STORE-REVIEW.md) · [File validation](./PREPARATION-VALIDATION.json) · [Browser results](./REVIEW-BROWSER-RESULTS.json)

| Prepared product | Variants | New images | Suggested USD retail |
| --- | ---: | ---: | ---: |
| [Marlow top-handle bag](./2408310805071622300/prepared/index.html) | 3 | 3 | $99.00 |
| [Alder bucket bag](./1756516170586402816/prepared/index.html) | 2 | 3 | $109.00 |
| [Rowan flap bag](./2602021300441600000/prepared/index.html) | 3 | 3 | $109.00 |
| [Sora bucket bag](./2607121014121623000/prepared/index.html) | 4 | 4 | $89.00 |
| [Elin bucket bag](./1458719239455248384/prepared/index.html) | 3 | 3 | $99.00 |
| [Nola everyday bag](./1731929813339873280/prepared/index.html) | 4 | 4 | $99.00 |
| [Orla barrel bag](./2607070853511612201/prepared/index.html) | 5 | 5 | $89.00 |
| [Linden zip handbag](./295A6204-FA3E-4BFF-A999-D44F5C61CA21/prepared/index.html) | 4 | 4 | $79.00 |
| [Rhea crossbody bag](./2506110631251623700/prepared/index.html) | 1 | 3 | $129.00 |
| [Mira pillow bag](./2072251249807106049/prepared/index.html) | 5 | 5 | $109.00 |
| [Sable soft tote](./2410190505071604800/prepared/index.html) | 7 | 7 | $69.00 |
| [Remy everyday bag](./2412070748501605500/prepared/index.html) | 5 | 5 | $59.00 |
| [Luma shoulder bag](./2407270630041615800/prepared/index.html) | 2 | 3 | $79.00 |
| [Talia shoulder bag](./2606090550321621400/prepared/index.html) | 5 | 5 | $109.00 |
| [Esme crossbody bag](./2509070113221629600/prepared/index.html) | 3 | 3 | $99.00 |
| [Milo compact crossbody](./2510110122001632000/prepared/index.html) | 5 | 5 | $89.00 |

## Where we stopped

**Upload completed and verified: 10 draft products, 32 variants, 34 images.** All 22 original products are unchanged. Six reviewed products were excluded from the batch.

See [SHOPIFY-UPLOAD-REPORT.md](./SHOPIFY-UPLOAD-REPORT.md) for Shopify Admin links and remaining work, [SHOPIFY-UPLOAD-RESULTS.json](./SHOPIFY-UPLOAD-RESULTS.json) for live verification, and [SHOPIFY-VARIANT-MAP.json](./SHOPIFY-VARIANT-MAP.json) for exact CJ/Shopify references.

Terminal access is verified using the ignored local .env credentials. No ChatGPT connector is required. Before activating listings, verify native CJ fulfillment links, actual stock/shipping and six nonstandard color swatches. The app has read-only theme access. A compatible replacement snippet is prepared locally, but neither Shopify theme was edited.

## Files and recovery

- Each product: source/ contains untouched supplier data; prepared/ contains product.json, description.html, variant-map.json, images.json, images/ and a static index.html review page.
- prepared-catalog.json combines all proposals. image-jobs.json records every generated image and original-photo mapping.
- IMAGE-PROMPT.txt records the shared built-in image_gen prompt; IMAGE-PROMPT-first.txt records the first image's prompt. Input-specific instructions are saved with the image jobs/media.
- Rebuild the review pages from existing prepared JSON with `node products/build-review.mjs`; validate with `node products/validate-prepared.mjs`. These commands do not call CJ or Shopify or regenerate images.
- prepare-content.mjs was the initial drafting generator. It can overwrite editorial changes; do not rerun it just to refresh the review pages.

Keep the file-based workflow. Do not restore the removed Product Studio. Credentials and connection state remain in ignored local files; products/ stays excluded from Shopify theme uploads.

Latest theme checkpoint: the six missing imported color mappings are applied and verified on draft theme 189635821887. See theme-compatibility/STATUS.json. Stock and CJ connection states may now differ from the original draft-upload verification because the owner has been configuring CJ inventory sync.
