/* ==========================================================================
   Atelier Lookbook — horizontal rail with drag, keyboard and buttons.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* The rail is a native overflow-x container with scroll snapping, so
     touch, trackpad and screen readers all work before any of this runs.
     Drag, the arrow buttons and keyboard support are added on top — never
     as a replacement, which is where most carousels go wrong. */
  function initRail() {
    var rail = $('[data-rail]');
    if (!rail) return;

    var prev = $('[data-rail-prev]');
    var next = $('[data-rail-next]');
    var progress = $('[data-rail-progress] span');

    function step() {
      var first = rail.querySelector('.look');
      if (!first) return rail.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap || 20);
      return first.getBoundingClientRect().width + gap;
    }

    function update() {
      var max = rail.scrollWidth - rail.clientWidth;
      if (prev) prev.disabled = rail.scrollLeft <= 1;
      if (next) next.disabled = rail.scrollLeft >= max - 1;

      if (progress) {
        var visible = max > 0 ? rail.clientWidth / rail.scrollWidth : 1;
        var ratio = max > 0 ? rail.scrollLeft / max : 0;
        progress.style.width = (visible * 100).toFixed(2) + '%';
        progress.style.transform = 'translateX(' + (ratio * (100 / visible - 100)).toFixed(2) + '%)';
      }
    }

    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: 'smooth' }); });

    rail.addEventListener('scroll', function () {
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);

    // Keyboard: the rail is focusable, so arrow keys move it.
    rail.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); rail.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); rail.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });

    // Pointer drag. Snapping is disabled mid-drag or the rail fights the
    // pointer, then restored when the drag ends.
    var dragging = false;
    var startX = 0;
    var startScroll = 0;
    var moved = 0;

    rail.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'touch') return; // native touch scrolling is better
      dragging = true;
      moved = 0;
      startX = event.clientX;
      startScroll = rail.scrollLeft;
      rail.setAttribute('data-dragging', 'true');
      rail.setPointerCapture(event.pointerId);
    });

    rail.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      var delta = event.clientX - startX;
      moved = Math.abs(delta);
      rail.scrollLeft = startScroll - delta;
    });

    function endDrag(event) {
      if (!dragging) return;
      dragging = false;
      rail.removeAttribute('data-dragging');
      if (rail.hasPointerCapture && rail.hasPointerCapture(event.pointerId)) {
        rail.releasePointerCapture(event.pointerId);
      }
    }

    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);

    // A drag that ends over a link must not also follow it.
    rail.addEventListener('click', function (event) {
      if (moved > 6) { event.preventDefault(); event.stopPropagation(); }
      moved = 0;
    }, true);

    update();
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
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });
    items.forEach(function (el) { observer.observe(el); });
  }

  function initMenu() {
    var toggle = $('.menu-toggle');
    var menu = $('.menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var open = menu.getAttribute('data-open') === 'true';
      menu.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
  }

  function initSignup() {
    $$('[data-signup]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var status = $('[data-status]', form);
        var email = form.elements.email.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          if (status) status.textContent = 'That email address does not look right.';
          return;
        }
        if (status) status.textContent = 'Thank you — you will hear from us before the next drop.';
        form.reset();
      });
    });
  }

  function init() {
    initRail();
    initReveals();
    initMenu();
    initSignup();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
