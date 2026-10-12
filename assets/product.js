/**
 * MINIMALIST ATELIER - PRODUCT & BUY BOX INTERACTION
 * Vanilla JS • Zero Dependencies
 */

(function () {
  'use strict';

  // 1. Product Media Gallery & Zoom
  function initProductGallery() {
    document.querySelectorAll('[data-product-gallery]').forEach(function (gallery) {
      const slides = gallery.querySelectorAll('.product-gallery__slide');
      const thumbs = gallery.querySelectorAll('[data-thumb-index]');
      const zoomTriggers = gallery.querySelectorAll('[data-zoom-trigger]');
      const zoomModal = gallery.querySelector('[data-zoom-modal]');
      const zoomModalImg = gallery.querySelector('[data-zoom-modal-img]');
      const zoomCloseBtn = gallery.querySelector('[data-zoom-close]');

      function activateSlide(index) {
        slides.forEach(function (slide, idx) {
          if (idx === index) {
            slide.classList.add('is-active');
          } else {
            slide.classList.remove('is-active');
          }
        });

        thumbs.forEach(function (thumb, idx) {
          if (idx === index) {
            thumb.classList.add('is-active');
            thumb.setAttribute('aria-current', 'true');
          } else {
            thumb.classList.remove('is-active');
            thumb.removeAttribute('aria-current');
          }
        });
      }

      thumbs.forEach(function (thumb, idx) {
        thumb.addEventListener('click', function () {
          activateSlide(idx);
        });
      });

      // Zoom Modal
      if (zoomModal && zoomModalImg) {
        zoomTriggers.forEach(function (trigger) {
          trigger.addEventListener('click', function (e) {
            const zoomSrc = trigger.getAttribute('data-zoom-src');
            if (zoomSrc) {
              zoomModalImg.src = zoomSrc;
              if (typeof zoomModal.showModal === 'function') {
                zoomModal.showModal();
              } else {
                zoomModal.setAttribute('open', '');
              }
            }
          });
        });

        if (zoomCloseBtn) {
          zoomCloseBtn.addEventListener('click', function () {
            if (typeof zoomModal.close === 'function') {
              zoomModal.close();
            } else {
              zoomModal.removeAttribute('open');
            }
          });
        }

        zoomModal.addEventListener('click', function (e) {
          if (e.target === zoomModal) {
            if (typeof zoomModal.close === 'function') {
              zoomModal.close();
            } else {
              zoomModal.removeAttribute('open');
            }
          }
        });
      }
    });
  }

  // 2. Color Swatch & Variant Selector
  function initSwatches() {
    document.querySelectorAll('[data-buy-box]').forEach(function (buyBox) {
      const swatchInputs = buyBox.querySelectorAll('.color-swatch-input');
      const labelSpan = buyBox.querySelector('[data-selected-color-label]');
      const variantInput = buyBox.querySelector('[data-variant-input]');

      swatchInputs.forEach(function (input) {
        input.addEventListener('change', function () {
          const colorName = input.getAttribute('data-color-name');
          const variantId = input.getAttribute('data-variant-id');

          if (labelSpan && colorName) {
            labelSpan.textContent = colorName;
          }

          if (variantInput && variantId) {
            variantInput.value = variantId;
          }
        });
      });
    });
  }

  // 3. Quantity Stepper
  function initQuantitySteppers() {
    document.querySelectorAll('[data-quantity-stepper]').forEach(function (stepper) {
      const input = stepper.querySelector('[data-quantity-input]');
      const minusBtn = stepper.querySelector('[data-quantity-minus]');
      const plusBtn = stepper.querySelector('[data-quantity-plus]');
      if (!input) return;

      if (minusBtn) {
        minusBtn.addEventListener('click', function () {
          const currentVal = parseInt(input.value, 10) || 1;
          const min = parseInt(input.min, 10) || 1;
          if (currentVal > min) {
            input.value = currentVal - 1;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }

      if (plusBtn) {
        plusBtn.addEventListener('click', function () {
          const currentVal = parseInt(input.value, 10) || 1;
          const max = input.max ? parseInt(input.max, 10) : Infinity;
          if (currentVal < max) {
            input.value = currentVal + 1;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
    });
  }

  // 4. Sticky Add to Cart Bar
  function initStickyCartBar() {
    const stickyBar = document.querySelector('[data-sticky-cart]');
    const buyBox = document.querySelector('[data-buy-box]');
    const stickyBtn = document.querySelector('[data-sticky-add-btn]');
    const stickyColor = document.querySelector('[data-sticky-color]');
    if (!stickyBar || !buyBox) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            stickyBar.classList.add('is-visible');
            stickyBar.setAttribute('aria-hidden', 'false');
          } else {
            stickyBar.classList.remove('is-visible');
            stickyBar.setAttribute('aria-hidden', 'true');
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(buyBox);

    if (stickyBtn) {
      stickyBtn.addEventListener('click', function () {
        const formBtn = buyBox.querySelector('[data-add-to-cart-btn]');
        if (formBtn) {
          formBtn.click();
        }
      });
    }

    const swatchInputs = buyBox.querySelectorAll('.color-swatch-input');
    swatchInputs.forEach(function (input) {
      input.addEventListener('change', function () {
        const colorName = input.getAttribute('data-color-name');
        if (stickyColor && colorName) {
          stickyColor.textContent = colorName;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initProductGallery();
    initSwatches();
    initQuantitySteppers();
    initStickyCartBar();
  });
})();

