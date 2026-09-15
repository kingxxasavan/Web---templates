'use strict';

const bcrypt = require('bcryptjs');
const { db } = require('../db');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normaliseEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateCredentials(email, password) {
  const errors = [];
  if (!EMAIL_RE.test(normaliseEmail(email))) errors.push('Enter a valid email address.');
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters.');
  return errors;
}

function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(normaliseEmail(email));
}

function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function create({ email, password, name }) {
  const hash = bcrypt.hashSync(password, 12);
  const info = db
    .prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
    .run(normaliseEmail(email), hash, name || null);
  return findById(info.lastInsertRowid);
}

/**
 * Find or create the user a paid order belongs to. Guest checkout is allowed,
 * so the account may not exist until payment succeeds — in that case we create
 * a claimable account with an unusable password hash and the buyer sets a
 * password from the receipt page.
 */
function ensureForEmail(email) {
  const existing = findByEmail(email);
  if (existing) return { user: existing, created: false };
  const info = db
    .prepare("INSERT INTO users (email, password_hash) VALUES (?, '!')")
    .run(normaliseEmail(email));
  return { user: findById(info.lastInsertRowid), created: true };
}

function hasUsablePassword(user) {
  return Boolean(user && user.password_hash && user.password_hash !== '!');
}

function verify(user, password) {
  if (!hasUsablePassword(user)) return false;
  return bcrypt.compareSync(password, user.password_hash);
}

function setPassword(userId, password) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 12), userId);
}

module.exports = {
  normaliseEmail,
  validateCredentials,
  findByEmail,
  findById,
  create,
  ensureForEmail,
  hasUsablePassword,
  verify,
  setPassword,
};
