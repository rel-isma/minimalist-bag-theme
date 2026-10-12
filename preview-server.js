const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const ROOT = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function getHeaderHtml() {
  return `
  <!-- Announcement Bar -->
  <div class="announcement-bar" role="region" aria-label="Announcement">
    <div class="container text-center">
      <span>Complimentary standard shipping on all orders over $150.</span>
    </div>
  </div>

  <!-- Site Header (Sticky & Scroll-aware) -->
  <header class="site-header" data-header>
    <div class="container">
      <div class="site-header__inner">
        <!-- Mobile Menu Toggle -->
        <button type="button" class="mobile-menu-toggle" data-mobile-menu-toggle aria-expanded="false" aria-controls="MobileNavDrawer" aria-label="Open navigation menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <!-- Desktop Navigation -->
        <nav class="site-header__nav" aria-label="Main navigation">
          <ul class="site-header__nav-list">
            <li><a href="/#ProductSpotlight" class="site-header__nav-link">Shop</a></li>
            <li><a href="/#WhyThisBag" class="site-header__nav-link">Craft</a></li>
            <li><a href="/#BrandStory" class="site-header__nav-link">Story</a></li>
            <li><a href="/#Reviews" class="site-header__nav-link">Reviews</a></li>
            <li><a href="/#Faq" class="site-header__nav-link">FAQ</a></li>
          </ul>
        </nav>

        <!-- Centered Logo -->
        <div class="site-header__logo">
          <a href="/">
            <span class="site-header__logo-text">Atelier Vane</span>
          </a>
        </div>

        <!-- Cart Trigger -->
        <div class="site-header__actions">
          <a href="/cart" class="site-header__cart-trigger" data-cart-drawer-trigger aria-label="1 item in cart">
            <span class="site-header__cart-icon">
              <svg class="icon icon-cart" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </span>
            <span class="cart-count-badge" data-cart-count aria-hidden="true">1</span>
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <div id="MobileNavDrawer" class="mobile-nav-drawer" data-mobile-nav-drawer aria-hidden="true" role="dialog" aria-modal="true" aria-label="Navigation Menu">
    <div class="mobile-nav-header">
      <span class="site-header__logo-text">Atelier Vane</span>
      <button type="button" class="btn--icon" data-mobile-menu-close aria-label="Close navigation menu" style="font-size: 1.5rem; line-height: 1; padding: 0.5rem;">
        <svg class="icon icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <ul class="mobile-nav-list">
      <li><a href="/#ProductSpotlight" class="mobile-nav-link" data-mobile-nav-link>Shop The Bag</a></li>
      <li><a href="/#WhyThisBag" class="mobile-nav-link" data-mobile-nav-link>Craftsmanship</a></li>
      <li><a href="/#BrandStory" class="mobile-nav-link" data-mobile-nav-link>Our Story</a></li>
      <li><a href="/#Reviews" class="mobile-nav-link" data-mobile-nav-link>Patron Reviews</a></li>
      <li><a href="/#Faq" class="mobile-nav-link" data-mobile-nav-link>FAQ</a></li>
      <li><a href="/policies/refund" class="mobile-nav-link" data-mobile-nav-link>Refund Policy</a></li>
    </ul>
    <div class="mobile-nav-footer">
      <p class="text-muted" style="font-size: 0.8125rem;">Complimentary global shipping over $150.</p>
    </div>
  </div>
  `;
}

