'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const { templates, categories, styles, featureLabels } = require('../src/db/catalog');
const config = require('../src/config');

const TEMPLATES_DIR = config.templatesDir;

test('every catalogue entry has a source directory with an index.html', () => {
  for (const template of templates) {
    const dir = path.join(TEMPLATES_DIR, template.slug);
    assert.ok(fs.existsSync(dir), `missing directory for ${template.slug}`);
    assert.ok(
      fs.existsSync(path.join(dir, 'index.html')),
      `${template.slug} has no index.html — buyers would download a zip with no entry point`
    );
  }
});

test('every template ships a README', () => {
  for (const template of templates) {
    const readme = path.join(TEMPLATES_DIR, template.slug, 'README.md');
    assert.ok(fs.existsSync(readme), `${template.slug} has no README.md`);
    assert.ok(fs.statSync(readme).size > 500, `${template.slug} README is too short to be useful`);
  }
});

test('declared page count matches the HTML files on disk', () => {
  for (const template of templates) {
    const dir = path.join(TEMPLATES_DIR, template.slug);
    const pages = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
    assert.strictEqual(
      pages.length,
      template.pages,
      `${template.slug} claims ${template.pages} pages but ships ${pages.length}`
    );
  }
});

test('slugs are unique and URL-safe', () => {
  const seen = new Set();
  for (const template of templates) {
    assert.match(template.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${template.slug} is not URL-safe`);
    assert.ok(!seen.has(template.slug), `duplicate slug ${template.slug}`);
    seen.add(template.slug);
  }
});

test('categories, styles and features all reference known keys', () => {
  const categoryKeys = new Set(categories.map((c) => c.key));
  const styleKeys = new Set(styles.map((s) => s.key));

  for (const template of templates) {
    assert.ok(categoryKeys.has(template.category), `${template.slug}: unknown category ${template.category}`);
    assert.ok(styleKeys.has(template.style), `${template.slug}: unknown style ${template.style}`);
    assert.ok(['physical', 'digital', 'services', 'none'].includes(template.selling), `${template.slug}: bad selling`);
    assert.ok(['none', 'subtle', 'rich'].includes(template.animation), `${template.slug}: bad animation`);
    for (const feature of template.features) {
      assert.ok(featureLabels[feature], `${template.slug}: feature "${feature}" has no label`);
    }
  }
});

test('every category is represented by at least one template', () => {
  // A category with nothing in it is a dead filter and an empty results page.
  for (const category of categories) {
    const matches = templates.filter((t) => t.category === category.key);
    assert.ok(matches.length > 0, `no templates in category "${category.key}"`);
  }
});

test('prices are all the advertised flat rate', () => {
  for (const template of templates) {
    assert.strictEqual(
      template.price_cents,
      config.store.templatePriceCents,
      `${template.slug} is not priced at the flat rate the store advertises`
    );
  }
});
