/* ==========================================================================
   Monolith Portfolio — theme toggle, scroll reveals, nav, contact form.
   ========================================================================== */
(function () {
  'use strict';

  var THEME_KEY = 'monolith.theme';

  /* Theme is resolved before paint by the inline snippet in each <head>, so
     this only has to handle the click and persist the choice. */
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var button = document.querySelector('.theme-toggle');
    if (button) {
      button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      button.innerHTML = theme === 'dark'
        ? '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z" fill="currentColor"/></svg>'
        : '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><path d="M8 .8v2M8 13.2v2M.8 8h2M13.2 8h2M2.9 2.9l1.4 1.4M11.7 11.7l1.4 1.4M13.1 2.9l-1.4 1.4M4.3 11.7l-1.4 1.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
    }
    try { localStorage.setItem(THEME_KEY, theme); } catch (err) { /* private mode */ }
  }

  function initTheme() {
    applyTheme(currentTheme());
    var button = document.querySelector('.theme-toggle');
    if (!button) return;
    button.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  function initReveals() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Stagger siblings so a row of frames arrives in sequence.
        var delay = Number(entry.target.getAttribute('data-reveal-delay') || 0);
        setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

    items.forEach(function (el) { observer.observe(el); });
  }

  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
  }

  function initForm() {
    var form = document.querySelector('[data-contact]');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = form.querySelector('[data-status]');
      var email = form.elements.email.value.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        if (status) status.textContent = 'That email address does not look right.';
        return;
      }
      if (!form.elements.message.value.trim()) {
        if (status) status.textContent = 'Add a line or two about the project.';
        return;
      }

      // Point the form's action at Formspree, Netlify Forms or your own
      // endpoint — see README.md. Until then this just confirms locally.
      if (status) status.textContent = 'Thanks. I reply to everything within two days.';
      form.reset();
    });
  }

  function init() {
    initTheme();
    initReveals();
    initNav();
    initForm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
