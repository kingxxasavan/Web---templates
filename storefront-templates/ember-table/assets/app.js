/* ==========================================================================
   Ember Table — menu tabs, opening hours, reservation validation.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var money = function (pence) { return '£' + (pence / 100).toFixed(2).replace(/\.00$/, ''); };

  var HOURS = [
    { day: 'Monday', open: null, close: null, text: 'Closed' },
    { day: 'Tuesday', open: 17.5, close: 22, text: '5.30pm – 10pm' },
    { day: 'Wednesday', open: 17.5, close: 22, text: '5.30pm – 10pm' },
    { day: 'Thursday', open: 17.5, close: 22, text: '5.30pm – 10pm' },
    { day: 'Friday', open: 12, close: 23, text: '12pm – 11pm' },
    { day: 'Saturday', open: 12, close: 23, text: '12pm – 11pm' },
    { day: 'Sunday', open: 12, close: 20, text: '12pm – 8pm' },
  ];

  // ------------------------------------------------------------ menu
  function renderMenu(key) {
    var container = $('[data-dishes]');
    var noteEl = $('[data-menu-note]');
    if (!container || !window.EMBER_MENU) return;

    var section = window.EMBER_MENU[key];
    if (!section) return;

    container.innerHTML = section.dishes.map(function (dish) {
      var tags = (dish.tags || []).map(function (tag) {
        var veg = tag === 'v' || tag === 'vg';
        var label = tag === 'v' ? 'Vegetarian' : tag === 'vg' ? 'Vegan' : tag;
        return '<span class="dish__tag' + (veg ? ' dish__tag--v' : '') + '">' + label + '</span>';
      }).join('');

      return (
        '<div class="dish">' +
        '<div class="dish__top">' +
        '<span class="dish__name">' + dish.name + '</span>' +
        '<span class="dish__dots" aria-hidden="true"></span>' +
        '<span class="dish__price">' + money(dish.price) + '</span>' +
        '</div>' +
        (dish.desc ? '<p class="dish__desc">' + dish.desc + '</p>' : '') +
        (tags ? '<div class="dish__tags">' + tags + '</div>' : '') +
        '</div>'
      );
    }).join('');

    if (noteEl) {
      noteEl.textContent = section.note || '';
      noteEl.hidden = !section.note;
    }
  }

  function initMenu() {
    var tabs = $$('[data-menu-tab]');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
        tab.setAttribute('aria-selected', 'true');
        renderMenu(tab.getAttribute('data-menu-tab'));
      });
    });

    var initial = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
    initial.setAttribute('aria-selected', 'true');
    renderMenu(initial.getAttribute('data-menu-tab'));
  }

  // ----------------------------------------------------------- hours
  function initHours() {
    // getDay() is 0-indexed from Sunday; HOURS starts on Monday.
    var todayIndex = (new Date().getDay() + 6) % 7;
    var today = HOURS[todayIndex];

    var table = $('[data-hours]');
    if (table) {
      table.innerHTML = HOURS.map(function (row, index) {
        return '<tr' + (index === todayIndex ? ' data-today' : '') + '>' +
               '<td>' + row.day + (index === todayIndex ? ' <span class="tiny">(today)</span>' : '') + '</td>' +
               '<td>' + row.text + '</td></tr>';
      }).join('');
    }

    // The open/closed banner appears in the footer of every page, so update
    // all of them, not just the first.
    var now = new Date();
    var hour = now.getHours() + now.getMinutes() / 60;
    var open = today.open !== null && hour >= today.open && hour < today.close;
    var message = open
      ? 'Open now until ' + today.text.split('\u2013')[1].trim()
      : 'Closed now \u00b7 ' + nextOpening(todayIndex);

    $$('[data-open-now]').forEach(function (banner) {
      banner.textContent = message;
      banner.setAttribute('data-state', open ? 'open' : 'closed');
    });
  }

  function nextOpening(todayIndex) {
    for (var offset = 1; offset <= 7; offset++) {
      var row = HOURS[(todayIndex + offset) % 7];
      if (row.open !== null) return 'opens ' + row.day + ' ' + row.text.split('\u2013')[0].trim();
    }
    return '';
  }

  // ------------------------------------------------------ reservation
  function initBooking() {
    var form = $('[data-booking]');
    if (!form) return;

    // Bookings open from today and run twelve weeks out.
    var dateInput = form.elements.date;
    if (dateInput) {
      var today = new Date();
      dateInput.min = today.toISOString().slice(0, 10);
      var horizon = new Date(today.getTime() + 84 * 86400000);
      dateInput.max = horizon.toISOString().slice(0, 10);
    }

    function setError(field, message) {
      var wrapper = field.closest('div');
      var errorEl = wrapper ? wrapper.querySelector('.field-error') : null;
      if (errorEl) errorEl.textContent = message || '';
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      return !message;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var ok = true;
      var status = $('[data-status]', form);
      if (status) status.textContent = '';

      ok = setError(form.elements.name, form.elements.name.value.trim() ? '' : 'We need a name for the booking.') && ok;
      ok = setError(form.elements.email,
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.elements.email.value.trim()) ? '' : 'Check this email address.') && ok;

      var party = Number(form.elements.party.value);
      ok = setError(form.elements.party,
        party >= 1 && party <= 8 ? '' : 'For parties over eight, call us — we will move tables.') && ok;

      var chosen = form.elements.date.value;
      if (!chosen) {
        ok = setError(form.elements.date, 'Pick a date.') && ok;
      } else {
        // Monday is the one day nobody is in the building.
        var dayIndex = (new Date(chosen + 'T12:00:00').getDay() + 6) % 7;
        ok = setError(form.elements.date,
          HOURS[dayIndex].open === null ? 'We are closed on Mondays. Try Tuesday?' : '') && ok;
      }

      if (!ok) {
        if (status) status.textContent = 'Have a look at the fields marked above.';
        return;
      }

      // Point the form at your booking provider (ResDiary, SevenRooms,
      // OpenTable) or your own endpoint — see README.md.
      if (status) {
        status.textContent = 'Thanks ' + form.elements.name.value.trim().split(' ')[0] +
          ' — we will confirm by email within the hour.';
      }
      form.reset();
      $$('[aria-invalid]', form).forEach(function (f) { f.setAttribute('aria-invalid', 'false'); });
    });
  }

  // ---------------------------------------------------------- chrome
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
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -50px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  function init() {
    initMenu();
    initHours();
    initBooking();
    initNav();
    initReveals();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
