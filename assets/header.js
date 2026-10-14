/* Native disclosures and dialogs, plus progressively enhanced Shopify search. */
(() => {
  'use strict';
  const components = new WeakMap();

  function initHeader(root) {
    if (components.has(root)) return;
    const lifecycle = new AbortController();
    const { signal } = lifecycle;
    components.set(root, lifecycle);
    root.classList.add('header-enhanced');
    const header = root.querySelector('[data-header]');
    const menu = root.querySelector('[data-mobile-nav-drawer]');
    const search = root.querySelector('[data-header-search-dialog]');
    const toggle = root.querySelector('[data-mobile-menu-toggle]');
    const transparent = header.classList.contains('is-transparent');
    const updateHeader = (initial = false) => {
      const scrolled = initial === true ? false : window.scrollY > 40;
      header.classList.toggle('is-scrolled', scrolled);
      header.classList.toggle('is-transparent', transparent && !scrolled && !menu.open && !search.open);
    };
    window.addEventListener('scroll', updateHeader, { passive: true, signal });
    updateHeader(true);
    const openDialog = (dialog, trigger) => {
      [menu, search].forEach(other => { if (other !== dialog && other.open) other.close(); });
      dialog.returnTrigger = trigger;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', String(menu.open));
      updateHeader();
      if (dialog === search) dialog.querySelector('input[type="search"]')?.focus();
    };
    [menu, search].forEach(dialog => {
      dialog.addEventListener('click', event => {
        const bounds = dialog.getBoundingClientRect();
        const backdrop = event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
        if (event.target.closest('[data-header-dialog-close]') || backdrop) dialog.close();
      }, { signal });
      dialog.addEventListener('close', () => {
        const anotherOpen = menu.open || search.open;
        document.body.style.overflow = anotherOpen ? 'hidden' : '';
        toggle.setAttribute('aria-expanded', String(menu.open));
        updateHeader();
        if (!anotherOpen && !document.querySelector('[data-cart-drawer].is-open')) dialog.returnTrigger?.focus();
        if (dialog === search) dialog.dispatchEvent(new Event('search:reset'));
      }, { signal });
    });
    toggle.addEventListener('click', () => openDialog(menu, toggle), { signal });
    root.querySelector('[data-header-search-open]').addEventListener('click', event => {
      event.preventDefault();
      openDialog(search, event.currentTarget);
    }, { signal });
    menu.addEventListener('click', event => { if (event.target.closest('a')) menu.close(); }, { signal });
    const disclosures = [...root.querySelectorAll('.header-menu--desktop details')];
    disclosures.forEach(details => details.addEventListener('toggle', () => {
      if (details.open) disclosures.forEach(other => { if (other !== details) other.open = false; });
    }, { signal }));
    document.addEventListener('click', event => {
      if (!event.target.closest('.header-menu--desktop')) disclosures.forEach(details => { details.open = false; });
    }, { signal });
    root.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      const open = [menu, search].find(dialog => dialog.open);
      if (open) { event.preventDefault(); open.close(); return; }
      const details = event.target.closest('.header-menu--desktop details[open]');
      if (details) { details.open = false; details.querySelector('summary').focus(); }
    }, { signal });
    const desktop = window.matchMedia('(min-width: 1025px)');
    desktop.addEventListener('change', () => { if (desktop.matches && menu.open) menu.close(); }, { signal });
  }

  function initSearch(root) {
    if (components.has(root)) return;
    const lifecycle = new AbortController();
    const { signal } = lifecycle;
    components.set(root, lifecycle);
    const input = root.querySelector('[data-search-input]');
    const results = root.querySelector('[data-search-results]');
    const status = root.querySelector('[data-search-status]');
    const form = root.querySelector('form');
    const endpoint = root.dataset.predictiveUrl;
    if (!endpoint) return;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', results.id);
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('autocomplete', 'off');
    let timer;
    let request;
    let version = 0;
    let activeIndex = -1;
    const options = () => [...results.querySelectorAll('[role="option"]')];
    const activate = index => {
      const items = options();
      activeIndex = index;
      items.forEach((item, i) => item.setAttribute('aria-selected', String(i === index)));
      if (index >= 0 && items[index]) {
        input.setAttribute('aria-activedescendant', items[index].id);
        items[index].scrollIntoView({ block: 'nearest' });
      } else input.removeAttribute('aria-activedescendant');
    };
    const reset = () => {
      clearTimeout(timer);
      timer = null;
      request?.abort();
      version += 1;
      activeIndex = -1;
      results.replaceChildren();
      results.hidden = true;
      status.textContent = '';
      input.removeAttribute('aria-activedescendant');
      input.removeAttribute('aria-busy');
      input.setAttribute('aria-expanded', 'false');
    };
    lifecycle.signal.addEventListener('abort', reset, { once: true });
    root.closest('dialog')?.addEventListener('search:reset', reset, { signal });
    async function suggest(term, expectedVersion) {
      timer = null;
      request = new AbortController();
      const current = request;
      input.setAttribute('aria-busy', 'true');
      status.textContent = 'Searching…';
      try {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set('q', term);
        url.searchParams.set('resources[type]', 'product,page');
        url.searchParams.set('resources[limit]', '6');
        url.searchParams.set('resources[limit_scope]', 'all');
        url.searchParams.set('section_id', 'predictive-search');
        const response = await fetch(url, { signal: current.signal, headers: { Accept: 'text/html' } });
        if (!response.ok) throw new Error('Suggestions are unavailable.');
        const html = await response.text();
        if (current.signal.aborted || expectedVersion !== version) return;
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const content = parsed.querySelector('[data-predictive-results]');
        if (!content) throw new Error('Suggestions are unavailable.');
        results.replaceChildren(...content.childNodes);
        const items = options();
        items.forEach((item, index) => { item.id = `${input.id}-option-${index}`; });
        results.hidden = items.length === 0;
        input.setAttribute('aria-expanded', String(!results.hidden));
        const count = items.filter(item => !item.classList.contains('predictive-option--all')).length;
        status.textContent = count ? `${count} suggestions. Use the up and down arrow keys to explore.` : 'No suggestions. Press Enter to search all results.';
      } catch (error) {
        if (current.signal.aborted || expectedVersion !== version) return;
        results.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        status.textContent = 'Suggestions are unavailable. Press Enter or use Search to see all results.';
      } finally {
        if (expectedVersion === version) input.removeAttribute('aria-busy');
      }
    }
    input.addEventListener('input', () => {
      reset();
      const term = input.value.trim();
      if (!term || input.isComposing) return;
      const expectedVersion = version;
      timer = setTimeout(() => suggest(term, expectedVersion), 200);
    }, { signal });
    input.addEventListener('compositionend', () => input.dispatchEvent(new Event('input')), { signal });
    input.addEventListener('keydown', event => {
      if (event.isComposing) return;
      if (event.key === 'Escape' && (!results.hidden || timer || input.hasAttribute('aria-busy'))) {
        event.preventDefault();
        event.stopPropagation();
        reset();
      } else if (!results.hidden && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        const count = options().length;
        activate(event.key === 'ArrowDown' ? (activeIndex + 1) % count : (activeIndex <= 0 ? count : activeIndex) - 1);
      } else if (event.key === 'Enter' && activeIndex >= 0 && !results.hidden) {
        event.preventDefault();
        options()[activeIndex]?.click();
      } else if (event.key === 'Tab') reset();
    }, { signal });
    results.addEventListener('pointermove', event => {
      const option = event.target.closest('[role="option"]');
      if (option) activate(options().indexOf(option));
    }, { signal });
    // Keep clicked options available until the click fires; collapse when leaving the component.
    document.addEventListener('click', event => { if (!root.contains(event.target)) reset(); }, { signal });
    form.addEventListener('submit', reset, { signal });
  }

  function init(scope = document) {
    scope.querySelectorAll('[data-header-section]').forEach(initHeader);
    scope.querySelectorAll('[data-predictive-search]').forEach(initSearch);
  }
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('shopify:section:load', event => init(event.target));
  document.addEventListener('shopify:section:unload', event => {
    event.target.querySelectorAll('[data-header-section], [data-predictive-search]').forEach(root => {
      const openDialogs = [...root.querySelectorAll('dialog[open]')];
      openDialogs.forEach(dialog => dialog.close());
      if (openDialogs.length && !document.querySelector('dialog[open], [data-cart-drawer].is-open')) document.body.style.overflow = '';
      components.get(root)?.abort();
      components.delete(root);
    });
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-cart-drawer-trigger]');
    if (!trigger || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !document.querySelector('[data-cart-drawer]')) return;
    event.preventDefault();
    document.querySelectorAll('[data-header-section] dialog[open]').forEach(dialog => dialog.close());
    window.dispatchEvent(new CustomEvent('cart:open'));
  });
})();
