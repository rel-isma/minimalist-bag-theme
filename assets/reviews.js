/* Sorting and filtering use the same real records as the server-rendered summary. */
(() => {
  const initialized = new WeakSet();
  function init(scope = document) {
    scope.querySelectorAll('[data-reviews]').forEach(root => {
      if (initialized.has(root) || !root.querySelector('[data-review-list]')) return;
      initialized.add(root);
      const list = root.querySelector('[data-review-list]');
      const records = [...list.querySelectorAll('[data-review]')].map((node, index) => ({ node, index, rating: Number(node.dataset.rating), date: /^\d{4}-\d{2}-\d{2}$/.test(node.dataset.date) ? Date.parse(node.dataset.date) || 0 : 0 }));
      const rating = root.querySelector('[data-review-rating]');
      const sort = root.querySelector('[data-review-sort]');
      root.querySelector('[data-review-controls]').hidden = false;
      root.querySelectorAll('[data-review-stars]').forEach(button => { button.disabled = false; });
      function update() {
        const selected = rating.value;
        const sorted = [...records].sort((a, b) => {
          if (sort.value === 'highest') return b.rating - a.rating || b.date - a.date || a.index - b.index;
          if (sort.value === 'lowest') return a.rating - b.rating || b.date - a.date || a.index - b.index;
          return (sort.value === 'oldest' ? a.date - b.date : b.date - a.date) || a.index - b.index;
        });
        sorted.forEach(record => { record.node.hidden = selected !== 'all' && record.rating !== Number(selected);list.append(record.node); });
        const visible = sorted.filter(record => !record.node.hidden).length;
        root.querySelector('[data-review-count]').textContent = `${visible} of ${records.length} reviews`;
        root.querySelector('[data-review-empty]').hidden = visible > 0;
        root.querySelectorAll('[data-review-stars]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.reviewStars === selected)));
      }
      rating.addEventListener('change', update);sort.addEventListener('change', update);
      root.querySelector('[data-review-clear]').addEventListener('click', () => { rating.value = 'all';update(); });
      root.querySelectorAll('[data-review-stars]').forEach(button => button.addEventListener('click', () => { rating.value = button.dataset.reviewStars;update(); }));
      update();
    });
  }
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('shopify:section:load', event => init(event.target));
})();