function getFooterHtml() {
  return `
  <!-- Site Footer -->
  <footer class="site-footer hairline-top">
    <div class="container">
      <div class="site-footer__grid">
        <div class="site-footer__col">
          <h3 class="site-footer__brand-title">Atelier Vane</h3>
          <p class="text-muted prose" style="font-size: 0.9375rem; line-height: 1.6;">
            Designed in pursuit of quiet luxury and intentional form. One archetype, refined until nothing remains to subtract.
          </p>
        </div>
        <div class="site-footer__col">
          <h4 class="site-footer__col-title">The Collection</h4>
          <ul class="site-footer__links">
            <li><a href="/#ProductSpotlight" class="site-footer__link">The Demi Shoulder Bag</a></li>
            <li><a href="/#WhyThisBag" class="site-footer__link">Tuscan Leather Craft</a></li>
            <li><a href="/#WhatFits" class="site-footer__link">Capacity & Dimensions</a></li>
            <li><a href="/#ColorStory" class="site-footer__link">Tonal Palette</a></li>
            <li><a href="/#Reviews" class="site-footer__link">Client Reflections</a></li>
          </ul>
        </div>
        <div class="site-footer__col">
          <h4 class="site-footer__col-title">Client Services</h4>
          <ul class="site-footer__links">
            <li><a href="/#Faq" class="site-footer__link">Inquiries & FAQ</a></li>
            <li><a href="/policies/refund" class="site-footer__link">Refund & Return Policy</a></li>
            <li><a href="/policies/privacy" class="site-footer__link">Privacy Policy</a></li>
            <li><a href="/policies/terms" class="site-footer__link">Terms of Service</a></li>
            <li><a href="mailto:care@ateliervane.com" class="site-footer__link">care@ateliervane.com</a></li>
          </ul>
        </div>
        <div class="site-footer__col">
          <h4 class="site-footer__col-title">Correspondence</h4>
          <p class="text-muted" style="font-size: 0.875rem; margin-bottom: 1rem;">
            Occasional atelier notes and limited batch notifications. We write sparingly.
          </p>
          <form class="footer-newsletter-form" onsubmit="event.preventDefault(); alert('Subscribed to atelier correspondence.');">
            <div style="display: flex; gap: 0.5rem;">
              <input type="email" class="form-input" placeholder="Your email address" required>
              <button type="submit" class="btn btn--primary" style="min-width: 90px; padding: 0.75rem 1.25rem;">Join</button>
            </div>
          </form>
        </div>
      </div>
      <div class="site-footer__bottom">
        <div>&copy; ${new Date().getFullYear()} Atelier Vane. All rights reserved.</div>
        <div class="site-footer__payment-icons" style="font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase;">
          <span>Shop Pay • Apple Pay • Google Pay • Visa • Mastercard • Amex</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- Slide-out Cart Drawer -->
  <div id="CartDrawer" class="cart-drawer" data-cart-drawer aria-hidden="true" role="dialog" aria-modal="true" aria-label="Your Bag">
    <div class="cart-drawer__backdrop" data-cart-drawer-backdrop tabindex="-1"></div>
    <div class="cart-drawer__panel">
      <div class="cart-drawer__header">
        <div class="cart-drawer__title-wrap">
          <h2 class="cart-drawer__title font-heading">Your Bag</h2>
          <span class="cart-drawer__count-badge" data-cart-drawer-count>(1)</span>
        </div>
        <button type="button" class="cart-drawer__close-btn" data-cart-drawer-close aria-label="Close">
          <svg class="icon icon-close" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="cart-drawer__shipping-banner">
        <div class="free-shipping-bar" data-free-shipping-bar data-threshold="15000">
          <div class="free-shipping-bar__message" data-free-shipping-message>
            <span class="free-shipping-bar__text text-accent">✓ You have unlocked complimentary shipping</span>
          </div>
          <div class="free-shipping-bar__progress-track" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
            <div class="free-shipping-bar__progress-fill" data-free-shipping-fill style="width: 100%;"></div>
          </div>
        </div>
      </div>

      <div class="cart-drawer__body" data-cart-drawer-items>
        <div class="cart-drawer__items-list">
          <div class="cart-item" data-cart-item data-item-key="sample-item-1">
            <div class="cart-item__media">
              <img src="/assets/packshot-front.jpg" alt="The Demi Shoulder Bag" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);">
            </div>
            <div class="cart-item__details">
              <div class="cart-item__header">
                <span class="cart-item__title font-medium">The Demi Shoulder Bag</span>
                <span class="cart-item__price font-medium">$295.00</span>
              </div>
              <p class="cart-item__variant text-muted" style="font-size:0.8125rem;margin-top:0.25rem;">Bone · Full-Grain Calfskin</p>
              <div class="cart-item__actions">
                <div class="cart-item__stepper" data-cart-stepper>
                  <button type="button" class="cart-item__stepper-btn" onclick="const s=this.nextElementSibling;let v=Math.max(1,parseInt(s.textContent)-1);s.textContent=v;" aria-label="Decrease quantity">−</button>
                  <span class="cart-item__qty-display">1</span>
                  <button type="button" class="cart-item__stepper-btn" onclick="const s=this.previousElementSibling;s.textContent=parseInt(s.textContent)+1;" aria-label="Increase quantity">+</button>
                </div>
                <button type="button" class="cart-item__remove-btn" onclick="this.closest('.cart-item').remove(); alert('Item removed from bag');">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="cart-drawer__footer" data-cart-drawer-footer>
        <details class="cart-drawer__note-accordion">
          <summary class="cart-drawer__note-summary">
            <span>Add gift note or instructions</span>
            <span>▼</span>
          </summary>
          <div class="cart-drawer__note-content">
            <textarea class="form-input cart-drawer__note-input" rows="2" placeholder="Special delivery instructions or handwritten gift note..."></textarea>
          </div>
        </details>
        <div class="cart-drawer__subtotal-line">
          <span class="label-caps">Subtotal</span>
          <span class="cart-drawer__subtotal font-medium" data-cart-drawer-subtotal>$295.00</span>
        </div>
        <p class="cart-drawer__tax-note text-muted">Complimentary shipping and duties included</p>
        <button type="button" class="btn btn--primary btn--full" onclick="alert('Demo Storefront: In production this routes directly to Shopify Encrypted Checkout.');">Proceed to Checkout</button>
      </div>
    </div>
  </div>
  `;
}

