'use strict';

const config = require('../config');

function notFound(req, res, next) {
  const err = new Error('Page not found');
  err.status = 404;
  next(err);
}

function handler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  if (status >= 500) console.error(err);

  if (!req.accepts('html')) {
    return res.status(status).json({ error: err.message || 'Something went wrong' });
  }

  res.status(status).render('pages/error', {
    title: status === 404 ? 'Page not found' : 'Something went wrong',
    status,
    message: err.message || 'Something went wrong',
    stack: config.isProd ? null : err.stack,
  });
}

module.exports = { notFound, handler };
