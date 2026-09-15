'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const domainService = require('../services/domains');
const { categories } = require('../db/catalog');

const router = express.Router();

// Availability checks hit DNS, so the endpoint gets its own budget.
const lookupLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many lookups. Wait a minute and try again.' },
});

router.get('/', (req, res) => {
  const brief = req.session.brief || {};
  res.render('pages/domains', {
    title: 'Domain finder',
    categories,
    prefill: {
      name: brief.name || '',
      keywords: brief.keywords || '',
      category: brief.category || '',
    },
  });
});

router.post('/suggest', lookupLimiter, async (req, res, next) => {
  try {
    const { name = '', keywords = '', category = '', check } = req.body || {};
    const suggestions = domainService.suggest(
      { name: String(name).slice(0, 80), keywords: String(keywords).slice(0, 120), category: String(category) },
      { limit: 18 }
    );

    if (!suggestions.length) {
      return res.json({ suggestions: [], message: 'Add a business name or a few keywords to get started.' });
    }

    // Availability is opt-in: it is slower and only indicative.
    if (check) {
      const statuses = await domainService.checkMany(suggestions.map((s) => s.domain));
      for (const suggestion of suggestions) {
        suggestion.availability = statuses.get(suggestion.domain) || 'unknown';
      }
    }

    res.json({ suggestions, checked: Boolean(check) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
