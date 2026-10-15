# Phase 0 inventory

Snapshot: `49b87cf61b72dcaa54a7d93385cc0e9a669c0e5f`; 2026-10-15 (Africa/Casablanca).

This report inventories the unchanged native theme. Only reporting/evidence files are created in Phase 0. See `qa/baseline/README.md` for screenshot provenance and `qa/MUST-NOT-LOSE.md` for the confirmation checklist.

## Scope and reference method

Every file in assets/config/layout/locales/sections/snippets/templates is listed below. Literal render/include/section/sections, JSON section types, asset_url, CSS URL and known runtime section endpoint strings are traced. Platform-selected layouts/templates, collection/product/image picker data, app blocks, custom Liquid and JavaScript-built references are indirect; an absent static reference does not establish unused code. CSS selectors and runtime coverage belong to Phase 4. Line references point to the recorded source snapshot.

JSON template section order below is the saved design; schema presets are addable defaults, not proof of current visibility. Section/global setting values can be resolved from schema defaults where settings_data/JSON omit them.

## Counts

- assets: 22 files
- config: 2 files
- layout: 2 files
- locales: 1 files
- sections: 31 files
- snippets: 17 files
- templates: 17 files

- Section schemas: 29
- Section block types: 15
- Global theme setting IDs: 23
- Locale leaf keys: 57

## Templates and saved section/block instances

### templates/404.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-404.liquid`; disabled=False; settings={}

### templates/cart.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-cart.liquid`; disabled=False; settings={}

### templates/collection.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-collection.liquid`; disabled=False; settings={}

### templates/gift_card.liquid

Liquid platform entrypoint; declares layout none. No direct static reference found (not a deletion recommendation)

### templates/index.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `hero` → `sections/hero.liquid`; disabled=False; settings={"overlay_opacity": 60, "full_height": true, "eyebrow": "Atelier Vane", "heading": "Quietly essential.", "subhead": "Considered shapes for the things you carry.", "button_label": "Explore the collection", "button_link": "/collections/all"}
- `categories` → `sections/category-tiles.liquid`; disabled=False; settings={}
  - block `c0` type `category`; settings={"collection": "shoulder-bags", "label": "Shoulder bags"}
  - block `c1` type `category`; settings={"collection": "crossbody-bags", "label": "Crossbody bags"}
  - block `c2` type `category`; settings={"collection": "tote-bags", "label": "Tote bags"}
  - block `c3` type `category`; settings={"collection": "mini-and-clutch-bags", "label": "Mini and clutch bags"}
  - block `c4` type `category`; settings={"collection": "wallets-and-cardholders", "label": "Wallets and cardholders"}
  - block `c5` type `category`; settings={"collection": "accessories", "label": "Accessories"}
- `new` → `sections/featured-collection.liquid`; disabled=False; settings={"heading": "New arrivals", "collection": "new-arrivals", "limit": 6}
- `story` → `sections/brand-story.liquid`; disabled=False; settings={}
- `look` → `sections/shop-the-look.liquid`; disabled=False; settings={}
  - block `tote` type `pin`; settings={"product": "plane-tote-bag", "x": 34, "y": 60}
  - block `wallet` type `pin`; settings={"product": "turn-wallet", "x": 72, "y": 54}
- `featured` → `sections/featured-collection.liquid`; disabled=False; settings={"heading": "A considered edit", "collection": "featured", "limit": 6}
- `benefits` → `sections/trust-strip.liquid`; disabled=False; settings={}
- `reviews` → `sections/product-reviews.liquid`; disabled=False; settings={"publish_reviews": false}
- `construction` → `sections/comparison-table.liquid`; disabled=False; settings={}
  - block `construction-0` type `feature`; settings={"feature": "Materials", "our_text": "Find the stated composition on each product page.", "compare_text": "Check the material and finish for the piece you choose."}
  - block `construction-1` type `feature`; settings={"feature": "Hardware", "our_text": "Check the closure and hardware details for each design.", "compare_text": "Look for clear information about hardware and fastening."}
  - block `construction-2` type `feature`; settings={"feature": "Edges and seams", "our_text": "Explore the close-up product photographs.", "compare_text": "Compare finishing details using actual product photography."}
  - block `construction-3` type `feature`; settings={"feature": "Interior", "our_text": "See each product's dimensions and interior details.", "compare_text": "Compare capacity and pocket placement with your essentials."}
  - block `construction-4` type `feature`; settings={"feature": "Care", "our_text": "Follow the care information supplied for your product.", "compare_text": "Check the care instructions for the actual material."}
- `inquiries` → `sections/faq-accordion.liquid`; disabled=False; settings={}
  - block `inquiries-0` type `faq_item`; settings={"question": "Will my phone fit inside the bag?", "answer": "<p>Yes. The bag easily accommodates all modern smartphones up to the iPhone 15 Pro Max and Samsung Galaxy Ultra series, even when enclosed in a protective case, alongside a bifold wallet and keys.</p>"}
  - block `inquiries-1` type `faq_item`; settings={"question": "Is the leather water resistant?", "answer": "<p>Our full-grain leather is naturally resilient to light humidity and brief rainfall. If caught in rain, simply blot gently with a dry cotton cloth and allow it to air-dry at room temperature away from heat sources.</p>"}
  - block `inquiries-2` type `faq_item`; settings={"question": "How long does shipping take?", "answer": "<p>Orders are dispatched from our studio warehouse within 24 hours on business days. Standard delivery within the US takes 2–4 business days. Complimentary tracking is emailed upon fulfillment.</p>"}
  - block `inquiries-3` type `faq_item`; settings={"question": "What is your return policy?", "answer": "<p>We offer a 30-day trial period. If the bag does not suit your everyday needs, return it in original, unworn condition with its dust bag for a full refund. A prepaid return shipping label is provided.</p>"}
  - block `inquiries-4` type `faq_item`; settings={"question": "Can the shoulder strap length be adjusted?", "answer": "<p>The strap has a fixed 28 cm drop proportioned specifically to tuck securely under the arm and stay positioned on the shoulder without sliding off your coat.</p>"}

### templates/list-collections.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-list-collections.liquid`; disabled=False; settings={}

### templates/page.contact.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-contact.liquid`; disabled=False; settings={}

### templates/page.faq.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `inquiries` → `sections/faq-accordion.liquid`; disabled=False; settings={"page_heading": true}
  - block `inquiries-0` type `faq_item`; settings={"question": "Will my phone fit inside the bag?", "answer": "<p>Yes. The bag easily accommodates all modern smartphones up to the iPhone 15 Pro Max and Samsung Galaxy Ultra series, even when enclosed in a protective case, alongside a bifold wallet and keys.</p>"}
  - block `inquiries-1` type `faq_item`; settings={"question": "Is the leather water resistant?", "answer": "<p>Our full-grain leather is naturally resilient to light humidity and brief rainfall. If caught in rain, simply blot gently with a dry cotton cloth and allow it to air-dry at room temperature away from heat sources.</p>"}
  - block `inquiries-2` type `faq_item`; settings={"question": "How long does shipping take?", "answer": "<p>Orders are dispatched from our studio warehouse within 24 hours on business days. Standard delivery within the US takes 2–4 business days. Complimentary tracking is emailed upon fulfillment.</p>"}
  - block `inquiries-3` type `faq_item`; settings={"question": "What is your return policy?", "answer": "<p>We offer a 30-day trial period. If the bag does not suit your everyday needs, return it in original, unworn condition with its dust bag for a full refund. A prepaid return shipping label is provided.</p>"}
  - block `inquiries-4` type `faq_item`; settings={"question": "Can the shoulder strap length be adjusted?", "answer": "<p>The strap has a fixed 28 cm drop proportioned specifically to tuck securely under the arm and stay positioned on the shoulder without sliding off your coat.</p>"}

