'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');

const file = process.env.DATABASE_FILE || path.join(config.dataDir, 'store.db');
for (const suffix of ['', '-wal', '-shm']) {
  fs.rmSync(file + suffix, { force: true });
}
console.log('Database removed. Run `npm run db:seed` to rebuild it.');
