# Phase 0 — MUST-NOT-LOSE confirmation checklist

Snapshot: commit `49b87cf`; 2026-10-15, Africa/Casablanca. This is the existing design to preserve, not a proposal for new features. Checkboxes are left unchecked for the owner's confirmation. Screenshots and their observed DOM are indexed in `baseline/manifest.json`.

## Shared shell

- [ ] Bone background, stone surfaces, ink text, muted ash text, clay accents, hairline borders, sharp controls, serif headings and sans-serif body; current saved width/color/font settings.
- [ ] Responsive spacing and column changes at phone, tablet and desktop sizes; skip-to-content link and visible keyboard focus.
- [ ] Dark announcement: “Considered bags. Everyday companions.” with underlined “Shop the collection →” CTA.
- [ ] Sticky single-row header: desktop navigation left, Atelier Vane wordmark centered, search and bag/count right.
- [ ] Desktop navigation: Shop, New arrivals, Our philosophy, Contact.
- [ ] Shop image menu: “Explore the atelier”, “A shape for every day.”, descriptive copy, View all, and six image cards: Shoulder bags, Crossbody bags, Tote bags, Mini and clutch bags, Wallets and cardholders, Accessories. Hover, click and keyboard access; close on pointer exit, Escape and outside click.
- [ ] Phone/tablet hamburger menu dialog with close button, same navigation, expandable Shop categories; centered wordmark and search/bag retained.
- [ ] Search dialog: heading, labeled search field, submit/close controls, predictive product/page suggestions, result images/text, keyboard selection, all-results link, loading/no-results/error states.
- [ ] Bag trigger/count and cart drawer entry points; account link remains conditional on actual Shopify account settings (not visible in this local fixture).
- [ ] Footer: linked brand name, brand copy, Shop category column, Client care column (FAQ, Contact, Shipping and returns, Our philosophy), Studio notes copy, email field and Join button, current-year copyright, policy links once each.
- [ ] Footer payment icons remain conditional on enabled payment methods (none in the current local fixture); newsletter success/error handling remains part of the existing native form.

## Homepage — saved section order

- [ ] Hero: image, dark overlay, brand eyebrow, “Quietly essential.”, supporting sentence and Explore the collection CTA.
- [ ] Explore by shape: six collection image tiles with titles and links.
- [ ] New arrivals: heading, View all link, six shared product cards.
- [ ] Our philosophy: image/text split, “Fewer, better things.”, two paragraphs and Atelier Vane Studio sign-off.
- [ ] In good company / Shop the look: large work-scene image, numbered product pins and matching text links for Plane tote bag and Turn wallet.
- [ ] Featured collection: heading, View all link, six shared product cards.
- [ ] Honest Construction: eyebrow, A Direct Comparison, supporting text, editable table with Materials, Hardware, Edges and seams, Interior, Care; brand and “What to look for” columns.
- [ ] Inquiries: Frequently Asked Questions, subheading, five native expandable questions and the currently approved answer copy.
- [ ] Benefits and homepage review sections are saved but currently render no content because their blocks/publication settings are empty/off. Preserve this intentional conditional state; do not invent benefits or reviews.
- [ ] No repeated standalone homepage newsletter section; the shared footer contains the signup.

## Shared product cards and quick view

- [ ] Product image/link, second-image hover where present, title, formatted price, compare-at/From/sale/sold-out states only where data supports them.
- [ ] Circle color choices, current selection styling, variant-aware price/link updates and native radio form submission.
- [ ] Quick add for eligible single-option variants; Choose options/quick view for multi-option products.
- [ ] Quick view dialog: image, title/link, price, Color and Size button groups, availability, add-to-bag, close, loading and error status.
- [ ] Unavailable products/images have existing honest placeholder/disabled states rather than invented values.

## Collection and collections list