### templates/page.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-page.liquid`; disabled=False; settings={}

### templates/page.privacy.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-page.liquid`; disabled=False; settings={}

### templates/page.refund.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-page.liquid`; disabled=False; settings={}

### templates/page.shipping.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-page.liquid`; disabled=False; settings={}

### templates/page.story.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/brand-story.liquid`; disabled=False; settings={"page_heading": true, "eyebrow": "Atelier Vane", "heading": "Our philosophy", "story_text": "<p>We believe the pieces you reach for every day should feel effortless. Simple shapes, calm colors and considered proportions are the starting point for everything we design.</p><p>From a compact shoulder bag to a roomy tote, each silhouette has a place in the rhythm of a day. Our philosophy is to keep the essentials in focus and let the details speak quietly.</p>"}

### templates/page.terms.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-page.liquid`; disabled=False; settings={}

### templates/password.json

Platform entrypoint. Layout: password (platform selection; local renderer always uses theme).
- `main` → `sections/main-password.liquid`; disabled=False; settings={}

### templates/product.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-product.liquid`; disabled=False; settings={}
  - block `title` type `title`; settings={}
  - block `price` type `price`; settings={}
  - block `variant_picker` type `variant_picker`; settings={}
  - block `quantity_selector` type `quantity_selector`; settings={}
  - block `buy_buttons` type `buy_buttons`; settings={}
  - block `description` type `description`; settings={}
  - block `material` type `collapsible_tab`; settings={"heading": "Materials", "source": "material", "content": "<p>Information is being prepared. Contact us for details.</p>", "open_by_default": true}
  - block `dimensions` type `collapsible_tab`; settings={"heading": "Dimensions", "source": "dimensions", "content": "<p>Information is being prepared. Contact us for details.</p>", "open_by_default": false}
  - block `care` type `collapsible_tab`; settings={"heading": "Care", "source": "care", "content": "<p>Information is being prepared. Contact us for details.</p>", "open_by_default": false}
- `related` → `sections/product-recommendations.liquid`; disabled=False; settings={"intent": "related", "heading": "You may also like", "limit": 4}
- `complementary` → `sections/product-recommendations.liquid`; disabled=False; settings={"intent": "complementary", "heading": "To carry together", "limit": 4}
- `recent` → `sections/recently-viewed.liquid`; disabled=False; settings={}
- `reviews` → `sections/product-reviews.liquid`; disabled=False; settings={"publish_reviews": true, "heading": "Customer reviews", "show_empty": true}

### templates/search.json

Platform entrypoint. Layout: theme (platform selection; local renderer always uses theme).
- `main` → `sections/main-search.liquid`; disabled=False; settings={}

## Layouts and section groups

### layout/theme.liquid

No direct static reference found (not a deletion recommendation)

### layout/password.liquid

No direct static reference found (not a deletion recommendation)

### sections/header-group.json

layout/theme.liquid:55 (sections)

```json
{
  "name": "Header",
  "type": "header",
  "sections": {
    "announcement-bar": {
      "type": "announcement-bar",
      "settings": {
        "show_announcement": true,
        "text": "Considered bags. Everyday companions.",
        "cta_label": "Shop the collection",
        "link": "/collections/all"
      }
    },
    "header": {
      "type": "header",
      "settings": {
        "enable_transparent_header": false,
        "menu": "main-menu"
      }
    }
  },
  "order": [
    "announcement-bar",
    "header"
  ]
}
```

### sections/footer-group.json

layout/theme.liquid:61 (sections)

```json
{
  "name": "Footer",
  "type": "footer",
  "sections": {
    "footer": {
      "type": "footer",
      "settings": {
        "menu": "footer",
        "brand_bio": "Considered bags and everyday essentials. Calm colors, thoughtful proportions.",
        "newsletter_subtext": "New shapes, collection updates and occasional notes from the atelier.",
        "show_payment_icons": true,
        "show_newsletter": true
      }
    }
  },
  "order": [
    "footer"
  ]
}
```

## Sections, block types, presets and local settings

### sections/announcement-bar.liquid

Schema name: **Announcement bar**. Direct references: sections/header-group.json:6 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/404.json`, `templates/cart.json`, `templates/collection.json`, `templates/index.json`, `templates/list-collections.json`, `templates/page.contact.json`, `templates/page.faq.json`, `templates/page.json`, `templates/page.privacy.json`, `templates/page.refund.json`, `templates/page.shipping.json`, `templates/page.story.json`, `templates/page.terms.json`, `templates/product.json`, `templates/search.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.show_announcement | checkbox | true | sections/announcement-bar.liquid:1; declared in sections/announcement-bar.liquid schema |
| section.text | text | "Considered bags. Everyday companions." | sections/announcement-bar.liquid:4; declared in sections/announcement-bar.liquid schema |
| section.cta_label | text | "Shop the collection" | sections/announcement-bar.liquid:5; sections/announcement-bar.liquid:6; declared in sections/announcement-bar.liquid schema |
| section.link | url | "/collections/all" | sections/announcement-bar.liquid:5; sections/announcement-bar.liquid:6; declared in sections/announcement-bar.liquid schema |

### sections/brand-story.liquid

