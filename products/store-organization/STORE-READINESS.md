# Atelier Veyne — product sections and launch review

Checked against s35my0-uu.myshopify.com on 27 October 2026. This is a focused configuration review, not a completed checkout or fulfillment test.

## Saved in Shopify

- Created `best-sellers`, sorted `BEST_SELLING`. Automated rules require `cj-import` and inventory above zero. Verified 16 products and Online Store publication. Shopify ranks by all-time orders containing the product; with no sales it falls back to newest first. This ranking does not certify quality.
- Updated the existing `featured` collection to require `featured`, `cj-import` and positive inventory. Added the featured tag to Marlow, Lune, Iris, Ellis, Wren and Alba, retaining all other tags. Verified exactly those six products. No extra editor-picks collection was needed.
- Updated `new-arrivals` to require `new-arrival`, `cj-import` and positive inventory, sorted newest first. Verified 16 products and Online Store publication.
- No products, variants, prices, quantities or CJ links were replaced or deleted. The 20 research candidates were not imported or listed.

## Uploaded to the unpublished draft theme

Target: `atelier-veyne-theme`, theme 189635821887, currently UNPUBLISHED. Live theme is Helio, 189632381247.

Two files are staged in `theme-update/`:

1. `templates/index.json`: Best Sellers reads `best-sellers`; A considered edit retains `featured`; New arrivals retains its collection. Hero links to the real CJ new-arrivals collection. The shop-the-look section referencing demo Plane/Turn products is hidden until an accurate real-product look is prepared. Brand copy refers to selecting pieces rather than claiming to design supplier products. FAQ text no longer promises universal phone fit, water resistance/full-grain material, 24-hour dispatch, US delivery in 2–4 days, prepaid returns or one fixed strap drop without product-specific evidence.
2. `sections/product-recommendations.liquid`: keeps Shopify automatic related recommendations, requests up to 10 candidates and shows up to the configured count after excluding demo-tagged or unavailable products. Empty sections stay hidden. Complementary products remain an explicit pairing choice through Search & Discovery; no separate recommendation collection is needed. The algorithm can return fewer eligible products; the theme does not fabricate replacements.

Current remote homepage, original recommendation section, local-before files and mutation audit are saved under the ignored `products/.state/store-organization/` directory. The staged homepage derives from the current Shopify draft so unrelated theme-editor settings are retained.

Validation: Shopify 2026-10 GraphQL validation passed with deprecation notices for still-supported collection/publication fields. Full-theme validation passed for both changed files; the recommendation section has non-error unknown-global-object warnings from the validator. Collection contents/publication were read back after writes. The approved two-file Shopify CLI upload succeeded on 27 October 2026. Both remote files were read back and matched the prepared update, and the theme role was verified as UNPUBLISHED. Interactive storefront and checkout tests remain outstanding.

## Launch priorities from actual store data

1. **Markets and checkout:** only Morocco is active. US and UK supplier freight quotes do not enable those markets. The ordinary shipping profile lists US/UK under an international rate of MAD 190 at merchant location El Massira; the CJ profile returned no locations and only a Morocco USD 0 rate. Review product-to-profile/location assignment and deliberate US/UK customer rates, activate the intended markets, and test checkout with addresses in both countries. No market or shipping-rate writes were made.
2. **Demo catalog:** 22 active products carry `demo`, including every current wallet/accessory and tote listing. They remain in existing category collections and may appear in search/all-products; this task did not archive or unpublish them. New homepage collections exclude them. Before launch, retire those demos and replace them with approved, connected supplier products. Disabling demos will empty some categories until real products are listed. The bag-plus-wallet offer needs actual fulfillable wallet/accessory products before it is ready for customers.
3. **Unprepared listing:** active `Bags Women New Mumm` has no organization tags and lacks material, dimensions and care metafields. It is not included in the new homepage selections. Review or hide it before launch; do not infer readiness from its stock figure.
4. **Product facts:** 14 of 16 CJ-tagged products lack care information; 9 lack dimensions. Elin and Iris have all three theme detail fields populated, but populated fields alone do not prove accuracy. Get missing details from supplier/sample verification instead of inventing them.
5. **Policies and support:** confirm the actual return conditions, return address, shipping/processing policy, contact method and customer emails. No policy completeness, payment capture or delivery test was established in this audit. Set up a brand domain (current primary domain is the myshopify.com domain), check navigation on mobile, and run a test order/payment/refund workflow before removing the password.
6. **Theme launch:** apply and review the prepared changes in the Atelier draft first. Publishing that theme remains a separate launch decision; Helio is still the live theme.

## Ongoing use

Tag reviewed real products `cj-import`; tag a product `featured` to include it in the curated edit; tag it `new-arrival` for New arrivals. Positive tracked stock is required by the configured rules. Keep native CJ variant references unchanged. When sales come in, Shopify reorders Best Sellers automatically; collection membership and Shopify sales rank are not product-quality approval. Use Search & Discovery to review related recommendations and deliberately pair complementary wallets/accessories after actual products are ready.

References:
- https://help.shopify.com/en/manual/products/collections/collection-layout
- https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-recommendations
- https://shopify.dev/docs/api/ajax/reference/product-recommendations
