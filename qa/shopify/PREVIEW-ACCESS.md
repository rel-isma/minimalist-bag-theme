# Shared preview checkpoint

Date: 2026-10-15. The owner supplied a visitor preview link for theme `189100065059` after making the demo catalog visible in admin. Its temporary hostname is supplied through `SHOPIFY_PREVIEW_URL` and is not committed in scripts or reports.

The anonymous Playwright probe reached HTTP 200 but received Shopify's generic password screen, with zero theme product cards and no `[data-header]` markup. [Initial observation](preview-access-initial.json). This is an access blocker, not evidence that the theme is missing its products. No storefront test was marked passed, no cart/form/checkout was changed and no password was attempted during this probe. Two console resource-404 messages were observed on that access screen; they are not established theme errors.

The read-only native state check confirms 22 Active products and all three imported pages visible, with Contact/Privacy Choices still visible and password protection enabled. [State evidence](post-publication-state.json). Channel publication is queried separately from `onlineStoreUrl`; null URL values are not used as a verdict on this private store.

The owner manually confirmed Line tote color/size selection, product-page add, drawer quantity changes, removal and empty state work. These are **owner-reported manual results**, not automated Playwright passes. Supplied screenshots also show populated category tiles/product rows, the image menu, predictive suggestions and the collection count of 22; they do not establish all-state parity or editor acceptance.

## Needed locally

`.env.shopify-test` was created with private file permissions and is ignored by Git. The owner can enter the storefront password there using `SHOPIFY_STOREFRONT_PASSWORD="actual password entered locally"`, then reply that the local file is ready. Never post the password in chat, commit the file or export browser cookies/storage state into evidence.

The access probe can then be run with the supplied preview URL in the process environment:

```sh
node --env-file=.env.shopify-test qa/shopify/probe-preview.cjs
```

`SHOPIFY_PREVIEW_URL` must be set to the owner-supplied share link before this command. The probe uses the password only in the ephemeral browser, never logs the value or a Playwright fill-error call log, and closes the browser without saving authentication state. A successful access probe is a prerequisite to the actual storefront test/capture matrix, not a substitute for it.

The draft theme remains unpublished; no theme code/settings or store privacy configuration was changed in this checkpoint.
