/* Store chrome. Small enough to stay inline-free and dependency-free. */
(function () {
  'use strict';

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
  }

  // The finder is long; submitting on Enter from a text field is a foot-gun, so
  // only the explicit button submits it.
  var finder = document.getElementById('finder');
  if (finder) {
    finder.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && event.target.tagName === 'INPUT' && event.target.type === 'text') {
        event.preventDefault();
      }
    });
  }
})();