function getPreviewHtml() {
  const css = fs.readFileSync(path.join(ROOT, 'assets/base.css'), 'utf8');
  const js = fs.readFileSync(path.join(ROOT, 'assets/theme.js'), 'utf8');
  const productJs = fs.readFileSync(path.join(ROOT, 'assets/product.js'), 'utf8');
  const cartJs = fs.readFileSync(path.join(ROOT, 'assets/cart-drawer.js'), 'utf8');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Atelier Vane — The Demi Shoulder Bag | Quiet Luxury Archetype</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap" rel="stylesheet">
  <style>
${css}
  </style>
</head>
<body class="template-index">
  <a class="skip-to-content" href="#MainContent">Skip to content</a>

  ${getHeaderHtml()}

  <!-- Main Long-Form Landing Page (All 15 Ordered Sections) -->
  <main id="MainContent" class="content-for-layout" role="main" tabindex="-1">
    <!-- 1. Hero Section -->
    <section class="hero-section hero-section--full-height">
      <div class="hero-section__media">
        <img src="/assets/hero-lifestyle.jpg" alt="Editorial lifestyle of Atelier Vane shoulder bag" class="hero-section__image" style="width:100%;height:100%;object-fit:cover;object-position:center;">
        <div class="hero-section__overlay" style="background: rgba(27,26,24,0.25);"></div>
      </div>
      <div class="container hero-section__content-container">
        <div class="hero-section__content text-center fade-up">
          <p class="eyebrow hero-section__eyebrow" style="color: #FFFFFF; opacity: 0.95;">The Everyday Archetype</p>
          <h1 class="hero-section__heading" style="color: #FFFFFF;">Quietly Essential.<br>Built to Outlast the Season.</h1>
          <p class="hero-section__subhead prose" style="color: #F5F1EA; opacity: 0.95;">
            Sculpted in full-grain Italian calfskin with uncluttered lines. An archetype refined for daily elegance.
          </p>
          <div class="hero-section__cta">
            <a href="#ProductSpotlight" class="btn btn--primary" style="background: #FFFFFF; color: #1B1A18; border-color: #FFFFFF;">Explore The Bag</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Trust Strip -->
    <section class="trust-strip-section hairline-bottom">
      <div class="container">
        <div class="trust-strip__grid">
          <div class="trust-strip__item fade-up">
            <span class="trust-strip__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </span>
            <div class="trust-strip__text">
              <p class="trust-strip__title">Complimentary Shipping</p>
              <p class="trust-strip__subtitle">On all domestic orders over $150. Delivered in 2–4 business days.</p>
            </div>
          </div>
          <div class="trust-strip__item fade-up">
            <span class="trust-strip__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            </span>
            <div class="trust-strip__text">
              <p class="trust-strip__title">30-Day Thoughtful Return Window</p>
              <p class="trust-strip__subtitle">Prepaid return label included. Full refunds on unused items.</p>
            </div>
          </div>
          <div class="trust-strip__item fade-up">
            <span class="trust-strip__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </span>
            <div class="trust-strip__text">
              <p class="trust-strip__title">End-to-End Encrypted Checkout</p>
              <p class="trust-strip__subtitle">Protected with Shop Pay, Apple Pay, Google Pay and bank-grade SSL.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Product Spotlight with Full Buy Box -->
    <section id="ProductSpotlight" class="product-spotlight-section section-spacing hairline-bottom">
      <div class="container">
        <div class="product-spotlight__grid">
          <!-- Gallery -->
          <div class="product-spotlight__gallery-col">
            <div class="product-gallery" data-product-gallery>
              <div class="product-gallery__main-wrap" style="aspect-ratio: 4/5; overflow: hidden; border-radius: var(--radius-sm); background: #ECE5DA;">
                <div class="product-gallery__slide is-active" data-index="0" style="width:100%;height:100%;">
                  <img id="MainProductImage" src="/assets/packshot-front.jpg" alt="Atelier Vane - The Demi Shoulder Bag in Bone" style="width:100%;height:100%;object-fit:cover;aspect-ratio:4/5;display:block;">
                </div>
              </div>
              <div class="product-gallery__thumbs">
                <button type="button" class="product-gallery__thumb is-active" aria-label="View packshot" onclick="document.getElementById('MainProductImage').src='/assets/packshot-front.jpg'; document.querySelectorAll('.product-gallery__thumb').forEach(b=>b.classList.remove('is-active')); this.classList.add('is-active');">
                  <img src="/assets/packshot-front.jpg" alt="Packshot front" style="width:100%;height:100%;object-fit:cover;">
                </button>
                <button type="button" class="product-gallery__thumb" aria-label="View hardware detail" onclick="document.getElementById('MainProductImage').src='/assets/detail-hardware.jpg'; document.querySelectorAll('.product-gallery__thumb').forEach(b=>b.classList.remove('is-active')); this.classList.add('is-active');">
                  <img src="/assets/detail-hardware.jpg" alt="Hardware clasp detail" style="width:100%;height:100%;object-fit:cover;">
                </button>
                <button type="button" class="product-gallery__thumb" aria-label="View interior packout" onclick="document.getElementById('MainProductImage').src='/assets/detail-interior.jpg'; document.querySelectorAll('.product-gallery__thumb').forEach(b=>b.classList.remove('is-active')); this.classList.add('is-active');">
                  <img src="/assets/detail-interior.jpg" alt="Interior suede lining" style="width:100%;height:100%;object-fit:cover;">
                </button>
                <button type="button" class="product-gallery__thumb" aria-label="View model wearing" onclick="document.getElementById('MainProductImage').src='/assets/model-wearing.jpg'; document.querySelectorAll('.product-gallery__thumb').forEach(b=>b.classList.remove('is-active')); this.classList.add('is-active');">
                  <img src="/assets/model-wearing.jpg" alt="Worn on shoulder" style="width:100%;height:100%;object-fit:cover;">
                </button>
              </div>
            </div>
          </div>

          <!-- Buy Box -->
          <div class="product-spotlight__buy-box-col">
            <div class="product-buy-box" data-buy-box>
              <div class="product-buy-box__header">
                <p class="eyebrow">Atelier Vane</p>
                <h2 class="product-buy-box__title">The Demi Shoulder Bag</h2>
              </div>
              <div class="product-buy-box__price-line">
                <div class="price">
                  <span class="price-item price-item--sale">$295.00</span>
                  <s class="price-item--regular" style="font-size: 1.125rem; color: #8F8578; margin-left: 0.75rem;">$350.00</s>
                </div>
                <span class="product-buy-box__tax-note text-muted">Taxes included.</span>
              </div>
              <div class="inventory-status text-accent">
                <span class="inventory-status__dot"></span>
                <span>In stock · Ready to dispatch from Florence</span>
              </div>

              <!-- Color Swatches with Clean Spacing -->
              <div class="product-buy-box__option" data-color-swatches>
                <div class="product-buy-box__option-label">
                  <span class="label-caps">Color:</span>
                  <span class="product-buy-box__active-option-value" data-selected-color-name>Bone</span>
                </div>
                <div class="color-swatch-group">
                  <label class="color-swatch-item is-selected">
                    <input type="radio" name="preview_color" value="Bone" checked class="color-swatch-input visually-hidden" data-color-name="Bone" onchange="selectColor(this.value)">
                    <span class="color-swatch-circle" style="background-color: #F5F1EA;"></span>
                    <span class="color-swatch-name">Bone</span>
                  </label>
                  <label class="color-swatch-item">
                    <input type="radio" name="preview_color" value="Warm Stone" class="color-swatch-input visually-hidden" data-color-name="Warm Stone" onchange="selectColor(this.value)">
                    <span class="color-swatch-circle" style="background-color: #ECE5DA;"></span>
                    <span class="color-swatch-name">Warm Stone</span>
                  </label>
                  <label class="color-swatch-item">
                    <input type="radio" name="preview_color" value="Noir" class="color-swatch-input visually-hidden" data-color-name="Noir" onchange="selectColor(this.value)">
                    <span class="color-swatch-circle" style="background-color: #1B1A18;"></span>
                    <span class="color-swatch-name">Noir</span>
                  </label>
                  <label class="color-swatch-item">
                    <input type="radio" name="preview_color" value="Clay" class="color-swatch-input visually-hidden" data-color-name="Clay" onchange="selectColor(this.value)">
                    <span class="color-swatch-circle" style="background-color: #9A4F36;"></span>
                    <span class="color-swatch-name">Clay</span>
                  </label>
                </div>
              </div>

              <!-- Stepper & Add to Cart CTA with Generous Space -->
              <div class="product-buy-box__cta-group">
                <div class="quantity-input-stepper" data-quantity-stepper>
                  <button type="button" class="quantity__button" data-quantity-minus aria-label="Decrease quantity" onclick="const input=this.nextElementSibling; if(parseInt(input.value)>1){input.value=parseInt(input.value)-1;}">−</button>
                  <input type="number" value="1" min="1" class="quantity__input" data-quantity-input aria-label="Quantity">
                  <button type="button" class="quantity__button" data-quantity-plus aria-label="Increase quantity" onclick="const input=this.previousElementSibling; input.value=parseInt(input.value)+1;">+</button>
                </div>
                <button type="button" class="btn btn--primary" onclick="document.getElementById('CartDrawer').classList.add('is-open'); document.body.classList.add('overflow-hidden');">
                  Add to Bag
                </button>
              </div>

              <div class="product-buy-box__trust-line">
                <div class="product-buy-box__trust-item">
                  <span>✓ 2–4 business days delivery with tracking</span>
                </div>
                <div class="product-buy-box__trust-item">
                  <span>✓ 30-day trial with complimentary returns</span>
                </div>
              </div>

              <!-- Accordions -->
              <div class="product-spotlight__accordions">
                <details class="accordion-item" open>
                  <summary class="accordion-item__summary">
                    <span class="accordion-item__title">Details & Materials</span>
                    <span class="accordion-item__icon">▼</span>
                  </summary>
                  <div class="accordion-item__content">
                    <p>100% full-grain calfskin leather, drum-dyed for enduring softness. Lined in breathable micro-suede. Custom solid brass magnetic hardware.</p>
                  </div>
                </details>
                <details class="accordion-item">
                  <summary class="accordion-item__summary">
                    <span class="accordion-item__title">Dimensions & Fit</span>
                    <span class="accordion-item__icon">▼</span>
                  </summary>
                  <div class="accordion-item__content">
                    <p>Width: 26 cm (10.2 in) · Height: 15 cm (5.9 in) · Depth: 7 cm (2.8 in). Shoulder strap drop: 28 cm (11.0 in). Weight: 380 grams.</p>
                  </div>
                </details>
                <details class="accordion-item">
                  <summary class="accordion-item__summary">
                    <span class="accordion-item__title">Care Guide</span>
                    <span class="accordion-item__icon">▼</span>
                  </summary>
                  <div class="accordion-item__content">
                    <p>Wipe gently with a soft dry cloth. Store in the complimentary organic cotton dust bag away from direct sunlight.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Why This Bag -->
    <section id="WhyThisBag" class="why-this-bag-section section-spacing hairline-bottom">
      <div class="container">
        <div class="section-header text-center fade-up">
          <p class="eyebrow">Design Principles</p>
          <h2 class="section-heading">Why We Made It</h2>
          <p class="text-muted prose" style="margin: 0 auto;">No extraneous hardware. No conspicuous logos. Just considered proportions and honest materials.</p>
        </div>
        <div class="why-this-bag__grid">
          <div class="why-this-bag__card fade-up">
            <div class="why-this-bag__media">
              <img src="/assets/craft-leather.jpg" alt="Full-Grain Italian Calfskin Texture" class="why-this-bag__image">
            </div>
            <h3 class="why-this-bag__title">Full-Grain Italian Calfskin</h3>
            <p class="why-this-bag__text text-muted">Sourced from small family tanneries in Tuscany. Supple to the touch with a delicate pebble grain that ages gracefully.</p>
          </div>
          <div class="why-this-bag__card fade-up">
            <div class="why-this-bag__media">
              <img src="/assets/craft-slouch.jpg" alt="Unstructured Slouch Silhouette" class="why-this-bag__image">
            </div>
            <h3 class="why-this-bag__title">Unstructured Slouch</h3>
            <p class="why-this-bag__text text-muted">Drapes naturally under the arm without rigid cardboard stiffeners. Soft yet structured enough to stand on its base.</p>
          </div>
          <div class="why-this-bag__card fade-up">
            <div class="why-this-bag__media">
              <img src="/assets/detail-hardware.jpg" alt="Custom Solid Brass Hardware" class="why-this-bag__image">
            </div>
            <h3 class="why-this-bag__title">Custom Solid Brass</h3>
            <p class="why-this-bag__text text-muted">Every buckle and magnetic closure is machined from solid brass and brushed to a warm satin finish that will never peel.</p>
          </div>
          <div class="why-this-bag__card fade-up">
            <div class="why-this-bag__media">
              <img src="/assets/craft-stitching.jpg" alt="Reinforced Saddle Stitching" class="why-this-bag__image">
            </div>
            <h3 class="why-this-bag__title">Reinforced Stitching</h3>
            <p class="why-this-bag__text text-muted">Critical stress points are hand-tacked with high-tensile waxed thread, ensuring the strap remains secure for decades.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Detail Close-ups -->
    <section class="detail-closeups-section section-spacing hairline-bottom">
      <div class="container">
        <div class="section-header text-center fade-up">
          <p class="eyebrow">Up Close</p>
          <h2 class="section-heading">The Integrity of Every Seam</h2>
          <p class="text-muted prose" style="margin: 0 auto;">Every millimeter inspected by hand before leaving our studio workshop.</p>
        </div>
        <div class="detail-closeups__grid">
          <div class="detail-closeups__card fade-up">
            <div class="detail-closeups__media" style="aspect-ratio:1/1;overflow:hidden;border-radius:var(--radius-sm);">
              <img src="/assets/detail-hardware.jpg" alt="Custom solid brass buckle clasp" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <h3 class="detail-closeups__title">Custom Solid Brass Clasp</h3>
            <p class="text-muted" style="font-size:0.9375rem;">Brushed satin finish that resists scratches and snaps into place with a reassuring muted click.</p>
          </div>
          <div class="detail-closeups__card fade-up">
            <div class="detail-closeups__media" style="aspect-ratio:1/1;overflow:hidden;border-radius:var(--radius-sm);">
              <img src="/assets/detail-interior.jpg" alt="Suede-lined sanctuary" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <h3 class="detail-closeups__title">Suede-Lined Sanctuary</h3>
            <p class="text-muted" style="font-size:0.9375rem;">Rich biscuit suede lining protects screens and compacts, with dedicated slip pocket for cards.</p>
          </div>
          <div class="detail-closeups__card fade-up">
            <div class="detail-closeups__media" style="aspect-ratio:1/1;overflow:hidden;border-radius:var(--radius-sm);">
              <img src="/assets/model-wearing.jpg" alt="Tailored shoulder drape" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <h3 class="detail-closeups__title">Effortless Shoulder Drape</h3>
            <p class="text-muted" style="font-size:0.9375rem;">A precise 28 cm drop proportioned to tuck comfortably against the ribcage with cashmere or silk.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. What Fits & Dimensions -->
    <section id="WhatFits" class="what-fits-section section-spacing hairline-bottom">
      <div class="container">
        <div class="section-header text-center fade-up">
          <p class="eyebrow">Capacity & Scale</p>
          <h2 class="section-heading">Everything You Need. Nothing You Don't.</h2>
          <p class="text-muted prose" style="margin: 0 auto;">Engineered to hold daily essentials without bulging or compromising its architectural drape.</p>
        </div>
        <div class="what-fits__grid">
          <div class="what-fits__media-col fade-up">
            <div class="what-fits__media-wrap" style="aspect-ratio:4/5;overflow:hidden;border-radius:var(--radius-sm);">
              <img src="/assets/detail-interior.jpg" alt="Interior capacity packout" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="what-fits__items-list">
              <span class="what-fits__pill">✓ iPhone 15 Pro Max</span>
              <span class="what-fits__pill">✓ Bifold Cardholder</span>
              <span class="what-fits__pill">✓ Car Keys & Fob</span>
              <span class="what-fits__pill">✓ Sunglasses in Pouch</span>
              <span class="what-fits__pill">✓ Lip Balm & Compact</span>
              <span class="what-fits__pill">✓ Passport</span>
            </div>
          </div>
          <div class="what-fits__table-col fade-up">
            <div class="dimensions-card">
              <h3 class="dimensions-card__title">Exact Specifications</h3>
              <p class="text-muted" style="font-size:0.9375rem;margin-bottom:1.5rem;">Proportioned specifically to sit naturally tucked at the ribcage.</p>
              <table class="dimensions-table">
                <tbody>
                  <tr><th>Width</th><td>26 cm <span class="text-muted">(10.2 in)</span></td></tr>
                  <tr><th>Height</th><td>15 cm <span class="text-muted">(5.9 in)</span></td></tr>
                  <tr><th>Depth</th><td>7 cm <span class="text-muted">(2.8 in)</span></td></tr>
                  <tr><th>Strap Drop</th><td>28 cm <span class="text-muted">(11.0 in)</span></td></tr>
                  <tr><th>Weight</th><td>380 grams <span class="text-muted">(0.83 lbs)</span></td></tr>
                  <tr><th>Closure</th><td>Concealed magnetic snap</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. Color Story -->
    <section id="ColorStory" class="color-story-section section-spacing hairline-bottom">
      <div class="container">
        <div class="section-header text-center fade-up">
          <p class="eyebrow">The Tonal Palette</p>
          <h2 class="section-heading">Four Nuanced Shades</h2>
          <p class="text-muted prose" style="margin: 0 auto;">Formulated with low-impact aniline dyes that reveal the natural hide's subtle depth.</p>
        </div>

        <div class="color-story__grid">
          <div class="color-story__card fade-up" style="display:flex;flex-direction:column;cursor:pointer;" onclick="selectColor('Bone'); document.getElementById('ProductSpotlight').scrollIntoView({behavior:'smooth'});">
            <div class="color-story__media" style="aspect-ratio:4/5;overflow:hidden;border-radius:var(--radius-sm);background:#F5F1EA;margin-bottom:1rem;">
              <img src="/assets/packshot-front.jpg" alt="The Demi Shoulder Bag in Bone" class="color-story__image" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;">
            </div>
            <div class="color-story__info" style="display:flex;flex-direction:column;flex:1;">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem;">
                <span class="color-story__swatch-circle" style="background:#F5F1EA;width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,0.2);display:inline-block;"></span>
                <h3 class="color-story__name" style="margin:0;font-size:1.125rem;">Bone</h3>
              </div>
              <p class="color-story__desc text-muted" style="font-size:0.875rem;line-height:1.5;margin-bottom:0.75rem;">An unbleached limestone hue. Warm, neutral, and effortlessly adaptable to linen and wool alike.</p>
              <button type="button" class="btn btn--secondary btn--sm" style="margin-top:auto;width:100%;">Select Bone</button>
            </div>
          </div>

          <div class="color-story__card fade-up" style="display:flex;flex-direction:column;cursor:pointer;" onclick="selectColor('Warm Stone'); document.getElementById('ProductSpotlight').scrollIntoView({behavior:'smooth'});">
            <div class="color-story__media" style="aspect-ratio:4/5;overflow:hidden;border-radius:var(--radius-sm);background:#ECE5DA;margin-bottom:1rem;">
              <img src="/assets/packshot-stone.jpg" alt="The Demi Shoulder Bag in Warm Stone" class="color-story__image" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;">
            </div>
            <div class="color-story__info" style="display:flex;flex-direction:column;flex:1;">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem;">
                <span class="color-story__swatch-circle" style="background:#ECE5DA;width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,0.2);display:inline-block;"></span>
                <h3 class="color-story__name" style="margin:0;font-size:1.125rem;">Warm Stone</h3>
              </div>
              <p class="color-story__desc text-muted" style="font-size:0.875rem;line-height:1.5;margin-bottom:0.75rem;">A grounded taupe-sand tone with gentle warmth. Subtle, understated, and timeless.</p>
              <button type="button" class="btn btn--secondary btn--sm" style="margin-top:auto;width:100%;">Select Warm Stone</button>
            </div>
          </div>

          <div class="color-story__card fade-up" style="display:flex;flex-direction:column;cursor:pointer;" onclick="selectColor('Noir'); document.getElementById('ProductSpotlight').scrollIntoView({behavior:'smooth'});">
            <div class="color-story__media" style="aspect-ratio:4/5;overflow:hidden;border-radius:var(--radius-sm);background:#1B1A18;margin-bottom:1rem;">
              <img src="/assets/packshot-noir.jpg" alt="The Demi Shoulder Bag in Noir" class="color-story__image" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;">
            </div>
            <div class="color-story__info" style="display:flex;flex-direction:column;flex:1;">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem;">
                <span class="color-story__swatch-circle" style="background:#1B1A18;width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,0.2);display:inline-block;"></span>
                <h3 class="color-story__name" style="margin:0;font-size:1.125rem;">Noir</h3>
              </div>
              <p class="color-story__desc text-muted" style="font-size:0.875rem;line-height:1.5;margin-bottom:0.75rem;">Deep charcoal ink black. Deeply saturated with a soft satin finish that avoids harsh synthetic shine.</p>
              <button type="button" class="btn btn--secondary btn--sm" style="margin-top:auto;width:100%;">Select Noir</button>
            </div>
          </div>

          <div class="color-story__card fade-up" style="display:flex;flex-direction:column;cursor:pointer;" onclick="selectColor('Clay'); document.getElementById('ProductSpotlight').scrollIntoView({behavior:'smooth'});">
            <div class="color-story__media" style="aspect-ratio:4/5;overflow:hidden;border-radius:var(--radius-sm);background:#9A4F36;margin-bottom:1rem;">
              <img src="/assets/packshot-clay.jpg" alt="The Demi Shoulder Bag in Clay" class="color-story__image" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;">
            </div>
            <div class="color-story__info" style="display:flex;flex-direction:column;flex:1;">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem;">
                <span class="color-story__swatch-circle" style="background:#9A4F36;width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,0.2);display:inline-block;"></span>
                <h3 class="color-story__name" style="margin:0;font-size:1.125rem;">Clay</h3>
              </div>
              <p class="color-story__desc text-muted" style="font-size:0.875rem;line-height:1.5;margin-bottom:0.75rem;">Tuscan terracotta earth. Adds an intentional, sophisticated pop of warm color to monochromatic looks.</p>
              <button type="button" class="btn btn--secondary btn--sm" style="margin-top:auto;width:100%;">Select Clay</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. Reviews -->
    <section id="Reviews" class="reviews-section section-spacing hairline-bottom">
      <div class="container">
        <div class="section-header text-center fade-up">
          <p class="eyebrow">Client Reflections</p>
          <h2 class="section-heading">In Everyday Use</h2>
          <p class="text-muted prose" style="margin: 0 auto;">Unsolicited feedback from patrons who carry our archetype daily.</p>
        </div>
        <div class="reviews__grid">
          <div class="review-card fade-up">
            <div class="review-card__stars" style="color: var(--color-accent); font-size: 1.125rem; letter-spacing: 0.15em; margin-bottom: 1rem;">★★★★★</div>
            <blockquote class="review-card__quote" style="font-family: var(--font-heading); font-size: 1.25rem; line-height: 1.4; color: var(--color-ink); margin-bottom: 1.25rem;">
              &ldquo;The drape and leather grain are extraordinary. It tucks under the arm naturally without feeling stiff, and fits my Max phone, cardholder, and keys without ever bulging.&rdquo;
            </blockquote>
            <div class="review-card__author">
              <span class="review-card__name font-medium">Elena R.</span>
              <span class="review-card__badge label-caps text-muted" style="margin-left: 0.5rem;">Verified Buyer</span>
              <span class="review-card__date text-muted" style="margin-left: auto;">New York</span>
            </div>
          </div>
          <div class="review-card fade-up">
            <div class="review-card__stars" style="color: var(--color-accent); font-size: 1.125rem; letter-spacing: 0.15em; margin-bottom: 1rem;">★★★★★</div>
            <blockquote class="review-card__quote" style="font-family: var(--font-heading); font-size: 1.25rem; line-height: 1.4; color: var(--color-ink); margin-bottom: 1.25rem;">
              &ldquo;Finally, a luxury bag without ostentatious gold logos. The solid brass closure and matte edge dye speak of true atelier craftsmanship.&rdquo;
            </blockquote>
            <div class="review-card__author">
              <span class="review-card__name font-medium">Sophia M.</span>
              <span class="review-card__badge label-caps text-muted" style="margin-left: 0.5rem;">Verified Buyer</span>
              <span class="review-card__date text-muted" style="margin-left: auto;">London</span>
            </div>
          </div>
          <div class="review-card fade-up">
            <div class="review-card__stars" style="color: var(--color-accent); font-size: 1.125rem; letter-spacing: 0.15em; margin-bottom: 1rem;">★★★★★</div>
            <blockquote class="review-card__quote" style="font-family: var(--font-heading); font-size: 1.25rem; line-height: 1.4; color: var(--color-ink); margin-bottom: 1.25rem;">
              &ldquo;Carried daily through train commutes and dinners. The leather has developed a subtle, rich patina that looks even better than the day it arrived.&rdquo;
            </blockquote>
            <div class="review-card__author">
              <span class="review-card__name font-medium">Claire T.</span>
              <span class="review-card__badge label-caps text-muted" style="margin-left: 0.5rem;">Verified Buyer</span>
              <span class="review-card__date text-muted" style="margin-left: auto;">Paris</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 9. Honest Comparison -->
    <section class="comparison-section section-spacing hairline-bottom">
      <div class="container">
        <div class="section-header text-center fade-up">
          <p class="eyebrow">Honest Construction</p>
          <h2 class="section-heading">A Direct Comparison</h2>
          <p class="text-muted prose" style="margin: 0 auto;">Where luxury is actually built, rather than marketed.</p>
        </div>
        <div class="comparison-table-wrap fade-up">
          <table class="comparison-table">
            <thead>
              <tr>
                <th scope="col">Feature & Craft</th>
                <th scope="col" class="comparison-table__brand-col">
                  <span class="comparison-table__badge">Our Archetype</span>
                  <span>Atelier Vane</span>
                </th>
                <th scope="col"><span class="text-muted">A Typical Shoulder Bag</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Leather Selection</td>
                <td class="comparison-table__brand-col font-medium">Full-Grain Tuscan Calfskin</td>
                <td class="text-muted">Bonded split leather or polyurethane coating</td>
              </tr>
              <tr>
                <td>Hardware Composition</td>
                <td class="comparison-table__brand-col font-medium">Machined Solid Brass (Satin finish)</td>
                <td class="text-muted">Electroplated zinc pot metal (chips over time)</td>
              </tr>
              <tr>
                <td>Lining Material</td>
                <td class="comparison-table__brand-col font-medium">Breathable Micro-Suede</td>
                <td class="text-muted">Synthetic crinkly polyester</td>
              </tr>
              <tr>
                <td>Branding Approach</td>
                <td class="comparison-table__brand-col font-medium">Blind heat-stamp / Unbranded exterior</td>
                <td class="text-muted">Conspicuous monogram print or oversized logo</td>
              </tr>
              <tr>
                <td>Production Model</td>
                <td class="comparison-table__brand-col font-medium">Small-batch studio production</td>
                <td class="text-muted">Mass-scale quarterly fashion turnover</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 10. FAQ -->
    <section id="Faq" class="faq-section section-spacing hairline-bottom">
      <div class="container container--narrow">
        <div class="section-header text-center fade-up">
          <p class="eyebrow">Inquiries</p>
          <h2 class="section-heading">Frequently Asked Questions</h2>
        </div>
        <div class="faq-list fade-up">
          <details class="accordion-item">
            <summary class="accordion-item__summary">
              <span class="accordion-item__title">Will my phone fit inside the bag?</span>
              <span class="accordion-item__icon">▼</span>
            </summary>
            <div class="accordion-item__content">
              <p>Yes. The bag easily accommodates all modern smartphones up to the iPhone 15 Pro Max and Galaxy S24 Ultra with case, plus cardholder, keys, and lip balm.</p>
            </div>
          </details>
          <details class="accordion-item">
            <summary class="accordion-item__summary">
              <span class="accordion-item__title">Is the leather water resistant?</span>
              <span class="accordion-item__icon">▼</span>
            </summary>
            <div class="accordion-item__content">
              <p>Our full-grain leather is naturally resilient to light humidity. If caught in rain, simply blot gently with a dry cotton cloth and allow it to air-dry naturally.</p>
            </div>
          </details>
          <details class="accordion-item">
            <summary class="accordion-item__summary">
              <span class="accordion-item__title">How long does shipping take?</span>
              <span class="accordion-item__icon">▼</span>
            </summary>
            <div class="accordion-item__content">
              <p>Orders ship within 24 hours. Standard delivery within the US takes 2–4 business days with complimentary tracking.</p>
            </div>
          </details>
          <details class="accordion-item">
            <summary class="accordion-item__summary">
              <span class="accordion-item__title">What is your return policy?</span>
              <span class="accordion-item__icon">▼</span>
            </summary>
            <div class="accordion-item__content">
              <p>We provide a 30-day trial period. If you are not completely satisfied, return the bag in unused condition with our prepaid return shipping label for a 100% full refund.</p>
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- 11. Brand Story -->
    <section id="BrandStory" class="brand-story-section section-spacing hairline-bottom">
      <div class="container">
        <div class="brand-story__grid">
          <div class="brand-story__media fade-up" style="border-radius:var(--radius-sm);overflow:hidden;">
            <img src="/assets/hero-lifestyle.jpg" alt="Atelier Vane philosophy and design" style="width:100%;height:100%;object-fit:cover;aspect-ratio:4/5;display:block;">
          </div>
          <div class="brand-story__content fade-up">
            <p class="eyebrow">Our Philosophy</p>
            <h2 class="brand-story__heading">Fewer, Better Things.</h2>
            <div class="brand-story__body prose text-muted">
              <p>We founded our studio on a single conviction: modern wardrobes do not need dozens of seasonal bags that quickly date and discard. They need one archetype, resolved so thoroughly in its proportion, feel, and durability that you reach for it without hesitation every morning.</p>
              <p>Crafted in small batches with full-grain Italian calfskin and solid brass fittings, The Demi Shoulder Bag is built to become a signature companion for years to come.</p>
            </div>
            <div class="brand-story__signoff">
              <p class="font-heading" style="font-size: 1.5rem; margin-bottom: 0.25rem;">Atelier Vane Studio</p>
              <p class="label-caps text-muted">Florence · New York</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 12. Newsletter -->
    <section class="newsletter-section section-spacing">
      <div class="container container--narrow text-center">
        <div class="newsletter-card fade-up">
          <p class="eyebrow">Correspondence</p>
          <h2 class="section-heading">Join The Atelier Journal</h2>
          <p class="text-muted prose" style="margin: 0 auto 2rem auto;">Subscribers receive advance notice for restocks and limited studio releases. We write sparingly.</p>
          <form class="newsletter-form" onsubmit="event.preventDefault(); alert('Subscribed to atelier journal!');">
            <div class="newsletter-form__fields">
              <input type="email" class="form-input newsletter-form__input" placeholder="Enter your email address" required>
              <button type="submit" class="btn btn--primary">Subscribe</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>

  <!-- Sticky Add-to-Cart Bar -->
  <div class="sticky-cart-bar" data-sticky-cart aria-hidden="true">
    <div class="container sticky-cart-bar__inner">
      <div class="sticky-cart-bar__product-info">
        <div class="sticky-cart-bar__thumb">
          <img src="/assets/packshot-front.jpg" alt="The Demi Shoulder Bag" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);">
        </div>
        <div class="sticky-cart-bar__meta">
          <p class="sticky-cart-bar__title">The Demi Shoulder Bag</p>
          <div class="sticky-cart-bar__sub">
            <span class="sticky-cart-bar__price">$295.00</span>
            <span class="sticky-cart-bar__separator">·</span>
            <span class="sticky-cart-bar__color" data-sticky-color>Bone</span>
          </div>
        </div>
      </div>
      <div class="sticky-cart-bar__action">
        <button type="button" class="btn btn--primary btn--sm" onclick="document.getElementById('CartDrawer').classList.add('is-open'); document.body.classList.add('overflow-hidden');">
          Add to Bag
        </button>
      </div>
    </div>
  </div>

  ${getFooterHtml()}

  <script>${js}</script>
  <script>${productJs}</script>
  <script>${cartJs}</script>
  <script>
    window.selectColor = function(colorName) {
      const colorMap = {
        'Bone': '/assets/packshot-front.jpg',
        'Warm Stone': '/assets/packshot-stone.jpg',
        'Noir': '/assets/packshot-noir.jpg',
        'Clay': '/assets/packshot-clay.jpg'
      };
      const imgUrl = colorMap[colorName] || '/assets/packshot-front.jpg';
      const mainImg = document.getElementById('MainProductImage');
      if (mainImg) mainImg.src = imgUrl;

      const colorLabel = document.querySelector('[data-selected-color-name]');
      if (colorLabel) colorLabel.textContent = colorName;

      const stickyColor = document.querySelector('[data-sticky-color]');
      if (stickyColor) stickyColor.textContent = colorName;

      const radio = document.querySelector('input[name="preview_color"][value="' + colorName + '"]');
      if (radio) {
        radio.checked = true;
        document.querySelectorAll('.color-swatch-item').forEach(function(el) { el.classList.remove('is-selected'); });
        const parent = radio.closest('.color-swatch-item');
        if (parent) parent.classList.add('is-selected');
      }
    };
  </script>
