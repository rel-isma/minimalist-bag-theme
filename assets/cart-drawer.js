/**
 * MINIMALIST ATELIER - CART DRAWER & AJAX CART
 * Vanilla JS • Zero Dependencies
 */

(function () {
  'use strict';

  class CartDrawerManager {
    constructor() {
      this.drawer = document.querySelector('[data-cart-drawer]');
      this.backdrop = document.querySelector('[data-cart-drawer-backdrop]');
      this.closeBtns = document.querySelectorAll('[data-cart-drawer-close]');
      this.triggers = document.querySelectorAll('[data-cart-drawer-trigger]');
      this.countBadges = document.querySelectorAll('[data-cart-count], [data-cart-drawer-count]');
      this.itemsContainer = document.querySelector('[data-cart-drawer-items]');
      this.subtotalDisplay = document.querySelector('[data-cart-drawer-subtotal]');
      this.shippingFill = document.querySelector('[data-free-shipping-fill]');
      this.shippingMsg = document.querySelector('[data-free-shipping-message]');
      this.noteInput = document.querySelector('[data-cart-note]');

      this.isOpen = false;
      this.threshold = 15000; // in cents, default $150.00

      const barEl = document.querySelector('[data-free-shipping-bar]');
      if (barEl && barEl.dataset.threshold) {
        this.threshold = parseInt(barEl.dataset.threshold, 10);
      }

      this.init();
    }

    init() {
      if (!this.drawer) return;

      // Event listeners for open/close
      this.triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      });

      window.addEventListener('cart:open', () => this.open());
      window.addEventListener('cart:close', () => this.close());

      this.closeBtns.forEach(btn => btn.addEventListener('click', () => this.close()));
      if (this.backdrop) {
        this.backdrop.addEventListener('click', () => this.close());
      }

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Intercept Add-to-Cart forms
      document.querySelectorAll('form[data-type="add-to-cart-form"]').forEach(form => {
        form.addEventListener('submit', (e) => this.handleAddToCart(e, form));
      });

      // Handle cart item stepper & remove within drawer and cart page
      document.addEventListener('click', (e) => {
        const minusBtn = e.target.closest('[data-cart-qty-minus]');
        if (minusBtn) {
          this.handleQuantityChange(minusBtn, -1);
          return;
        }

        const plusBtn = e.target.closest('[data-cart-qty-plus]');
        if (plusBtn) {
          this.handleQuantityChange(plusBtn, 1);
          return;
        }

        const removeBtn = e.target.closest('[data-cart-remove]');
        if (removeBtn) {
          this.handleRemoveItem(removeBtn);
          return;
        }
      });

      // Cart Note persistence
      if (this.noteInput) {
        this.noteInput.addEventListener('change', () => {
          this.updateCartNote(this.noteInput.value);
        });
      }
    }

    open() {
      this.drawer.classList.add('is-open');
      this.drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      this.isOpen = true;

      const firstFocusable = this.drawer.querySelector('button, [href], input, select, textarea');
      if (firstFocusable) firstFocusable.focus();
    }

    close() {
      this.drawer.classList.remove('is-open');
      this.drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      this.isOpen = false;
    }

    async handleAddToCart(e, form) {
      e.preventDefault();
      const submitBtn = form.querySelector('[data-add-to-cart-btn]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
      }

      try {
        const formData = new FormData(form);
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.ok) {
          await this.refreshCart();
          this.open();
        } else {
          const err = await response.json();
          alert(err.description || 'Could not add item to bag.');
        }
      } catch (err) {
        console.error('Error adding to cart:', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-loading');
        }
      }
    }

    async handleQuantityChange(btn, delta) {
      const key = btn.dataset.key;
      const stepper = btn.closest('[data-cart-stepper]');
      const display = stepper ? stepper.querySelector('[data-cart-qty-val]') : null;
      const currentQty = display ? parseInt(display.textContent, 10) || 1 : 1;
      const newQty = Math.max(0, currentQty + delta);

      await this.updateLineQuantity(key, newQty);
    }

    async handleRemoveItem(btn) {
      const key = btn.dataset.key;
      await this.updateLineQuantity(key, 0);
    }

    async updateLineQuantity(key, quantity) {
      try {
        const response = await fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ id: key, quantity: quantity })
        });

        if (response.ok) {
          await this.refreshCart();
        }
      } catch (err) {
        console.error('Error updating cart line quantity:', err);
      }
    }

    async updateCartNote(note) {
      try {
        await fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ note: note })
        });
      } catch (err) {
        console.error('Error updating note:', err);
      }
    }

    async refreshCart() {
      try {
        const response = await fetch('/cart.js', {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const cart = await response.json();
        this.renderCart(cart);
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    }

    renderCart(cart) {
      // Update badge counts
      this.countBadges.forEach(badge => {
        if (badge.dataset.cartDrawerCount !== undefined) {
          badge.textContent = `(${cart.item_count})`;
        } else {
          badge.textContent = cart.item_count;
        }
      });

      // Update Subtotal
      if (this.subtotalDisplay) {
        this.subtotalDisplay.textContent = this.formatMoney(cart.total_price);
      }

      // Update Free Shipping Progress Bar
      if (this.threshold > 0 && this.shippingFill && this.shippingMsg) {
        const gap = this.threshold - cart.total_price;
        const percent = Math.min(100, Math.max(0, (cart.total_price / this.threshold) * 100));

        this.shippingFill.style.width = `${percent}%`;

        if (gap <= 0) {
          this.shippingMsg.innerHTML = '<span class="free-shipping-bar__text text-accent">✓ You have unlocked complimentary shipping</span>';
        } else {
          const formattedGap = this.formatMoney(gap);
          this.shippingMsg.innerHTML = `<span class="free-shipping-bar__text">Add <span class="font-medium">${formattedGap}</span> more for complimentary shipping</span>`;
        }
      }

      // Refresh page if on cart template, otherwise update drawer lines
      if (window.location.pathname.includes('/cart')) {
        window.location.reload();
        return;
      }

      if (!this.itemsContainer) return;

      if (cart.items.length === 0) {
        this.itemsContainer.innerHTML = `
          <div class="cart-drawer__empty text-center">
            <p class="font-heading" style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--color-ink);">
              Your bag is empty
            </p>
            <p class="text-muted" style="font-size: 0.9375rem; margin-bottom: 2rem;">
              Discover our single minimalist archetype in full-grain leather.
            </p>
            <a href="#ProductSpotlight" class="btn btn--secondary" data-cart-drawer-close>
              Continue shopping
            </a>
          </div>
        `;

        const footer = document.querySelector('[data-cart-drawer-footer]');
        if (footer) footer.style.display = 'none';
      } else {
        const footer = document.querySelector('[data-cart-drawer-footer]');
        if (footer) footer.style.display = 'block';

        let html = '<div class="cart-drawer__items-list">';
        cart.items.forEach(item => {
          html += `
            <div class="cart-item" data-cart-item data-item-key="${item.key}">
              <div class="cart-item__media">
                <a href="${item.url}">
                  <img src="${item.featured_image.url}" alt="${item.title}" width="160" height="200" class="cart-item__image" loading="lazy">
                </a>
              </div>
              <div class="cart-item__details">
                <div class="cart-item__header">
                  <a href="${item.url}" class="cart-item__title">${item.product_title}</a>
                  <span class="cart-item__price font-medium">${this.formatMoney(item.final_line_price)}</span>
                </div>
                ${item.variant_title ? `<p class="cart-item__variant text-muted" style="font-size: 0.8125rem; margin-top: 0.25rem;">${item.variant_title}</p>` : ''}
                <div class="cart-item__actions">
                  <div class="cart-item__stepper" data-cart-stepper>
                    <button type="button" class="cart-item__stepper-btn" data-cart-qty-minus data-key="${item.key}" aria-label="Decrease quantity">−</button>
                    <span class="cart-item__qty-display" data-cart-qty-val>${item.quantity}</span>
                    <button type="button" class="cart-item__stepper-btn" data-cart-qty-plus data-key="${item.key}" aria-label="Increase quantity">+</button>
                  </div>
                  <button type="button" class="cart-item__remove-btn" data-cart-remove data-key="${item.key}" aria-label="Remove ${item.title}">Remove</button>
                </div>
              </div>
            </div>
          `;
        });
        html += '</div>';
        this.itemsContainer.innerHTML = html;
      }
    }

    formatMoney(cents) {
      const dollars = (cents / 100).toFixed(2);
      return `$${dollars}`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    new CartDrawerManager();
  });
})();
