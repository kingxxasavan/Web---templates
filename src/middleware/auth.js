'use strict';

const users = require('../services/users');

/** Hydrate res.locals.currentUser from the session on every request. */
function loadUser(req, res, next) {
  req.user = null;
  if (req.session && req.session.userId) {
    req.user = users.findById(req.session.userId) || null;
    if (!req.user) delete req.session.userId;
  }
  res.locals.currentUser = req.user;
  next();
}

/** Gate a page behind login, remembering where the visitor was headed. */
function requireUser(req, res, next) {
  if (req.user) return next();
  req.session.returnTo = req.originalUrl;
  if (req.accepts('html')) return res.redirect('/login');
  return res.status(401).json({ error: 'Authentication required' });
}

module.exports = { loadUser, requireUser };
