# Atelier Vane — Shopify theme and demo catalog

The existing Online Store 2.0 theme is being extended into a multi-product store without changing its palette, typography, buttons, or editorial style.

**Stages (a)–(g) are complete for local preparation.** The native theme, 22-product seed package, multi-product preview, local tests and theme ZIP are ready. Shopify import, theme-editor and checkout validation remain pending because no development store is connected. See [QA-REPORT.md](QA-REPORT.md).

Run `npm install`, then `npm start`, and open **http://localhost:3333**. The preview renders the actual theme Liquid with local fixture objects, supports browsing/search/filters and a simulated cart, and clearly labels its limits. It never creates a real order, account, subscription or contact message.

## Local review

- Open `seed/catalog-preview.html` in a browser to review the products, copy, primary-color imagery, and categories.
- `seed/catalog.json` is the source of truth: 22 products, 52 variants, $39–$129 demo prices, three demo compare-at prices.
- `seed/products.csv` uses the exact header row of Shopify’s official downloaded sample. It imports unpublished draft products. Hosted image URL cells are intentionally blank until you supply real URLs.
- Read [seed/README.md](seed/README.md) for the optional API seeder and URL preparation.
- Read [TAGS.md](TAGS.md), [IMAGE-LOG.md](IMAGE-LOG.md), [REPLACE-BEFORE-LAUNCH.md](REPLACE-BEFORE-LAUNCH.md), and [QA-REPORT.md](QA-REPORT.md).

Do not use the CSV and API seeder to create the same catalog in the same store. Pick one route. The API route rejects existing CSV-imported products because they have no API ownership marker.

## Keep the development store private

1. Use a Shopify partner development store, not a production store.
2. In Shopify admin, open **Online Store > Preferences**.
3. In **Password protection / Store access**, enable password protection, set a password and a demo message, and save.
4. Keep the password enabled throughout development. Draft products and unpublished pages do not appear in normal storefront browsing.
5. Activate or make demo resources visible only inside this password-protected development store when you are ready for storefront testing. Never remove password protection while demo data remains.

The scripts do not publish products, pages, collections, or themes and do not change store privacy settings.

## Import the CSV and upload images

These demo prices are in USD. Confirm the development store’s currency is USD before importing; CSV prices are numeric and are interpreted in the store currency.

1. In Shopify admin, open **Content > Files**.
2. Click **Upload files**, select the JPEGs in `seed/images/`, and wait for uploads to complete.
3. For each image, open its file details and copy the public CDN link.
4. Copy `seed/image-urls.example.json` to `seed/image-urls.json`. Paste each copied URL beside the exact matching filename. All 56 entries can be filled; the CSV uses the 44 product images.
5. From this project folder, run:
   ```sh
   node seed/build-csv.mjs --image-map seed/image-urls.json --require-images --output seed/products.with-images.csv
   ```
6. In Shopify admin, open **Products > Import > Add file**. Select `seed/products.with-images.csv`.
7. Keep **Overwrite products with matching handles** unchecked for the first import. Keep any option to publish new products to sales channels unchecked.
8. Click **Upload and preview**. Confirm the titles, vendor, prices, variant options, and images.
9. Click **Import products**. Wait for completion, then inspect the import notification/report.
10. In **Products**, filter by tag `demo`. Confirm 22 draft products. Inspect one Color-only product and **Line tote bag** (Color and Size); inventory tracking must be off.
11. Check that only **Drift shoulder bag**, **Loop crossbody bag**, and **Dusk clutch** have compare-at prices.
12. Images depict the first listed color only. Do not assign a Bone image to a Black variant. Photograph every real color before launch.

For an initial data-only import, use `seed/products.csv` as delivered. Products will have no images. Do not import an unfilled example URL or local filesystem path as an image URL.

