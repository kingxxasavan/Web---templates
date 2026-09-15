'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const templatesService = require('../services/templates');
const packager = require('../services/packager');

const router = express.Router();

/**
 * Live preview. The template's own files are served read-only under
 * /preview/<slug>/ so the detail page can show the real thing in an iframe
 * rather than a screenshot. A banner is injected into the served HTML so a
 * preview URL that escapes into the wild is never mistaken for a bought copy.
 */
router.use('/:slug', (req, res, next) => {
  const { slug } = req.params;
  if (!templatesService.bySlug(slug) || !packager.exists(slug)) return next();

  const dir = packager.templateDir(slug);
  const rel = req.path === '/' ? '/index.html' : req.path;
  const target = path.resolve(dir, '.' + rel);
  if (target !== dir && !target.startsWith(dir + path.sep)) return next();

  if (!target.endsWith('.html')) {
    return express.static(dir, { index: 'index.html', fallthrough: true })(req, res, next);
  }

  fs.readFile(target, 'utf8', (err, html) => {
    if (err) return next();
    res.type('html').send(injectBanner(html, slug));
  });
});

function injectBanner(html, slug) {
  const banner = `
<div id="fds-preview-banner" style="position:fixed;z-index:2147483647;left:50%;bottom:16px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:999px;background:#111318;color:#fff;font:500 13px/1.3 system-ui,-apple-system,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.35)">
  <span>Preview — ${config.store.name}</span>
  <a href="${config.baseUrl}/templates/${slug}" target="_top" style="color:#fff;background:#5b5bd6;padding:6px 12px;border-radius:999px;text-decoration:none">Get this template — $5</a>
</div>`;
  return html.includes('</body>') ? html.replace('</body>', `${banner}\n</body>`) : html + banner;
}

module.exports = router;
