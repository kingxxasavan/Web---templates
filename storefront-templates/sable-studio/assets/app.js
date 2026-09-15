/* ==========================================================================
   Sable Studio — nav, scroll reveals, contact form validation.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function initNav() {
    var toggle = $('.nav-toggle');
    var nav = $('.nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
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
    }, { rootMargin: '0px 0px -50px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  function initContact() {
    var form = $('[data-contact]');
    if (!form) return;

    function setError(field, message) {
      var errorEl = field.closest('.field') ? field.closest('.field').querySelector('.field-error') : null;
      if (errorEl) errorEl.textContent = message || '';
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      return !message;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = $('[data-status]', form);
      if (status) status.textContent = '';

      var ok = true;
      ok = setError(form.elements.name, form.elements.name.value.trim() ? '' : 'Who should we reply to?') && ok;
      ok = setError(form.elements.email,
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.elements.email.value.trim()) ? '' : 'Check this email address.') && ok;
      ok = setError(form.elements.message,
        form.elements.message.value.trim().length >= 20
          ? ''
          : 'A couple of sentences about the project helps us reply usefully.') && ok;

      if (!ok) {
        if (status) status.textContent = 'Have a look at the fields marked above.';
        // Move focus to the first problem so keyboard users are not stranded.
        var firstBad = $('[aria-invalid="true"]', form);
        if (firstBad) firstBad.focus();
        return;
      }

      // Point the form's action at your endpoint — see README.md.
      if (status) status.textContent = 'Thanks. We reply to every enquiry within one working day.';
      form.reset();
      $$('[aria-invalid]', form).forEach(function (f) { f.setAttribute('aria-invalid', 'false'); });
    });
  }

  function init() {
    initNav();
    initReveals();
    initContact();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
