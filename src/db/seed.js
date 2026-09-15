'use strict';

const { migrate } = require('./index');
const { templates } = require('./catalog');

const db = migrate();

const upsert = db.prepare(`
  INSERT INTO templates
    (slug, name, tagline, description, category, style, selling, animation,
     features, tech, accent, price_cents, pages, published, sort_order)
  VALUES
    (@slug, @name, @tagline, @description, @category, @style, @selling, @animation,
     @features, @tech, @accent, @price_cents, @pages, 1, @sort_order)
  ON CONFLICT(slug) DO UPDATE SET
    name        = excluded.name,
    tagline     = excluded.tagline,
    description = excluded.description,
    category    = excluded.category,
    style       = excluded.style,
    selling     = excluded.selling,
    animation   = excluded.animation,
    features    = excluded.features,
    tech        = excluded.tech,
    accent      = excluded.accent,
    price_cents = excluded.price_cents,
    pages       = excluded.pages,
    sort_order  = excluded.sort_order
`);

const run = db.transaction((rows) => {
  for (const row of rows) {
    upsert.run({
      ...row,
      features: JSON.stringify(row.features),
      tech: JSON.stringify(row.tech),
    });
  }
});

run(templates);
console.log(`Seeded ${templates.length} templates.`);
