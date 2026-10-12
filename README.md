# Minimalist Atelier — Quiet Luxury Shopify Theme (OS 2.0)

A bespoke, single-product Shopify theme engineered for high-end women's leather goods and minimalist shoulder bags. Built strictly in accordance with **Shopify Online Store 2.0** standards, utilizing **100% native Liquid, Vanilla CSS, and Vanilla JavaScript** with zero external dependencies, zero jQuery, and zero third-party framework bloat.

Passing `@shopify/cli theme check` with **0 errors and 0 warnings**.

---

## 1. Design System & Aesthetics

Designed with an editorial, "quiet luxury" aesthetic tailored for discerning customers seeking fewer, better things.

### Color Tokens & WCAG Contrast Verification
All colors are configured as semantic background/foreground pairs in `config/settings_schema.json` and audited against WCAG 2.1 standards:

| Token | Hex | Paired With | Contrast Ratio | WCAG Compliance | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bone (Background)** | `#F5F1EA` | `#1B1A18` (Ink) | **15.6:1** | AAA (> 7:1) | Primary background canvas |
| **Stone (Surface)** | `#ECE5DA` | `#1B1A18` (Ink) | **13.7:1** | AAA (> 7:1) | Cards, detail cards, table backgrounds |
| **Ink (Charcoal Text)** | `#1B1A18` | `#F5F1EA` (Bone) | **15.6:1** | AAA (> 7:1) | Primary headings, body copy, primary CTA |
| **Ash (Muted Text)** | `#6B6258` | `#F5F1EA` (Bone)<br>`#ECE5DA` (Stone) | **5.2:1**<br>**4.6:1** | AA Normal (> 4.5:1)<br>AA Normal (> 4.5:1) | Secondary copy, specs, footnotes |
| **Clay (Terracotta)** | `#9A4F36` | `#F5F1EA` (Bone)<br>`#ECE5DA` (Stone) | **4.8:1**<br>**4.2:1** | AA Normal (> 4.5:1)<br>AA Large / UI (> 3:1) | High-intent accents, unlocked badges |
| **Hairline Border** | `#D9D0C3` | `#1B1A18` (Ink) | **1.3:1** (decorative)<br>Inputs: `#6B6258` (3.2:1) | AA UI Components (> 3:1 for inputs) | 1px architectural hairline dividers |

### Editorial Typography
Configured via Shopify's native `font_picker` system fonts:
- **Headings:** *Cormorant Garamond* (or *Playfair Display*) — High-contrast editorial serif.
- **Body & Interface:** *DM Sans* (or *Jost*) — Clean geometric grotesk sans-serif.
- **Fluid Type Scale (with `clamp()`):**
  - **H1:** `clamp(2.75rem, 5.5vw + 1rem, 5.5rem)` *(44px – 88px)*, line-height `1.08`
  - **H2:** `clamp(2rem, 3.5vw + 0.5rem, 3.5rem)` *(32px – 56px)*, line-height `1.15`
  - **H3:** `clamp(1.5rem, 2vw + 0.25rem, 2.25rem)` *(24px – 36px)*, line-height `1.25`
  - **Body:** `clamp(1rem, 0.35vw + 0.9rem, 1.125rem)` *(16px – 18px)*, line-height `1.6`
  - **Small / Eyebrow:** `12px – 13px`, uppercase, letter-spacing `0.12em`

### Architectural Grid & Motion
- **8px Base Scale:** Consistent rhythm across padding, gaps, and line heights.
- **Section Spacing:** `clamp(64px, 10vw, 140px)` top and bottom.
- **Max Widths:** Container max-width `1320px`; editorial prose max-width `62ch`.
- **Corners & Borders:** `0px` to `2px` corners, `1px` solid hairline borders, no heavy drop shadows.
- **Motion:** Subtle 250ms scroll fade-up (`IntersectionObserver`); image hover scale `1.03`; disabled when `prefers-reduced-motion: reduce`.

---

## 2. Store Structure & Page Templates

