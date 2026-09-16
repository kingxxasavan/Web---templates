/* ==========================================================================
   Quill Journal — search, tag filtering, reading progress, newsletter.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Search and tag filtering run over the markup that is already on the page.
     No index, no fetch, no build step — which is the right trade-off up to a
     few hundred posts. Past that, generate a JSON index at build time. */
  function initFilters() {
    var posts = $$('[data-post]');
    if (!posts.length) return;

    var searchInput = $('[data-search]');
    var emptyEl = $('[data-empty]');
    var countEl = $('[data-count]');
    var state = { query: '', tag: '' };

    function apply() {
      var query = state.query.trim().toLowerCase();
      var shown = 0;

      posts.forEach(function (post) {
        var haystack = (post.getAttribute('data-search-text') || post.textContent).toLowerCase();
        var tags = (post.getAttribute('data-tags') || '').split(' ').filter(Boolean);

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesTag = !state.tag || tags.indexOf(state.tag) !== -1;
        var visible = matchesQuery && matchesTag;

        post.hidden = !visible;
        if (visible) shown++;
      });

      if (emptyEl) emptyEl.hidden = shown !== 0;
      if (countEl) {
        countEl.textContent = shown === posts.length
          ? posts.length + ' posts'
          : shown + ' of ' + posts.length + ' posts';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.query = searchInput.value;
        apply();
      });
    }

    // Only the buttons in the tag bar filter. The tags printed inside a post
    // stay ordinary links to the archive, so they behave the way a link looks.
    var tagButtons = $$('.tag-bar [data-tag]');
    tagButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        var tag = button.getAttribute('data-tag');
        // Clicking the active tag clears the filter, which is what people expect.
        state.tag = state.tag === tag ? '' : tag;
        tagButtons.forEach(function (b) {
          var on = b.getAttribute('data-tag') === state.tag;
          b.classList.toggle('tag--on', on);
          b.setAttribute('aria-pressed', String(on));
        });
        apply();
      });
    });

    apply();
  }

  function initSearchToggle() {
    var toggle = $('[data-search-toggle]');
    var bar = $('.searchbar');
    if (!toggle || !bar) return;

    toggle.addEventListener('click', function () {
      var open = bar.getAttribute('data-open') === 'true';
      bar.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
      if (!open) {
        var input = $('input', bar);
        if (input) input.focus();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && bar.getAttribute('data-open') === 'true') {
        bar.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
      // "/" focuses search, the convention readers expect — but not while
      // they are already typing in a field.
      if (event.key === '/' && !/^(INPUT|TEXTAREA)$/.test(event.target.tagName)) {
        event.preventDefault();
        bar.setAttribute('data-open', 'true');
        toggle.setAttribute('aria-expanded', 'true');
        var input = $('input', bar);
        if (input) input.focus();
      }
    });
  }

  function initProgress() {
    var bar = $('.progress');
    var article = $('[data-article]');
    if (!bar || !article) return;

    function update() {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      if (total <= 0) { bar.style.width = '100%'; return; }
      var scrolled = Math.min(Math.max(-rect.top, 0), total);
      bar.style.width = (scrolled / total * 100).toFixed(2) + '%';
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });

    window.addEventListener('resize', update);
    update();
  }

  /* Reading time from the article's own word count, so it can never drift out
     of sync with the text the way a hand-written number does. */
  function initReadingTime() {
    var target = $('[data-reading-time]');
    var article = $('[data-article]');
    if (!target || !article) return;
    var words = article.textContent.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.round(words / 230));
    target.textContent = minutes + ' min read';
  }

  function initNav() {
    var toggle = $('.nav-toggle');
    var links = $('.links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      var open = links.getAttribute('data-open') === 'true';
      links.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
  }

  function initSubscribe() {
    $$('[data-subscribe]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var status = $('[data-status]', form);
        var email = form.elements.email.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          if (status) status.textContent = 'That email address does not look right.';
          return;
        }
        // Point at Buttondown, ConvertKit, Listmonk or your own endpoint.
        if (status) status.textContent = 'Thanks — check your inbox to confirm.';
        form.reset();
      });
    });
  }

  function init() {
    initFilters();
    initSearchToggle();
    initProgress();
    initReadingTime();
    initNav();
    initSubscribe();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
