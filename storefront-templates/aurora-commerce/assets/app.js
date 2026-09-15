/* ==========================================================================
   Aurora Commerce — catalogue, filtering and cart.
   No dependencies, no build step. Edit PRODUCTS to change the shop.
   ========================================================================== */
(function () {
  'use strict';

  // ---------------------------------------------------------------- data
  // Replace this array with your own products. `art` picks one of the
  // generated illustrations in makeArt() — swap those for <img> tags when you
  // have real photography.
  var PRODUCTS = [
    { id: 'cw-01', name: 'Stoneware mug, 300ml', price: 2800, category: 'Ceramics', badge: 'New', art: ['#e8ddd0', '#c9b9a6', 'vessel'] },
    { id: 'cw-02', name: 'Serving bowl, wide', price: 5400, category: 'Ceramics', art: ['#dfe6e2', '#b6c6bd', 'bowl'] },
    { id: 'tx-01', name: 'Linen tea towel, pair', price: 2200, category: 'Textiles', art: ['#e7e3f3', '#c3bce0', 'fold'] },
    { id: 'tx-02', name: 'Washed throw, 130×180', price: 8900, category: 'Textiles', badge: 'Low stock', art: ['#f3e5e5', '#dcbcbc', 'fold'] },
    { id: 'wd-01', name: 'Olive wood board', price: 4200, category: 'Kitchen', art: ['#efe6d5', '#cbb68d', 'board'] },
    { id: 'wd-02', name: 'Spoon set, three', price: 3100, category: 'Kitchen', art: ['#eee8de', '#c8b79c', 'spoon'] },
    { id: 'cw-03', name: 'Tumbler, set of four', price: 6400, category: 'Ceramics', art: ['#e3ebf1', '#b3c6d6', 'vessel'] },
    { id: 'tx-03', name: 'Cotton apron', price: 3600, category: 'Textiles', art: ['#e6ece5', '#bcd0ba', 'fold'] },
    { id: 'wd-03', name: 'Trivet, round', price: 2600, category: 'Kitchen', art: ['#f0ebe2', '#d2c3a8', 'board'] },
  ];

  var FREE_SHIPPING_OVER = 7500;

  // ------------------------------------------------------------- helpers
  var money = function (cents) { return '£' + (cents / 100).toFixed(2); };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Procedural product illustrations. Four shapes, tinted per product — they
     read as a coherent catalogue until you drop in real photography. */
  function makeArt(product, seedOffset) {
    var base = product.art[0];
    var tone = product.art[1];
    var shape = product.art[2];
    var shift = (seedOffset || 0) * 6;
    var body = {
      vessel: '<rect x="' + (66 + shift) + '" y="74" width="68" height="84" rx="10" fill="' + tone + '"/>' +
              '<path d="M134 96h14a14 14 0 0 1 0 28h-14z" fill="none" stroke="' + tone + '" stroke-width="7"/>' +
              '<rect x="' + (66 + shift) + '" y="74" width="68" height="14" rx="7" fill="rgba(255,255,255,.45)"/>',
      bowl:   '<path d="M52 92h96a48 48 0 0 1-96 0z" fill="' + tone + '"/>' +
              '<ellipse cx="100" cy="92" rx="48" ry="11" fill="rgba(255,255,255,.5)"/>' +
              '<rect x="86" y="140" width="28" height="7" rx="3.5" fill="' + tone + '" opacity=".6"/>',
      fold:   '<path d="M56 68h88v104l-22-14-22 14-22-14-22 14z" fill="' + tone + '"/>' +
              '<path d="M56 96h88M56 120h88" stroke="rgba(255,255,255,.5)" stroke-width="5"/>',
      board:  '<rect x="48" y="70" width="104" height="82" rx="12" fill="' + tone + '"/>' +
              '<circle cx="138" cy="84" r="6" fill="rgba(255,255,255,.6)"/>' +
              '<path d="M48 126h104" stroke="rgba(255,255,255,.35)" stroke-width="4"/>',
      spoon:  '<g fill="' + tone + '">' +
              '<ellipse cx="74" cy="82" rx="15" ry="20"/><rect x="70" y="98" width="8" height="62" rx="4"/>' +
              '<ellipse cx="100" cy="76" rx="15" ry="20"/><rect x="96" y="92" width="8" height="68" rx="4"/>' +
              '<ellipse cx="126" cy="82" rx="15" ry="20"/><rect x="122" y="98" width="8" height="62" rx="4"/></g>',
    }[shape] || '';

    return (
      '<svg viewBox="0 0 200 200" role="img" aria-label="' + escapeHtml(product.name) + '">' +
      '<rect width="200" height="200" fill="' + base + '"/>' +
      '<circle cx="' + (150 - shift) + '" cy="52" r="30" fill="rgba(255,255,255,.4)"/>' +
      body +
      '</svg>'
    );
  }

  // ---------------------------------------------------------------- cart
  var STORAGE_KEY = 'aurora.cart.v1';

  function loadCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(function (l) { return findProduct(l.id); }) : [];
    } catch (err) {
      return [];
    }
  }

  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (err) { /* private mode */ }
  }

  var cart = [];

  function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }

  function cartCount() {
    return cart.reduce(function (n, line) { return n + line.qty; }, 0);
  }

  function cartSubtotal() {
    return cart.reduce(function (n, line) {
      var product = findProduct(line.id);
      return n + (product ? product.price * line.qty : 0);
    }, 0);
  }

  function addToCart(id, qty) {
    var existing = cart.filter(function (l) { return l.id === id; })[0];
    if (existing) existing.qty += qty || 1;
    else cart.push({ id: id, qty: qty || 1 });
    saveCart();
    renderCart();
    openDrawer();
  }

  function setQty(id, qty) {
    cart = cart
      .map(function (line) { return line.id === id ? { id: id, qty: Math.max(0, qty) } : line; })
      .filter(function (line) { return line.qty > 0; });
    saveCart();
    renderCart();
  }

  // -------------------------------------------------------------- render
  function renderProducts(filter) {
    var grid = $('[data-products]');
    if (!grid) return;

    var visible = PRODUCTS.filter(function (p) { return !filter || filter === 'All' || p.category === filter; });

    if (!visible.length) {
      grid.innerHTML = '<p class="empty">Nothing in this category yet.</p>';
      return;
    }

    grid.innerHTML = visible.map(function (product, index) {
      return (
        '<article class="product" data-reveal>' +
        '<div class="product__media">' +
        (product.badge ? '<span class="product__badge">' + escapeHtml(product.badge) + '</span>' : '') +
        makeArt(product, index) +
        '<button class="btn btn--accent btn--sm product__add" data-add="' + product.id + '">Add to cart</button>' +
        '</div>' +
        '<a class="product__name" href="product.html?id=' + encodeURIComponent(product.id) + '">' + escapeHtml(product.name) + '</a>' +
        '<div class="product__meta">' +
        '<span class="product__cat">' + escapeHtml(product.category) + '</span>' +
        '<span class="product__price">' + money(product.price) + '</span>' +
        '</div>' +
        '</article>'
      );
    }).join('');

    observeReveals();
  }

  function renderCart() {
    var count = cartCount();
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });

    var body = $('[data-cart-body]');
    if (!body) return;

    if (!cart.length) {
      body.innerHTML = '<p class="muted small" style="padding:32px 0;text-align:center">Your cart is empty.</p>';
    } else {
      body.innerHTML = cart.map(function (line) {
        var product = findProduct(line.id);
        return (
          '<div class="line">' +
          '<div class="line__media">' + makeArt(product, 0) + '</div>' +
          '<div>' +
          '<div class="line__name">' + escapeHtml(product.name) + '</div>' +
          '<div class="line__price">' + money(product.price) + '</div>' +
          '<div class="qty">' +
          '<button type="button" data-dec="' + product.id + '" aria-label="Decrease quantity">−</button>' +
          '<output>' + line.qty + '</output>' +
          '<button type="button" data-inc="' + product.id + '" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
          '<div class="line__price" style="color:var(--ink);font-weight:600">' + money(product.price * line.qty) + '</div>' +
          '<button class="line__remove" type="button" data-remove="' + product.id + '">Remove</button>' +
          '</div>' +
          '</div>'
        );
      }).join('');
    }

    var subtotal = cartSubtotal();
    var shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : 495;
    var totals = $('[data-cart-totals]');
    if (totals) {
      totals.innerHTML =
        '<div><span>Subtotal</span><span>' + money(subtotal) + '</span></div>' +
        '<div><span>Shipping</span><span>' + (shipping ? money(shipping) : 'Free') + '</span></div>' +
        (subtotal > 0 && shipping
          ? '<div class="tiny muted"><span>Free over ' + money(FREE_SHIPPING_OVER) + '</span><span>' + money(FREE_SHIPPING_OVER - subtotal) + ' to go</span></div>'
          : '') +
        '<div class="grand"><span>Total</span><span>' + money(subtotal + shipping) + '</span></div>';
    }

    var checkout = $('[data-checkout]');
    if (checkout) checkout.disabled = cart.length === 0;
  }

  // -------------------------------------------------------------- drawer
  function openDrawer() { setDrawer(true); }
  function closeDrawer() { setDrawer(false); }

  function setDrawer(open) {
    var drawer = $('[data-drawer]');
    var backdrop = $('[data-drawer-backdrop]');
    if (!drawer) return;
    drawer.setAttribute('data-open', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    if (backdrop) backdrop.setAttribute('data-open', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var close = $('.drawer__close', drawer);
      if (close) close.focus();
    }
  }

  // -------------------------------------------------------------- reveal
  var revealObserver = null;
  function observeReveals() {
    if (!('IntersectionObserver' in window)) {
      $$('[data-reveal]').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -40px 0px' });
    }
    $$('[data-reveal]:not(.is-visible)').forEach(function (el) { revealObserver.observe(el); });
  }

  // ---------------------------------------------------------------- init
  function init() {
    cart = loadCart();

    renderProducts(null);
    renderCart();
    renderProductPage();

    // One delegated listener covers every add/qty/remove button, including the
    // ones rendered after this runs.
    document.addEventListener('click', function (event) {
      var target = event.target.closest('[data-add],[data-inc],[data-dec],[data-remove],[data-open-cart],[data-close-cart]');
      if (!target) return;

      if (target.hasAttribute('data-add')) { addToCart(target.getAttribute('data-add'), 1); return; }
      if (target.hasAttribute('data-open-cart')) { openDrawer(); return; }
      if (target.hasAttribute('data-close-cart')) { closeDrawer(); return; }

      var id = target.getAttribute('data-inc') || target.getAttribute('data-dec') || target.getAttribute('data-remove');
      var line = cart.filter(function (l) { return l.id === id; })[0];
      if (!line) return;

      if (target.hasAttribute('data-inc')) setQty(id, line.qty + 1);
      else if (target.hasAttribute('data-dec')) setQty(id, line.qty - 1);
      else setQty(id, 0);
    });

    $$('[data-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        button.setAttribute('aria-pressed', 'true');
        renderProducts(button.getAttribute('data-filter'));
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeDrawer();
    });

    var menuToggle = $('.menu-toggle');
    var menu = $('.menu');
    if (menuToggle && menu) {
      menuToggle.addEventListener('click', function () {
        var open = menu.getAttribute('data-open') === 'true';
        menu.setAttribute('data-open', String(!open));
        menuToggle.setAttribute('aria-expanded', String(!open));
      });
    }

    var checkout = $('[data-checkout]');
    if (checkout) {
      checkout.addEventListener('click', function () {
        // Wire this to your own /api/checkout endpoint — see the "Taking
        // payments from a template" tutorial. Card details must never be
        // handled in front-end code.
        alert('Checkout is not wired up yet.\n\nSee README.md for the ~40 lines of\nStripe server code that completes this.');
      });
    }

    $$('[data-signup]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var status = $('[data-status]', form);
        var email = form.elements.email.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          if (status) status.textContent = 'That email address does not look right.';
          return;
        }
        // Point this at Formspree, Netlify Forms, or your own endpoint.
        if (status) status.textContent = form.getAttribute('data-success') || 'Thanks — you are on the list.';
        form.reset();
      });
    });

    observeReveals();
  }

  // --------------------------------------------------------- product page
  function renderProductPage() {
    var root = $('[data-product-page]');
    if (!root) return;

    var id = new URLSearchParams(window.location.search).get('id');
    var product = findProduct(id) || PRODUCTS[0];

    $('[data-pdp-name]').textContent = product.name;
    $('[data-pdp-price]').textContent = money(product.price);
    $('[data-pdp-category]').textContent = product.category;
    $('[data-pdp-main]').innerHTML = makeArt(product, 0);
    document.title = product.name + ' — Aurora';

    var thumbs = $('[data-pdp-thumbs]');
    if (thumbs) {
      thumbs.innerHTML = [0, 1, 2, 3].map(function (i) {
        return '<button class="pdp__thumb" type="button" aria-pressed="' + (i === 0) + '" data-variant="' + i + '"' +
               ' aria-label="View ' + escapeHtml(product.name) + ', image ' + (i + 1) + '">' + makeArt(product, i) + '</button>';
      }).join('');

      thumbs.addEventListener('click', function (event) {
        var button = event.target.closest('[data-variant]');
        if (!button) return;
        $$('[data-variant]', thumbs).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        button.setAttribute('aria-pressed', 'true');
        $('[data-pdp-main]').innerHTML = makeArt(product, Number(button.getAttribute('data-variant')));
      });
    }

    var addButton = $('[data-pdp-add]');
    if (addButton) {
      addButton.addEventListener('click', function () {
        addToCart(product.id, Number($('[data-pdp-qty]').value) || 1);
      });
    }

    $$('.swatch').forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        $$('.swatch').forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
        swatch.setAttribute('aria-pressed', 'true');
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
