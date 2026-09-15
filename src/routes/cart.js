'use strict';

const express = require('express');
const config = require('../config');
const cartService = require('../services/cart');
const payments = require('../services/payments');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/cart', {
    title: 'Your cart',
    cart: cartService.summary(req),
    addons: config.store.addons,
    stripeLive: payments.isLive(),
    cancelled: Boolean(req.query.cancelled),
  });
});

router.post('/add/:slug', (req, res) => {
  const result = cartService.addTemplate(req, req.params.slug);
  if (!result.ok) {
    req.session.flash = { type: 'error', message: result.reason };
  }
  redirectBack(req, res, '/cart');
});

router.post('/remove/:slug', (req, res) => {
  cartService.removeTemplate(req, req.params.slug);
  redirectBack(req, res, '/cart');
});

router.post('/addon/:id', (req, res) => {
  const result = cartService.toggleAddon(req, req.params.id);
  if (!result.ok) req.session.flash = { type: 'error', message: result.reason };
  redirectBack(req, res, '/cart');
});

router.post('/clear', (req, res) => {
  cartService.clear(req);
  res.redirect('/cart');
});

function redirectBack(req, res, fallback) {
  const target = req.body.redirect_to || req.get('referer') || fallback;
  // Only ever redirect within this site.
  res.redirect(target.startsWith('/') && !target.startsWith('//') ? target : fallback);
}

module.exports = router;