Schema name: **Our philosophy**. Direct references: templates/index.json:80 (JSON type (template/group)); templates/page.story.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/index.json`, `templates/page.story.json`.

Presets: [{"name": "Our philosophy"}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.page_heading | checkbox | false | sections/brand-story.liquid:29; declared in sections/brand-story.liquid schema |
| section.eyebrow | text | "Our philosophy" | sections/brand-story.liquid:26; sections/brand-story.liquid:27; declared in sections/brand-story.liquid schema |
| section.heading | text | "Fewer, better things." | sections/brand-story.liquid:9; sections/brand-story.liquid:16; sections/brand-story.liquid:29; declared in sections/brand-story.liquid schema |
| section.story_text | richtext | "<p>We believe the pieces you reach for every day should feel effortless. Simple shapes, calm colors and considered proportions are the starting point for everything we design.</p><p>From a compact shoulder bag to a roomy tote, each silhouette has a place in the rhythm of a day. Our philosophy is to keep the essentials in focus and let the details speak quietly.</p>" | sections/brand-story.liquid:31; declared in sections/brand-story.liquid schema |
| section.image | image_picker | "(absent)" | sections/brand-story.liquid:5; sections/brand-story.liquid:7; declared in sections/brand-story.liquid schema |
| section.signoff_name | text | "Atelier Vane Studio" | sections/brand-story.liquid:34; sections/brand-story.liquid:37; declared in sections/brand-story.liquid schema |
| section.signoff_title | text | "Design and proportion" | sections/brand-story.liquid:39; declared in sections/brand-story.liquid schema |

### sections/cart-drawer.liquid

Schema name: **Cart drawer**. Direct references: assets/cart-drawer.js:33 (endpoint/string reference; runtime verification required); assets/cart-drawer.js:35 (endpoint/string reference; runtime verification required); assets/cart-drawer.js:36 (endpoint/string reference; runtime verification required); assets/cart-drawer.js:36 (endpoint/string reference; runtime verification required); assets/catalog.js:166 (endpoint/string reference; runtime verification required); assets/catalog.js:182 (endpoint/string reference; runtime verification required); layout/theme.liquid:63 (section).

Template reachability (static + platform layout): `templates/404.json`, `templates/cart.json`, `templates/collection.json`, `templates/index.json`, `templates/list-collections.json`, `templates/page.contact.json`, `templates/page.faq.json`, `templates/page.json`, `templates/page.privacy.json`, `templates/page.refund.json`, `templates/page.shipping.json`, `templates/page.story.json`, `templates/page.terms.json`, `templates/product.json`, `templates/search.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

section: no setting IDs.

### sections/category-tiles.liquid

Schema name: **Category tiles**. Direct references: templates/index.json:16 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/index.json`.

Presets: [{"name": "Category tiles", "blocks": [{"type": "category"}, {"type": "category"}, {"type": "category"}, {"type": "category"}, {"type": "category"}, {"type": "category"}]}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=6.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.heading | text | "Explore by shape" | sections/category-tiles.liquid:1; declared in sections/category-tiles.liquid schema |

Block type `category`: {"type": "category", "name": "Collection"}

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| category.collection | collection | "(absent)" | sections/category-tiles.liquid:2; declared in sections/category-tiles.liquid schema |
| category.label | text | "Choose a collection" | sections/category-tiles.liquid:2; declared in sections/category-tiles.liquid schema |

### sections/comparison-table.liquid

Schema name: **Honest construction**. Direct references: templates/index.json:130 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/index.json`.