Source: [Shopify product CSV documentation](https://help.shopify.com/en/manual/products/import-export/using-csv). The original sample URL and retrieval date are recorded in `seed/README.md`; its unrelated example products are excluded from this repository.

## Create automated collections

For each row below:

1. Open **Products > Collections > Create collection**.
2. Enter the title and the editable demo description from `seed/collections.json`.
3. Select the **Smart / Automated** collection type.
4. Set the condition to **Product tag > is equal to >** the tag below.
5. In **Search engine listing > Edit**, set the URL handle exactly as listed.
6. Upload the matching banner from `seed/images/` for each of the eight collections.
7. Save. Keep its sales-channel visibility disabled until private storefront testing.

| Title | Handle | Tag condition |
| --- | --- | --- |
| Shoulder bags | shoulder-bags | shoulder-bag |
| Crossbody bags | crossbody-bags | crossbody-bag |
| Tote bags | tote-bags | tote-bag |
| Mini and clutch bags | mini-and-clutch-bags | mini-bag |
| Wallets and cardholders | wallets-and-cardholders | wallet |
| Accessories | accessories | accessory |
| New arrivals | new-arrivals | new-arrival |
| Featured | featured | featured |

Draft products will not appear as purchasable storefront collection items. On the private development store, set demo products to **Active** and add them to **Online Store** only on the password-protected development store. Make the collections available to **Online Store** there as well.

## Create pages and product metafields

1. Open **Online Store > Pages > Add page**.
2. Create **Our philosophy**, **FAQ**, **Contact**, and **Shipping and returns** using the editable HTML in `seed/pages.json`.
3. Use **Search engine listing > Edit** to set handles `story`, `faq`, `contact`, and `shipping-returns`.
4. Keep visibility **Hidden** until private development testing.
5. Assign templates `page.story`, `page.faq`, `page.contact`, and `page.shipping` respectively when those templates are available in the store’s active theme.
6. Open **Settings > Custom data / Metafields and metaobjects > Products > Add definition**.
7. Create **Material**, **Dimensions**, and **Care** with namespace/key `custom.material`, `custom.dimensions`, and `custom.care`, all of type **Multi-line text**.
8. Open each demo product and fill these fields from its `metafields` object in `seed/catalog.json`. The API seeder writes their demo values automatically.
9. Replace the demo policy text with confirmed merchant policies under **Settings > Policies** before launch.

Our philosophy uses an editable image-and-text section in `page.story`. The FAQ page uses the same editable Inquiries accordion as the homepage, with its own heading and five question blocks in `page.faq`. Edit FAQ content in the theme editor for each placement. Shipping displays the editable page body. Contact displays that body with its native form. Product accordions read custom.material, custom.dimensions and custom.care, with editable fallback text.

## Create menus

1. Open **Content > Menus**.
2. Open **Main menu**, or add a menu with handle `main-menu` if it is absent.
3. Add **Shop**, linking to all products (`/collections/all`).
4. Add the six category collection links, then drag them beneath Shop to nest them.
5. Add **New arrivals** (collection), **Our philosophy** (page), and **Contact** (page), then save.
6. Open **Footer**, or create it with handle `footer`.
7. Add **Shop** with the six category children.
8. Add **Client care**, linking to FAQ, with children **FAQ**, **Contact**, **Shipping and returns**, and **Our philosophy**.
9. Configure real policies in **Settings > Policies**. The footer shows these once along the bottom; policies already included in a custom footer menu are not repeated.
10. Save. Compare the result with `seed/menus.json`.

Source: [Shopify menu editing instructions](https://help.shopify.com/en/manual/online-store/menus-and-links/editing-menus). Header dropdowns and the mobile menu now read the selected Main menu, including nested links. The footer reads its selected Footer menu, including nested links.

## Enable native filters

1. Install **Shopify Search & Discovery** from Shopify’s App Store if it is not installed.
2. Open **Apps > Search & Discovery > Filters > Add filter**.
3. Select **Availability** as the source and save.
4. Repeat for **Price**, **Product type**, and **Product option > Color**.
5. Keep the option’s name exactly `Color` across products.
6. Open a private collection preview and verify each filter, active chips, sorting, and clear-all behavior.

Source: [Shopify filter configuration](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-filters). The collection template now reads `collection.filters`. Only filters enabled in Search & Discovery appear; no filter controls are fabricated when Shopify returns none.

## Upload the theme and assign templates

1. Use `dist/atelier-vane-theme.zip`. The `seed/` folder and development documents are separate deliverables, not Shopify theme assets.
2. Open **Online Store > Themes > Add theme > Upload zip file**.
3. Select the theme ZIP and upload it to the theme library.
4. Open **Customize / Edit theme** and retain the existing colors, fonts, and brand name in **Theme settings**.
5. Select **Main menu** in the header and **Footer** in the footer settings.
6. Choose the six collections in category tiles, **New arrivals** and **Featured** in collection sections, and products for shop-the-look pins.
7. Keep reviews empty unless you have authentic customer reviews. Configure benefits using verified values.
8. To assign templates in resource editors, the templates must exist in the active theme. You may activate the reviewed theme on a password-protected **development store**; do not publish it to a production store during this process.
9. Open each product and collection, select its default theme template, and save.
10. Open each page and select the page templates listed above, then save.

## Local commands and checks

Native Liquid, CSS, and plain JavaScript power the storefront. Seed scripts use Node.js 22+ with built-in fetch; image compression uses Python 3 and Pillow. No third-party scripts are added to the storefront.

```sh
node seed/seed.mjs --dry-run
node seed/build-csv.mjs
node seed/validate.mjs
node --test --test-reporter=dot seed/seed.test.mjs
shopify theme check --path .
shopify theme dev --store your-development-store.myshopify.com
```

Install Shopify CLI using its [official installation instructions](https://shopify.dev/docs/api/shopify-cli). During stage (a), CLI 4.9.3 was installed in a temporary tools folder and Theme Check passed with zero errors and warnings. Live Shopify testing remains pending. Local mobile Lighthouse results are recorded in QA-REPORT.md.

`node preview-server.js` still serves the original standalone demonstration on port 3333. It contains separate hardcoded HTML and cannot validate Liquid, native filters, checkout, or the new catalog.

## Preserved design system

Bone `#F5F1EA`, Stone `#ECE5DA`, Ink `#1B1A18`, Ash `#6B6258`, Clay `#9A4F36`, border `#D9D0C3`; Garamond and Assistant selected in Shopify settings; 1320px container; 64–140px section spacing; sharp corners, hairline borders, existing button styles, and reduced-motion-aware transitions.


## Customize the completed storefront

1. In **Online Store > Themes > Customize > Header**, select **Main menu**, upload a logo if desired, set its width, and choose transparent-home-header and predictive-search settings. The desktop header places navigation on the left, the brand in the center, and actions on the right. The nested **Shop** menu opens on hover, click, or keyboard activation and shows each linked collection’s image (or its first product image). Change **Image menu link title** if you rename Shop; assign collection images in Shopify for the six visual category cards. Account links appear only when Shopify accounts are enabled. The cart setting selects a drawer or native cart page.
2. In **Home page > Hero**, upload real desktop/mobile photography and edit the eyebrow, heading, subheading and collection link. The AI fallback scenes are replaceable placeholders. The default overlay protects text contrast; recheck contrast after changing it.
3. In **Category tiles**, open each of the six blocks and select its collection. The known demo handles are assigned in the JSON template; missing resources show a friendly placeholder.
4. In the two **Featured collection** sections, choose **New arrivals** and **Featured**, edit headings and product counts. Empty collections do not create fake products.
5. In **Our philosophy**, replace demo editorial copy and photograph. In **Shop the look**, upload the matching scene, add Product pin blocks, select real products and position each pin; keyboard links below the scene duplicate the pin destinations. The template assigns two known demo products matching the work-scene image; missing products omit their pins. Resource defaults are not embedded in the section schema.
6. **Benefits** starts empty. Add only verified claims. **Reviews** starts unpublished with no blocks; add authentic names/text and explicitly publish when verified. Verified buyer defaults to false. Edit the footer’s **Studio notes** newsletter and confirm real Shopify form delivery. The homepage uses this single signup form.
7. Under **Theme settings > Product cards and collections**, choose image ratio, second image, swatches, quick shopping and desktop grid default. On a collection template, set banner/description visibility and products per page. Enable availability, price, Color and product-type filters as described above. Native filter state and sorting share a form; tag-route chips are intentionally omitted to avoid conflicting filter states.
8. In **Products > [product]**, supply accurate material/dimensions/care metafields and real variant photos. On the product template, edit blocks and fallback accordion text. Related/complementary sections use Shopify recommendations and remain hidden when empty; configure complementary products in **Search & Discovery**. Customer reviews appear last, after recommendations and recently viewed, before the footer. Recently viewed uses bounded localStorage inside try/catch and quietly hides if storage is blocked or invalid.
9. In **Footer**, choose **Footer** and edit brand/newsletter copy. Configure real policies under **Settings > Policies**. The Our philosophy page uses its editable section; other page templates display their admin-owned body content. Gift cards use Shopify's real balance, code and validity state.
10. Under **Theme settings > Cart and shipping**, enable notes and enter a free-shipping threshold only if the real shipping rules support it. The default 0 hides the bar; both page and drawer totals use Liquid money formatting in the active currency. The announcement bar is enabled with “Considered bags. Everyday companions.” and a “Shop the collection” CTA to `/collections/all`. Edit its text, CTA label and link in **Header > Announcement bar**, or disable it.

The obsolete single-product buy flow and fabricated customer quotes have been removed. At your request, the Inquiries section and its supplied FAQ copy are restored, and Honest Construction returns as an editable comparison table. Confirm the FAQ capacity, material, strap, delivery and return statements against your actual catalog and policies before launch. Old imagery is archived outside the theme in `seed/legacy-images/`; IMAGE-LOG.md retains provenance.

## Local preview and QA

Use Node 26 and install the development dependency with `npm install`. LiquidJS is used only by the local preview and QA scripts; the Shopify storefront loads native CSS and JavaScript with no dependency or external library. Python/Pillow optionally generates cached thumbnail sizes for local product/collection images; the preview falls back to the original image if resizing is unavailable. Shopify itself serves native responsive image sizes in the live theme.

```sh
npm start                  # http://localhost:3333; keep this terminal running
npm test                   # seven seed tests and six storefront fixture tests
npm run seed:validate      # catalog, CSV and image constraints
npm run test:browser        # requires npm start, Chrome and Node 26
shopify theme check --path .
npm run package:theme       # dist/atelier-vane-theme.zip and package-manifest.json
```

The preview simulates catalog filtering, pagination, recommendations and cart mutations using isolated in-memory cookie sessions. It approximates Shopify Liquid objects and filters and uses local font fallbacks. It does not verify Shopify service endpoints, production currency/locale behavior or app blocks. Contact, newsletter, account and checkout destinations explain the missing store connection instead of reporting success. Static serving is limited to public images/assets and review HTML; local environment files and private seed credentials are not served.

Desktop/mobile screenshots are in `seed/store-desktop.png` and `seed/store-mobile.png`. Browser results are in `seed/store-browser-results.json`. Historical stage review documents remain in seed/; use the running store for the completed implementation.

Mobile Lighthouse is optional QA tooling, installed outside the theme:

```sh
npm install --prefix /tmp/atelier-qa-tools lighthouse@12 --no-audit --no-fund
node seed/run-lighthouse.mjs
```

Run it without competing browser workloads. Reports are in `seed/lighthouse/`; these are local-fixture measurements, not Shopify storefront scores. Repeat Lighthouse on the password-protected development store after importing all 22 products and configuring fonts, menus and images.

## Deliverables and remaining live checks

- `dist/atelier-vane-theme.zip`: only the seven native Shopify theme directories; no seed data, Node modules, credentials or local-preview backend. Integrity hash and file count are in `dist/package-manifest.json`.
- `seed/`: original catalog/CSV/seeder/images, review fixtures and QA results. Import instructions above and [seed/README.md](seed/README.md) apply.
- [TAGS.md](TAGS.md), [IMAGE-LOG.md](IMAGE-LOG.md), [REPLACE-BEFORE-LAUNCH.md](REPLACE-BEFORE-LAUNCH.md), and [QA-REPORT.md](QA-REPORT.md).

When the store is available, run `shopify theme dev --store your-development-store.myshopify.com` and verify fresh-store CSV/API import, metafield and photo associations, menus, native filtering/pagination, recommendation intents, currencies/localized routes, theme-editor reloads, contact/newsletter delivery, checkout, account and gift-card behavior. Keep the password while demo products or photography remain. No store was published or modified during local work.

## Swatches, Inquiries and product reviews

The homepage and FAQ page include **Inquiries / Frequently Asked Questions**, with the five supplied questions and answers, and **Honest Construction / A Direct Comparison**. Edit both sections and their blocks in the theme editor. The construction table has editable product details/comparison notes and does not invent competitor specifications. FAQ text is the copy you requested; it is not a verified specification for all 22 demo products.

Color-only product cards now submit the checked circular swatch directly as the variant ID, including without JavaScript. Selecting a circle updates its price and product link. Multi-option card circles link to the color variant and Choose options opens quick view. Product details and quick view use labeled Color radio buttons in the original swatch style and separate Size buttons. The hidden full-variant selector remains only as the product-page JavaScript-disabled fallback.

Product details show **Customer reviews** with an honest empty state until authentic records exist. The average, total and 5–1 star bars are calculated from complete review records for that product. Newest/oldest/highest/lowest sorting, rating filtering, clickable star bars and clear-filter controls operate on those same records; an empty filter has its own message.

To publish real reviews, open **Customize > Products > Default product > Product reviews**. Add **Authentic review** blocks, select the matching **Reviewed product**, and enter the real reviewer name, text, rating and ISO date (YYYY-MM-DD). Verified buyer starts off and should reflect actual verified purchase records. Unassigned reviews and reviews for other products do not appear on a product page. Up to 50 review blocks are supported per section. No review-submission backend or review-app synchronization is implied; this theme currently uses merchant-managed authentic records.

Review-control tests use `seed/reviews-test-preview.html`, clearly marked **synthetic QA fixture** and excluded from Shopify upload. Its records are never seeded or displayed as customer reviews. Reproduce with:

```sh
node seed/build-reviews-test.mjs
node seed/check-refinements-browser.cjs  # requires npm start and Chrome
```
