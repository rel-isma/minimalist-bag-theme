# Central Studio workflow — 25 October 2026

The owner approved the six prepared products and USD prices, then confirmed the United States as the destination. Approval is stored locally in `studio/.state/approvals/`; changes to presentation, variants, images or prices invalidate it. Shipping choices and publication are separate.

Studio now opens on Launch: approved product → real US freight/location/profile check → reviewed shipping choice → fresh native CJ listing plan → final confirmation → Activity and connection/stock verification. Future products enter this queue through Products → Approve for launch. Pending CJ listing requests must be resumed, preventing a second native listing submission.

Existing Shopify product updates keep the same variants and CJ identity references. No Shopify theme, product publication or supplier stock quantities were changed during this update. The first new native listing still needs an end-to-end live pilot; local tests do not establish its success.

A real, read-only check for Lune returned the cjdropshipping Shopify location, 28 US freight methods and the compatible General shipping profile. A profile is required; it includes at least one zero-fee rate, which does not establish coverage of every US address. Freight results use a basket containing one of each variant and are explicitly labeled as combined estimates, not per-unit shipping rates. No method or profile has been silently selected.

Local validation: content/price approval invalidation, shipping method/profile authenticity, expiration, acknowledgment and variant/location changes; existing product/link/inventory tests; HTTP origin/CSRF/private-file checks; production build; real Chrome at 1440px and 390px with six approved cards, publication blocked until shipping review, editor navigation, no horizontal overflow or page errors.

CJ native listing is the route for new products; Studio subsequently verifies actual CJ variant connections and inventory-management flags. Shopify tracking alone does not establish supplier synchronization. Some official CJ inventory settings, authorization and Shopify payments/market setup remain outside this local app. No promise is made that undocumented CJ settings can be changed through the API.