Presets: [{"name": "Honest construction", "blocks": [{"type": "feature", "settings": {"feature": "Materials", "our_text": "Find the stated composition on each product page.", "compare_text": "Check the material and finish for the piece you choose."}}, {"type": "feature", "settings": {"feature": "Hardware", "our_text": "Check the closure and hardware details for each design.", "compare_text": "Look for clear information about hardware and fastening."}}, {"type": "feature", "settings": {"feature": "Edges and seams", "our_text": "Explore the close-up product photographs.", "compare_text": "Compare finishing details using actual product photography."}}, {"type": "feature", "settings": {"feature": "Interior", "our_text": "See each product's dimensions and interior details.", "compare_text": "Compare capacity and pocket placement with your essentials."}}, {"type": "feature", "settings": {"feature": "Care", "our_text": "Follow the care information supplied for your product.", "compare_text": "Check the care instructions for the actual material."}}]}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=10.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.eyebrow | text | "Honest Construction" | sections/comparison-table.liquid:1; declared in sections/comparison-table.liquid schema |
| section.heading | text | "A Direct Comparison" | sections/comparison-table.liquid:1; declared in sections/comparison-table.liquid schema |
| section.subhead | text | "A closer look at the details that matter." | sections/comparison-table.liquid:1; declared in sections/comparison-table.liquid schema |
| section.other_heading | text | "What to look for" | sections/comparison-table.liquid:1; declared in sections/comparison-table.liquid schema |

Block type `feature`: {"type": "feature", "name": "Construction detail"}

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| feature.feature | text | "(absent)" | sections/comparison-table.liquid:1; declared in sections/comparison-table.liquid schema |
| feature.our_text | textarea | "(absent)" | sections/comparison-table.liquid:1; declared in sections/comparison-table.liquid schema |
| feature.compare_text | textarea | "(absent)" | sections/comparison-table.liquid:1; declared in sections/comparison-table.liquid schema |

### sections/custom-liquid.liquid

Schema name: **Custom Liquid**. Direct references: No direct static reference found (not a deletion recommendation).

Template reachability (static + platform layout): None found; endpoint-only or addable sections may still be needed..

Presets: [{"name": "Custom Liquid"}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.custom_liquid | liquid | "(absent)" | sections/custom-liquid.liquid:3; declared in sections/custom-liquid.liquid schema |

### sections/faq-accordion.liquid

Schema name: **FAQ**. Direct references: templates/index.json:183 (JSON type (template/group)); templates/page.faq.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/index.json`, `templates/page.faq.json`.

Presets: [{"name": "FAQ", "blocks": [{"type": "faq_item", "settings": {"question": "Will my phone fit inside the bag?", "answer": "<p>Yes. The bag easily accommodates all modern smartphones up to the iPhone 15 Pro Max and Samsung Galaxy Ultra series, even when enclosed in a protective case, alongside a bifold wallet and keys.</p>"}}, {"type": "faq_item", "settings": {"question": "Is the leather water resistant?", "answer": "<p>Our full-grain leather is naturally resilient to light humidity and brief rainfall. If caught in rain, simply blot gently with a dry cotton cloth and allow it to air-dry at room temperature away from heat sources.</p>"}}, {"type": "faq_item", "settings": {"question": "How long does shipping take?", "answer": "<p>Orders are dispatched from our studio warehouse within 24 hours on business days. Standard delivery within the US takes 2–4 business days. Complimentary tracking is emailed upon fulfillment.</p>"}}, {"type": "faq_item", "settings": {"question": "What is your return policy?", "answer": "<p>We offer a 30-day trial period. If the bag does not suit your everyday needs, return it in original, unworn condition with its dust bag for a full refund. A prepaid return shipping label is provided.</p>"}}, {"type": "faq_item", "settings": {"question": "Can the shoulder strap length be adjusted?", "answer": "<p>The strap has a fixed 28 cm drop proportioned specifically to tuck securely under the arm and stay positioned on the shoulder without sliding off your coat.</p>"}}]}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.page_heading | checkbox | false | sections/faq-accordion.liquid:7; declared in sections/faq-accordion.liquid schema |
| section.eyebrow | text | "Inquiries" | sections/faq-accordion.liquid:4; sections/faq-accordion.liquid:5; declared in sections/faq-accordion.liquid schema |
| section.heading | text | "Frequently Asked Questions" | sections/faq-accordion.liquid:7; declared in sections/faq-accordion.liquid schema |
| section.subhead | text | "Straightforward answers regarding sizing, leather care, and shipping." | sections/faq-accordion.liquid:8; sections/faq-accordion.liquid:9; declared in sections/faq-accordion.liquid schema |

Block type `faq_item`: {"type": "faq_item", "name": "FAQ item"}

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| faq_item.question | text | "Will my phone fit inside the bag?" | sections/faq-accordion.liquid:18; declared in sections/faq-accordion.liquid schema |
| faq_item.answer | richtext | "<p>Yes. The bag easily accommodates all modern smartphones up to the iPhone 15 Pro Max and Samsung Galaxy Ultra series, even when enclosed in a protective case, alongside a bifold wallet and keys.</p>" | sections/faq-accordion.liquid:19; declared in sections/faq-accordion.liquid schema |

### sections/featured-collection.liquid

Schema name: **Featured collection**. Direct references: templates/index.json:72 (JSON type (template/group)); templates/index.json:110 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/index.json`.

Presets: [{"name": "Featured collection"}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.heading | text | "A considered edit" | sections/featured-collection.liquid:1; declared in sections/featured-collection.liquid schema |
| section.collection | collection | "(absent)" | sections/featured-collection.liquid:1; declared in sections/featured-collection.liquid schema |
| section.limit | range | 6 | sections/featured-collection.liquid:1; declared in sections/featured-collection.liquid schema |

### sections/footer.liquid

Schema name: **Footer**. Direct references: sections/footer-group.json:3 (JSON type (template/group)); sections/footer-group.json:6 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/404.json`, `templates/cart.json`, `templates/collection.json`, `templates/index.json`, `templates/list-collections.json`, `templates/page.contact.json`, `templates/page.faq.json`, `templates/page.json`, `templates/page.privacy.json`, `templates/page.refund.json`, `templates/page.shipping.json`, `templates/page.story.json`, `templates/page.terms.json`, `templates/product.json`, `templates/search.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.brand_bio | textarea | "Considered bags and everyday essentials. Calm colors, thoughtful proportions." | sections/footer.liquid:7; declared in sections/footer.liquid schema |
| section.menu | link_list | "(absent)" | sections/footer.liquid:10; declared in sections/footer.liquid schema |
| section.show_newsletter | checkbox | true | sections/footer.liquid:42; declared in sections/footer.liquid schema |
| section.newsletter_subtext | text | "New shapes, collection updates and occasional notes from the atelier." | sections/footer.liquid:45; declared in sections/footer.liquid schema |
| section.show_payment_icons | checkbox | true | sections/footer.liquid:67; declared in sections/footer.liquid schema |

### sections/header.liquid

Schema name: **Header**. Direct references: config/settings_schema.json:14 (JSON type); config/settings_schema.json:54 (JSON type); config/settings_schema.json:75 (JSON type); config/settings_schema.json:85 (JSON type); sections/header-group.json:3 (JSON type (template/group)); sections/header-group.json:15 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/404.json`, `templates/cart.json`, `templates/collection.json`, `templates/index.json`, `templates/list-collections.json`, `templates/page.contact.json`, `templates/page.faq.json`, `templates/page.json`, `templates/page.privacy.json`, `templates/page.refund.json`, `templates/page.shipping.json`, `templates/page.story.json`, `templates/page.terms.json`, `templates/product.json`, `templates/search.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.logo | image_picker | "(absent)" | sections/header.liquid:14; sections/header.liquid:15; declared in sections/header.liquid schema |
| section.logo_width | range | 140 | sections/header.liquid:46; declared in sections/header.liquid schema |
| section.menu | link_list | "(absent)" | sections/header.liquid:1; declared in sections/header.liquid schema |
| section.mega_menu_title | text | "Shop" | sections/header.liquid:7; declared in sections/header.liquid schema |
| section.enable_transparent_header | checkbox | false | sections/header.liquid:3; declared in sections/header.liquid schema |
| section.enable_predictive_search | checkbox | true | sections/header.liquid:43; declared in sections/header.liquid schema |

### sections/hero.liquid

Schema name: **Hero**. Direct references: templates/index.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/index.json`.

Presets: [{"name": "Hero"}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.image | image_picker | "(absent)" | sections/hero.liquid:7; sections/hero.liquid:16; declared in sections/hero.liquid schema |
| section.mobile_image | image_picker | "(absent)" | sections/hero.liquid:9; sections/hero.liquid:12; declared in sections/hero.liquid schema |
| section.overlay_opacity | range | 60 | sections/hero.liquid:4; declared in sections/hero.liquid schema |
| section.full_height | checkbox | true | sections/hero.liquid:3; declared in sections/hero.liquid schema |
| section.eyebrow | text | "Bags and everyday essentials" | sections/hero.liquid:45; sections/hero.liquid:46; declared in sections/hero.liquid schema |
| section.heading | text | "Quietly essential." | sections/hero.liquid:24; sections/hero.liquid:32; sections/hero.liquid:50; declared in sections/hero.liquid schema |
| section.subhead | text | "Considered shapes for the things you carry." | sections/hero.liquid:53; sections/hero.liquid:55; declared in sections/hero.liquid schema |
| section.button_label | text | "Explore the collection" | sections/hero.liquid:59; sections/hero.liquid:62; declared in sections/hero.liquid schema |
| section.button_link | url | "(absent)" | sections/hero.liquid:61; declared in sections/hero.liquid schema |

### sections/main-404.liquid

Schema name: **404 page**. Direct references: templates/404.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/404.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

section: no setting IDs.

### sections/main-cart.liquid

Schema name: **Cart**. Direct references: templates/cart.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/cart.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

section: no setting IDs.

### sections/main-collection.liquid

Schema name: **Collection products**. Direct references: templates/collection.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/collection.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.show_image | checkbox | true | sections/main-collection.liquid:17; sections/main-collection.liquid:19; sections/main-collection.liquid:38; declared in sections/main-collection.liquid schema |
| section.show_description | checkbox | true | sections/main-collection.liquid:18; declared in sections/main-collection.liquid schema |
| section.products_per_page | range | 12 | sections/main-collection.liquid:21; declared in sections/main-collection.liquid schema |

### sections/main-contact.liquid

Schema name: **Contact form**. Direct references: templates/page.contact.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/page.contact.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

section: no setting IDs.

### sections/main-list-collections.liquid

Schema name: **Collections list**. Direct references: templates/list-collections.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/list-collections.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.heading | text | "Collections" | sections/main-list-collections.liquid:1; declared in sections/main-list-collections.liquid schema |
| section.collections_per_page | range | 12 | sections/main-list-collections.liquid:1; declared in sections/main-list-collections.liquid schema |

### sections/main-page.liquid

Schema name: **Page content**. Direct references: templates/page.json:4 (JSON type (template/group)); templates/page.privacy.json:4 (JSON type (template/group)); templates/page.refund.json:4 (JSON type (template/group)); templates/page.shipping.json:4 (JSON type (template/group)); templates/page.terms.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/page.json`, `templates/page.privacy.json`, `templates/page.refund.json`, `templates/page.shipping.json`, `templates/page.terms.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

section: no setting IDs.

### sections/main-password.liquid

Schema name: **Password page**. Direct references: templates/password.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/password.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

section: no setting IDs.

### sections/main-product.liquid

Schema name: **Product information**. Direct references: templates/product.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/product.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

section: no setting IDs.

Block type `@app`: {"type": "@app"}

@app: no setting IDs.

Block type `title`: {"type": "title", "name": "Title", "limit": 1}

title: no setting IDs.

Block type `price`: {"type": "price", "name": "Price", "limit": 1}

price: no setting IDs.

Block type `variant_picker`: {"type": "variant_picker", "name": "Variant picker", "limit": 1}

variant_picker: no setting IDs.

Block type `quantity_selector`: {"type": "quantity_selector", "name": "Quantity", "limit": 1}

quantity_selector: no setting IDs.

Block type `buy_buttons`: {"type": "buy_buttons", "name": "Buy buttons", "limit": 1}

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| buy_buttons.show_dynamic_checkout | checkbox | false | sections/main-product.liquid:13; declared in sections/main-product.liquid schema |

Block type `description`: {"type": "description", "name": "Description", "limit": 1}

description: no setting IDs.

Block type `collapsible_tab`: {"type": "collapsible_tab", "name": "Accordion"}

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| collapsible_tab.heading | text | "Details" | sections/main-product.liquid:15; declared in sections/main-product.liquid schema |
| collapsible_tab.source | select | "custom" | sections/main-product.liquid:15; declared in sections/main-product.liquid schema |
| collapsible_tab.content | richtext | "<p>Details are being prepared. Contact us with any questions.</p>" | sections/main-product.liquid:15; declared in sections/main-product.liquid schema |
| collapsible_tab.open_by_default | checkbox | false | sections/main-product.liquid:15; declared in sections/main-product.liquid schema |

Block type `custom_liquid`: {"type": "custom_liquid", "name": "Custom Liquid"}

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| custom_liquid.custom_liquid | liquid | "(absent)" | sections/main-product.liquid:16; declared in sections/main-product.liquid schema |

### sections/main-search.liquid

Schema name: **Search**. Direct references: templates/search.json:4 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/search.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.enable_predictive_search | checkbox | true | sections/main-search.liquid:4; declared in sections/main-search.liquid schema |
| section.results_per_page | range | 12 | sections/main-search.liquid:7; declared in sections/main-search.liquid schema |

### sections/newsletter.liquid

Schema name: **Email signup**. Direct references: No direct static reference found (not a deletion recommendation).

Template reachability (static + platform layout): None found; endpoint-only or addable sections may still be needed..

Presets: [{"name": "Email signup"}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.eyebrow | text | "Correspondence" | sections/newsletter.liquid:5; sections/newsletter.liquid:6; declared in sections/newsletter.liquid schema |
| section.heading | text | "Join The Atelier Journal" | sections/newsletter.liquid:8; declared in sections/newsletter.liquid schema |
| section.subhead | text | "Product updates and occasional notes from the studio. We write sparingly." | sections/newsletter.liquid:9; sections/newsletter.liquid:10; declared in sections/newsletter.liquid schema |
| section.button_label | text | "Subscribe" | sections/newsletter.liquid:43; declared in sections/newsletter.liquid schema |
| section.success_message | text | "Thank you for subscribing. Welcome to our quiet correspondence." | sections/newsletter.liquid:18; declared in sections/newsletter.liquid schema |
| section.disclaimer | text | "You may unsubscribe at any time. We respect your privacy." | sections/newsletter.liquid:46; sections/newsletter.liquid:48; declared in sections/newsletter.liquid schema |

### sections/predictive-search.liquid

Schema name: **Predictive search**. Direct references: assets/header.js:153 (endpoint/string reference; runtime verification required).

Template reachability (static + platform layout): `templates/404.json`, `templates/cart.json`, `templates/collection.json`, `templates/index.json`, `templates/list-collections.json`, `templates/page.contact.json`, `templates/page.faq.json`, `templates/page.json`, `templates/page.privacy.json`, `templates/page.refund.json`, `templates/page.shipping.json`, `templates/page.story.json`, `templates/page.terms.json`, `templates/product.json`, `templates/search.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

section: no setting IDs.

### sections/product-recommendations.liquid

Schema name: **Product recommendations**. Direct references: templates/product.json:72 (JSON type (template/group)); templates/product.json:80 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/product.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.heading | text | "You may also like" | sections/product-recommendations.liquid:2; declared in sections/product-recommendations.liquid schema |
| section.intent | select | "related" | sections/product-recommendations.liquid:1; declared in sections/product-recommendations.liquid schema |
| section.limit | range | 4 | sections/product-recommendations.liquid:1; declared in sections/product-recommendations.liquid schema |

### sections/product-reviews.liquid

Schema name: **Product reviews**. Direct references: templates/index.json:123 (JSON type (template/group)); templates/product.json:92 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/index.json`, `templates/product.json`.

Presets: [{"name": "Product reviews", "blocks": []}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=50.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.publish_reviews | checkbox | false | sections/product-reviews.liquid:15; declared in sections/product-reviews.liquid schema |
| section.show_empty | checkbox | false | sections/product-reviews.liquid:15; declared in sections/product-reviews.liquid schema |
| section.eyebrow | text | "Client reflections" | sections/product-reviews.liquid:17; declared in sections/product-reviews.liquid schema |
| section.heading | text | "Customer reviews" | sections/product-reviews.liquid:17; declared in sections/product-reviews.liquid schema |

Block type `review`: {"type": "review", "name": "Authentic review"}

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| review.product | product | "(absent)" | sections/product-reviews.liquid:6; sections/product-reviews.liquid:20; sections/product-reviews.liquid:24; declared in sections/product-reviews.liquid schema |
| review.reviewer_name | text | "(absent)" | sections/product-reviews.liquid:9; sections/product-reviews.liquid:20; sections/product-reviews.liquid:24; declared in sections/product-reviews.liquid schema |
| review.title | text | "(absent)" | sections/product-reviews.liquid:24; declared in sections/product-reviews.liquid schema |
| review.rating | range | 5 | sections/product-reviews.liquid:11; sections/product-reviews.liquid:20; sections/product-reviews.liquid:24; declared in sections/product-reviews.liquid schema |
| review.review_text | textarea | "(absent)" | sections/product-reviews.liquid:9; sections/product-reviews.liquid:20; sections/product-reviews.liquid:24; declared in sections/product-reviews.liquid schema |
| review.date | text | "(absent)" | sections/product-reviews.liquid:24; declared in sections/product-reviews.liquid schema |
| review.verified_buyer | checkbox | false | sections/product-reviews.liquid:24; declared in sections/product-reviews.liquid schema |

### sections/quick-view.liquid

Schema name: **Quick view**. Direct references: assets/catalog.js:132 (endpoint/string reference; runtime verification required).

Template reachability (static + platform layout): `templates/404.json`, `templates/cart.json`, `templates/collection.json`, `templates/index.json`, `templates/list-collections.json`, `templates/page.contact.json`, `templates/page.faq.json`, `templates/page.json`, `templates/page.privacy.json`, `templates/page.refund.json`, `templates/page.shipping.json`, `templates/page.story.json`, `templates/page.terms.json`, `templates/product.json`, `templates/search.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

section: no setting IDs.

### sections/recent-product-card.liquid

Schema name: **Recent product card**. Direct references: assets/product.js:99 (endpoint/string reference; runtime verification required).

Template reachability (static + platform layout): `templates/404.json`, `templates/cart.json`, `templates/collection.json`, `templates/index.json`, `templates/list-collections.json`, `templates/page.contact.json`, `templates/page.faq.json`, `templates/page.json`, `templates/page.privacy.json`, `templates/page.refund.json`, `templates/page.shipping.json`, `templates/page.story.json`, `templates/page.terms.json`, `templates/product.json`, `templates/search.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

section: no setting IDs.

### sections/recently-viewed.liquid

Schema name: **Recently viewed**. Direct references: templates/product.json:88 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/product.json`.

Presets: [].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=unspecified.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.heading | text | "Recently viewed" | sections/recently-viewed.liquid:1; declared in sections/recently-viewed.liquid schema |
| section.limit | range | 4 | sections/recently-viewed.liquid:1; declared in sections/recently-viewed.liquid schema |

### sections/shop-the-look.liquid

Schema name: **Shop the look**. Direct references: templates/index.json:84 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/index.json`.

Presets: [{"name": "Shop the look"}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=5.

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| section.heading | text | "In good company" | sections/shop-the-look.liquid:1; declared in sections/shop-the-look.liquid schema |
| section.image | image_picker | "(absent)" | sections/shop-the-look.liquid:1; declared in sections/shop-the-look.liquid schema |

Block type `pin`: {"type": "pin", "name": "Product pin"}

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| pin.product | product | "(absent)" | sections/shop-the-look.liquid:2; declared in sections/shop-the-look.liquid schema |
| pin.x | range | 50 | sections/shop-the-look.liquid:2; declared in sections/shop-the-look.liquid schema |
| pin.y | range | 50 | sections/shop-the-look.liquid:2; declared in sections/shop-the-look.liquid schema |

### sections/trust-strip.liquid

Schema name: **Benefits**. Direct references: templates/index.json:118 (JSON type (template/group)).

Template reachability (static + platform layout): `templates/index.json`.

Presets: [{"name": "Benefits"}].

Placement: enabled_on="unspecified"; disabled_on="unspecified"; max_blocks=4.

section: no setting IDs.

Block type `benefit`: {"type": "benefit", "name": "Verified benefit"}

| Scope / ID | Type | Default | Literal reads / schema declaration |
|---|---|---|---|
| benefit.title | text | "(absent)" | sections/trust-strip.liquid:1; declared in sections/trust-strip.liquid schema |
| benefit.text | textarea | "(absent)" | sections/trust-strip.liquid:1; declared in sections/trust-strip.liquid schema |

## Snippets

| File | Incoming references | Template reachability |
|---|---|---|
| snippets/cart-item.liquid | sections/cart-drawer.liquid:60 (render); sections/main-cart.liquid:1 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/collection-filters.liquid | sections/main-collection.liquid:35 (render) | templates/collection.json |
| snippets/color-swatch.liquid | snippets/product-card.liquid:57 (render); snippets/product-options.liquid:13 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/free-shipping-bar.liquid | sections/cart-drawer.liquid:39 (render); sections/main-cart.liquid:1 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/icon-cart.liquid | sections/header.liquid:27 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/icon-chevron.liquid | snippets/product-accordion.liquid:14 (render) | templates/index.json, templates/page.faq.json, templates/product.json |
| snippets/icon-close.liquid | sections/cart-drawer.liquid:33 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/navigation-tree.liquid | sections/header.liquid:7 (render); sections/header.liquid:32 (render); sections/header.liquid:37 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/price.liquid | sections/main-product.liquid:10 (render); sections/predictive-search.liquid:9 (render); sections/quick-view.liquid:13 (render); snippets/product-card.liquid:51 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/product-accordion.liquid | sections/faq-accordion.liquid:16 (render); sections/main-product.liquid:15 (render) | templates/index.json, templates/page.faq.json, templates/product.json |
| snippets/product-card.liquid | sections/featured-collection.liquid:1 (render); sections/main-collection.liquid:38 (render); sections/main-search.liquid:12 (render); sections/product-recommendations.liquid:2 (render); sections/recent-product-card.liquid:1 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/product-media-gallery.liquid | sections/main-product.liquid:6 (render) | templates/product.json |
| snippets/product-options.liquid | sections/main-product.liquid:11 (render); sections/quick-view.liquid:17 (render); snippets/product-card.liquid:65 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/product-variant-data.liquid | sections/main-product.liquid:17 (render); snippets/product-card.liquid:66 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/search-form.liquid | sections/header.liquid:43 (render); sections/main-search.liquid:4 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/seo-tags.liquid | layout/theme.liquid:10 (render) | templates/404.json, templates/cart.json, templates/collection.json, templates/index.json, templates/list-collections.json, templates/page.contact.json, templates/page.faq.json, templates/page.json, templates/page.privacy.json, templates/page.refund.json, templates/page.shipping.json, templates/page.story.json, templates/page.terms.json, templates/product.json, templates/search.json |
| snippets/structured-data.liquid | sections/main-product.liquid:3 (render) | templates/product.json |

## Assets (including all images)

| File | Bytes | SHA-256 | Incoming references |
|---|---|---|
| assets/base.css | 43619 | 489c201be1f0c99f9c9b40dabb784f424140f88d38cf8da7cd51df26220c0584 | layout/password.liquid:31 (asset_url); layout/theme.liquid:35 (asset_url); templates/gift_card.liquid:2 (asset_url) |
| assets/cart-drawer.js | 5343 | b89a39f21d17897136629ee49265881cb1a3d9c1105220b653fc2fefa0013ffb | layout/theme.liquid:45 (asset_url) |
| assets/catalog.css | 6860 | 0660651de3c0b2bbd53555dafca35b7ae8adca5e4f15cb245ebef72ac2bc271e | layout/theme.liquid:36 (asset_url) |
| assets/catalog.js | 12155 | f357ed8a769683df80ebca15ced01f880d208bbd2d806ebaadfe1baa7e288d5b | layout/theme.liquid:46 (asset_url) |
| assets/demo-hero-1100.webp | 56008 | c5c98de48ed64b4b7c1989ac311478e45304d18c2bcc0578f04cc99333ee10a2 | sections/hero.liquid:29 (asset_url); sections/hero.liquid:30 (asset_url) |
| assets/demo-hero-1600.webp | 93464 | 0d1604954007e1592b768f67654e4c31d03435f3ce16bcddb6d0c7294a67f706 | sections/hero.liquid:30 (asset_url) |
| assets/demo-hero-750.webp | 33138 | 55e2af33f6521cc7142128fa85f09ef7722c6ebfd53ae7eda57dd46058fc338b | sections/hero.liquid:30 (asset_url) |
| assets/demo-hero.webp | 98180 | 4166fc66d46a432657801afa672402d2eeaa86c6f3350783cd898a86beee4e4c | No direct static reference found (not a deletion recommendation) |
| assets/demo-look-1600.webp | 100834 | 2762e0e4298c33b0c031a6d8675cfb8f3c1e23bfbf4048ffbb7200b6a18bab81 | sections/shop-the-look.liquid:1 (asset_url) |
| assets/demo-look-480.webp | 17800 | f67bba8be6a7c1a6b727104e045a8ad42a804b4e7f2416a95bbc596d2fd61be3 | sections/shop-the-look.liquid:1 (asset_url) |
| assets/demo-look-900.webp | 47658 | 7f332f06c0b21010950736a34003b16bd7e6f5da62707df5b25422be8ae9636a | sections/shop-the-look.liquid:1 (asset_url); sections/shop-the-look.liquid:1 (asset_url) |
| assets/demo-look.webp | 105172 | 4c62604510c052df231e55c76f05e9a56ab6e2252cc656aceafe06669103aee1 | No direct static reference found (not a deletion recommendation) |
| assets/demo-story-1200.webp | 45006 | 4783e51707849b632bba23799f2e6991890b434f4cde9b1d5e2d76277d5717a5 | sections/brand-story.liquid:14 (asset_url) |
| assets/demo-story-480.webp | 10752 | 38d35802727a3f18c46333dd23c165229ef065e3c344079f4658da412da81263 | sections/brand-story.liquid:14 (asset_url) |
| assets/demo-story-750.webp | 21180 | 6992b8afb40a68e47a1dc75addcb5564fc225d2da9ac38a891255e76b86b226b | sections/brand-story.liquid:13 (asset_url); sections/brand-story.liquid:14 (asset_url) |
| assets/demo-story.webp | 76710 | faaac9f5edd0f7627d40c9f66bfc43c4ae6f272cc7d1b2e1afd81721a5906281 | No direct static reference found (not a deletion recommendation) |
| assets/header.css | 7748 | 4f816377a0c7f01ce9c419e3ae84f5dc6d537ee03279b6cf92ace1391e2a6f74 | layout/theme.liquid:37 (asset_url) |
| assets/header.js | 12009 | 2ff6e04a72b76951c2e3a24207a07e3b8a944cdc8f67c77596ccfcae5b568e8d | layout/theme.liquid:47 (asset_url) |
| assets/product.js | 8005 | 0f6ee161fa975593aba1410da673cce6588aed5981bf9ad9f7c86239da950b89 | layout/theme.liquid:43 (asset_url) |
| assets/reviews.js | 2501 | bb2053a59ccc51c0c7252df12678baa76513e418d59f9a81becccc1eb8fcb631 | layout/theme.liquid:44 (asset_url) |
| assets/store.css | 9137 | 8ae130af8ed327264790447dab6483afca3ad4a9b3081b22e91cf5a74140168f | layout/theme.liquid:38 (asset_url) |
| assets/theme.js | 992 | 20963ef05042a8e143a6abcfa35006a084a7fadf0a3c863f9ae7a2af374003fd | layout/theme.liquid:42 (asset_url) |

## Global theme settings

| Group / ID | Type | Schema default | Saved current | Literal reads |
|---|---|---|---|---|
| Colors / color_bg | color | "#F5F1EA" | "#F5F1EA" | layout/password.liquid:7; layout/password.liquid:20; layout/theme.liquid:8; layout/theme.liquid:21 |
| Colors / color_surface | color | "#ECE5DA" | "#ECE5DA" | layout/password.liquid:21; layout/theme.liquid:22 |
| Colors / color_ink | color | "#1B1A18" | "#1B1A18" | layout/password.liquid:22; layout/theme.liquid:23 |
| Colors / color_muted | color | "#6B6258" | "#6B6258" | layout/password.liquid:23; layout/theme.liquid:24 |
| Colors / color_accent | color | "#9A4F36" | "#9A4F36" | layout/password.liquid:24; layout/theme.liquid:25 |
| Colors / color_border | color | "#D9D0C3" | "#D9D0C3" | layout/password.liquid:25; layout/theme.liquid:26 |
| Colors / color_inverse_bg | color | "#1B1A18" | "#1B1A18" | layout/theme.liquid:27 |
| Colors / color_inverse_text | color | "#F5F1EA" | "#F5F1EA" | layout/theme.liquid:28 |
| Typography / heading_font | font_picker | "garamond_n4" | "garamond_n4" | layout/password.liquid:16; layout/password.liquid:26; layout/theme.liquid:17; layout/theme.liquid:29 |
| Typography / body_font | font_picker | "assistant_n4" | "assistant_n4" | layout/password.liquid:17; layout/password.liquid:27; layout/theme.liquid:18; layout/theme.liquid:30 |
| Layout & spacing / page_width | range | 1320 | 1320 | layout/theme.liquid:31 |
| Product cards and collections / card_image_ratio | select | "3/4" | "(inherits schema/default or unset)" | snippets/product-card.liquid:10 |
| Product cards and collections / card_show_second_image | checkbox | true | "(inherits schema/default or unset)" | snippets/product-card.liquid:36 |
| Product cards and collections / card_show_swatches | checkbox | true | "(inherits schema/default or unset)" | snippets/product-card.liquid:27; snippets/product-card.liquid:52 |
| Product cards and collections / card_show_quick_add | checkbox | true | "(inherits schema/default or unset)" | snippets/product-card.liquid:53; snippets/product-card.liquid:62 |
| Product cards and collections / collection_grid_columns | select | "3" | "(inherits schema/default or unset)" | sections/featured-collection.liquid:1; sections/main-collection.liquid:3 |
| Brand / brand_name | text | "Atelier Vane" | "Atelier Vane" | layout/theme.liquid:66; sections/comparison-table.liquid:1; sections/footer.liquid:6; sections/footer.liquid:61; sections/header.liquid:13; sections/header.liquid:16; sections/header.liquid:36; sections/main-collection.liquid:18; sections/main-password.liquid:4; sections/main-product.liquid:9 |
| Cart & shipping / cart_type | select | "drawer" | "drawer" | layout/theme.liquid:64; sections/header.liquid:26 |
| Cart & shipping / free_shipping_threshold | number | 0 | 0 | snippets/free-shipping-bar.liquid:8 |
| Cart & shipping / enable_cart_notes | checkbox | true | true | sections/cart-drawer.liquid:68; sections/main-cart.liquid:1 |
| Favicon / favicon | image_picker | "(absent)" | "(inherits schema/default or unset)" | layout/password.liquid:11; layout/password.liquid:12; layout/theme.liquid:12; layout/theme.liquid:13 |
| Social media / social_instagram_link | text | "(absent)" | "(inherits schema/default or unset)" | No literal read found; inspect indirect access |
| Social media / social_pinterest_link | text | "(absent)" | "(inherits schema/default or unset)" | No literal read found; inspect indirect access |

## Locale keys

Plural leaves are listed individually; references to their parent translation key apply to each form. Schema `t:` references are included in this scan.

| Key | Value | References |
|---|---|---|
| general.skip_to_content | Skip to content | layout/theme.liquid:52 |
| general.share | Share | No literal translation/schema reference found; do not remove in Phase 0 |
| general.close | Close | sections/cart-drawer.liquid:31 |
| general.menu | Menu | No literal translation/schema reference found; do not remove in Phase 0 |
| general.open_menu | Open navigation menu | No literal translation/schema reference found; do not remove in Phase 0 |
| general.close_menu | Close navigation menu | No literal translation/schema reference found; do not remove in Phase 0 |
| general.search | Search | No literal translation/schema reference found; do not remove in Phase 0 |
| general.loading | Loading... | No literal translation/schema reference found; do not remove in Phase 0 |
| general.error | An error occurred. Please try again. | No literal translation/schema reference found; do not remove in Phase 0 |
| general.breadcrumbs.home | Home | No literal translation/schema reference found; do not remove in Phase 0 |
| accessibility.close | Close | No literal translation/schema reference found; do not remove in Phase 0 |
| accessibility.unit_price_separator | per | No literal translation/schema reference found; do not remove in Phase 0 |
| accessibility.star_reviews_info | {{ rating_value }} out of {{ rating_max }} stars | No literal translation/schema reference found; do not remove in Phase 0 |
| accessibility.total_reviews | {{ count }} reviews | No literal translation/schema reference found; do not remove in Phase 0 |
| accessibility.skip_to_text | Skip to content | No literal translation/schema reference found; do not remove in Phase 0 |
| accessibility.collapsible_section | Collapsible section | No literal translation/schema reference found; do not remove in Phase 0 |
| sections.header.announcement | Announcement | sections/announcement-bar.liquid:2 |
| sections.header.cart_count.one | {{ count }} item | No literal translation/schema reference found; do not remove in Phase 0 |
| sections.header.cart_count.other | {{ count }} items | No literal translation/schema reference found; do not remove in Phase 0 |
| sections.footer.payment_methods | Accepted payment methods | No literal translation/schema reference found; do not remove in Phase 0 |
| sections.footer.copyright | All rights reserved. | No literal translation/schema reference found; do not remove in Phase 0 |
| sections.cart.title | Your Bag | sections/cart-drawer.liquid:12; sections/cart-drawer.liquid:22 |
| sections.cart.empty | Your bag is empty | sections/cart-drawer.liquid:48 |
| sections.cart.continue_shopping | Continue shopping | sections/cart-drawer.liquid:54 |
| sections.cart.subtotal | Subtotal | sections/cart-drawer.liquid:90 |
| sections.cart.taxes_and_shipping_policy_at_checkout_html | Taxes and <a href="{{ link }}">shipping</a> calculated at checkout | No literal translation/schema reference found; do not remove in Phase 0 |
| sections.cart.taxes_and_shipping_at_checkout | Taxes and shipping calculated at checkout | sections/cart-drawer.liquid:97 |
| sections.cart.checkout | Proceed to Checkout | sections/cart-drawer.liquid:107 |
| sections.cart.note | Add order notes | sections/cart-drawer.liquid:71; sections/cart-drawer.liquid:75 |
| sections.cart.save_note | Save note | No literal translation/schema reference found; do not remove in Phase 0 |
| sections.cart.free_shipping_unlocked | You have unlocked complimentary shipping | snippets/free-shipping-bar.liquid:29 |
| sections.cart.free_shipping_remaining_html | Add <span class="font-medium">{{ amount }}</span> more for complimentary shipping | snippets/free-shipping-bar.liquid:34 |
| sections.cart.item_added | Item added to bag | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.add_to_cart | Add to Bag | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.sold_out | Sold Out | snippets/price.liquid:54 |
| products.product.unavailable | Unavailable | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.quantity.label | Quantity | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.quantity.increase | Increase quantity for {{ product }} | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.quantity.decrease | Decrease quantity for {{ product }} | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.price.from_price_html | From {{ price }} | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.price.regular_price | Regular price | snippets/price.liquid:38; snippets/price.liquid:43 |
| products.product.price.sale_price | Sale price | snippets/price.liquid:34 |
| products.product.price.unit_price | Unit price | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.taxes_included | Taxes included. | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.inventory.low_stock | Only {{ count }} remaining in stock | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.inventory.in_stock | In stock and ready to ship | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.media.open_featured_media | Open featured media in modal zoom | No literal translation/schema reference found; do not remove in Phase 0 |
| products.product.media.play_video | Play video | No literal translation/schema reference found; do not remove in Phase 0 |
| templates.404.title | Page not found | sections/main-404.liquid:5 |
| templates.404.subtext | The page you are looking for does not exist or has been moved. | sections/main-404.liquid:8 |
| templates.404.button | Return to Store | sections/main-404.liquid:11 |
| templates.contact.form.name | Name | sections/main-contact.liquid:36 |
| templates.contact.form.email | Email | sections/main-contact.liquid:49 |
| templates.contact.form.phone | Phone number | sections/main-contact.liquid:68 |
| templates.contact.form.comment | Message | sections/main-contact.liquid:81 |
| templates.contact.form.send | Send Message | sections/main-contact.liquid:4; sections/main-contact.liquid:95 |
| templates.contact.form.post_success | Thank you for reaching out. We will respond within one business day. | sections/main-contact.liquid:21 |

## Config and locale documents

- `config/settings_schema.json`: platform-consumed document; No direct static reference found (not a deletion recommendation).
- `config/settings_data.json`: platform-consumed document; No direct static reference found (not a deletion recommendation).
- `locales/en.default.json`: platform-consumed document; No direct static reference found (not a deletion recommendation).

## Saved design values and external demo dependencies

- Full setting declarations and defaults are preserved in `qa/inventory-data.json`; saved current values are in `config/settings_data.json`.
- Local catalog: `seed/catalog.json` (22 products, 52 variants), `seed/collections.json` (8 collections), `seed/menus.json` (2 menus), `seed/pages.json` (4 pages), `seed/images/` (56 images). These are local fixtures, not embedded Shopify database objects.
- Uploaded Shopify theme resolves product, collection, menu and image picker handles against the destination store. Importing matching data is required; this inventory does not assert that upload alone reproduces local fixture content.
- Native themes have no `blocks/` directory in this snapshot; block types are declared in section schemas.
- No theme edits, deletions, fix commits, release tag, new Shopify store or live imports occurred during Phase 0.

## Phase 0 baseline disposition

The owner selected local baseline only; Shopify connection remains deferred. The completed Playwright run recorded 82 working local screenshots across 390/768/1280/1536 px, four password-route 404 observations (native password baseline blocked), and two intentionally inapplicable desktop mobile-menu cases. See `qa/baseline/index.html`, `qa/baseline/README.md` and `qa/baseline/manifest.json`. No Shopify parity, theme-editor or checkout verification is claimed. All 92 theme files and 62 local renderer/data/image inputs match their starting hashes (`qa/source-verification.json`).

Confirm `qa/MUST-NOT-LOSE.md` and approve this Phase 0 report before Phase 1 starts, as required by the brief. No AUDIT.md, fixes, deletions, fix commits or release tags have been created in this phase.
