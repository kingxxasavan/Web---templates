'use strict';

const config = require('../config');
const templatesService = require('./templates');
const { priceCart, nextBundleNudge } = require('./pricing');

const MAX_TEMPLATES = 20;

function get(req) {
  if (!req.session.cart) req.session.cart = { templates: [], addons: [] };
  const cart = req.session.cart;
  if (!Array.isArray(cart.templates)) cart.templates = [];
  if (!Array.isArray(cart.addons)) cart.addons = [];
  return cart;
}

function addTemplate(req, slug) {
  const cart = get(req);
  const template = templatesService.bySlug(slug);
  if (!template) return { ok: false, reason: 'No such template.' };
  if (cart.templates.includes(slug)) return { ok: true, alreadyPresent: true, template };
  if (cart.templates.length >= MAX_TEMPLATES) {
    return { ok: false, reason: `A cart holds at most ${MAX_TEMPLATES} templates.` };
  }
  cart.templates.push(slug);
  return { ok: true, template };
}

function removeTemplate(req, slug) {
  const cart = get(req);
  cart.templates = cart.templates.filter((s) => s !== slug);
  // Add-ons are meaningless with no template to apply them to.
  if (!cart.templates.length) cart.addons = [];
}

function toggleAddon(req, id) {
  const cart = get(req);
  if (!config.store.addons[id]) return { ok: false, reason: 'No such add-on.' };
  if (cart.addons.includes(id)) {
    cart.addons = cart.addons.filter((a) => a !== id);
    return { ok: true, added: false };
  }
  cart.addons.push(id);
  return { ok: true, added: true };
}

function clear(req) {
  req.session.cart = { templates: [], addons: [] };
}

/** Cart contents priced and hydrated, ready for a view. */
function summary(req) {
  const cart = get(req);
  const templates = templatesService.bySlugs(cart.templates);
  const priced = priceCart({ templates: templates.map((t) => t.slug), addons: cart.addons }, templatesService.indexBySlug(templates));
  return {
    ...priced,
    templates,
    addons: cart.addons,
    nudge: nextBundleNudge(templates.length),
    isEmpty: priced.itemCount === 0,
  };
}

module.exports = { get, addTemplate, removeTemplate, toggleAddon, clear, summary, MAX_TEMPLATES };