- [ ] Breadcrumbs; title, description and optional collection image banner.
- [ ] Product count, sort select, desktop density choices and mobile Filters trigger.
- [ ] Availability, Color, Price and Product type filter groups with labeled controls/counts; Apply filters.
- [ ] Desktop open filter sidebar; phone/tablet modal containing the same filter form, with close control.
- [ ] Active filter chips, per-filter removal, Clear all, combined sort/filter query behavior, empty-match message.
- [ ] Product grid, pagination, existing two-column mobile layout.
- [ ] Collections list: collection image/title/product-count tiles, links, pagination and empty-state behavior.

## Product page — order and parts

- [ ] Breadcrumbs and two-column desktop gallery/buy box, stacked on smaller screens.
- [ ] Main image, active media, thumbnail navigation, Enlarge link and zoom dialog with close control. Preserve video/external-media rendering paths even though fixture media is image-only.
- [ ] Brand eyebrow, product title, price/compare-at, Color circle/pill choices and Size buttons; selected variant state and URL update.
- [ ] Quantity stepper, native quantity/form association, add-to-bag, sold-out/unavailable and status handling; native variant fallback without JavaScript.
- [ ] Product description; editable Materials, Dimensions, Care accordions with metafield/fallback content.
- [ ] Optional existing dynamic-checkout, app-block and custom-Liquid capabilities remain conditional (off/unpopulated in baseline).
- [ ] You may also like, To carry together, Recently viewed — in this order after main information, with conditional visibility and actual linked cards. Prior Cove visit enables the recently viewed baseline.
- [ ] Customer reviews LAST in the product content, before footer: Client reflections heading, Customer reviews, honest No ratings yet/zero summary in this fixture.
- [ ] Existing authentic-review capabilities (average, total, 5–1 star progress bars, filter/sort/clear/no-match) are data-conditional; no authentic review records exist in the current fixture. Synthetic review QA content is not storefront content.

## Cart drawer and cart page

- [ ] Drawer overlay/panel, heading, close control, empty state and continue-shopping link.
- [ ] Populated rows: image/title/product link, variant label, quantity minus/input/plus, remove, line price.
- [ ] Optional order note, subtotal, shipping/tax explanation, checkout button and live count/status/error updates.
- [ ] Native cart page with same item details, quantity/update controls, note, subtotal, checkout and empty state.
- [ ] Free-shipping progress remains hidden at saved threshold 0. Preserve existing conditional behavior for a verified positive threshold; it is not visible in baseline.
- [ ] Native discount allocation display paths are preserved; fixture has no discounts. Local checkout is only a connection-required notice, not a Shopify checkout.

## Search and content pages

- [ ] Full search page initial state: heading, labeled input and explore/help text.
- [ ] Search results: term/count, product cards, page excerpts/links and pagination; empty search results message.
- [ ] Our philosophy page: photo/text editorial layout, one main heading, two paragraphs and studio sign-off.
- [ ] FAQ page: Inquiries, Frequently Asked Questions as H1, subheading and the same five accordion questions as home, independently editable.
- [ ] Shipping and returns/general page: heading and rich-text content container.
- [ ] Contact: page heading/body, labeled name/email/phone/message inputs and submit control, native success/error paths.
- [ ] Policies: native policy URLs and editable content; local policy bodies are labeled placeholders.
- [ ] 404: current heading/message and navigation CTA.

## Conditional/platform screens to preserve, not falsely verified

- [ ] Password design in `layout/password.liquid` and `sections/main-password.liquid`: preparation eyebrow, brand heading, message, Store Access panel, labeled password field and Enter button. **Local `/password` returns 404; native page baseline pending Shopify.**
- [ ] Gift card Liquid page: real enabled/expired states, code, balance/currency, expiry, print action and missing-card fallback. Not available as a real local gift-card object.
- [ ] Theme editor settings, section/block controls, Shopify-provided content, accounts, newsletter/contact delivery, currencies and checkout require the destination Shopify store to verify.

## Local preview marker

- [ ] The beige “Local demo preview · AI placeholder images · Checkout and contact submissions require Shopify” notice is visible locally and is inserted by the preview server. It is a documented preview-only difference, not native theme content to add to Shopify.

Owner confirmation is pending. No cleanup, redesign or feature additions are authorized by this checklist.
