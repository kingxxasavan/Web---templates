'use strict';

const crypto = require('crypto');

// Per-session double-submit token. Small enough to keep in the repo rather than
// pulling a dependency for one comparison.
function csrf(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const supplied = req.body?._csrf || req.get('x-csrf-token');
  const expected = req.session.csrfToken;
  const ok =
    typeof supplied === 'string' &&
    supplied.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));

  if (!ok) {
    const err = new Error('Your form session expired. Please try again.');
    err.status = 403;
    return next(err);
  }
  return next();
}

module.exports = { csrf };
