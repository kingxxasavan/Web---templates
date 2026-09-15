'use strict';

const express = require('express');
const config = require('../config');
const cartService = require('../services/cart');
const payments = require('../services/payments');
const orders = require('../services/orders');
const users = require('../services/users');

const router = express.Router();

router.get('/', (req, res) => {
  const cart = cartService.summary(req);
  if (cart.isEmpty) return res.redirect('/cart');

  res.render('pages/checkout', {
    title: 'Checkout',
    cart,
    stripeLive: payments.isLive(),
    email: req.user?.email || req.session.checkoutEmail || '',
    errors: [],
  });
});

router.post('/', async (req, res, next) => {
  try {
    const cart = cartService.summary(req);
    if (cart.isEmpty) return res.redirect('/cart');

    const email = users.normaliseEmail(req.user?.email || req.body.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(400).render('pages/checkout', {
        title: 'Checkout',
        cart,
        stripeLive: payments.isLive(),
        email: req.body.email || '',
        errors: ['Enter a valid email address — this is where the download link goes.'],
      });
    }
    req.session.checkoutEmail = email;

    const order = orders.createPending({
      userId: req.user?.id || null,
      email,
      priced: cart,
      provider: payments.isLive() ? 'stripe' : 'dev',
    });

    const session = await payments.createCheckout({ order, priced: cart, email });
    orders.setProviderRef(order.id, session.providerRef, session.provider);

    res.redirect(303, session.url);
  } catch (err) {
    next(err);
  }
});

/**
 * Simulated checkout, used only when no Stripe keys are configured so the app
 * is runnable end to end out of the box. It never accepts card details and the
 * page says plainly that no money moves.
 */
router.get('/dev/:reference', (req, res, next) => {
  if (payments.isLive()) return next();
  const order = orders.byReference(req.params.reference);
  if (!order || order.status !== 'pending') return next();

  res.render('pages/checkout-dev', {
    title: 'Simulated checkout',
    order,
    items: orders.items(order.id),
  });
});

router.post('/dev/:reference', (req, res, next) => {
  try {
    if (payments.isLive()) return next();
    const order = orders.byReference(req.params.reference);
    if (!order || order.status !== 'pending') return next();

    const { user } = users.ensureForEmail(order.email);
    orders.fulfil(order, { userId: user.id });
    cartService.clear(req);

    res.redirect(`/checkout/receipt/${order.reference}`);
  } catch (err) {
    next(err);
  }
});

/** Stripe's success_url lands here. Confirm with Stripe before granting. */
router.get('/complete', async (req, res, next) => {
  try {
    const order = orders.byReference(String(req.query.ref || ''));
    if (!order) return next();

    if (order.status !== 'paid') {
      const session = await payments.retrieveSession(String(req.query.session_id || ''));
      // Trust Stripe's own record, never the query string, before fulfilling.
      if (session && session.payment_status === 'paid' && session.client_reference_id === order.reference) {
        const { user } = users.ensureForEmail(order.email);
        orders.fulfil(order, { userId: user.id });
      } else {
        // The webhook is the backstop; tell the buyer rather than guessing.
        return res.render('pages/checkout-pending', { title: 'Confirming payment', order });
      }
    }

    cartService.clear(req);
    res.redirect(`/checkout/receipt/${order.reference}`);
  } catch (err) {
    next(err);
  }
});

router.get('/receipt/:reference', (req, res, next) => {
  const order = orders.byReference(req.params.reference);
  if (!order || order.status !== 'paid') return next();

  const account = users.findByEmail(order.email);
  res.render('pages/receipt', {
    title: `Order ${order.reference}`,
    order,
    items: orders.items(order.id),
    needsPassword: account ? !users.hasUsablePassword(account) : false,
    signedIn: Boolean(req.user),
  });
});

/** Claim the account created by a guest checkout by setting a password. */
router.post('/claim/:reference', (req, res, next) => {
  try {
    const order = orders.byReference(req.params.reference);
    if (!order || order.status !== 'paid') return next();

    const account = users.findByEmail(order.email);
    if (!account || users.hasUsablePassword(account)) {
      return res.redirect('/login');
    }

    const errors = users.validateCredentials(order.email, req.body.password);
    if (errors.length) {
      return res.status(400).render('pages/receipt', {
        title: `Order ${order.reference}`,
        order,
        items: orders.items(order.id),
        needsPassword: true,
        signedIn: false,
        errors,
      });
    }

    users.setPassword(account.id, req.body.password);
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = account.id;
      res.redirect('/account');
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

/**
 * Webhook handler. Mounted separately in server.js because it needs the raw
 * body for signature verification, before the JSON body parser runs.
 */
module.exports.webhook = function webhook(req, res) {
  let event;
  try {
    event = payments.parseWebhook(req.body, req.get('stripe-signature'));
  } catch (err) {
    console.error('Stripe webhook rejected:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    const order =
      orders.byReference(session.client_reference_id || '') || orders.byProviderRef(session.id);

    if (order && session.payment_status === 'paid') {
      const email = session.customer_email || session.customer_details?.email || order.email;
      const { user } = users.ensureForEmail(email);
      orders.fulfil(order, { userId: user.id });
    }
  }

  res.json({ received: true });
};

module.exports.config = config;