</body>
</html>`;
}

function getPolicyPageHtml(title, eyebrow, bodyHtml) {
  const css = fs.readFileSync(path.join(ROOT, 'assets/base.css'), 'utf8');
  const js = fs.readFileSync(path.join(ROOT, 'assets/theme.js'), 'utf8');
  const cartJs = fs.readFileSync(path.join(ROOT, 'assets/cart-drawer.js'), 'utf8');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — Atelier Vane</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap" rel="stylesheet">
  <style>
${css}
  </style>
</head>
<body class="template-page">
  <a class="skip-to-content" href="#MainContent">Skip to content</a>

  ${getHeaderHtml()}

  <main id="MainContent" class="content-for-layout" role="main" tabindex="-1">
    <section class="main-policy-section section-spacing hairline-bottom">
      <div class="container container--narrow">
        <header class="section-header text-center fade-up" style="margin-bottom: 3.5rem;">
          <p class="eyebrow">${eyebrow}</p>
          <h1 class="section-heading">${title}</h1>
          <p class="text-muted" style="font-size: 0.8125rem;">Last updated: October 2026 · Official Atelier Policy</p>
        </header>

        <div class="prose policy-content fade-up" style="margin: 0 auto; line-height: 1.8; font-size: 0.9375rem; color: var(--color-ink);">
          ${bodyHtml}
        </div>
      </div>
    </section>
  </main>

  ${getFooterHtml()}

  <script>${js}</script>
  <script>${cartJs}</script>
</body>
</html>`;
}

