(function () {
  var STORAGE_KEY = 'promoDrawerOpen';
  var drawer = document.getElementById('promo-drawer');
  var toggle = document.getElementById('drawer-toggle');

  if (!drawer || !toggle) return;

  function applyState(open, animate) {
    if (!animate) {
      drawer.classList.add('drawer--no-transition');
    }
    if (open) {
      drawer.setAttribute('data-open', 'true');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close promo panel');
      toggle.textContent = '<';
    } else {
      drawer.removeAttribute('data-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open promo panel');
      toggle.textContent = '>';
    }
    if (!animate) {
      drawer.getBoundingClientRect();
      drawer.classList.remove('drawer--no-transition');
    }
  }

  var isOpen = localStorage.getItem(STORAGE_KEY) === 'true';
  applyState(isOpen, false);

  toggle.addEventListener('click', function () {
    isOpen = !isOpen;
    localStorage.setItem(STORAGE_KEY, isOpen ? 'true' : 'false');
    applyState(isOpen, true);
    if (!isOpen) {
      toggle.focus();
    }
  });
}());
