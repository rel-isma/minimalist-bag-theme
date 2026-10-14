/* Cart totals and lines are rendered by Shopify Liquid in the active currency. */
(() => {
  'use strict';
  let drawer;
  let returnFocus;
  let busy = false;
  const config = () => document.querySelector('[data-cart-drawer]');
  const error = message => { const status = config()?.querySelector('[data-cart-error]');if (status) status.textContent = message; };
  function open() {
    drawer = config();if (!drawer) return;
    if (!drawer.classList.contains('is-open') && !returnFocus) returnFocus = document.activeElement;
    drawer.classList.add('is-open');drawer.removeAttribute('inert');drawer.setAttribute('aria-hidden', 'false');document.body.style.overflow = 'hidden';
    drawer.querySelector('[data-cart-drawer-close]')?.focus();
  }
  function close() {
    drawer = config();if (!drawer) return;
    drawer.classList.remove('is-open');drawer.setAttribute('inert', '');drawer.setAttribute('aria-hidden', 'true');document.body.style.overflow = '';
    if (returnFocus?.isConnected) returnFocus.focus();returnFocus = null;
  }
  function replace(html) {
    const parsed = new DOMParser().parseFromString(html || '', 'text/html').querySelector('[data-cart-drawer]');
    if (!parsed) throw new Error('Your bag changed. Reload the page to see its current contents.');
    const existing = config();existing.replaceChildren(...parsed.childNodes);
    const count = existing.querySelector('[data-cart-drawer-count]')?.dataset.itemCount || '0';
    document.querySelectorAll('[data-cart-count]').forEach(badge => { badge.textContent = count;badge.closest('[data-cart-drawer-trigger]')?.setAttribute('aria-label', `Bag, ${count} items`); });
  }
  async function mutate(url, payload) {
    if (busy) return;
    busy = true;const previous = document.activeElement;const focusKey = previous?.dataset.key;const focusType = previous?.dataset.cartQuantityStep;
    const target = config();target.setAttribute('aria-busy', 'true');error('Updating your bag…');
    target.querySelectorAll('button, input, textarea').forEach(control => { control.disabled = true; });
    try {
      const response = await fetch(`${url}.js`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...payload, sections: ['cart-drawer'], sections_url: location.pathname }) });
      const data = await response.json();if (!response.ok) throw new Error(data.description || 'Could not update your bag. Try again.');
      let html = data.sections?.['cart-drawer'];
      if (!html) { const sectionUrl = new URL(target.dataset.cartUrl, location.origin);sectionUrl.searchParams.set('sections', 'cart-drawer');const response = await fetch(sectionUrl);if (response.ok) html = (await response.json())['cart-drawer']; }
      replace(html);
      const next = [...target.querySelectorAll('[data-key]')].find(control => control.dataset.key === focusKey && (focusType ? control.dataset.cartQuantityStep === focusType : control.matches('[data-cart-quantity]')));
      (next || target.querySelector('[data-cart-drawer-close]'))?.focus();
    } catch (err) { error(err.message || 'Could not update your bag.'); }
    finally { busy = false;target.removeAttribute('aria-busy');target.querySelectorAll('button, input, textarea').forEach(control => { control.disabled = false; }); }
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-cart-drawer-close], [data-cart-drawer-backdrop]')) { close();return; }
    const step = event.target.closest('[data-cart-quantity-step]');
    const remove = event.target.closest('[data-cart-remove]');
    if (!step && !remove) return;
    if (!event.target.closest('[data-cart-drawer]')) return;
    event.preventDefault();const input = step?.closest('[data-cart-stepper]').querySelector('input');
    const quantity = remove ? 0 : Math.max(0, Number(input.value) + Number(step.dataset.cartQuantityStep));
    mutate(config().dataset.changeUrl, { id: (step || remove).dataset.key, quantity });
  });
  document.addEventListener('change', event => {
    if (!event.target.closest('[data-cart-drawer]')) return;
    if (event.target.matches('[data-cart-quantity]')) {
      if (!event.target.checkValidity()) { event.target.reportValidity();return; }
      mutate(config().dataset.changeUrl, { id: event.target.dataset.key, quantity: Number(event.target.value) });
    }
    if (event.target.matches('[data-cart-note]')) mutate(config().dataset.updateUrl, { note: event.target.value });
  });
  window.addEventListener('cart:open', open);window.addEventListener('cart:close', close);
  window.addEventListener('cart:rendered', event => { returnFocus = event.detail?.trigger;open(); });
  window.addEventListener('keydown', event => {
    const target = config();if (!target?.classList.contains('is-open')) return;
    if (event.key === 'Escape') { close();return; }
    if (event.key !== 'Tab') return;
    const controls = [...target.querySelectorAll('a, button, input, textarea, select')].filter(control => !control.disabled && control.getClientRects().length);
    const first = controls[0];const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault();last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault();first?.focus(); }
  });
})();
