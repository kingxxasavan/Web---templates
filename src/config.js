'use strict';

require('dotenv').config();

const path = require('path');

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

function required(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value && isProd) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

const config = {
  env,
  isProd,
  port: Number(process.env.PORT || 3000),
  baseUrl: process.env.BASE_URL || `http://localhost:${Number(process.env.PORT || 3000)}`,
  rootDir: path.join(__dirname, '..'),
  dataDir: process.env.DATA_DIR || path.join(__dirname, '..', 'data'),
  templatesDir: process.env.TEMPLATES_DIR || path.join(__dirname, '..', 'storefront-templates'),
  session: {
    secret: required('SESSION_SECRET', 'dev-only-insecure-session-secret'),
    name: 'fds.sid',
    maxAgeDays: 30,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: 'usd',
  },
  store: {
    name: 'The $5 Store',
    tagline: 'High-quality website templates. Five dollars each.',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@fivedollar.store',
    templatePriceCents: 500,
    // Buy 3+ templates and the cheapest ones get discounted.
    bundle: { minItems: 3, priceCents: 1200 },
    addons: {
      'addon-motion': { name: 'Motion Pack', priceCents: 700, blurb: 'Scroll reveals, page transitions and micro-interactions wired in.' },
      'addon-growth': { name: 'Growth Pack', priceCents: 900, blurb: 'Analytics, SEO metadata, sitemap and Open Graph images.' },
      'addon-commerce': { name: 'Commerce Pack', priceCents: 1200, blurb: 'Stripe-ready cart, product schema and checkout flow.' },
    },
  },
  downloads: {
    // A download token is short-lived; the purchase itself never expires.
    tokenTtlMinutes: 30,
    maxPerPurchase: 50,
  },
};

module.exports = config;
