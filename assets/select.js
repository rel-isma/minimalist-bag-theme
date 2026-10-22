/* Keep native values and change events for Shopify forms and existing controls. */
(() => {
  let nextId = 0;
  const controls = new Set();
  let opened;
  function enhance(select) {
    if (select.closest('.theme-select') || select.multiple || select.size > 1 || select.matches('.product-native-variant, [hidden]')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'theme-select';
    select.before(wrapper);
    wrapper.append(select);
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'form-input theme-select__trigger';
    trigger.id = `ThemeSelect-${++nextId}`;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    const value = document.createElement('span');
    value.id = `${trigger.id}-value`;
    trigger.append(value);
    const labels = [...select.labels || []];
    labels.forEach((label, index) => { if (!label.id) label.id = `${trigger.id}-label-${index}`; });
    if (labels.length) trigger.setAttribute('aria-labelledby', `${labels.map(label => label.id).join(' ')} ${value.id}`);
    else trigger.setAttribute('aria-label', select.getAttribute('aria-label') || select.name || 'Choose an option');
    labels.forEach(label => label.addEventListener('click', event => { event.preventDefault(); trigger.focus(); }));
    const menu = document.createElement('ul');
    menu.className = 'theme-select__menu';
    menu.id = `${trigger.id}-menu`;
    menu.role = 'listbox';
    menu.hidden = true;
    menu.setAttribute('aria-labelledby', labels.map(label => label.id).join(' ') || trigger.id);
    trigger.setAttribute('aria-controls', menu.id);
    wrapper.append(trigger, menu);
    const options = [...select.options].map((option, index) => {
      const item = document.createElement('li');
      item.className = 'theme-select__option'; item.role = 'option';
      item.id = `${trigger.id}-option-${index}`;
      item.textContent = option.label;
      item.addEventListener('mousedown', event => event.preventDefault());
      item.addEventListener('click', () => choose(index));
      menu.append(item);
      return item;
    });
    let active = select.selectedIndex;
    const enabled = index => index >= 0 && index < select.options.length && !select.options[index].disabled && !select.options[index].parentElement.disabled;
    function sync() {
      const label = select.selectedOptions[0]?.label || 'Choose an option';
      if (value.textContent !== label) value.textContent = label;
      trigger.disabled = select.disabled;
      options.forEach((item, index) => {
        item.setAttribute('aria-selected', String(index === select.selectedIndex));
        item.setAttribute('aria-disabled', String(!enabled(index)));
      });
    }
    function position() {
      const rect = trigger.getBoundingClientRect();
      const below = innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const height = Math.min(320, Math.max(below, above));
      menu.style.width = `${Math.min(rect.width, innerWidth - 24)}px`;
      menu.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - rect.width - 12))}px`;
      menu.style.maxHeight = `${Math.max(60, height)}px`;
      menu.style.top = below >= Math.min(menu.scrollHeight, 320) || below >= above ? `${rect.bottom + 6}px` : `${Math.max(6, rect.top - Math.min(menu.scrollHeight, height) - 6)}px`;
    }
    function highlight(index) {
      active = index;
      options.forEach((item, i) => item.classList.toggle('is-active', i === active));
      if (options[active]) { trigger.setAttribute('aria-activedescendant', options[active].id); options[active].scrollIntoView({ block: 'nearest' }); }
    }
    function close() {
      menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); trigger.removeAttribute('aria-activedescendant');
      if (opened === control) opened = null;
    }
    function open() {
      if (trigger.disabled) return;
      opened?.close(); sync(); menu.hidden = false; opened = control;
      trigger.setAttribute('aria-expanded', 'true'); position();
      highlight(enabled(select.selectedIndex) ? select.selectedIndex : [...select.options].findIndex((_, i) => enabled(i)));
    }
    function choose(index) {
      if (!enabled(index)) return;
      const changed = select.selectedIndex !== index;
      select.selectedIndex = index; sync(); close(); trigger.focus();
      if (changed) { select.dispatchEvent(new Event('input', { bubbles: true })); select.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    let search = '', timer;
    trigger.addEventListener('click', () => menu.hidden ? open() : close());
    trigger.addEventListener('keydown', event => {
      const key = event.key;
      if (key === 'Tab') { close(); return; }
      if (key === 'Escape' && !menu.hidden) { event.preventDefault(); event.stopPropagation(); close(); return; }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
        event.preventDefault(); if (menu.hidden) open();
        let index = key === 'Home' ? 0 : key === 'End' ? options.length - 1 : active + (key === 'ArrowDown' ? 1 : -1);
        const step = key === 'End' || key === 'ArrowUp' ? -1 : 1;
        while (index >= 0 && index < options.length && !enabled(index)) index += step;
        if (enabled(index)) highlight(index);
      } else if (key === 'Enter' || key === ' ') {
        event.preventDefault(); if (menu.hidden) open(); else choose(active);
      } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault(); clearTimeout(timer); search += key.toLowerCase(); timer = setTimeout(() => { search = ''; }, 600);
        if (menu.hidden) open();
        const index = [...select.options].findIndex((option, i) => enabled(i) && option.label.toLowerCase().startsWith(search));
        if (index >= 0) highlight(index);
      }
    });
    trigger.addEventListener('blur', close);
    select.addEventListener('change', sync);
    select.form?.addEventListener('reset', () => setTimeout(sync));
    const control = { select, wrapper, sync, close, position };
    controls.add(control);
    select.classList.add('theme-select__native');
    sync();
  }
  function init(scope = document) { scope.querySelectorAll('select.form-input').forEach(enhance); }
  document.addEventListener('click', event => {
    if (opened && !opened.wrapper.contains(event.target)) opened.close();
    // Review star filters also update their native select programmatically.
    queueMicrotask(() => controls.forEach(control => control.sync()));
  });
  window.addEventListener('resize', () => opened?.position());
  window.addEventListener('scroll', event => { if (opened && !event.target.closest?.('.theme-select__menu')) opened.close(); }, true);
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('shopify:section:load', event => init(event.target));
  document.addEventListener('shopify:section:unload', event => controls.forEach(control => { if (event.target.contains(control.wrapper)) { control.close(); controls.delete(control); } }));
})();
