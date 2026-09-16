/* ==========================================================================
   Pulse Fitness — timetable, filtering, trial signup.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** "18:00" -> "6.00pm", which is how a timetable in the UK reads. */
  function displayTime(hhmm) {
    var parts = hhmm.split(':');
    var hour = Number(parts[0]);
    var suffix = hour >= 12 ? 'pm' : 'am';
    var display = hour % 12 === 0 ? 12 : hour % 12;
    return display + '.' + parts[1] + suffix;
  }

  function initTimetable() {
    var list = $('[data-classes]');
    if (!list || !window.SCHEDULE) return;

    // getDay() is 0-indexed from Sunday; the schedule starts on Monday.
    var todayIndex = (new Date().getDay() + 6) % 7;
    var state = { day: todayIndex, type: '' };

    var tabBar = $('[data-day-tabs]');
    if (tabBar) {
      tabBar.innerHTML = DAYS.map(function (day, index) {
        return '<button class="day-tab" type="button" role="tab" data-day="' + index + '"' +
               (index === todayIndex ? ' data-today' : '') +
               ' aria-selected="' + (index === state.day) + '">' +
               '<span class="sr-only">' + day + '</span><span aria-hidden="true">' + SHORT[index] + '</span>' +
               '</button>';
      }).join('');

      tabBar.addEventListener('click', function (event) {
        var tab = event.target.closest('[data-day]');
        if (!tab) return;
        state.day = Number(tab.getAttribute('data-day'));
        $$('[data-day]', tabBar).forEach(function (t) {
          t.setAttribute('aria-selected', String(Number(t.getAttribute('data-day')) === state.day));
        });
        render();
      });
    }

    $$('[data-type]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var type = chip.getAttribute('data-type');
        state.type = state.type === type ? '' : type;
        $$('[data-type]').forEach(function (c) {
          c.setAttribute('aria-pressed', String(c.getAttribute('data-type') === state.type));
        });
        render();
      });
    });

    function render() {
      var classes = window.SCHEDULE
        .filter(function (item) { return item.day === state.day; })
        .filter(function (item) { return !state.type || item.type === state.type; })
        .sort(function (a, b) { return a.time.localeCompare(b.time); });

      var heading = $('[data-day-heading]');
      if (heading) {
        heading.textContent = state.day === todayIndex ? DAYS[state.day] + ' — today' : DAYS[state.day];
      }

      if (!classes.length) {
        var anyThatDay = window.SCHEDULE.some(function (item) { return item.day === state.day; });
        list.innerHTML = '<div class="rest-day">' +
          (anyThatDay
            ? '<b>Nothing in that category on ' + DAYS[state.day] + '.</b><p class="small" style="margin-top:8px">Clear the filter to see the rest of the day.</p>'
            : '<b>No classes on ' + DAYS[state.day] + '.</b><p class="small" style="margin-top:8px">Open gym 8am&ndash;2pm. Turn up, no booking.</p>') +
          '</div>';
        return;
      }

      list.innerHTML = classes.map(function (item) {
        var type = window.CLASS_TYPES[item.type] || { label: item.type, bg: '#eee', fg: '#333' };
        var full = item.spaces <= 0;

        return (
          '<article class="klass' + (full ? ' klass--full' : '') + '">' +
          '<div class="klass__time-cell">' +
          '<div class="klass__time">' + displayTime(item.time) + '</div>' +
          '<div class="klass__dur">' + item.minutes + ' min</div>' +
          '</div>' +
          '<div class="klass__name-cell">' +
          '<div class="klass__name">' + escapeHtml(item.name) + '</div>' +
          '<div class="klass__coach">with ' + escapeHtml(item.coach) + '</div>' +
          '</div>' +
          '<div class="klass__type-cell">' +
          '<span class="klass__type" style="background:' + type.bg + ';color:' + type.fg + '">' + escapeHtml(type.label) + '</span>' +
          '</div>' +
          '<div class="klass__spaces-cell klass__spaces">' +
          (full ? 'Full — join waitlist' : '<b>' + item.spaces + '</b> of ' + item.cap + ' left') +
          '</div>' +
          '<div class="klass__book-cell">' +
          '<a class="btn btn--sm btn--block" href="join.html">' + (full ? 'Waitlist' : 'Book') + '</a>' +
          '</div>' +
          '</article>'
        );
      }).join('');
    }

    render();
  }

  /** The soonest class still to come today, for the hero strip. */
  function initNextClass() {
    var target = $('[data-next-class]');
    if (!target || !window.SCHEDULE) return;

    var now = new Date();
    var todayIndex = (now.getDay() + 6) % 7;
    var nowMinutes = now.getHours() * 60 + now.getMinutes();

    function toMinutes(hhmm) {
      var parts = hhmm.split(':');
      return Number(parts[0]) * 60 + Number(parts[1]);
    }

    var upcoming = window.SCHEDULE
      .filter(function (item) { return item.day === todayIndex && toMinutes(item.time) > nowMinutes; })
      .sort(function (a, b) { return a.time.localeCompare(b.time); })[0];

    if (upcoming) {
      target.textContent = 'Next today: ' + upcoming.name + ' at ' + displayTime(upcoming.time) +
        (upcoming.spaces > 0 ? ' — ' + upcoming.spaces + ' places left' : ' — full');
    } else {
      // Look forward to the next day that has anything on.
      for (var offset = 1; offset <= 7; offset++) {
        var dayIndex = (todayIndex + offset) % 7;
        var next = window.SCHEDULE
          .filter(function (item) { return item.day === dayIndex; })
          .sort(function (a, b) { return a.time.localeCompare(b.time); })[0];
        if (next) {
          target.textContent = 'Next: ' + next.name + ', ' + DAYS[dayIndex] + ' ' + displayTime(next.time);
          return;
        }
      }
      target.textContent = '';
    }
  }

  function initTrialForm() {
    var form = $('[data-trial]');
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
      ok = setError(form.elements.name, form.elements.name.value.trim() ? '' : 'We need a name.') && ok;
      ok = setError(form.elements.email,
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.elements.email.value.trim()) ? '' : 'Check this email address.') && ok;

      if (!ok) {
        var firstBad = $('[aria-invalid="true"]', form);
        if (firstBad) firstBad.focus();
        return;
      }

      // Point this at your gym management system (Glofox, TeamUp, Mindbody)
      // or your own endpoint — see README.md.
      if (status) status.textContent = 'Booked. Check your email for the details and what to bring.';
      form.reset();
      $$('[aria-invalid]', form).forEach(function (f) { f.setAttribute('aria-invalid', 'false'); });
    });
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
    initTimetable();
    initNextClass();
    initTrialForm();
    initNav();
    initReveals();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
