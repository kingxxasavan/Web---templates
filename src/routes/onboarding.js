'use strict';

const express = require('express');
const crypto = require('crypto');
const { db } = require('../db');
const templatesService = require('../services/templates');
const { recommend } = require('../services/recommend');
const { categories, styles, featureLabels } = require('../db/catalog');

const router = express.Router();

// The guided quiz. Order matters: each answer narrows the next question's
// relevance, and the whole thing has to stay answerable in under a minute.
const QUESTIONS = [
  {
    key: 'category',
    question: 'What are you building?',
    help: 'This does most of the work — it decides which layouts even make sense.',
    type: 'single',
    options: categories.map((c) => ({ value: c.key, label: c.label })),
  },
  {
    key: 'selling',
    question: 'Are you selling something?',
    help: 'Changes whether you get a catalogue, a booking form, or neither.',
    type: 'single',
    options: [
      { value: 'physical', label: 'Physical products', hint: 'Things you ship' },
      { value: 'digital', label: 'Digital products', hint: 'Downloads, subscriptions' },
      { value: 'services', label: 'Services', hint: 'Bookings, consultations' },
      { value: 'none', label: 'Not selling', hint: 'Informational site' },
    ],
  },
  {
    key: 'style',
    question: 'Which way should it lean?',
    type: 'single',
    options: styles.map((s) => ({ value: s.key, label: s.label })),
  },
  {
    key: 'animation',
    question: 'How much motion?',
    type: 'single',
    options: [
      { value: 'none', label: 'None', hint: 'Fastest, most accessible' },
      { value: 'subtle', label: 'Subtle', hint: 'Fades and hovers only' },
      { value: 'rich', label: 'Rich', hint: 'Scroll effects and transitions' },
    ],
  },
  {
    key: 'features',
    question: 'What do you actually need on the page?',
    help: 'Pick as many as apply. Missing ones are listed on each match so there are no surprises.',
    type: 'multi',
    options: [
      'catalog', 'cart', 'gallery', 'contact-form', 'pricing-table',
      'newsletter', 'testimonials', 'team', 'schedule', 'reservations',
      'menu', 'faq', 'search', 'dark-mode',
    ].map((key) => ({ value: key, label: featureLabels[key] || key })),
  },
];

router.get('/', (req, res) => {
  res.render('pages/onboarding', {
    title: 'Find your template',
    questions: QUESTIONS,
    saved: req.session.brief || {},
  });
});

router.post('/', (req, res, next) => {
  try {
    const brief = normaliseBrief(req.body);
    req.session.brief = brief;

    const publicId = crypto.randomBytes(9).toString('base64url');
    db.prepare('INSERT INTO briefs (public_id, user_id, answers) VALUES (?, ?, ?)')
      .run(publicId, req.user?.id || null, JSON.stringify(brief));

    res.redirect(`/find/${publicId}`);
  } catch (err) {
    next(err);
  }
});

router.get('/:publicId', (req, res, next) => {
  const row = db.prepare('SELECT * FROM briefs WHERE public_id = ?').get(req.params.publicId);
  if (!row) return next();

  const brief = JSON.parse(row.answers);
  const matches = recommend(templatesService.all(), brief, { limit: 4 });

  res.render('pages/onboarding-results', {
    title: 'Your matches',
    brief,
    briefId: row.public_id,
    matches,
    featureLabels,
    categories,
    cartSlugs: req.session.cart?.templates || [],
  });
});

function normaliseBrief(body) {
  const pick = (key, allowed) => {
    const value = String(body[key] || '').trim();
    return allowed.includes(value) ? value : null;
  };
  const features = []
    .concat(body.features || [])
    .map((f) => String(f).trim())
    .filter((f) => Object.prototype.hasOwnProperty.call(featureLabels, f));

  return {
    category: pick('category', categories.map((c) => c.key)),
    selling: pick('selling', ['physical', 'digital', 'services', 'none']),
    style: pick('style', styles.map((s) => s.key)),
    animation: pick('animation', ['none', 'subtle', 'rich']),
    features: [...new Set(features)],
    name: String(body.name || '').trim().slice(0, 80),
    keywords: String(body.keywords || '').trim().slice(0, 120),
  };
}

module.exports = router;
module.exports.QUESTIONS = QUESTIONS;
module.exports.normaliseBrief = normaliseBrief;
