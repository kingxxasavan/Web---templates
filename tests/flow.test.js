'use strict';

// End-to-end purchase flow against a real server instance, with a throwaway
// database. Uses the simulated checkout, which is the path anyone running this
// without Stripe keys will take.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fds-test-'));
process.env.DATA_DIR = tmp;
process.env.DATABASE_FILE = path.join(tmp, 'test.db');
process.env.SESSION_SECRET = 'test-secret-not-used-anywhere-real';
process.env.STRIPE_SECRET_KEY = '';
process.env.NODE_ENV = 'test';

const { createApp } = require('../src/server');
require('../src/db/seed');

let server;
let base;

// A tiny cookie-aware fetch, so the session survives across requests the way a
// browser's would.
function makeClient() {
  const jar = new Map();

  async function request(url, options = {}) {
    const headers = Object.assign({}, options.headers);
    if (jar.size) {
      headers.cookie = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
    }

    const response = await fetch(base + url, { ...options, headers, redirect: 'manual' });

    for (const raw of response.headers.getSetCookie?.() || []) {
      const [pair] = raw.split(';');
      const index = pair.indexOf('=');
      jar.set(pair.slice(0, index), pair.slice(index + 1));
    }
    return response;
  }

  /** Follow redirects manually so each hop can be asserted on. */
  async function follow(url, options, max = 5) {
    let response = await request(url, options);
    let hops = 0;
    while (response.status >= 300 && response.status < 400 && hops++ < max) {
      const location = response.headers.get('location');
      response = await request(location, { method: 'GET' });
    }
    return response;
  }

  async function csrfFrom(url) {
    const response = await request(url);
    const body = await response.text();
    const match = body.match(/name="_csrf" value="([a-f0-9]+)"/);
    assert.ok(match, `no CSRF token found on ${url}`);
    return match[1];
  }

  function form(fields) {
    return {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields).toString(),
    };
  }

  return { request, follow, csrfFrom, form, jar };
}

test.before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  if (server) server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('the storefront pages all render', async () => {
  const client = makeClient();
  for (const url of ['/', '/templates', '/find', '/pricing', '/tutorials', '/domains', '/cart', '/licence']) {
    const response = await client.request(url);
    assert.strictEqual(response.status, 200, `${url} returned ${response.status}`);
  }
});

test('an unknown template 404s rather than erroring', async () => {
  const client = makeClient();
  const response = await client.request('/templates/does-not-exist');
  assert.strictEqual(response.status, 404);
});

test('a live preview is served with the store banner injected', async () => {
  const client = makeClient();
  const response = await client.request('/preview/aurora-commerce/');
  assert.strictEqual(response.status, 200);
  const body = await response.text();
  assert.match(body, /fds-preview-banner/, 'the preview banner must be injected');
  assert.match(body, /Aurora/, 'the real template markup should still be there');
});

test('a POST without a CSRF token is rejected', async () => {
  const client = makeClient();
  await client.request('/'); // establish a session
  const response = await client.request('/cart/add/aurora-commerce', client.form({}));
  assert.strictEqual(response.status, 403);
});

test('the guided finder records a brief and returns ranked matches', async () => {
  const client = makeClient();
  const csrf = await client.csrfFrom('/find');

  const response = await client.request('/find', client.form({
    _csrf: csrf,
    category: 'restaurant',
    selling: 'services',
    style: 'warm',
    animation: 'subtle',
    features: 'menu',
    name: 'Ember Table',
  }));

  assert.strictEqual(response.status, 302);
  const results = await client.request(response.headers.get('location'));
  assert.strictEqual(results.status, 200);
  const body = await results.text();
  assert.match(body, /Ember Table/, 'the obvious match should be listed');
  assert.match(body, /% fit/, 'each match should show a fit score');
});

test('the domain finder returns ranked suggestions', async () => {
  const client = makeClient();
  const csrf = await client.csrfFrom('/domains');

  const response = await client.request('/domains/suggest', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
    // `check: false` keeps this test off the network.
    body: JSON.stringify({ name: 'Ember Table', keywords: 'pizza', category: 'restaurant', check: false }),
  });

  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert.ok(data.suggestions.length > 0);
  assert.strictEqual(data.suggestions[0].domain, 'embertable.com', 'the exact name should rank first');
  for (let i = 1; i < data.suggestions.length; i++) {
    assert.ok(data.suggestions[i - 1].score >= data.suggestions[i].score, 'suggestions came back unsorted');
  }
});

