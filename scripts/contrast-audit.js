#!/usr/bin/env node
'use strict';

/**
 * WCAG AA contrast audit over every page in the store and every page of every
 * template. Starts the app itself on an ephemeral port, so it needs no
 * external setup.
 *
 *   npm run audit:contrast
 *
 * Playwright is an optional dependency — this is a pre-release check, not
 * something `npm install` should pull a browser for. Exits non-zero on any
 * failure so it can gate a release.
 */

const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error(
    'This audit needs Playwright:\n\n  npm install --no-save playwright\n\n' +
    'Chromium must also be available; set PLAYWRIGHT_CHROMIUM if it is not on the default path.'
  );
  process.exit(2);
}

// Quiet the request log — the audit's own output is the point.
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'contrast-audit-local-only';

const { createApp } = require('../src/server');
const config = require('../src/config');
const { templates } = require('../src/db/catalog');
const tutorials = require('../src/content/tutorials');

// Reported against the background actually painted behind the text.
const IN_PAGE = function collect() {
  function parse(value) {
    if (!value) return null;
    const nums = (value.match(/[\d.]+/g) || []).map(Number);
    if (!nums.length) return null;
    // color(srgb r g b) uses 0-1; rgb()/rgba() use 0-255.
    if (value.startsWith('color(')) return nums.slice(0, 3).map((v) => Math.round(v * 255));
    return nums.slice(0, 3);
  }

  function alphaOf(value) {
    if (value.includes('/')) {
      const tail = value.split('/')[1].match(/[\d.]+/);
      return tail ? Number(tail[0]) : 1;
    }
    const nums = value.match(/[\d.]+/g) || [];
    return nums.length > 3 ? Number(nums[3]) : 1;
  }

  function luminance([r, g, b]) {
    const channel = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }

  function backgroundBehind(el) {
    let node = el;
    while (node && node !== document.documentElement) {
      const bg = getComputedStyle(node).backgroundColor;
      if (bg && bg !== 'transparent' && alphaOf(bg) > 0.5) return parse(bg);
      node = node.parentElement;
    }
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    return parse(bodyBg) || [255, 255, 255];
  }

  const findings = [];
  const seen = new Set();

  for (const el of document.querySelectorAll('a, button, p, li, td, th, h1, h2, h3, h4, span, label, summary, b, strong, time, figcaption, blockquote, cite')) {
    if (el.closest('svg')) continue;                    // SVG text is decorative here
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    if (getComputedStyle(el).visibility === 'hidden') continue;

    // Only measure elements that render their own text, not wrappers.
    const ownText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (!ownText) continue;

    const styles = getComputedStyle(el);
    const fg = parse(styles.color);
    const bg = backgroundBehind(el);
    if (!fg || !bg) continue;

    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    const size = parseFloat(styles.fontSize);
    const bold = Number(styles.fontWeight) >= 700;
    const required = size >= 24 || (size >= 18.66 && bold) ? 3.0 : 4.5;

    const key = `${styles.color}|${bg.join(',')}|${required}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (ratio < required) {
      findings.push({
        sample: ownText.slice(0, 50),
        color: styles.color,
        background: `rgb(${bg.join(', ')})`,
        ratio: Number(ratio.toFixed(2)),
        required,
        fontSize: size,
      });
    }
  }

  return findings;
};

function templatePages() {
  const urls = [];
  for (const template of templates) {
    const dir = path.join(config.templatesDir, template.slug);
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.html'))) {
      urls.push(`/preview/${template.slug}/${file}`);
    }
  }
  return urls;
}

function storePages() {
  return [
    '/', '/templates', '/find', '/pricing', '/tutorials', '/domains',
    '/cart', '/login', '/register', '/licence',
    ...templates.map((t) => `/templates/${t.slug}`),
    ...tutorials.map((t) => `/tutorials/${t.slug}`),
  ];
}

(async () => {
  const app = createApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;

  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
  });

  const urls = [...storePages(), ...templatePages()];
  let failed = 0;
  let checked = 0;

  for (const url of urls) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    try {
      await page.goto(base + url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(150);
      const findings = await page.evaluate(IN_PAGE);
      checked++;

      if (findings.length) {
        failed += findings.length;
        console.log(`\n${url}`);
        for (const f of findings) {
          console.log(
            `  ${String(f.ratio).padStart(5)} (need ${f.required})  ` +
            `${f.color} on ${f.background}  ${f.fontSize}px  "${f.sample}"`
          );
        }
      }
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  console.log(
    failed
      ? `\n${failed} contrast failure(s) across ${checked} pages.`
      : `\nAll text on ${checked} pages meets WCAG AA contrast.`
  );
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
