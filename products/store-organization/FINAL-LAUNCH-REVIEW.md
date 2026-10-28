# Atelier Veyne — final launch review

Updated 27 October 2026 after owner-approved repairs. The original read-only audit is superseded below for product details, shipping, policies and Marlow. Isolated test carts were created and cleared; no payment, order or customer form was submitted. The branded theme remains a draft.

## Finish in this order

1. **Clean the sale catalog and offers.** There are 39 products: 16 CJ-tagged products, 22 active demos and one unprepared active listing, “Bags Women New Mumm”. Demo products remain visible in All products. The actual “Complete your carry” block still promotes Slip, Turn and Keep demo wallets. The unprepared listing appears in Lune’s automatic related recommendations. Draft/unpublish the demos and unprepared listing, or finish and verify actual supplier products before offering them. Replace demo wallets with approved CJ-connected wallets; until then hide the cross-sell block and bag-plus-wallet promotion. Hiding these products will empty some categories; hide those navigation/category tiles until real stock is ready. The researched 10 bags and 10 wallets are candidates only, not listed products.
2. **US/UK rates and Marlow repaired.** US and UK markets are active. All 16 CJ bags / 57 variants now use the actual CJ delivery profile, with approved USD flat shipping of $19.95 per order to the US and $12.95 per order to the UK. Existing Morocco and merchant-location rates were preserved. Marlow now displays Add to bag; its existing CJ stock was preserved. Actual isolated one- and two-Marlow-bag carts returned the approved rates, and checkout displayed the matching shipping service. This is not a paid-order or every-address test. The earlier “CJ profile has no locations” finding came from a lookup omitting legacy fulfillment locations; Studio’s query now includes them.
3. **Shipping and returns policies saved.** The custom shipping-and-returns placeholder was replaced, and standard Shopify shipping/refund policies now exist. Terms include estimated 2–5 days processing plus 4–9 days US/UK transit, approved customer charges, tracking/contact instructions, 30-day change-of-mind returns, customer-paid remorse postage, remedies for faulty/incorrect items and preserved statutory rights. The merchant still needs a working return receiving address/process; do not assume CJ accepts change-of-mind returns. The standalone draft FAQ was corrected and uploaded with separate owner approval. Contact/email delivery has not been tested.
4. **Remaining supplier measurements.** All 16 CJ bags now have clearly labeled general leather-care guidance, authorized by the owner and distinct from manufacturer instructions. Seven supplier-supported dimension entries were added/corrected; 12 of 16 have dimension fields. Linden, Rhea, Milo and Reed still require confirmed dimensions/units. Marlow and Alder have partial confirmed measurements because their depth units were ambiguous. No missing specifications were invented. See ../finish-launch/SUPPLIER-CONFIRMATION-NEEDED.md. Physical samples remain advisable before advertising quality/fit claims.
5. **Run one complete checkout-to-fulfillment test before launch.** Verify payment success/failure, shipping and taxes, stock deduction, native CJ order/variant routing, confirmation emails, cancellation/refund and the exact 10%-off-one-bag condition with a real eligible add-on. Newsletter signup worked earlier, but receipt/automation delivery and contact-message delivery need a current test. No payment/order/refund/fulfillment test was performed in this review. Use an appropriate official test process rather than placing an unapproved paid order.
6. **Launch the intended brand theme.** Atelier Veyne (189635821887) remains unpublished; Helio is live. Connect the brand domain and sender email, make a final mobile pass, then explicitly approve theme publication and removal of the storefront password once the earlier items pass. Do not publish before fixing the sale catalog and checkout coverage.

## Already working or checked

- Automatic Best Sellers collection, curated six-product Featured and newest-first CJ New arrivals are configured.
- Lune and Ellis card color selection was fixed and previously tested in the actual draft: no navigation on color selection; selected variant carried into product links. Local cart tests used mocked requests, not real orders.
- Related recommendations now exclude demo-tagged products. This does not automatically exclude the untagged, unprepared supplier listing, and it does not affect the separate “Complete your carry” block.
- Current homepage, New arrivals, All products, Lune, Marlow, contact and policy pages returned no page JavaScript errors in the review. Desktop pages checked showed no horizontal overflow; Lune at 390px also had none. This is not an exhaustive browser/device audit.
- Privacy policy, contact, FAQ and custom shipping-and-returns pages load. Loading a page does not establish that its content is complete.
- No fake customer reviews were found or added. Empty product review sections are visible; optionally hide the empty rating breakdown until genuine reviews exist.

## Optional polish after the blockers

- Reduce repetition between Best Sellers, New arrivals and the curated edit. Best-selling sorting can mirror newest-first before meaningful sales exist; it is not evidence that items have been tested or popular. “Our favourites” is an honest curated launch label if wanted.
- Consider removing/replacing the generic “A Direct Comparison” block, which repeats the same heading and adds limited buying guidance.
- Add concise product-specific measurements and packing/fit details rather than more homepage sections.
- Do not add more apps or extra collections just to look finished. A smaller verified assortment with reliable delivery is sufficient for launch.

Evidence is saved privately under `products/.state/store-organization/latest-review.json`, `storefront-review.json`, `storefront-detail-review.json` and the accompanying screenshots.

Official launch/testing guidance:
https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/setup-prepare-for-launch
https://help.shopify.com/en/manual/checkout-settings/test-orders

## Evidence for the approved repairs

- `../finish-launch/FINAL-VALIDATION.json`: live product/profile/market/rate readback.
- `../finish-launch/checkout-shipping-validation.json`: four actual storefront shipping calculations (US/UK, one/two bags).
- `../finish-launch/product-detail-results.json`: source-linked dimension edits and care sources.
- `../finish-launch/shipping-policy.html`, `refund-policy.html`, `shipping-returns.html`: saved policy text.
- Private backups and browser results are under `products/.state/finish-launch/`.

Care sources: [Leather UK](https://leatheruk.org/care-instructions/) and [Leather Naturally](https://www.leathernaturally.org/wp-content/uploads/2023/05/LN_Fact_Sheet_Guide_How-to-care-for-Leather.pdf). Return rights reference: [UK Government](https://www.gov.uk/accepting-returns-and-giving-refunds).