const refundPolicyContent = `
  <h3>30-Day Thoughtful Trial</h3>
  <p>We want you to experience The Demi Shoulder Bag in your daily routine with complete confidence. We offer a 30-day return window from the date of physical delivery.</p>
  <br>
  <h3>Return Eligibility</h3>
  <p>To be eligible for a full refund, items must be in original condition: unworn, undamaged, with protective cotton dust bag and packaging intact. We provide a prepaid domestic return shipping label with every authorized return request.</p>
  <br>
  <h3>Refund Process & Timeline</h3>
  <p>Once your returned bag is received and inspected at our workshop (typically within 2 business days of arrival), your refund will be immediately processed to your original method of payment. Credit card refunds typically post within 3 to 5 business days depending on your financial institution.</p>
  <br>
  <h3>Lifetime Atelier Repair Support</h3>
  <p>Because our bags are built for longevity, we stand behind the integrity of our stitching and solid brass hardware. Should you experience any manufacturing defect or require leather conditioning advice, contact our team at <a href="mailto:care@ateliervane.com">care@ateliervane.com</a>.</p>
`;

const privacyPolicyContent = `
  <h3>Our Commitment to Privacy</h3>
  <p>At Atelier Vane, privacy is a fundamental standard of luxury. We do not sell, rent, or trade your personal information with third-party data brokers under any circumstances.</p>
  <br>
  <h3>Information We Collect</h3>
  <p>When you purchase The Demi Shoulder Bag or subscribe to our journal, we collect only the necessary details required to deliver your order: your name, shipping address, email, and phone number for delivery carrier updates. Payment information is securely tokenized and handled directly through Shopify PCI-DSS compliant gateways (Shop Pay, Apple Pay, Google Pay).</p>
  <br>
  <h3>Communication Preferences</h3>
  <p>We send email notifications regarding order tracking, essential dispatch information, and limited studio releases only if you have opted in. You may unsubscribe at any moment via the link in our correspondence.</p>
  <br>
  <h3>Data Rights</h3>
  <p>You have the right to request access to the personal data we hold about you or request its permanent deletion by contacting our privacy compliance desk at <a href="mailto:privacy@ateliervane.com">privacy@ateliervane.com</a>.</p>
`;

