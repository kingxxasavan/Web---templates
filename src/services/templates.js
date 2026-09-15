'use strict';

const { db } = require('../db');
const { featureLabels } = require('../db/catalog');

function hydrate(row) {
  if (!row) return null;
  return {
    ...row,
    features: JSON.parse(row.features || '[]'),
    tech: JSON.parse(row.tech || '[]'),
    featureLabels: JSON.parse(row.features || '[]').map((f) => featureLabels[f] || f),
    price: (row.price_cents / 100).toFixed(2),
  };
}

function all({ includeUnpublished = false } = {}) {
  const where = includeUnpublished ? '' : 'WHERE published = 1';
  return db.prepare(`SELECT * FROM templates ${where} ORDER BY sort_order, name`).all().map(hydrate);
}

function bySlug(slug) {
  return hydrate(db.prepare('SELECT * FROM templates WHERE slug = ?').get(slug));
}

function bySlugs(slugs) {
  if (!slugs || !slugs.length) return [];
  const placeholders = slugs.map(() => '?').join(',');
  const rows = db
    .prepare(`SELECT * FROM templates WHERE slug IN (${placeholders})`)
    .all(...slugs)
    .map(hydrate);
  // Preserve the order the caller asked for (cart order, recommendation order).
  const bySlugMap = Object.fromEntries(rows.map((r) => [r.slug, r]));
  return slugs.map((s) => bySlugMap[s]).filter(Boolean);
}

function indexBySlug(list) {
  return Object.fromEntries(list.map((t) => [t.slug, t]));
}

/** Filter + sort for the catalogue page. All inputs come from the query string. */
function search({ category, style, feature, selling, sort, q } = {}) {
  let rows = all();

  if (category) rows = rows.filter((t) => t.category === category);
  if (style) rows = rows.filter((t) => t.style === style);
  if (selling) rows = rows.filter((t) => t.selling === selling);
  if (feature) rows = rows.filter((t) => t.features.includes(feature));

  if (q) {
    const needle = String(q).toLowerCase();
    rows = rows.filter((t) =>
      [t.name, t.tagline, t.description, t.category, t.style, ...t.features]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }

  switch (sort) {
    case 'name':
      rows.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
      break;
    default:
      rows.sort((a, b) => a.sort_order - b.sort_order);
  }

  return rows;
}

module.exports = { all, bySlug, bySlugs, search, hydrate, indexBySlug };
