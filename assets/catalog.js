/* Progressive catalog controls. Native forms and product links work without JS. */
(() => {
  'use strict';
  const initialized = new WeakSet();
  const collections = new WeakMap();
  const quickDialog = () => document.querySelector('[data-quick-view-dialog]');
  let quickRequest;
  let quickTrigger;

  function bindDialog(dialog) {
    if (!dialog || initialized.has(dialog)) return;
    initialized.add(dialog);
    dialog.addEventListener('click', (event) => {
      if (event.target.closest('[data-dialog-close]') || event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      window.AtelierTheme.syncScrollLock();
      if (dialog.catalogReturnFocus?.getClientRects().length) dialog.catalogReturnFocus.focus();
      if (dialog === quickDialog()) {
        quickRequest?.abort();
        if (!document.querySelector('[data-cart-drawer].is-open')) quickTrigger?.focus();
      }
    });
  }

  function initCollections(root = document) {
    root.querySelectorAll('[data-collection-section]').forEach(section => {
      if (initialized.has(section)) return;
      initialized.add(section);
      section.classList.add('catalog-enhanced');
      const form = section.querySelector('[data-collection-filters]');
      const home = section.querySelector('[data-filter-home]');
      const dialog = section.querySelector('[data-filter-dialog]');
      const destination = section.querySelector('[data-filter-destination]');
      const openButton = section.querySelector('[data-filter-open]');
      const media = window.matchMedia('(max-width: 989px)');
      bindDialog(dialog);
      const moveFilters = () => {
        if (!section.isConnected) { media.removeEventListener('change', moveFilters); return; }
        if (dialog.open) dialog.close();
        (media.matches && openButton ? destination : home).append(form);
      };
      moveFilters();
      media.addEventListener('change', moveFilters);
      collections.set(section, () => { media.removeEventListener('change', moveFilters); if (dialog.open) dialog.close(); });
      openButton?.addEventListener('click', () => {
        dialog.catalogReturnFocus = openButton;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      });
      section.querySelector('[data-collection-sort]')?.addEventListener('change', () => form.requestSubmit());
      // Empty price fields should not create meaningless filter parameters.
      form.addEventListener('submit', () => {
        form.querySelectorAll('input[type="number"]').forEach(input => { if (!input.value) input.disabled = true; });
      });
      section.querySelectorAll('[data-grid-columns]').forEach(button => {
        button.addEventListener('click', () => {
          section.style.setProperty('--collection-columns', button.dataset.gridColumns);
          section.querySelectorAll('[data-grid-columns]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        });
      });
    });
  }

  function updateVariant(form) {
    const variants = JSON.parse(form.querySelector('[data-variant-data]').dataset.variants);
    const selected = Array.from(form.querySelectorAll('[data-variant-option]'), group => group.querySelector('input:checked')?.value);
    const variant = variants.find(item => item.options.every((value, index) => value === selected[index]));
    const button = form.querySelector('[data-variant-submit]');
    const hiddenId = form.querySelector('[name="id"]');
    button.disabled = !variant?.available;
    button.textContent = !variant ? 'Unavailable' : variant.available ? 'Add to bag' : 'Sold out';
    hiddenId.value = variant?.id || '';
    const product = form.closest('[data-quick-view-product]');
    const price = product.querySelector('[data-quick-view-price]');
    price.replaceChildren();
    if (variant) {
      const amount = document.createElement('span');
      amount.textContent = variant.price;
      price.append(amount);
      if (variant.comparePrice) {
        const comparison = document.createElement('s');
        comparison.className = 'text-muted';
        comparison.textContent = variant.comparePrice;
        price.append(' ', comparison);
      }
    }
    const image = product.querySelector('[data-quick-view-image]');
    if (image) {
      if (!image.dataset.originalSrc) {
        image.dataset.originalSrc = image.currentSrc || image.src;
        image.dataset.originalAlt = image.alt;
      }
      image.removeAttribute('srcset');
      image.src = variant?.image || image.dataset.originalSrc;
      image.alt = variant?.image ? variant.alt : image.dataset.originalAlt;
    }
    form.querySelector('[data-catalog-status]').textContent = variant ? '' : 'This combination is unavailable. Choose another option.';
  }

  function updateCard(form) {
    const data = form.querySelector('[data-product-variants]');
    if (!data) return;
    const variant = JSON.parse(data.dataset.variants).find(item => String(item.id) === String(new FormData(form).get('id')));
    if (!variant) return;
    const card = form.closest('[data-product-card]');
    const price = card.querySelector('[data-card-price]');
    price.replaceChildren();
    const amount = document.createElement('span');amount.textContent = variant.price;price.append(amount);
    if (variant.comparePrice) { const comparison = document.createElement('s');comparison.className = 'text-muted';comparison.textContent = variant.comparePrice;price.append(' ', comparison); }
    form.querySelector('button[type="submit"]').disabled = !variant.available || form.dataset.adding === 'true';
    card.querySelectorAll('.product-card__media, .product-card__title a').forEach(link => { const url = new URL(link.href);url.searchParams.set('variant', variant.id);link.href = url; });
    if (variant.image) { const image = card.querySelector('.product-card__image');if (image) { image.removeAttribute('srcset');image.src = variant.image; } }
  }

  async function openQuickView(link) {
    const dialog = quickDialog();
    if (!dialog) { window.location.assign(link.href); return; }
    quickRequest?.abort();
    quickRequest = new AbortController();
    const request = quickRequest;
    quickTrigger = link;
    bindDialog(dialog);
    const content = dialog.querySelector('[data-quick-view-content]');
    content.setAttribute('role', 'status');
    content.setAttribute('aria-live', 'polite');
    content.textContent = 'Loading product…';
    dialog.setAttribute('aria-label', 'Choose product options');
    dialog.removeAttribute('aria-labelledby');
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    try {
      const url = new URL(link.href);
      url.searchParams.set('section_id', 'quick-view');
      const response = await fetch(url, { signal: request.signal });
      if (!response.ok) throw new Error('Could not load product.');
      const html = await response.text();
      if (request.signal.aborted || !dialog.open) return;
      const documentFragment = new DOMParser().parseFromString(html, 'text/html');
      const product = documentFragment.querySelector('[data-quick-view-product]');
      if (!product) throw new Error('This product is unavailable.');
      content.removeAttribute('role');
      content.removeAttribute('aria-live');
      content.replaceChildren(product);
      dialog.setAttribute('aria-labelledby', product.querySelector('h2').id);
      const form = product.querySelector('[data-variant-form]');
      updateVariant(form);
      product.querySelector('input[type="radio"]:checked, button, a')?.focus();
    } catch (error) {
      if (error.name === 'AbortError') return;
      content.textContent = `${error.message} `;
      const fallback = document.createElement('a');
      fallback.className = 'btn btn--link';
      fallback.href = link.href;
      fallback.textContent = 'View product details';
      content.append(fallback);
    }
  }

  async function addToBag(form) {
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-catalog-status]');
    if (button.disabled || form.dataset.adding === 'true') return;
    const settings = document.querySelector('[data-catalog-config]');
    const cartUrl = settings?.dataset.cartUrl;
    if (!cartUrl) { form.submit(); return; }
    const body = new FormData(form);
    body.set('sections', 'cart-drawer');
    body.set('sections_url', window.location.pathname);
    form.dataset.adding = 'true';
    const selectors = [...form.querySelectorAll('select, input[type="radio"]')].filter(control => !control.disabled);
    selectors.forEach(select => { select.disabled = true; });
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    status.textContent = 'Adding to bag…';
    let added = false;
    try {
      const response = await fetch(`${form.action}.js`, { method: 'POST', body, headers: { Accept: 'application/json' } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.description || 'Could not add this item. Please try again.');
      added = true;
      if (settings.dataset.cartType === 'page') { window.location.assign(cartUrl); return; }
      const drawer = document.querySelector('[data-cart-drawer]');
      const rendered = new DOMParser().parseFromString(result.sections?.['cart-drawer'] || '', 'text/html').querySelector('[data-cart-drawer]');
      if (!drawer || !rendered) {
        status.replaceChildren('Added to your bag. ');
        const cartLink = document.createElement('a');
        cartLink.className = 'btn btn--link';
        cartLink.href = cartUrl;
        cartLink.textContent = 'View bag';
        status.append(cartLink);
        return;
      }
      const returnTrigger = quickDialog()?.open ? quickTrigger : form.querySelector('button');
      if (quickDialog()?.open) quickDialog().close();
      drawer.replaceChildren(...rendered.childNodes);
      const count = drawer.querySelector('[data-cart-drawer-count]')?.dataset.itemCount;
      document.querySelectorAll('[data-cart-count]').forEach(badge => { badge.textContent = count || '';badge.closest('[data-cart-drawer-trigger]')?.setAttribute('aria-label', `Bag, ${count} items`); });
      status.textContent = 'Added to your bag.';
      window.dispatchEvent(new CustomEvent('cart:rendered', { detail: { trigger: returnTrigger } }));
    } catch (error) {
      status.textContent = added ? 'Added to your bag. Open your bag to continue.' : error.message || 'Could not add this item. Please try again.';
    } finally {
      delete form.dataset.adding;
      selectors.forEach(select => { select.disabled = false; });
      button.removeAttribute('aria-busy');
      const id = String(new FormData(form).get('id') || '');
      const data = form.querySelector('[data-variant-data], [data-product-variants]') || form.closest('[data-main-product]')?.querySelector('[data-product-variants]');
      button.disabled = data ? !JSON.parse(data.dataset.variants).find(variant => String(variant.id) === id)?.available : false;
    }
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-quick-view]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openQuickView(link);
  });
  document.addEventListener('change', event => {
    const form = event.target.closest('[data-variant-form]');
    if (form && event.target.closest('[data-variant-option]')) updateVariant(form);
    const cardForm = event.target.closest('[data-product-card] form');
    if (cardForm && event.target.matches('input[name="id"]')) updateCard(cardForm);
  });
  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-catalog-add-form]');
    if (!form) return;
    event.preventDefault();
    addToBag(form);
  });
  function initCards(scope = document) { scope.querySelectorAll('[data-product-card] form').forEach(updateCard); }
  document.addEventListener('DOMContentLoaded', () => { initCollections();initCards(); });
  document.addEventListener('catalog:cards:load', event => initCards(event.detail.root));
  document.addEventListener('shopify:section:load', event => { initCollections(event.target);initCards(event.target); });
  document.addEventListener('shopify:section:unload', event => {
    event.target.querySelectorAll('[data-collection-section]').forEach(section => {
      collections.get(section)?.(); collections.delete(section); initialized.delete(section);
    });
    if (quickTrigger && event.target.contains(quickTrigger)) { quickRequest?.abort(); quickDialog()?.close(); quickTrigger = null; }
    window.AtelierTheme.syncScrollLock();
  });
})();
