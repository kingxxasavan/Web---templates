'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

let db;

function open() {
  if (db) return db;
  fs.mkdirSync(config.dataDir, { recursive: true });
  const file = process.env.DATABASE_FILE || path.join(config.dataDir, 'store.db');
  db = new Database(file);
  db.pragma('foreign_keys = ON');
  return db;
}

function migrate() {
  const database = open();
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  database.exec(schema);
  return database;
}

module.exports = {
  get db() {
    return open();
  },
  open,
  migrate,
};
