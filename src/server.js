'use strict';

const path = require('path');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

const config = require('./config');
const { migrate } = require('./db');
const { loadUser } = require('./middleware/auth');
const { csrf } = require('./middleware/csrf');
const errors = require('./middleware/errors');
const { formatMoney } = require('./services/pricing');
const payments = require('./services/payments');
const checkoutRoutes = require('./routes/checkout');

function createApp() {
  migrate();

  const app = express();
  app.set('trust proxy', 1);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(expressLayouts);
  app.set('layout', 'layout');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          frameSrc: ["'self'"],
          connectSrc: ["'self'"],
        },
      },
      // Template previews render in an iframe from this same origin.
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    })
  );

  if (!config.isProd) app.use(morgan('dev'));

  // The Stripe webhook needs the raw body for signature verification, so it is
  // mounted before the body parsers that would consume it.
  app.post('/checkout/webhook', express.raw({ type: 'application/json' }), checkoutRoutes.webhook);

  app.use(express.urlencoded({ extended: false, limit: '64kb' }));
  app.use(express.json({ limit: '64kb' }));

  fs.mkdirSync(config.dataDir, { recursive: true });
  app.use(
    session({
      store: new SQLiteStore({ db: 'sessions.db', dir: config.dataDir, concurrentDB: true }),
      name: config.session.name,
      secret: config.session.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProd,
        maxAge: config.session.maxAgeDays * 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use(loadUser);
  app.use(csrf);

  app.use(express.static(path.join(config.rootDir, 'public'), { maxAge: config.isProd ? '7d' : 0 }));

  // Values every view can rely on.
  app.use((req, res, next) => {
    res.locals.store = config.store;
    res.locals.money = formatMoney;
    res.locals.path = req.path;
    res.locals.cartCount =
      (req.session.cart?.templates?.length || 0) + (req.session.cart?.addons?.length || 0);
    res.locals.stripeLive = payments.isLive();
    res.locals.flash = req.session.flash || null;
    res.locals.query = req.query;
    delete req.session.flash;
    next();
  });

  app.use('/', require('./routes/pages'));
  app.use('/', require('./routes/auth'));
  app.use('/find', require('./routes/onboarding'));
  app.use('/cart', require('./routes/cart'));
  app.use('/checkout', checkoutRoutes);
  app.use('/account', require('./routes/account'));
  app.use('/domains', require('./routes/domains'));
  app.use('/preview', require('./routes/preview'));

  app.get('/healthz', (req, res) => res.json({ ok: true, stripe: payments.isLive() ? 'live' : 'dev' }));

  app.use(errors.notFound);
  app.use(errors.handler);

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`\n  ${config.store.name} running at ${config.baseUrl}`);
    console.log(`  Payments: ${payments.isLive() ? 'Stripe (live keys detected)' : 'SIMULATED — set STRIPE_SECRET_KEY for real checkout'}\n`);
  });
}

module.exports = { createApp };
