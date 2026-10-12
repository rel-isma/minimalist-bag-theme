/**
 * MINIMALIST ATELIER - THEME CORE SCRIPT
 * Vanilla JS • Zero Dependencies
 */

(function () {
  'use strict';

  // 1. Header Scroll State
  function initHeaderScroll() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    const isTransparentHeader = header.classList.contains('is-transparent');

    function updateHeader() {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 40) {
        header.classList.add('is-scrolled');
        if (isTransparentHeader) {
          header.classList.remove('is-transparent');
        }
      } else {
        header.classList.remove('is-scrolled');
        if (isTransparentHeader && !document.body.classList.contains('menu-open')) {
          header.classList.add('is-transparent');
        }
      }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // 2. Mobile Navigation Drawer
  function initMobileMenu() {
    const toggleBtn = document.querySelector('[data-mobile-menu-toggle]');
    const drawer = document.querySelector('[data-mobile-nav-drawer]');
    const closeBtn = document.querySelector('[data-mobile-menu-close]');
    if (!toggleBtn || !drawer) return;

    function openMenu() {
      drawer.classList.add('is-active');
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeMenu() {
      drawer.classList.remove('is-active');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // ESC key listener
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-active')) {
        closeMenu();
      }
    });

    // Close on link click
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // 3. Subtle Fade-up on Scroll
  function initFadeUpObserver() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.fade-up').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );

    document.querySelectorAll('.fade-up').forEach(function (el) {
      observer.observe(el);
    });
  }

  // 4. Cart Trigger Listener
  function initCartTriggers() {
    document.querySelectorAll('[data-cart-drawer-trigger]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('cart:open'));
      });
    });
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initMobileMenu();
    initFadeUpObserver();
    initCartTriggers();
  });
})();
