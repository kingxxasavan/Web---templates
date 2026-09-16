/* ==========================================================================
   Vertex Launch — pricing toggle, reveals, nav, waitlist form.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Annual prices are stored on the markup as data attributes rather than
     computed here, so a plan can have a discount that is not a flat 20%. */
  function initPricing() {
    var toggle = $('[data-billing-toggle]');
    if (!toggle) return;

    function apply(period) {
      $$('[data-billing]').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-billing') === period));
      });

      $$('[data-price]').forEach(function (el) {
        var value = el.getAttribute(period === 'annual' ? 'data-price-annual' : 'data-price');
        el.textContent = value;
      });

      $$('[data-period-label]').forEach(function (el) {
        el.textContent = period === 'annual' ? '/mo, billed yearly' : '/month';
      });
    }

    toggle.addEventListener('click', function (event) {
      var button = event.target.closest('[data-billing]');
      if (button) apply(button.getAttribute('data-billing'));
    });

    apply('monthly');
  }

  function initReveals() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = Number(entry.target.getAttribute('data-reveal-delay') || 0);
        setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.05 });

    items.forEach(function (el) { observer.observe(el); });
  }

  function initNav() {
    var toggle = $('.nav-toggle');
    var nav = $('.nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
    // Close after following an in-page link, or the menu covers the target.
    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initForms() {
    $$('[data-waitlist]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var status = $('[data-status]', form);
        var email = form.elements.email.value.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          if (status) status.textContent = 'That email address does not look right.';
          return;
        }

        // Replace with a POST to your own endpoint, Formspree, or an ESP.
        if (status) status.textContent = form.getAttribute('data-success') || 'You are on the list. We will be in touch.';
        form.reset();
      });
    });
  }

  function init() {
    initPricing();
    initReveals();
    initNav();
    initForms();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
