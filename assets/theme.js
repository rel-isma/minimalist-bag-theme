/* Shared section lifecycle and scroll animation, including editor re-renders. */
(() => {
  'use strict';
  const observers = new WeakMap();
  const theme = window.AtelierTheme = window.AtelierTheme || {};
  theme.syncScrollLock = () => {
    document.body.style.overflow = document.querySelector('dialog[open], [data-cart-drawer].is-open') ? 'hidden' : '';
  };
  function init(scope = document) {
    observers.get(scope)?.disconnect();
    const nodes = [...scope.querySelectorAll('.fade-up')];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach(node => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: .1 });
    observers.set(scope, observer);
    nodes.forEach(node => observer.observe(node));
  }
  const selectedDisclosures = new WeakMap();
  function reveal(event) {
    const root = event.target;
    root.closest?.('.fade-up')?.classList.add('is-visible');
    root.querySelectorAll('.fade-up').forEach(node => node.classList.add('is-visible'));
    if (root.matches?.('.fade-up')) root.classList.add('is-visible');
    if (event.type === 'shopify:block:select') {
      const details = root.matches?.('details') ? root : root.querySelector('details');
      if (details) { selectedDisclosures.set(root, details.open); details.open = true; }
    }
  }
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('shopify:section:load', event => init(event.target));
  document.addEventListener('shopify:section:unload', event => {
    observers.get(event.target)?.disconnect();
    event.target.querySelectorAll('.fade-up').forEach(node => observers.get(document)?.unobserve(node));
    event.target.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    if (event.target.querySelector('[data-cart-drawer].is-open')) window.dispatchEvent(new CustomEvent('cart:close'));
    theme.syncScrollLock();
  });
  document.addEventListener('shopify:section:select', reveal);
  document.addEventListener('shopify:block:select', reveal);
  document.addEventListener('shopify:block:deselect', event => {
    const root = event.target;
    const details = root.matches?.('details') ? root : root.querySelector('details');
    if (details && selectedDisclosures.has(root)) { details.open = selectedDisclosures.get(root); selectedDisclosures.delete(root); }
  });
  document.addEventListener('shopify:section:deselect', () => theme.syncScrollLock());
})();