test('guest checkout: cart to paid order to a working download', async () => {
  const client = makeClient();

  // Add two templates and an add-on.
  let csrf = await client.csrfFrom('/templates/aurora-commerce');
  await client.request('/cart/add/aurora-commerce', client.form({ _csrf: csrf, redirect_to: '/cart' }));
  await client.request('/cart/add/quill-journal', client.form({ _csrf: csrf, redirect_to: '/cart' }));
  await client.request('/cart/addon/addon-motion', client.form({ _csrf: csrf, redirect_to: '/cart' }));

  const cart = await client.request('/cart');
  const cartBody = await cart.text();
  assert.match(cartBody, /Aurora Commerce/);
  assert.match(cartBody, /Quill Journal/);
  assert.match(cartBody, /Motion Pack/);

  // Check out as a guest.
  csrf = await client.csrfFrom('/checkout');
  const checkout = await client.request('/checkout', client.form({
    _csrf: csrf,
    email: 'buyer@example.com',
  }));
  assert.strictEqual(checkout.status, 303);
  const devUrl = checkout.headers.get('location');
  assert.match(devUrl, /^\/checkout\/dev\/FDS-/, 'should land on the simulated checkout');

  // The simulated checkout page must say plainly that nothing is charged.
  const devPage = await client.request(devUrl);
  const devBody = await devPage.text();
  assert.match(devBody, /Simulated checkout/i);
  assert.match(devBody, /nothing is charged/i);

  // Pay.
  csrf = await client.csrfFrom(devUrl);
  const paid = await client.request(devUrl, client.form({ _csrf: csrf }));
  assert.strictEqual(paid.status, 302);
  const receiptUrl = paid.headers.get('location');
  assert.match(receiptUrl, /^\/checkout\/receipt\/FDS-/);

  const receipt = await client.request(receiptUrl);
  const receiptBody = await receipt.text();
  assert.match(receiptBody, /Payment complete/);
  assert.match(receiptBody, /Set a password/, 'a guest should be offered the account we created for them');

  // The cart must be empty afterwards, or a refresh double-buys.
  const emptyCart = await client.request('/cart');
  assert.match(await emptyCart.text(), /Nothing in here yet/);

  // Claim the account.
  const reference = receiptUrl.split('/').pop();
  csrf = await client.csrfFrom(receiptUrl);
  const claimed = await client.request(`/checkout/claim/${reference}`, client.form({
    _csrf: csrf,
    password: 'a-good-enough-password',
  }));
  assert.strictEqual(claimed.status, 302);
  assert.strictEqual(claimed.headers.get('location'), '/account');

  // Both templates should now be owned.
  const account = await client.request('/account');
  const accountBody = await account.text();
  assert.match(accountBody, /Aurora Commerce/);
  assert.match(accountBody, /Quill Journal/);
  assert.match(accountBody, /Motion Pack/, 'the add-on should be recorded against the entitlement');

  // Downloading issues a one-time token and streams a zip.
  csrf = await client.csrfFrom('/account');
  const issue = await client.request('/account/download/aurora-commerce', client.form({ _csrf: csrf }));
  assert.strictEqual(issue.status, 302);
  const tokenUrl = issue.headers.get('location');

  const zip = await client.request(tokenUrl);
  assert.strictEqual(zip.status, 200);
  assert.strictEqual(zip.headers.get('content-type'), 'application/zip');
  const bytes = Buffer.from(await zip.arrayBuffer());
  assert.ok(bytes.length > 1000, 'the zip looks empty');
  assert.strictEqual(bytes.subarray(0, 2).toString(), 'PK', 'not a zip file');

  // The same token must not work twice.
  const replay = await client.request(tokenUrl);
  assert.strictEqual(replay.status, 410, 'a download token must be single-use');
});

test('a signed-out visitor cannot reach the account area', async () => {
  const client = makeClient();
  const response = await client.request('/account');
  assert.strictEqual(response.status, 302);
  assert.strictEqual(response.headers.get('location'), '/login');
});

test('you cannot download a template you do not own', async () => {
  const client = makeClient();

  // Register a fresh account that has bought nothing.
  let csrf = await client.csrfFrom('/register');
  const registered = await client.request('/register', client.form({
    _csrf: csrf,
    email: 'freeloader@example.com',
    password: 'another-good-password',
  }));
  assert.strictEqual(registered.status, 302);

  csrf = await client.csrfFrom('/account');
  const response = await client.request('/account/download/aurora-commerce', client.form({ _csrf: csrf }));
  assert.strictEqual(response.status, 403);
});

test('login rejects a wrong password without revealing whether the account exists', async () => {
  const client = makeClient();
  const csrf = await client.csrfFrom('/login');

  const wrongPassword = await client.request('/login', client.form({
    _csrf: csrf, email: 'buyer@example.com', password: 'not-the-password',
  }));
  const noSuchUser = await client.request('/login', client.form({
    _csrf: csrf, email: 'nobody@example.com', password: 'not-the-password',
  }));

  assert.strictEqual(wrongPassword.status, 401);
  assert.strictEqual(noSuchUser.status, 401);

  const a = await wrongPassword.text();
  const b = await noSuchUser.text();
  const message = /do not match an account/;
  assert.match(a, message);
  assert.match(b, message);
});

test('a path-traversal attempt on the preview route does not escape the templates directory', async () => {
  // fetch() normalises "../" out of a URL before it is sent, which would make
  // this test pass without ever reaching the server. Send the raw path down
  // the socket instead, the way an attacker would.
  function rawGet(rawPath) {
    return new Promise((resolve, reject) => {
      const request = http.request(
        { host: '127.0.0.1', port: server.address().port, path: rawPath, method: 'GET' },
        (response) => {
          let body = '';
          response.on('data', (chunk) => { body += chunk; });
          response.on('end', () => resolve({ status: response.statusCode, body }));
        }
      );
      request.on('error', reject);
      request.end();
    });
  }

  for (const attempt of [
    '/preview/aurora-commerce/../../package.json',
    '/preview/aurora-commerce/..%2f..%2fpackage.json',
    '/preview/..%2f..%2fsrc%2fconfig.js',
    '/preview/aurora-commerce/assets/../../../src/config.js',
  ]) {
    const response = await rawGet(attempt);
    assert.ok(response.status >= 400, `${attempt} returned ${response.status}`);
    assert.ok(!response.body.includes('STRIPE_SECRET_KEY'), `${attempt} leaked a source file`);
    assert.ok(!response.body.includes('"dependencies"'), `${attempt} leaked package.json`);
  }

  // The control: a legitimate path under the template still works, so the
  // assertions above are not passing because the route is simply broken.
  const ok = await rawGet('/preview/aurora-commerce/index.html');
  assert.strictEqual(ok.status, 200);
});
