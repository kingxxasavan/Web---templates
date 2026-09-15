/* Domain finder — posts the brief and renders ranked suggestions. */
(function () {
  'use strict';

  var form = document.getElementById('domain-form');
  if (!form) return;

  var statusEl = document.getElementById('domain-status');
  var resultsEl = document.getElementById('domain-results');
  var csrf = document.querySelector('input[name="_csrf"]');

  var LABELS = {
    'likely-available': { text: 'Likely free', cls: 'tag--ok' },
    taken: { text: 'Taken', cls: 'tag--danger' },
    unknown: { text: 'Unclear', cls: 'tag--warn' },
  };

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    var payload = {
      name: form.elements.name.value,
      keywords: form.elements.keywords.value,
      category: form.elements.category.value,
      check: form.elements.check.checked,
    };

    if (!payload.name.trim() && !payload.keywords.trim()) {
      render(null, 'Add a name or a few keywords first.');
      return;
    }

    setBusy(true, payload.check ? 'Generating names and checking DNS…' : 'Generating names…');

    try {
      var response = await fetch('/domains/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf ? csrf.value : '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        var problem = await response.json().catch(function () { return {}; });
        render(null, problem.error || 'That lookup failed. Try again in a moment.');
        return;
      }

      var data = await response.json();
      render(data.suggestions, data.message, data.checked);
    } catch (err) {
      render(null, 'Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  });

  function setBusy(busy, message) {
    var button = form.querySelector('button[type="submit"]');
    button.disabled = busy;
    button.textContent = busy ? 'Working…' : 'Suggest names';
    if (message) statusEl.innerHTML = '<p class="small muted">' + escapeHtml(message) + '</p>';
  }

  function render(suggestions, message, checked) {
    if (!suggestions || !suggestions.length) {
      statusEl.innerHTML = message
        ? '<div class="notice notice--warn"><div>' + escapeHtml(message) + '</div></div>'
        : '';
      resultsEl.innerHTML = '';
      return;
    }

    statusEl.innerHTML =
      '<p class="small muted">' +
      suggestions.length + ' suggestion' + (suggestions.length === 1 ? '' : 's') +
      ', best first.' +
      (checked ? ' Availability is a DNS hint — confirm at a registrar.' : '') +
      '</p>';

    var rows = suggestions.map(function (item) {
      var badge = '';
      if (item.availability) {
        var label = LABELS[item.availability] || LABELS.unknown;
        badge = '<span class="tag ' + label.cls + '">' + label.text + '</span>';
      }
      return (
        '<tr>' +
        '<td><b>' + escapeHtml(item.domain) + '</b></td>' +
        '<td>' + badge + '</td>' +
        '<td class="num"><span class="small muted">' + item.score + '</span></td>' +
        '<td class="num"><a class="btn btn--ghost btn--sm" target="_blank" rel="noopener nofollow"' +
        ' href="https://www.cloudflare.com/products/registrar/">Check &nearr;</a></td>' +
        '</tr>'
      );
    });

    resultsEl.innerHTML =
      '<div class="card card--flush"><table class="table">' +
      '<thead><tr><th>Domain</th><th>Status</th><th class="num">Score</th><th></th></tr></thead>' +
      '<tbody>' + rows.join('') + '</tbody></table></div>';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
})();
