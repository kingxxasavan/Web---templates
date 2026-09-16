'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const config = require('../src/config');
const { templates } = require('../src/db/catalog');

const TEMPLATES_DIR = config.templatesDir;

function filesIn(dir, ext) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesIn(full, ext));
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out;
}

const allHtml = templates.flatMap((t) => filesIn(path.join(TEMPLATES_DIR, t.slug), '.html'));
const allCss = templates.flatMap((t) => filesIn(path.join(TEMPLATES_DIR, t.slug), '.css'));
const allJs = templates.flatMap((t) => filesIn(path.join(TEMPLATES_DIR, t.slug), '.js'));

test('every template JavaScript file parses', () => {
  for (const file of allJs) {
    // `node --check` is the real parser, so this catches anything the browser would.
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  }
});

test('no stray non-ASCII characters inside markup attributes', () => {
  // A mangled colour or attribute value renders as a broken page rather than an
  // error, so it has to be caught here rather than at runtime.
  const attrRe = /(fill|stroke|style|class|href|src|id|viewBox|d)="([^"]*)"/g;
  for (const file of allHtml) {
    const source = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = attrRe.exec(source)) !== null) {
      // eslint-disable-next-line no-control-regex
      const nonAscii = match[2].match(/[^\x00-\x7F]/);
      assert.strictEqual(
        nonAscii,
        null,
        `${path.relative(TEMPLATES_DIR, file)}: non-ASCII ${JSON.stringify(nonAscii && nonAscii[0])} in ${match[1]}="${match[2].slice(0, 60)}"`
      );
    }
  }
});

test('every colour literal is a well-formed hex value', () => {
  // Only look at value positions: after a colon in CSS, or inside a fill /
  // stroke / stop-color attribute. A bare `#id` in a selector or an href is
  // not a colour and must not be flagged.
  const isValidHex = (token) => /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(token);

  const check = (file, token, context) => {
    assert.ok(
      isValidHex(token),
      `${path.relative(TEMPLATES_DIR, file)}: malformed colour ${JSON.stringify(token)} in ${context}`
    );
  };

  for (const file of allCss) {
    const source = fs.readFileSync(file, 'utf8');
    // Declaration values only — everything after the first colon on a line.
    for (const line of source.split('\n')) {
      const colon = line.indexOf(':');
      if (colon === -1) continue;
      const value = line.slice(colon + 1);
      for (const token of value.match(/#[^\s;,)"'}]+/g) || []) check(file, token, line.trim().slice(0, 70));
    }
  }

  for (const file of allHtml) {
    const source = fs.readFileSync(file, 'utf8');
    const attrRe = /(fill|stroke|stop-color|color)="(#[^"]*)"/g;
    let match;
    while ((match = attrRe.exec(source)) !== null) {
      check(file, match[2], `${match[1]}="${match[2]}"`);
    }
  }
});

test('assets referenced by each page exist on disk', () => {
  const refRe = /(?:href|src)="(?!https?:|mailto:|tel:|#|data:)([^"]+)"/g;
  for (const file of allHtml) {
    const source = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);
    let match;
    while ((match = refRe.exec(source)) !== null) {
      const ref = match[1].split(/[?#]/)[0];
      if (!ref) continue;
      const target = path.resolve(dir, ref);
      assert.ok(
        fs.existsSync(target),
        `${path.relative(TEMPLATES_DIR, file)} references missing file "${ref}"`
      );
    }
  }
});

test('every page declares a charset, viewport, title and lang', () => {
  for (const file of allHtml) {
    const source = fs.readFileSync(file, 'utf8');
    const name = path.relative(TEMPLATES_DIR, file);
    assert.match(source, /<html lang="[a-z]{2}"/, `${name}: missing lang on <html>`);
    assert.match(source, /<meta charset="utf-8">/i, `${name}: missing charset`);
    assert.match(source, /name="viewport"/, `${name}: missing viewport — it would not be responsive`);
    assert.match(source, /<title>[^<]{5,}<\/title>/, `${name}: missing or trivial <title>`);
    assert.match(source, /name="description"/, `${name}: missing meta description`);
  }
});

test('every page has exactly one h1', () => {
  for (const file of allHtml) {
    const source = fs.readFileSync(file, 'utf8');
    const count = (source.match(/<h1[\s>]/g) || []).length;
    assert.strictEqual(count, 1, `${path.relative(TEMPLATES_DIR, file)} has ${count} <h1> elements, expected 1`);
  }
});

test('every img has an alt attribute and every standalone svg is labelled', () => {
  for (const file of allHtml) {
    const source = fs.readFileSync(file, 'utf8');
    const name = path.relative(TEMPLATES_DIR, file);

    for (const img of source.match(/<img\b[^>]*>/g) || []) {
      assert.match(img, /\balt=/, `${name}: <img> without alt — ${img.slice(0, 80)}`);
    }

    for (const svg of source.match(/<svg\b[^>]*>/g) || []) {
      const labelled = /aria-hidden="true"/.test(svg) || /aria-label=/.test(svg) || /role="img"/.test(svg);
      assert.ok(labelled, `${name}: <svg> is neither aria-hidden nor labelled — ${svg.slice(0, 90)}`);
    }
  }
});

test('every stylesheet honours prefers-reduced-motion', () => {
  for (const file of allCss) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(
      source,
      /prefers-reduced-motion/,
      `${path.relative(TEMPLATES_DIR, file)} has no reduced-motion handling`
    );
  }
});

test('every stylesheet has a mobile breakpoint', () => {
  for (const file of allCss) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(
      source,
      /@media\s*\(max-width:\s*7[0-9]{2}px\)/,
      `${path.relative(TEMPLATES_DIR, file)} has no phone-width breakpoint`
    );
  }
});

test('no template has a leftover TODO or placeholder marker', () => {
  for (const file of [...allHtml, ...allCss, ...allJs]) {
    const source = fs.readFileSync(file, 'utf8');
    for (const marker of ['TODO', 'FIXME', 'XXX', 'Lorem ipsum']) {
      assert.ok(
        !source.includes(marker),
        `${path.relative(TEMPLATES_DIR, file)} contains "${marker}"`
      );
    }
  }
});