const termsPolicyContent = `
  <h3>Terms of Service</h3>
  <p>By accessing or purchasing from Atelier Vane, you agree to be bound by the following terms and conditions. These terms govern the purchase of our products and use of our digital storefront.</p>
  <br>
  <h3>Product Authenticity & Small-Batch Craft</h3>
  <p>All Atelier Vane pieces are crafted from genuine full-grain leather. Because full-grain leather is a natural, uncorrected material, slight variations in grain texture, pebble density, and natural tone are marks of authenticity, not defects.</p>
  <br>
  <h3>Pricing & Availability</h3>
  <p>Prices are displayed in USD and include all applicable taxes unless otherwise noted. We reserve the right to limit order quantities to ensure fair availability across our handcrafted releases.</p>
  <br>
  <h3>Governing Law</h3>
  <p>These terms and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of the State of New York and the United States.</p>
`;

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  if (urlPath === '/' || urlPath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getPreviewHtml());
    return;
  }

  if (urlPath === '/policies/refund' || urlPath === '/pages/refund') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getPolicyPageHtml('Refund & Return Policy', 'Guarantees & Client Care', refundPolicyContent));
    return;
  }

  if (urlPath === '/policies/privacy' || urlPath === '/pages/privacy') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getPolicyPageHtml('Privacy Policy', 'Data Protection & Integrity', privacyPolicyContent));
    return;
  }

  if (urlPath === '/policies/terms' || urlPath === '/pages/terms') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getPolicyPageHtml('Terms of Service', 'Atelier Terms & Governance', termsPolicyContent));
    return;
  }

  const filePath = path.join(ROOT, urlPath);
  const ext = path.extname(filePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Theme Preview Server] Listening at http://localhost:${PORT}`);
});
