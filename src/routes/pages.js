'use strict';

const express = require('express');
const config = require('../config');
const templatesService = require('../services/templates');
const orders = require('../services/orders');
const { categories, styles, featureLabels } = require('../db/catalog');
const tutorials = require('../content/tutorials');
const { formatMoney } = require('../services/pricing');

const router = express.Router();

router.get('/', (req, res) => {
  const all = templatesService.all();
  res.render('pages/home', {
    title: `${config.store.name} — ${config.store.tagline}`,
    featured: all.slice(0, 6),
    total: all.length,
    categories,
  });
});

router.get('/templates', (req, res) => {
  const { category, style, feature, selling, sort, q } = req.query;
  const results = templatesService.search({ category, style, feature, selling, sort, q });
  const activeFilters = Object.entries({ category, style, feature, selling, q }).filter(([, v]) => v);

  res.render('pages/templates', {
    title: 'All templates',
    results,
    categories,
    styles,
    featureLabels,
    filters: { category, style, feature, selling, sort: sort || 'featured', q },
    activeFilters,
    totalCount: templatesService.all().length,
  });
});

router.get('/templates/:slug', (req, res, next) => {
  const template = templatesService.bySlug(req.params.slug);
  if (!template) return next();

  const related = templatesService
    .all()
    .filter((t) => t.slug !== template.slug && (t.category === template.category || t.style === template.style))
    .slice(0, 3);

  res.render('pages/template-detail', {
    title: `${template.name} — ${formatMoney(template.price_cents)}`,
    template,
    related,
    addons: config.store.addons,
    owned: Boolean(orders.owns(req.user?.id, template.slug)),
    inCart: (req.session.cart?.templates || []).includes(template.slug),
  });
});

router.get('/pricing', (req, res) => {
  res.render('pages/pricing', {
    title: 'Pricing',
    addons: config.store.addons,
    bundle: config.store.bundle,
  });
});

router.get('/tutorials', (req, res) => {
  res.render('pages/tutorials', { title: 'Tutorials', tutorials });
});

router.get('/tutorials/:slug', (req, res, next) => {
  const tutorial = tutorials.find((t) => t.slug === req.params.slug);
  if (!tutorial) return next();
  res.render('pages/tutorial-detail', { title: tutorial.title, tutorial });
});

router.get('/licence', (req, res) => {
  res.render('pages/licence', { title: 'Licence' });
});

module.exports = router;
