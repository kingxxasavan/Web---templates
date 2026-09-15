'use strict';

const dns = require('dns').promises;

// Word banks used to build candidate names. Kept small and on-brand rather than
// exhaustive — a short list of good suffixes beats a long list of bad ones.
const PREFIXES = ['get', 'go', 'try', 'the', 'hey', 'join'];
const SUFFIXES_BY_CATEGORY = {
  ecommerce: ['shop', 'store', 'goods', 'supply', 'market'],
  portfolio: ['studio', 'works', 'folio', 'design', 'made'],
  saas: ['app', 'hq', 'labs', 'stack', 'cloud'],
  restaurant: ['kitchen', 'table', 'eats', 'dining', 'house'],
  business: ['group', 'co', 'partners', 'agency', 'studio'],
  blog: ['journal', 'notes', 'reads', 'letter', 'press'],
};
const TLDS_BY_CATEGORY = {
  ecommerce: ['.com', '.store', '.shop', '.co'],
  portfolio: ['.com', '.studio', '.design', '.me'],
  saas: ['.com', '.io', '.app', '.dev'],
  restaurant: ['.com', '.kitchen', '.restaurant', '.co'],
  business: ['.com', '.co', '.agency', '.io'],
  blog: ['.com', '.blog', '.press', '.co'],
};

function slugifyWords(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean);
}

function unique(list) {
  return [...new Set(list)];
}

/**
 * Build candidate domains from a brief.
 * @param {Object} brief { name, keywords, category }
 * @param {Object} [opts] { limit }
 */
function suggest(brief = {}, opts = {}) {
  const limit = opts.limit || 24;
  const category = brief.category && SUFFIXES_BY_CATEGORY[brief.category] ? brief.category : 'business';
  // The brand name and the descriptive keywords are ranked differently: the
  // name is what the buyer wants to register, the keywords only supply fallbacks.
  const nameWords = slugifyWords(brief.name);
  const keywordWords = slugifyWords(brief.keywords).filter((w) => !nameWords.includes(w));
  const words = unique([...nameWords, ...keywordWords]);

  if (!words.length) return [];

  const exact = nameWords.join('');
  const stems = unique([
    exact,
    nameWords[0],
    nameWords.slice(0, 2).join(''),
    ...keywordWords.slice(0, 2),
    keywordWords.slice(0, 2).join(''),
  ]).filter((s) => s && s.length >= 3 && s.length <= 20);

  const suffixes = SUFFIXES_BY_CATEGORY[category];
  const tlds = TLDS_BY_CATEGORY[category];

  const bases = unique([
    ...stems,
    ...stems.slice(0, 2).flatMap((s) => suffixes.slice(0, 3).map((suffix) => `${s}${suffix}`)),
    ...stems.slice(0, 2).flatMap((s) => PREFIXES.slice(0, 3).map((prefix) => `${prefix}${s}`)),
  ]).filter((b) => b.length >= 3 && b.length <= 24);

  const candidates = [];
  for (const base of bases) {
    // A distinctive base is one that combines words or carries a prefix/suffix.
    // Bare generic words like "wood" score well on length but are always taken,
    // so they must not outrank a compound the buyer could actually register.
    const distinctive =
      base === exact ||
      base.length > Math.max(...words.map((w) => w.length)) ||
      words.filter((w) => base.includes(w)).length > 1;
    for (const tld of tlds) {
      candidates.push({
        domain: `${base}${tld}`,
        base,
        tld,
        score: scoreDomain(base, tld, { distinctive, isExactName: base === exact }),
      });
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score || a.domain.length - b.domain.length)
    .slice(0, limit);
}

/**
 * Heuristic quality score, 0-100. Shorter is better, an exact-match .com is
 * best, hyphens and digits are penalised, and a bare dictionary word that
 * ignores the rest of the brief is pushed down because it is never available.
 */
function scoreDomain(base, tld, { distinctive = true, isExactName = false } = {}) {
  let score = 60;
  if (!distinctive) score -= 25;
  if (tld === '.com') score += 18;
  if (base.length <= 8) score += 12;
  else if (base.length <= 12) score += 6;
  else if (base.length > 18) score -= 10;
  // The buyer's own name, exactly, is the suggestion they most want to see.
  if (isExactName) score += 20;
  if (/\d/.test(base)) score -= 12;
  if (base.includes('-')) score -= 15;
  if (/(.)\1\1/.test(base)) score -= 8;
  return Math.max(0, Math.min(100, score));
}

/**
 * Indicative availability via DNS. A domain with no NS records is very likely
 * unregistered; one with NS records is definitely taken. This is a hint, not a
 * registry lookup — the UI says so, and a registrar is still the source of
 * truth. Returns 'taken' | 'likely-available' | 'unknown'.
 */
async function checkAvailability(domain, { timeoutMs = 2500 } = {}) {
  try {
    const records = await withTimeout(dns.resolveNs(domain), timeoutMs);
    return records && records.length ? 'taken' : 'likely-available';
  } catch (err) {
    if (err && (err.code === 'ENOTFOUND' || err.code === 'NXDOMAIN')) return 'likely-available';
    if (err && err.code === 'ENODATA') return 'unknown';
    return 'unknown';
  }
}

async function checkMany(domains, { concurrency = 6, timeoutMs = 2500 } = {}) {
  const results = new Map();
  const queue = [...domains];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const domain = queue.shift();
      results.set(domain, await checkAvailability(domain, { timeoutMs }));
    }
  });
  await Promise.all(workers);
  return results;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), ms)),
  ]);
}

module.exports = { suggest, scoreDomain, checkAvailability, checkMany };
