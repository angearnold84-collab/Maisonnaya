const WHATSAPP = '2250504552364';
const products = [
  { id: 'ligne-doree', name: 'Ligne dorée', category: 'bagues', categoryLabel: 'Bague', price: 12500, image: 'assets/ligne-doree.jpg', description: 'Un bijou fantaisie à la finition dorée, délicat au quotidien.', badge: 'LA SÉLECTION' },
  { id: 'anneau-naya', name: 'Anneau Naya', category: 'bagues', categoryLabel: 'Bague', price: 14500, image: 'assets/anneau-naya.jpg', description: 'Une silhouette épurée qui se porte seule ou en accumulation.' },
  { id: 'collier-sillage', name: 'Sillage doré', category: 'colliers', categoryLabel: 'Collier', price: 18500, image: 'assets/collier.jpg', description: 'Un collier fin et lumineux, pensé pour accompagner vos tenues préférées.', badge: 'NOUVEAUTÉ' },
  { id: 'collier-precieux', name: 'Éclat précieux', category: 'colliers', categoryLabel: 'Collier', price: 22000, image: 'assets/parure.jpg', description: 'Un pendentif délicat pour ajouter une note de lumière.' },
  { id: 'boucles-lumiere', name: 'Lumière', category: 'boucles', categoryLabel: 'Boucles d’oreilles', price: 15000, image: 'assets/boucles.jpg', description: 'Des boucles d’oreilles dorées au dessin élégant et facile à porter.' },
  { id: 'bracelet-doux', name: 'Doux éclat', category: 'bracelets', categoryLabel: 'Bracelet', price: 17500, image: 'assets/bracelet.jpg', description: 'Une ligne dorée subtile pour habiller le poignet.' }
];

const money = amount => `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`;
const grid = document.querySelector('#product-grid');
const resultNote = document.querySelector('#results-note');
let activeCategory = 'all';
let cart = JSON.parse(localStorage.getItem('maison-naya-cart') || '{}');

function renderProducts() {
  const sort = document.querySelector('#sort').value;
  let visible = products.filter(product => activeCategory === 'all' || product.category === activeCategory);
  if (sort === 'low') visible.sort((a, b) => a.price - b.price);
  if (sort === 'high') visible.sort((a, b) => b.price - a.price);
  resultNote.textContent = `${visible.length} ${visible.length > 1 ? 'créations' : 'création'}`;
  grid.innerHTML = visible.map(product => `
    <article class="catalog-card">
      <button class="catalog-image" type="button" data-view="${product.id}" aria-label="Voir ${product.name}">
        <img loading="lazy" src="${product.image}" alt="${product.categoryLabel} ${product.name}" width="900" height="1100">
        ${product.badge ? `<span class="catalog-badge">${product.badge}</span>` : ''}
        <span class="quick-view">Voir le détail</span>
      </button>
      <div class="catalog-meta"><div><p class="catalog-category">${product.categoryLabel}</p><h3>${product.name}</h3></div><p class="catalog-price">${money(product.price)}</p></div>
      <div class="card-actions"><button class="add-cart" type="button" data-add="${product.id}">Ajouter au panier</button><button class="details-link" type="button" data-view="${product.id}">Détail</button></div>
    </article>`).join('');
}

function saveCart() { localStorage.setItem('maison-naya-cart', JSON.stringify(cart)); renderCart(); }
function countItems() { return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0); }
function renderCart() {
  const count = countItems();
  document.querySelector('.cart-count').textContent = count;
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  document.querySelector('#cart-empty').hidden = entries.length > 0;
  document.querySelector('#cart-footer').hidden = entries.length === 0;
  document.querySelector('#cart-items').innerHTML = entries.map(([id, quantity]) => {
    const product = products.find(item => item.id === id);
    if (!product) return '';
    return `<div class="cart-row"><img src="${product.image}" alt=""><div><h3>${product.name}</h3><p>${money(product.price)}</p><div class="quantity"><button type="button" data-quantity="${id}" data-change="-1" aria-label="Retirer une unité de ${product.name}">−</button><span>${quantity}</span><button type="button" data-quantity="${id}" data-change="1" aria-label="Ajouter une unité de ${product.name}">+</button><button class="remove-item" type="button" data-remove="${id}">Retirer</button></div></div><strong class="row-total">${money(product.price * quantity)}</strong></div>`;
  }).join('');
  const total = entries.reduce((sum, [id, quantity]) => sum + products.find(product => product.id === id).price * quantity, 0);
  document.querySelector('#cart-total').textContent = money(total);
}

