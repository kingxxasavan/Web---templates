'use strict';

const test = require('node:test');
const assert = require('node:assert');

const { recommend, scoreTemplate } = require('../src/services/recommend');
const { templates } = require('../src/db/catalog');

test('a brief matching a template exactly ranks it first', () => {
  const target = templates.find((t) => t.slug === 'ember-table');
  const brief = {
    category: target.category,
    selling: target.selling,
    style: target.style,
    animation: target.animation,
    features: target.features.slice(0, 3),
  };

  const [best] = recommend(templates, brief, { limit: 4 });
  assert.strictEqual(best.template.slug, 'ember-table');
  assert.strictEqual(best.fit, 100, 'an exact match should be a 100% fit');
  assert.deepStrictEqual(best.missingFeatures, []);
});

test('category is the strongest single signal', () => {
  const [best] = recommend(templates, { category: 'blog' }, { limit: 1 });
  assert.strictEqual(best.template.category, 'blog');
});

test('missing features are reported rather than hidden', () => {
  // A restaurant brief that also demands a shopping cart: nothing has both.
  const [best] = recommend(templates, { category: 'restaurant', features: ['menu', 'cart'] }, { limit: 1 });
  assert.ok(best.matchedFeatures.includes('menu'));
  assert.ok(best.missingFeatures.includes('cart'), 'the buyer must be told what is absent');
});

test('an empty brief still returns results, ranked by catalogue order', () => {
  const results = recommend(templates, {}, { limit: 3 });
  assert.strictEqual(results.length, 3);
  for (const result of results) {
    assert.strictEqual(result.score, 0);
    assert.strictEqual(result.fit, 0, 'no brief means no meaningful fit percentage');
  }
});

test('fit is always a sane percentage', () => {
  const brief = { category: 'saas', selling: 'digital', style: 'modern', animation: 'rich', features: ['faq'] };
  for (const result of recommend(templates, brief, { limit: templates.length })) {
    assert.ok(result.fit >= 0 && result.fit <= 100, `fit out of range: ${result.fit}`);
  }
});

test('results are sorted by score, descending', () => {
  const results = recommend(templates, { category: 'ecommerce', selling: 'physical' }, { limit: templates.length });
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i - 1].score >= results[i].score, 'results came back out of order');
  }
});

test('every match carries at least one human-readable reason when it scores', () => {
  const results = recommend(templates, { category: 'portfolio', style: 'minimal' }, { limit: 3 });
  for (const result of results) {
    if (result.score > 0) {
      assert.ok(result.reasons.length > 0, `${result.template.slug} scored but gave no reason`);
    }
  }
});

test('scoring handles features stored as a JSON string, as they come from SQLite', () => {
  const row = { ...templates[0], features: JSON.stringify(templates[0].features) };
  const result = scoreTemplate(row, { features: [templates[0].features[0]] });
  assert.ok(result.score > 0, 'a JSON-encoded feature list must score the same as an array');
});

test('limit is respected', () => {
  assert.strictEqual(recommend(templates, { category: 'business' }, { limit: 2 }).length, 2);
});
