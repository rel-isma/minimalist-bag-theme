/* Welcome signup and a bag + wallet purchase. Shopify owns prices and discounts. */
(() => {
  'use strict';
  const root = document.querySelector('[data-store-offers]');
  if (!root) return;
  const welcome = root.querySelector('#AtelierWelcome');
  const offer = root.querySelector('#AtelierOffers');
  if (!offer?.showModal || !welcome?.showModal) return;
  const launcher = root.querySelector('.offers-launcher');
  const bag = offer.querySelector('[data-role="bag"]');
  const wallet = offer.querySelector('[data-role="wallet"]');
  const addButton = offer.querySelector('[data-pair-add]');
  const status = offer.querySelector('[data-pair-status]');
  const bagMarkup = bag?.innerHTML;
  const bagDefaults = bag ? { ...bag.dataset } : {};
  const bagTemplates = new Map([...root.querySelectorAll('[data-bag-template]')].map(template => [template.dataset.bagTemplate, template]));
  const bagChooser = offer.querySelector('[data-bag-chooser]');
  const attemptedOffers = new Set();
  const variants = new WeakMap();
  const walletSelections = new Map();
  const walletTemplates = new Map([...root.querySelectorAll('[data-wallet-template]')].map(template => [template.dataset.walletTemplate, template]));
  const walletChooser = offer.querySelector('[data-wallet-chooser]');
  const key = 'atelier-welcome-until-v2';
  const bagTypes = new Set(['shoulder bag', 'crossbody bag', 'tote bag', 'mini and clutch bag', 'mini bag', 'clutch bag']);
  let cart = null;
  let busy = false;
  let timer;
  let refreshId = 0;
  const money = amount => new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency: root.dataset.currency || 'USD' }).format(amount / 100);
  const isBag = item => item.quantity > 0 && bagTypes.has(String(item.product_type || item.product?.type || '').toLowerCase());
  const isAddon = item => item.quantity > 0 && walletTemplates.has(String(item.product_id || item.product?.id));
  const addonInCart = () => cart?.items.find(isAddon);
  const offerSaving = () => !root.dataset.code ? 0 : (cart?.items || []).filter(isBag).reduce((sum, line) => sum + (line.line_level_discount_allocations || []).filter(a => String(a.discount_application?.title || '').toUpperCase() === root.dataset.code.toUpperCase()).reduce((n, a) => n + Number(a.amount || 0), 0), 0);
  const walletPresent = id => cart?.items.some(item => Number(item.variant_id || item.id) === Number(id) && item.quantity > 0);
  const bagInCart = () => cart?.items.find(item => isBag(item) && String(item.product_id || item.product?.id) === document.querySelector('[data-main-product]')?.dataset.productId) || cart?.items.find(isBag);
  const anotherModal = () => document.querySelector('dialog[open], [data-cart-drawer].is-open');
  const syncLock = () => window.AtelierTheme?.syncScrollLock();
  const readExpiry = () => { try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; } };
  const rememberWelcome = (days = Number(root.dataset.frequency)) => { try { localStorage.setItem(key, String(Math.max(readExpiry(), Date.now() + days * 86400000))); } catch { /* Storage is optional. */ } };
  const signup = welcome.querySelector('#AtelierWelcomeForm');
  const signupButton = signup?.querySelector('[data-welcome-submit]');
  const signupLabel = signupButton?.querySelector('[data-welcome-submit-label]');
  const signupStatus = signup?.querySelector('[data-welcome-status]');
  const signupDefaultLabel = signupLabel?.textContent;
  const pendingSignupKey = 'atelier-welcome-pending';
  const pendingSignup = () => { try { const at = Number(sessionStorage.getItem(pendingSignupKey)); return at > 0 && Date.now() - at < 15 * 60 * 1000; } catch { return false; } };
  const clearPendingSignup = () => { try { sessionStorage.removeItem(pendingSignupKey); } catch { /* Storage is optional. */ } };
  signup?.addEventListener('submit', () => {
    if (!signupButton || !signup.checkValidity()) return;
    // Keep Shopify's native submission/verification flow and all form fields.
    try { sessionStorage.setItem(pendingSignupKey, String(Date.now())); } catch { /* Storage is optional. */ }
    signup.setAttribute('aria-busy', 'true');
    signupButton.disabled = true;
    signupButton.setAttribute('aria-disabled', 'true');
    signupLabel.textContent = 'Joining…';
    signupStatus.textContent = 'Sending your signup…';
  });
  window.addEventListener('pageshow', event => {
    if (!event.persisted || !signupButton) return;
    signup.removeAttribute('aria-busy');
    signupButton.disabled = false;
    signupButton.removeAttribute('aria-disabled');
    signupLabel.textContent = signupDefaultLabel;
    signupStatus.textContent = '';
    clearPendingSignup();
  });
  const getCart = async () => {
    const response = await fetch(`${root.dataset.cartUrl}.js`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!response.ok) throw new Error('Could not read your bag. Please try again.');
    return response.json();
  };
  const productLink = value => {
    const url = new URL(value || root.dataset.cartUrl, location.origin);
    return url.origin === location.origin ? url.href : root.dataset.cartUrl;
  };
  function updateSummary() {
    const existing = bagInCart();
    const addon = addonInCart();
    const ready = bag && wallet && bag.dataset.available === 'true' && wallet.dataset.available === 'true';
    const selectedAddonPresent = walletPresent(wallet?.dataset.variantId);
    addButton.disabled = busy || !cart || !ready;
    offer.querySelectorAll('input[type="radio"], [data-wallet-choice], [data-wallet-choose], [data-bag-choice], [data-bag-choose]').forEach(input => { input.disabled = busy; });
    for (const role of ['bag', 'wallet']) {
      const card = role === 'bag' ? bag : wallet;
      offer.querySelectorAll(`[data-${role}-choice]`).forEach(button => button.setAttribute('aria-pressed', String(button.dataset[`${role}Choice`] === card?.dataset.productId)));
      const change = card?.querySelector(`[data-${role}-choose]`);
      if (change) { change.hidden = role === 'bag' ? !!existing || bagTemplates.size < 2 : walletTemplates.size < 2; change.setAttribute('aria-expanded', String(!(role === 'bag' ? bagChooser : walletChooser).hidden)); }
    }
    addButton.textContent = busy ? 'Updating your bag…' : existing && selectedAddonPresent ? 'View your pair' : existing ? 'Add add-on & save on bag' : selectedAddonPresent ? 'Add bag & save 10%' : 'Add pair & save on bag';
    if (!root.dataset.code) addButton.textContent = busy ? 'Adding…' : 'Add to bag';
    const subtotal = Number(bag?.dataset.price || 0) + Number(wallet?.dataset.price || 0);
    offer.querySelector('[data-pair-subtotal]').textContent = ready ? money(subtotal) : '—';
    offer.querySelector('[data-pair-intro]').textContent = existing && addon ? 'Your pair is in the bag. Explore another add-on if you like.' : existing ? 'Your bag is here. Choose a wallet or accessory to save 10% on it.' : addon ? 'Your add-on is in. Choose a bag to save 10% on it.' : 'Choose a bag and a wallet or accessory. Make it yours.';
    if (wallet) wallet.querySelector('[data-pair-badge]').hidden = !selectedAddonPresent;
    const saving = offerSaving();
    document.querySelectorAll('[data-wallet-upsell]').forEach(panel => {
      panel.hidden = !cart?.item_count && !!panel.closest('[data-cart-drawer]');
      panel.classList.toggle('pairing-bar--complete', !!existing && !!addon);
      panel.querySelector('[data-upsell-heading]').textContent = saving > 0 ? `${root.dataset.code} · ${money(saving)} saved on your bag` : existing && addon ? 'Your pair is ready. Save 10% on one bag.' : existing ? 'Add a wallet or accessory. Save 10% on your bag.' : addon ? 'Add a bag. Save 10% on it.' : 'A bag + an add-on. Save 10% on one bag.';
      const button = panel.querySelector('[data-offers-open]');
      button.hidden = saving > 0;
      button.disabled = busy;
      button.textContent = busy ? 'Applying…' : existing && addon ? 'Review offer →' : existing ? 'Choose add-on →' : addon ? 'Choose bag →' : 'Build your pair →';
    });
  }
  function updatePicker(card) {
    const selected = [...card.querySelectorAll('[data-option-position]')].map(group => group.querySelector('input:checked')?.value);
    const list = variants.get(card) || [];
    const variant = selected.length ? list.find(item => item.options.every((value, i) => value === selected[i])) : list[0];
    card.dataset.variantId = variant?.id || '';
    if (card === wallet && variant) walletSelections.set(card.dataset.productId, variant.id);
    card.dataset.price = variant?.price || 0;
    card.dataset.available = String(!!variant?.available);
    card.querySelector('[data-pair-price]').textContent = variant ? money(variant.price) : '—';
    card.querySelector('[data-pair-variant-note]').textContent = !variant ? 'This combination is unavailable.' : !variant.available ? 'Sold out — choose another color.' : variant.options.join(' / ');
    if (variant) {
      card.querySelectorAll('[data-pair-title], [data-pair-image-link], [data-pair-details]').forEach(link => { link.href = productLink(variant.url); });
      const image = card.querySelector('[data-pair-image]');
      if (image && variant.image) { image.removeAttribute('srcset'); image.src = variant.image; }
    }
    updateSummary();
  }
  function initPicker(card) {
    if (!card) return;
    try { variants.set(card, JSON.parse(card.querySelector('[data-pair-variants]').dataset.variants)); updatePicker(card); }
    catch { card.dataset.available = 'false'; addButton.disabled = true; status.textContent = 'Choose your products from their detail pages.'; }
  }
  function chooseVariant(card, id) {
    const variant = variants.get(card)?.find(item => Number(item.id) === Number(id));
    if (!variant) return;
    card.querySelectorAll('[data-option-position]').forEach((group, index) => {
      group.querySelectorAll('input').forEach(input => { input.checked = input.value === variant.options[index]; });
    });
    updatePicker(card);
  }
  function toggleWalletChooser(show, focus = true) {
    if (!walletChooser || walletTemplates.size < 2) return;
    walletChooser.hidden = !show;
    if (show) bagChooser.hidden = true;
    updateSummary();
    if (focus) {
      if (show) walletChooser.querySelector('[aria-pressed="true"], [data-wallet-choice]')?.focus();
      else wallet?.querySelector('[data-wallet-choose]')?.focus();
    }
  }
  function chooseWallet(productId, variantId, focus = false) {
    const template = walletTemplates.get(String(productId));
    const replacement = template?.content.querySelector('[data-role="wallet"]');
    if (!replacement || !wallet) return false;
    const preferred = variantId || walletSelections.get(String(productId));
    const clone = replacement.cloneNode(true);
    wallet.replaceChildren(...clone.childNodes);
    for (const name of ['productId', 'productUrl', 'variantId', 'price']) wallet.dataset[name] = replacement.dataset[name];
    initPicker(wallet);
    if (preferred) chooseVariant(wallet, preferred);
    toggleWalletChooser(false, focus);
    status.textContent = '';
    return true;
  }
  function toggleBagChooser(show, focus = true) {
    if (!bagChooser || bagInCart()) return;
    bagChooser.hidden = !show;
    if (show) walletChooser.hidden = true;
    updateSummary();
    if (focus) (show ? bagChooser.querySelector('[aria-pressed="true"], [data-bag-choice]') : bag.querySelector('[data-bag-choose]'))?.focus();
  }
  function chooseBag(id) {
    if (bagInCart() || busy) return;
    const replacement = bagTemplates.get(String(id))?.content.querySelector('[data-role="bag"]');
    if (!replacement) return;
    bag.replaceChildren(...replacement.cloneNode(true).childNodes);
    for (const name of ['productId', 'productUrl', 'variantId', 'price']) bag.dataset[name] = replacement.dataset[name];
    initPicker(bag); toggleBagChooser(false);
    status.textContent = '';
  }
  function syncBag() {
    if (!bag) return;
    const existing = bagInCart();
    if (existing) {
      bag.dataset.inCart = 'true';
      bag.dataset.productId = existing.product_id || existing.product?.id;
      bagChooser.hidden = true;
      bag.dataset.variantId = existing.variant_id || existing.id;
      bag.dataset.price = existing.original_price ?? existing.price ?? existing.final_price ?? existing.original_line_price / existing.quantity;
      bag.dataset.available = 'true';
      bag.querySelector('[data-pair-title]').textContent = existing.product_title || existing.product?.title || existing.title;
      bag.querySelectorAll('[data-pair-title], [data-pair-image-link], [data-pair-details]').forEach(link => { link.href = productLink(existing.url); });
      bag.querySelector('[data-pair-price]').textContent = money(Number(bag.dataset.price));
      bag.querySelector('[data-pair-variant-note]').textContent = [existing.variant_title, existing.quantity > 1 ? `${existing.quantity} in your bag` : ''].filter(Boolean).join(' · ');
      bag.querySelector('[data-pair-options]').hidden = true;
      bag.querySelector('[data-pair-badge]').hidden = false;
      const src = existing.featured_image?.url || existing.image?.src || existing.image;
      const image = bag.querySelector('[data-pair-image]');
      if (image && typeof src === 'string') { image.removeAttribute('srcset'); image.src = src; image.alt = existing.product_title || 'Your bag'; }
    } else if (bag.dataset.inCart === 'true') {
      bag.innerHTML = bagMarkup;
      Object.assign(bag.dataset, bagDefaults);
      delete bag.dataset.inCart;
      initPicker(bag);
    }
    updateSummary();
  }
  async function refreshCart(chooseExistingWallet = false) {
    if (busy) return;
    const request = ++refreshId;
    try {
      const latest = await getCart();
      if (request !== refreshId || busy) return;
      cart = latest; syncBag();
      const existingWallet = cart.items.find(item => String(item.product_id || item.product?.id) === wallet?.dataset.productId && item.quantity > 0) || cart.items.find(item => walletTemplates.has(String(item.product_id || item.product?.id)) && item.quantity > 0);
      if (chooseExistingWallet === true && existingWallet) chooseWallet(existingWallet.product_id || existingWallet.product?.id, existingWallet.variant_id || existingWallet.id);
      status.textContent = '';
      await applyEligibleOffer();
    } catch (error) { if (request === refreshId) { cart = null; updateSummary(); status.textContent = error.message; } }
  }
  async function applyEligibleOffer() {
    if (busy || !root.dataset.code || !bagInCart() || !addonInCart() || offerSaving() > 0) return;
    const fingerprint = JSON.stringify((cart.items || []).map(i => [i.variant_id || i.id, i.quantity]).sort());
    if (attemptedOffers.has(fingerprint)) return;
    attemptedOffers.add(fingerprint);
    const drawer = document.querySelector('[data-cart-drawer]');
    if (drawer?.getAttribute('aria-busy') === 'true') { attemptedOffers.delete(fingerprint); return; }
    busy = true; updateSummary();
    drawer?.setAttribute('aria-busy', 'true');
    const checkout = drawer?.querySelector('[name="checkout"]');
    if (checkout) checkout.disabled = true;
    try {
      const codes = [...new Set([...(cart.discount_codes || []).map(c => c.code).filter(Boolean), root.dataset.code])];
      const result = await post(root.dataset.updateUrl, { discount: codes.join(','), sections: ['cart-drawer'], sections_url: location.pathname });
      cart = result;
      if (result.sections?.['cart-drawer']) window.dispatchEvent(new CustomEvent('cart:offer-refreshed', { detail: { html: result.sections['cart-drawer'] } }));
      if (location.pathname.replace(/\/$/, '') === root.dataset.cartUrl.replace(/\/$/, '') && offerSaving() > 0) { location.reload(); return; }
      if (!offerSaving()) document.querySelectorAll('[data-upsell-status]').forEach(el => { el.textContent = `${root.dataset.code} could not be applied. Review the offer or check eligibility at checkout.`; });
    } catch {
      document.querySelectorAll('[data-upsell-status]').forEach(el => { el.textContent = `Could not apply ${root.dataset.code}. You can enter it at checkout.`; });
    } finally {
      busy = false; drawer?.removeAttribute('aria-busy');
      const nextCheckout = drawer?.querySelector('[name="checkout"]'); if (nextCheckout) nextCheckout.disabled = false;
      updateSummary();
    }
  }
  function openDialog(dialog, trigger) {
    if (dialog.open || anotherModal()) return false;
    dialog.returnFocus = trigger || document.activeElement;
    dialog.showModal(); syncLock();
    (dialog.querySelector('[data-offers-success], [data-offers-error]') || dialog.querySelector('button'))?.focus();
    return true;
  }
  function openOffer(trigger) {
    clearTimeout(timer);
    if (welcome.open) welcome.close();
    if (trigger?.closest('[data-cart-drawer]')) window.dispatchEvent(new CustomEvent('cart:close'));
    if (openDialog(offer, trigger?.closest('[data-cart-drawer]') ? launcher : trigger)) {
      if (!bagInCart()) {
        const main = document.querySelector('[data-main-product]');
        if (main?.dataset.productId === bag?.dataset.productId) chooseVariant(bag, main.querySelector('[data-product-variant-id]')?.value);
      }
      refreshCart(true).then(() => { if (offer.open && !bagInCart() && addonInCart()) toggleBagChooser(true); if (offer.open && (trigger?.hasAttribute('data-wallet-choice-open') || (bagInCart() && !addonInCart()))) toggleWalletChooser(true); });
    }
  }
  async function post(url, payload) {
    const response = await fetch(`${url}.js`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.description || data.message || 'Could not update your bag. Please try again.');
    return data;
  }
  async function showCart(data, trigger, message) {
    const drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer || document.querySelector('[data-catalog-config]')?.dataset.cartType === 'page') { location.assign(root.dataset.cartUrl); return; }
    let html = data?.sections?.['cart-drawer'];
    if (!html) {
      const url = new URL(root.dataset.cartUrl, location.origin); url.searchParams.set('sections', 'cart-drawer');
      const response = await fetch(url); if (response.ok) html = (await response.json())['cart-drawer'];
    }
    const rendered = new DOMParser().parseFromString(html || '', 'text/html').querySelector('[data-cart-drawer]');
    if (!rendered) throw new Error('Your items are in the bag. Open “View your bag” to continue.');
    drawer.replaceChildren(...rendered.childNodes);
    const count = drawer.querySelector('[data-cart-drawer-count]')?.dataset.itemCount || '0';
    document.querySelectorAll('[data-cart-count]').forEach(badge => { badge.textContent = count; badge.closest('[data-cart-drawer-trigger]')?.setAttribute('aria-label', `Bag, ${count} items`); });
    if (offer.open) offer.close();
    if (welcome.open) welcome.close();
    window.dispatchEvent(new CustomEvent('cart:rendered', { detail: { trigger: trigger?.closest('dialog') ? launcher : trigger } }));
    const feedback = drawer.querySelector('[data-cart-error]'); if (feedback) feedback.textContent = offerSaving() > 0 ? '' : message;
  }
  async function addPair(trigger) {
    if (busy || !bag || !wallet) return;
    if (document.querySelector('[data-cart-drawer][aria-busy="true"]')) return;
    if (wallet.dataset.available !== 'true' || bag.dataset.available !== 'true') return;
    busy = true; ++refreshId; updateSummary();
    status.textContent = 'Adding to your bag…';
    let changed = false;
    const panelStatus = trigger?.closest('[data-wallet-upsell]')?.querySelector('[data-upsell-status]');
    if (panelStatus) panelStatus.textContent = 'Adding your add-on…';
    try {
      cart = await getCart(); syncBag();
      const existing = bagInCart();
      const items = [];
      if (!existing) items.push({ id: Number(bag.dataset.variantId), quantity: 1 });
      if (!walletPresent(wallet.dataset.variantId)) items.push({ id: Number(wallet.dataset.variantId), quantity: 1 });
      let result;
      if (items.length) { result = await post(root.dataset.addUrl, { items, sections: ['cart-drawer'], sections_url: location.pathname }); changed = true; }
      let message = 'Your pair is in the bag.';
      if (root.dataset.code) {
        const codes = [...new Set([...(cart.discount_codes || []).map(item => item.code).filter(Boolean), root.dataset.code])];
        try {
          result = await post(root.dataset.updateUrl, { discount: codes.join(','), sections: ['cart-drawer'], sections_url: location.pathname });
          const applicable = result.discount_codes?.find(item => String(item.code || '').toUpperCase() === root.dataset.code.toUpperCase())?.applicable;
          message = applicable === false ? `Items are in your bag, but ${root.dataset.code} is not eligible. Review your bag before checkout.` : applicable === true ? `Your pair is in the bag. ${root.dataset.code} applied.` : `Your pair is in the bag. ${root.dataset.code} requested; check your savings below.`;
        } catch { message = `Items are in your bag. ${root.dataset.code} could not be applied; enter it at checkout to check eligibility.`; result = null; }
      }
      cart = await getCart(); syncBag();
      await showCart(result, trigger, message);
      status.textContent = message;
      if (panelStatus?.isConnected) panelStatus.textContent = message;
    } catch (error) {
      const message = changed ? 'Items were added. Review your bag before trying again.' : error.message || 'Your bag may have changed. Review it before trying again.';
      status.textContent = message; if (panelStatus?.isConnected) panelStatus.textContent = message;
    } finally { busy = false; updateSummary(); }
  }
  initPicker(bag); initPicker(wallet);
  document.addEventListener('change', event => {
    const card = event.target.closest('[data-offer-product]');
    if (card && card.dataset.inCart !== 'true') { updatePicker(card); status.textContent = ''; }
  });
  document.addEventListener('click', event => {
    const open = event.target.closest('[data-offers-open]');
    if (open) openOffer(open);
    if (event.target.closest('[data-welcome-close]')) welcome.close();
    if (event.target.closest('[data-offers-close]')) offer.close();
    if (event.target.closest('[data-bag-choose]')) toggleBagChooser(bagChooser.hidden);
    if (event.target.closest('[data-bag-chooser-close]')) toggleBagChooser(false);
    const bagChoice = event.target.closest('[data-bag-choice]');
    if (bagChoice && !busy) chooseBag(bagChoice.dataset.bagChoice);
    if (event.target.closest('[data-wallet-choose]')) toggleWalletChooser(walletChooser.hidden);
    if (event.target.closest('[data-wallet-chooser-close]')) toggleWalletChooser(false);
    const walletChoice = event.target.closest('[data-wallet-choice]');
    if (walletChoice && !busy) chooseWallet(walletChoice.dataset.walletChoice, null, true);
    const pairAdd = event.target.closest('[data-pair-add]'); if (pairAdd) addPair(pairAdd);

  });
  [welcome, offer].forEach(dialog => {
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (dialog === welcome) rememberWelcome();
      syncLock();
      if (!anotherModal() && dialog.returnFocus?.isConnected && !dialog.returnFocus.closest('[inert]')) dialog.returnFocus.focus();
    });
  });
  offer.addEventListener('cancel', event => { if (!walletChooser.hidden) { event.preventDefault(); toggleWalletChooser(false); } else if (!bagChooser.hidden) { event.preventDefault(); toggleBagChooser(false); } });
  launcher.hidden = false;
  window.addEventListener('cart:rendered', refreshCart);
  window.addEventListener('cart:updated', refreshCart);
  refreshCart();
  const success = welcome.querySelector('[data-offers-success]');
  const error = welcome.querySelector('[data-offers-error]');
  if (success || error || pendingSignup()) {
    const unconfirmed = !success && !error;
    clearPendingSignup();
    if (success) {
      rememberWelcome(365);
      welcome.querySelector('.offers-dismiss').textContent = 'Continue exploring';
    }
    if (unconfirmed && signupStatus) signupStatus.textContent = 'We could not confirm your signup. Please check for a confirmation email, or try again.';
    openDialog(welcome, launcher);
    if (success) success.focus();
    if (error) { error.setAttribute('tabindex', '-1'); error.focus(); }
  } else if (root.dataset.autoOpen === 'true' && !root.hasAttribute('data-design-mode') && readExpiry() < Date.now()) {
    timer = setTimeout(() => {
      if (document.visibilityState === 'visible' && !anotherModal() && !document.activeElement?.matches('input, textarea, select')) {
        if (openDialog(welcome, launcher)) rememberWelcome();
      }
    }, Number(root.dataset.delay) * 1000);
  }
})();