function notify(message) {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.append(toast); }
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(notify.timeout); notify.timeout = setTimeout(() => toast.classList.remove('show'), 2100);
}

const drawer = document.querySelector('#cart-drawer');
const overlay = document.querySelector('#overlay');
function openCart() { drawer.hidden = false; overlay.hidden = false; document.body.classList.add('locked'); document.querySelector('.drawer-close').focus(); }
function closeCart() { drawer.hidden = true; overlay.hidden = true; document.body.classList.remove('locked'); document.querySelector('.cart-open').focus(); }
function addToCart(id) { cart[id] = (cart[id] || 0) + 1; saveCart(); notify('Ajouté à votre sélection'); }

document.querySelector('.menu-toggle').addEventListener('click', event => {
  const button = event.currentTarget; const isOpen = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!isOpen)); button.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
  document.querySelector('#mobile-menu').hidden = isOpen;
});
document.querySelectorAll('#mobile-menu a').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#mobile-menu').hidden = true;
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('.filter-chip').forEach(button => button.addEventListener('click', () => {
  activeCategory = button.dataset.category;
  document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.toggle('active', chip === button));
  renderProducts();
}));
document.querySelector('#sort').addEventListener('change', renderProducts);
document.querySelector('.cart-open').addEventListener('click', openCart);
document.querySelector('.drawer-close').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.querySelector('.continue-shopping').addEventListener('click', closeCart);

grid.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  const view = event.target.closest('[data-view]');
  if (add) addToCart(add.dataset.add);
  if (view) {
    const product = products.find(item => item.id === view.dataset.view);
    document.querySelector('.dialog-content').innerHTML = `<img src="${product.image}" alt="${product.categoryLabel} ${product.name}"><div class="dialog-info"><p class="catalog-category">${product.categoryLabel}</p><h2>${product.name}</h2><p class="dialog-price">${money(product.price)}</p><p>${product.description}</p><p>Création de démonstration. Disponibilité à confirmer.</p><button class="add-cart" type="button" data-dialog-add="${product.id}">Ajouter au panier</button></div>`;
    document.querySelector('#product-dialog').showModal();
  }
});
document.querySelector('.dialog-close').addEventListener('click', () => document.querySelector('#product-dialog').close());
document.querySelector('.product-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
document.querySelector('.product-dialog').addEventListener('click', event => {
  const button = event.target.closest('[data-dialog-add]');
  if (button) { addToCart(button.dataset.dialogAdd); document.querySelector('#product-dialog').close(); }
});
drawer.addEventListener('click', event => {
  const quantity = event.target.closest('[data-quantity]');
  const remove = event.target.closest('[data-remove]');
  if (quantity) { const id = quantity.dataset.quantity; cart[id] = Math.max(0, (cart[id] || 0) + Number(quantity.dataset.change)); if (!cart[id]) delete cart[id]; saveCart(); }
  if (remove) { delete cart[remove.dataset.remove]; saveCart(); }
});
document.querySelector('.checkout').addEventListener('click', () => {
  const rows = Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([id, quantity]) => { const product = products.find(item => item.id === id); return `• ${product.name} × ${quantity} — ${money(product.price * quantity)}`; });
  const total = Object.entries(cart).reduce((sum, [id, quantity]) => sum + products.find(item => item.id === id).price * quantity, 0);
  const message = `Bonjour Maison Naya, je souhaite me renseigner sur cette sélection :\n${rows.join('\n')}\nSous-total estimé : ${money(total)}\nMerci de me confirmer la disponibilité et les modalités.`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault(); const data = new FormData(event.currentTarget);
  const message = `Bonjour Maison Naya, je m'appelle ${data.get('name')} (${data.get('phone')}). ${data.get('message')}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !drawer.hidden) closeCart(); });

renderProducts(); renderCart();
