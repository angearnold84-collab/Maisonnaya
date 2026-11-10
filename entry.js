(() => {
  const entry = document.querySelector('#entry-screen');
  const image = entry.querySelector('img');
  const primary = entry.querySelector('.entry-primary');
  const secondary = entry.querySelector('.entry-secondary');
  const pageParts = [...document.body.children].filter(element => element !== entry && !['SCRIPT'].includes(element.tagName));
  const params = new URLSearchParams(location.search);
  const path = location.pathname;
  const isHomePath = path.endsWith('/') || /\/index\.html$/i.test(path);
  const hasDirectDestination = !isHomePath || Boolean(location.hash) || Boolean(location.search);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storageKey = 'maison-naya-entry-seen';
  let dismissed = false;

  try { clearTimeout(window.__maisonNayaFailOpen); } catch {}

  function setPageInert(value) {
    pageParts.forEach(element => {
      element.inert = value;
      if (value) element.setAttribute('aria-hidden', 'true');
      else element.removeAttribute('aria-hidden');
    });
    document.body.classList.toggle('entry-open', value);
  }

  function revealPage(animate = true) {
    if (dismissed) return;
    dismissed = true;
    try { sessionStorage.setItem(storageKey, '1'); } catch {}
    document.documentElement.classList.remove('entry-pending');
    const finish = () => {
      entry.hidden = true;
      entry.classList.remove('is-leaving');
      setPageInert(false);
      const heading = document.querySelector('#hero-title');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    };
    if (!animate || reducedMotion) {
      finish();
    } else {
      entry.classList.add('is-leaving');
      window.setTimeout(finish, 820);
    }
  }

  let seenThisSession = false;
  try { seenThisSession = sessionStorage.getItem(storageKey) === '1'; } catch {}

  if (!hasDirectDestination && !seenThisSession && document.documentElement.classList.contains('entry-pending')) {
    try { sessionStorage.setItem(storageKey, '1'); } catch {}
    entry.hidden = false;
    setPageInert(true);
    window.requestAnimationFrame(() => primary.focus({ preventScroll: true }));
    if (image.complete && image.naturalWidth === 0) revealPage(false);
    image.addEventListener('error', () => revealPage(false), { once: true });
  } else {
    document.documentElement.classList.remove('entry-pending');
    entry.hidden = true;
    setPageInert(false);
    if (hasDirectDestination) {
      try { sessionStorage.setItem(storageKey, '1'); } catch {}
    }
  }

  primary.addEventListener('click', () => revealPage(true));
  secondary.addEventListener('click', () => revealPage(false));

  entry.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); revealPage(false); return; }
    if (event.key !== 'Tab') return;
    const focusable = [primary, secondary];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  let touchStartY = null;
  entry.addEventListener('touchstart', event => { touchStartY = event.changedTouches[0]?.clientY ?? null; }, { passive: true });
  entry.addEventListener('touchend', event => {
    const touchEndY = event.changedTouches[0]?.clientY;
    if (touchStartY !== null && touchEndY !== undefined && touchStartY - touchEndY > 48) revealPage(true);
    touchStartY = null;
  }, { passive: true });
  entry.addEventListener('wheel', event => { if (event.deltaY > 28) revealPage(true); }, { passive: true });

  const productDialog = document.querySelector('#product-dialog');
  const cartDrawer = document.querySelector('#cart-drawer');
  const selection = document.querySelector('#selection');
  function updateDestination(key, value) {
    const next = new URL(location.href);
    if (value) next.searchParams.set(key, value); else next.searchParams.delete(key);
    history.replaceState(null, '', next);
  }
  function clearDestination(key) { updateDestination(key, null); }

  document.addEventListener('click', event => {
    const product = event.target.closest('[data-view]');
    const category = event.target.closest('.filter-chip');
    if (product) updateDestination('product', product.dataset.view);
    if (category) {
      updateDestination('category', category.dataset.category === 'all' ? null : category.dataset.category);
      selection.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' });
    }
    if (event.target.closest('.cart-open')) updateDestination('cart', '1');
    if (event.target.closest('.drawer-close, .continue-shopping, .checkout') || event.target.id === 'overlay') clearDestination('cart');
  });
  productDialog.addEventListener('close', () => clearDestination('product'));

  if (params.has('category')) {
    const categoryButton = document.querySelector(`.filter-chip[data-category="${params.get('category')}"]`);
    if (categoryButton) { categoryButton.click(); selection.scrollIntoView({ block: 'start', behavior: 'instant' }); }
  }
  if (params.has('product')) {
    const productId = params.get('product');
    if (/^[a-z0-9-]+$/i.test(productId)) document.querySelector(`[data-view="${productId}"]`)?.click();
  }
  if (params.get('cart') === '1') document.querySelector('.cart-open').click();
})();