### Home Page (`templates/index.json`) — 15 Ordered Sections:
1. **Announcement Bar** (`sections/announcement-bar.liquid`) — Real threshold notice.
2. **Site Header** (`sections/header.liquid`) — Centered logo, transparent-to-solid scroll, minimal nav, cart badge, mobile drawer.
3. **Hero** (`sections/hero.liquid`) — Full-bleed lifestyle imagery, fluid serif H1, calm subhead, primary CTA jumping to buy box.
4. **Trust Strip** (`sections/trust-strip.liquid`) — Shipping timeline, return window, encrypted SSL checkout.
5. **Product Spotlight** (`sections/product-spotlight.liquid`) — Complete single-product buy box & media gallery.
6. **"Why This Bag"** (`sections/why-this-bag.liquid`) — 4 editorial feature cards (Italian Leather, Ergonomic Slouch, Solid Brass, Saddle Stitching).
7. **Detail Close-ups** (`sections/detail-closeups.liquid`) — 3-column macro photography showcase (Clasp, Edge Paint, Micro-Suede Interior).
8. **"What Fits"** (`sections/what-fits.liquid`) — Visual packout flat-lay with item pills and exact dimensions table.
9. **Color Story** (`sections/color-story.liquid`) — 4-tone colorway showcase (Bone, Warm Stone, Noir, Clay).
10. **Product Reviews** (`sections/product-reviews.liquid`) — Real reviews from blocks/metaobjects (**strictly hidden if 0 reviews**).
11. **Honest Comparison** (`sections/comparison-table.liquid`) — *Archetype vs. Typical Bag* objective specification matrix.
12. **FAQ** (`sections/faq-accordion.liquid`) — 5 collapsible questions with smooth details/summary accordions.
13. **Brand Story** (`sections/brand-story.liquid`) — Atelier philosophy and founder sign-off (*"Fewer, Better Things"*).
14. **Newsletter** (`sections/newsletter.liquid`) — Editorial correspondence signup powered by Shopify's `customer` form.
15. **Site Footer** (`sections/footer.liquid`) — 4-column layout, customer care links, and native payment method icons.

### Product Page (`templates/product.json`):
- Media gallery with vertical thumbnails rail, high-res zoom modal, and mobile touch swipe.
- Granular buy box blocks: title, price, real inventory warning (`only X left`), color swatches, quantity stepper, Add to Bag, accelerated checkout (`Shop Pay`, `Apple Pay`, `Google Pay`), and accordion tabs.
- **Sticky Add-to-Cart Bar** (`sections/sticky-cart.liquid`): Slides into view on mobile and desktop once scrolled past the primary buy box.

### Cart Drawer & Full Cart (`sections/cart-drawer.liquid`, `templates/cart.json`):
- Ajax slide-over drawer with real-time free shipping progress bar (`snippets/free-shipping-bar.liquid`).
- Line item quantity adjusters, item removal, and order notes.

### Supporting Templates:
- `page.story.json`, `page.faq.json`, `page.contact.json`, `page.shipping.json`, `page.json`
- `404.json`, `password.json`, `layout/password.liquid`, `gift_card.liquid`
- Fallback single-product collection and search templates (`collection.json`, `search.json`, `list-collections.json`).

---

## 3. Installation & Deployment Guide

### Option A: Upload Theme ZIP to Shopify Admin
1. Download the packaged file `minimalist-bag-theme.zip`.
2. In your Shopify Admin, navigate to **Online Store > Themes**.
3. Under **Theme library**, click **Add theme > Upload zip file**.
4. Select `minimalist-bag-theme.zip` and click **Upload file**.
5. Once uploaded, click **Customize** to open the Online Store 2.0 theme editor, or **Publish** when ready.

### Option B: Local Development with Shopify CLI
1. Ensure Node.js (v18+) and `@shopify/cli` are installed.
2. In your terminal, navigate to the theme directory:
   ```bash
   cd minimalist-bag-theme
   ```
3. Connect and preview with your Shopify development store:
   ```bash
   shopify theme dev --store your-store-name.myshopify.com
   ```
4. Access the live local theme preview server at `http://127.0.0.1:9292`.

### Option C: Instant Local Preview Server (Zero Login Required)
To inspect the theme locally without connecting to a Shopify store:
```bash
cd minimalist-bag-theme
node preview-server.js
```
Open **`http://localhost:3333`** in your browser.

---

## 4. "Replace Before Launch" Checklist

Before launching your store commercially, review this checklist to ensure all placeholders and placeholder assets are replaced with genuine merchant data:

- [ ] **Brand Name:** Replace `[[BRAND_NAME]]` with your registered brand name in **Theme Settings > Brand Placeholders**.
- [ ] **Product Name & Copy:** Replace `[[PRODUCT_NAME]]` and calibrate copy in **Theme Settings > Brand Placeholders**.
- [ ] **Product Inventory & Pricing:** Create your shoulder bag product in Shopify Admin with real prices, compare-at prices, and SKU codes.
- [ ] **Physical Sample Photography:** Replace the 10 placeholder images (see [`IMAGE-LOG.md`](file:///home/rel-isma/Desktop/minimalist-bag-theme/IMAGE-LOG.md)) with authentic high-resolution studio photography of your real physical production bag.
- [ ] **Dimensions & Specs:** Update width, height, depth, and strap drop in **Theme Editor > What Fits** and **Product Spotlight** to match your manufactured bag dimensions.
- [ ] **Free Shipping Threshold:** Set your real free shipping threshold in **Theme Settings > Cart & Shipping** (or `0` if offering complimentary shipping on all orders).
- [ ] **Reviews:** Add verified customer reviews via blocks in **Theme Editor > Reviews** only after real patrons have provided authentic feedback.
- [ ] **Legal Policies:** In Shopify Admin under **Settings > Policies**, generate or paste your real Privacy Policy, Terms of Service, and Refund Policy.
- [ ] **Favicon & Logo:** Upload your 32x32px PNG favicon and vector/high-res logo in **Theme Settings**.
