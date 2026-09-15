'use strict';

const express = require('express');
const config = require('../config');
const orders = require('../services/orders');
const templatesService = require('../services/templates');
const packager = require('../services/packager');
const { requireUser } = require('../middleware/auth');

const router = express.Router();

router.use(requireUser);

router.get('/', (req, res) => {
  const entitlements = orders.entitlementsFor(req.user.id);
  const history = orders.forUser(req.user.id);
  const owned = new Set(entitlements.map((e) => e.template_slug));

  res.render('pages/account', {
    title: 'Your account',
    entitlements,
    history,
    addons: config.store.addons,
    suggestions: templatesService.all().filter((t) => !owned.has(t.slug)).slice(0, 3),
  });
});

/** Issue a one-time token, then redirect to the zip. Keeps zip URLs unshareable. */
router.post('/download/:slug', (req, res, next) => {
  const entitlement = orders.owns(req.user.id, req.params.slug);
  if (!entitlement) {
    const err = new Error('You do not own that template.');
    err.status = 403;
    return next(err);
  }
  const token = orders.issueDownloadToken(req.user.id, req.params.slug);
  res.redirect(`/account/download/${token}`);
});

router.get('/download/:token', (req, res, next) => {
  const row = orders.consumeDownloadToken(req.params.token);
  if (!row) {
    const err = new Error('That download link has expired or was already used. Start it again from your account.');
    err.status = 410;
    return next(err);
  }

  const template = templatesService.bySlug(row.template_slug);
  const entitlement = orders.owns(row.user_id, row.template_slug);
  if (!template || !entitlement) return next();

  try {
    packager.streamZip(res, {
      template,
      buyerEmail: req.user.email,
      orderReference: entitlement.order_id ? `#${entitlement.order_id}` : 'n/a',
      addons: entitlement.addons,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
