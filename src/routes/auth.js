'use strict';

const express = require('express');
const users = require('../services/users');

const router = express.Router();

router.get('/register', (req, res) => {
  if (req.user) return res.redirect('/account');
  res.render('pages/register', { title: 'Create an account', errors: [], values: {} });
});

router.post('/register', (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const errors = users.validateCredentials(email, password);

    const existing = users.findByEmail(email);
    if (existing && users.hasUsablePassword(existing)) {
      errors.push('That email already has an account. Sign in instead.');
    }

    if (errors.length) {
      return res.status(400).render('pages/register', {
        title: 'Create an account',
        errors,
        values: { email, name },
      });
    }

    // A guest checkout may have already created a claimable account for this
    // address; registering claims it, keeping the templates they bought.
    let user;
    if (existing) {
      users.setPassword(existing.id, password);
      user = users.findById(existing.id);
    } else {
      user = users.create({ email, password, name });
    }

    req.session.userId = user.id;
    const target = req.session.returnTo || '/account';
    delete req.session.returnTo;
    res.redirect(target);
  } catch (err) {
    next(err);
  }
});

router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/account');
  res.render('pages/login', { title: 'Sign in', errors: [], values: {} });
});

router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = users.findByEmail(email);

    if (!user || !users.verify(user, password)) {
      // One message for both cases so the form cannot be used to test which
      // addresses have accounts.
      return res.status(401).render('pages/login', {
        title: 'Sign in',
        errors: ['That email and password do not match an account.'],
        values: { email },
      });
    }

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      res.redirect('/account');
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie(require('../config').session.name);
    res.redirect('/');
  });
});

module.exports = router;
