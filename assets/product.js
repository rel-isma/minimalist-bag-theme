/* Product options, native gallery controls, recommendations and bounded recent history. */
(() => {
  'use strict';
  const initialized = new WeakSet();
  const historyKey = 'atelier-recent-products';
  function showMedia(root, id) {
    const slides = [...root.querySelectorAll('[data-product-media]')];
    const selected = slides.find(slide => slide.dataset.mediaId === String(id) || slide.dataset.imageId === String(id)) || slides[0];
    slides.forEach(slide => {
      slide.classList.toggle('is-active', slide === selected);
      if (slide !== selected) slide.querySelectorAll('video').forEach(video => video.pause());
    });
    root.querySelectorAll('[data-media-select]').forEach(link => {
      const active = link.dataset.mediaSelect === selected?.dataset.mediaId;
      link.classList.toggle('is-active', active);
      link.setAttribute('aria-current', String(active));
    });
  }
  function initProduct(root) {
    if (initialized.has(root)) return;
    initialized.add(root);
    const variants = JSON.parse(root.querySelector('[data-product-variants]').dataset.variants);
    const selectors = [...root.querySelectorAll('[data-product-option]')];
    const form = root.querySelector('[data-product-form]');
    const nativeVariant = root.querySelector('[data-product-variant-id]');
    // Keep the native variant form usable if merchant blocks omit the picker or buy button.
    if (form && nativeVariant && (selectors.length || variants.length === 1)) {
      root.classList.add('product-enhanced');
      const update = () => {
        const chosen = selectors.map(group => group.querySelector('input:checked')?.value);
        const variant = selectors.length ? variants.find(item => item.options.every((value, index) => value === chosen[index])) : variants[0];
        const button = form.querySelector('[data-product-submit]');
        nativeVariant.value = variant?.id || '';
        button.disabled = !variant?.available || form.dataset.adding === 'true';
        button.textContent = !variant ? 'Unavailable' : variant.available ? 'Add to bag' : 'Sold out';
        const price = root.querySelector('[data-product-price]');
        if (price) {
          price.replaceChildren();
          if (variant) {
            const amount = document.createElement('span');amount.textContent = variant.price;price.append(amount);
            if (variant.comparePrice) { const compare = document.createElement('s');compare.className = 'text-muted';compare.textContent = variant.comparePrice;price.append(' ', compare); }
          }
        }
        form.querySelector('[data-catalog-status]').textContent = variant ? '' : 'This combination is unavailable. Choose another option.';
        if (variant) {
          const url = new URL(location.href);url.searchParams.set('variant', variant.id);history.replaceState({}, '', url);
          showMedia(root, variant.imageId);
          if (variant.image && !root.querySelector(`[data-media-id="${variant.imageId}"], [data-image-id="${variant.imageId}"]`)) {
            const image = root.querySelector('[data-product-media].is-active img');
            if (image) { image.removeAttribute('srcset');image.src = variant.image;const zoom = image.closest('[data-product-media]').querySelector('[data-product-zoom]');if (zoom) zoom.href = variant.image; }
          }
        }
      };
      selectors.forEach(select => select.addEventListener('change', update));
      update();
    }
    root.querySelectorAll('[data-product-quantity]').forEach(button => button.addEventListener('click', () => {
      const input = root.querySelector('input[name="quantity"]');
      input.value = Math.max(1, Number(input.value || 1) + Number(button.dataset.productQuantity));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }));
    root.querySelectorAll('[data-media-select]').forEach(link => link.addEventListener('click', event => { event.preventDefault();showMedia(root, link.dataset.mediaSelect); }));
    const dialog = root.querySelector('[data-product-zoom-dialog]');
    let trigger;
    root.querySelectorAll('[data-product-zoom]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();trigger = link;
      const image = document.createElement('img');image.src = link.href;image.alt = link.closest('[data-product-media]').querySelector('img')?.alt || '';
      dialog.querySelector('[data-product-zoom-content]').replaceChildren(image);dialog.showModal();document.body.style.overflow = 'hidden';
    }));
    dialog?.querySelector('[data-product-zoom-close]').addEventListener('click', () => dialog.close());
    dialog?.addEventListener('close', () => { document.body.style.overflow = '';trigger?.focus(); });
  }
  async function recommendations(root) {
    if (initialized.has(root)) return;
    initialized.add(root);
    try {
      const url = new URL(root.dataset.url, location.origin);
      url.searchParams.set('section_id', root.dataset.sectionId);url.searchParams.set('product_id', root.dataset.productId);url.searchParams.set('intent', root.dataset.intent);url.searchParams.set('limit', root.dataset.limit);
      const response = await fetch(url);if (!response.ok) return;
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const content = html.querySelector('[data-recommendation-content]');
      if (!root.isConnected || !content?.querySelector('[data-product-card]')) return;
      root.querySelector('[data-recommendation-content]').replaceChildren(...content.childNodes);root.hidden = false;root.dispatchEvent(new CustomEvent('catalog:cards:load', { bubbles: true, detail: { root } }));
    } catch { /* Optional recommendations remain hidden on failure. */ }
  }
  async function recent(root) {
    if (initialized.has(root)) return;
    initialized.add(root);
    try {
      const saved = JSON.parse(localStorage.getItem(historyKey) || '[]');
      if (!Array.isArray(saved)) return;
      const current = root.dataset.currentUrl;
      const urls = [...new Set(saved)].filter(value => {
        if (typeof value !== 'string' || value === current) return false;
        const url = new URL(value, location.origin);
        return url.origin === location.origin && /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?products\/[a-z0-9-]+$/i.test(url.pathname) && !url.search && !url.hash;
      }).slice(0, Number(root.dataset.limit));
      const cards = await Promise.all(urls.map(async value => {
        try { const url = new URL(value, location.origin);url.searchParams.set('section_id', 'recent-product-card');const response = await fetch(url);if (!response.ok) return null;const html = new DOMParser().parseFromString(await response.text(), 'text/html');return html.querySelector('[data-recent-card]'); } catch { return null; }
      }));
      if (!root.isConnected) return;
      const available = cards.filter(Boolean);root.querySelector('[data-recent-products]').replaceChildren(...available);root.hidden = !available.length;root.dispatchEvent(new CustomEvent('catalog:cards:load', { bubbles: true, detail: { root } }));
    } catch { /* Storage can be blocked or malformed. */ }
  }
  function init(scope = document) {
    scope.querySelectorAll('[data-main-product]').forEach(initProduct);
    scope.querySelectorAll('[data-product-recommendations]').forEach(recommendations);
    scope.querySelectorAll('[data-recently-viewed]').forEach(recent);
    const current = scope.querySelector('[data-main-product]')?.dataset.productUrl;
    if (current) try { let stored;try { stored = JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { stored = []; }localStorage.setItem(historyKey, JSON.stringify([current, ...(Array.isArray(stored) ? stored : []).filter(value => typeof value === 'string' && value !== current)].slice(0, 8))); } catch { /* Optional history. */ }
  }
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('shopify:section:load', event => init(event.target));
})();
