# Atelier Veyne — storefront reference

Reviewed 23 October 2026 through the owner's current draft preview. This was a read-only visual/content review, not an admin audit or checkout test. The browser loaded the preview without needing the supplied password. Direct HTTP requests were temporarily rate limited, but the browser review succeeded.

## Pages reviewed

- Homepage, including Best Sellers, New arrivals, collection categories, editorial sections and footer.
- Cove shoulder bag and Arc shoulder bag product pages.
- All-products collection: it reports 22 products, with Color and Product type filters.
- Cove product page at a 390px mobile viewport.

Screenshots and raw observations are retained privately under `.state/shopify-review/`. The preview link and password are not included in this report.

## Confirmed visual identity

The browser's computed styles match the current local theme: warm cream `#F5F1EA`, stone `#ECE5DA`, ink `#1B1A18`, muted brown `#6B6258`, clay `#9A4F36`, and fine borders `#D9D0C3`. Headings use Garamond with Baskerville/Caslon/serif fallbacks; body text uses Assistant. The wordmark, centered header, restrained buttons, generous space and understated editorial copy create a consistent direction.

Product imagery uses warm plaster/cream backgrounds, pale stone or travertine surfaces, gentle directional daylight and soft shadows. Products have enough space around their silhouette. Collection photos group related bags; product photos keep one piece as the focus. Existing demo images establish a lighting/background reference, not evidence of the actual CJ product's shape or construction.

## How the CJ products should fit

- Keep at most eight distinct photos per product, drawn only from its CJ product gallery and variant photos. Do not use description-HTML images, recreate unsupported views or add filler to reach eight.
- Prepare portrait 3:4 catalog masters to fit the current product-card crop, keeping straps, handles, base and hardware clear of crop boundaries. Product galleries also display other portrait proportions; preserve generous safe space.
- Retain the actual product, color, texture, seams and hardware from each original. Change presentation/background only. Reject generated candidates that change those details.
- Name products briefly, followed by their functional type. Use calm, concrete descriptions rather than supplier keywords or unsupported luxury claims.
- Prepare native Color and Size options where the source has them, without losing CJ variant IDs or SKUs. Preserve source color names in the mapping even when proposing clearer customer labels.
- The local theme reads `custom.material`, `custom.dimensions` and `custom.care` for its product accordions. Supply verified facts, not generic demo text. Do not assume another product's template, dimensions or care guidance applies.
- Match existing product types and collections only after admin/catalog verification. The visible collection types are Shoulder bag, Crossbody bag, Tote bag, Mini and clutch bag, Wallet and cardholder, and Bag accessory.
- Listed prices are in USD. Current demo prices are references only; supplier costs do not establish approved retail prices for the new CJ items.

## Existing-store observations

1. Cove exposes an additional color literally named “read,” with a letter fallback in its swatch. This is an existing catalog value; do not silently reinterpret it as “Red” or carry it into the CJ import. Owner confirmation is needed before changing existing variants.
2. Cove and Arc still contain demo/testing disclaimers and placeholder material text. Their imagery is also labeled as AI-generated demo content in alt text. New CJ listings must use their own verified facts and accurate product photos.
3. The visible pairing promotion says a bag plus an add-on saves 10% on one bag. This review did not verify the actual discount eligibility or backend configuration. Do not promise eligibility for a new product until its collections and discount rules are checked.
4. Reviews are empty on the two inspected product pages. Do not create ratings or testimonials for the CJ listings.
5. Some lower-page images were not loaded in the full-page captures. Lazy loading/scroll animation can explain that; this review does not establish broken assets.

## Access and next work

The supplied preview is sufficient for visual preparation. It does not grant Shopify Admin/API access or prove fulfillment links. Admin authorization will be needed later for duplicate checks, exact collection/template selection and the owner-approved publishing plan. No Shopify product, theme, cart, customer or discount was changed during this review.

The remaining preparation work is to resolve conflicting source specifications, agree retail pricing, produce accurate branded content/images in each product folder and present the complete proposed create/update changes for owner review before publication.
