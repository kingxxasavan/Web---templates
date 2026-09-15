'use strict';

// Tutorial content lives as data rather than markdown files so the detail page
// can render a consistent step/code structure and the index can show real
// step counts without parsing anything.

module.exports = [
  {
    slug: 'getting-started',
    title: 'From zip to a site on your screen',
    minutes: 4,
    level: 'Beginner',
    blurb: 'Unpack a template, open it in a browser, and make your first edit. No build tools, no terminal required.',
    steps: [
      {
        heading: 'Unzip it',
        body: 'Every template downloads as a single zip. Unzip it anywhere — Desktop is fine. Inside you get one folder named after the template.',
        code: `aurora-commerce/
├── index.html        ← the homepage
├── about.html
├── product.html
├── assets/
│   ├── style.css     ← all the styling
│   ├── app.js        ← the interactive bits
│   └── img/
├── README.md         ← template-specific notes
└── LICENCE.txt       ← your licence, with your email on it`,
        lang: 'text',
      },
      {
        heading: 'Open it',
        body: 'Double-click index.html. It opens in your browser and works immediately — the templates are plain HTML, CSS and JavaScript with no build step.',
      },
      {
        heading: 'Change the first thing',
        body: 'Open index.html in any text editor. Find the headline and type over it. Save, then refresh the browser. That is the whole edit loop.',
        code: `<!-- before -->
<h1 class="hero__title">Objects for the long haul</h1>

<!-- after -->
<h1 class="hero__title">Hand-thrown ceramics, made in Leeds</h1>`,
        lang: 'html',
      },
      {
        heading: 'Use a local server when you need one',
        body: 'Opening a file directly works for everything except fetch() calls, which browsers block on file:// URLs. If a template loads data from a JSON file, run a one-line server instead.',
        code: `# from inside the template folder
npx serve .
# or, if you have Python
python3 -m http.server 8000`,
        lang: 'bash',
      },
    ],
  },
  {
    slug: 'deploy-your-site',
    title: 'Putting it online, free',
    minutes: 6,
    level: 'Beginner',
    blurb: 'Three ways to host a template for nothing: Netlify drag-and-drop, GitHub Pages, and Cloudflare Pages.',
    steps: [
      {
        heading: 'Netlify — the thirty-second version',
        body: 'Go to app.netlify.com/drop and drag your unzipped template folder onto the page. You get a live URL immediately. This is the fastest path from download to a link you can send someone.',
      },
      {
        heading: 'GitHub Pages — if you want version history',
        body: 'Create a repository, push the template folder contents to it, then enable Pages in Settings → Pages with the branch set to main and the folder set to root.',
        code: `cd aurora-commerce
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main`,
        lang: 'bash',
      },
      {
        heading: 'Cloudflare Pages — if you expect traffic',
        body: 'Connect the same repository at dash.cloudflare.com → Workers & Pages → Create → Pages. Leave the build command empty and set the output directory to /. Cloudflare serves it from their edge network with no configuration.',
      },
      {
        heading: 'A note on paths',
        body: 'All templates use relative asset paths, so they work from a subdirectory as well as a domain root. If you see unstyled HTML after deploying, the output directory is almost certainly set one level too high.',
      },
    ],
  },
  {
    slug: 'change-colours-and-fonts',
    title: 'Making it look like yours',
    minutes: 5,
    level: 'Beginner',
    blurb: 'Every template is themed through CSS custom properties at the top of one file. Change five values, change the whole site.',
    steps: [
      {
        heading: 'Find the theme block',
        body: 'Open assets/style.css. The first rule in every template is a :root block holding the entire palette and type scale.',
        code: `:root {
  --accent: #5b5bd6;
  --accent-soft: #ececfb;
  --ink: #16181d;
  --ink-muted: #5c6270;
  --surface: #ffffff;
  --surface-alt: #f6f7f9;
  --border: #e4e6ec;
  --radius: 14px;
  --font-display: "Instrument Serif", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
}`,
        lang: 'css',
      },
      {
        heading: 'Change the accent first',
        body: 'The accent drives buttons, links, focus rings and highlights. Change --accent and --accent-soft together — the soft variant is the same hue at about 92% lightness, used for tinted backgrounds.',
      },
      {
        heading: 'Swap the fonts',
        body: 'Pick two fonts on fonts.google.com, copy the <link> tag into the <head> of each HTML file, then update the two font variables. Keep the fallbacks: they are what visitors see for the first 200ms.',
        code: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&display=swap" rel="stylesheet">`,
        lang: 'html',
      },
      {
        heading: 'Check the dark theme too',
        body: 'Templates with a dark mode define a second palette under a [data-theme="dark"] selector further down the same file. Change both, or the toggle will look broken.',
      },
    ],
  },
  {
    slug: 'contact-forms-that-work',
    title: 'Making the contact form actually send',
    minutes: 5,
    level: 'Beginner',
    blurb: 'The forms ship validated but unwired, because where they send depends on you. Three options, no backend needed.',
    steps: [
      {
        heading: 'Why it is not wired already',
        body: 'A form needs somewhere to post. Hard-coding a service would mean signing you up for it. The markup is ready — you supply the endpoint.',
      },
      {
        heading: 'Formspree — fastest',
        body: 'Create a form at formspree.io, then paste its endpoint into the action attribute. Nothing else changes.',
        code: `<form class="contact-form" method="POST"
      action="https://formspree.io/f/YOUR_FORM_ID">
  <input name="email" type="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>`,
        lang: 'html',
      },
      {
        heading: 'Netlify Forms — free if you host there',
        body: 'Add one attribute. Netlify detects the form at deploy time and collects submissions in your dashboard.',
        code: `<form class="contact-form" name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact">
  ...
</form>`,
        lang: 'html',
      },
      {
        heading: 'Your own endpoint',
        body: 'If you already run a server, post JSON to it and keep the visitor on the page.',
        code: `form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form));
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  form.querySelector('[data-status]').textContent =
    response.ok ? 'Thanks — we will reply within a day.' : 'That did not send. Try again?';
});`,
        lang: 'javascript',
      },
    ],
  },
  {
    slug: 'take-payments',
    title: 'Taking payments from a template',
    minutes: 10,
    level: 'Intermediate',
    blurb: 'Turn the cart in Aurora Commerce or Atelier Lookbook into a real Stripe checkout. About forty lines of server code.',
    steps: [
      {
        heading: 'What ships and what does not',
        body: 'The templates include the cart: adding, removing, quantities, totals, and persistence in localStorage. They do not include a server, because taking card details requires one — your Stripe secret key can never be in front-end code.',
      },
      {
        heading: 'Stand up a tiny server',
        body: 'One endpoint that turns a cart into a Stripe Checkout session.',
        code: `const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(express.static('.'));

app.post('/api/checkout', async (req, res) => {
  // Never trust prices from the browser — look them up server-side.
  const lineItems = req.body.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: 'usd',
      unit_amount: PRODUCTS[item.sku].priceCents,
      product_data: { name: PRODUCTS[item.sku].name },
    },
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: process.env.BASE_URL + '/thanks.html',
    cancel_url: process.env.BASE_URL + '/cart.html',
  });

  res.json({ url: session.url });
});

app.listen(3000);`,
        lang: 'javascript',
      },
      {
        heading: 'Point the cart button at it',
        body: 'In assets/app.js, find the checkout handler and replace the placeholder with a call to your endpoint.',
        code: `checkoutButton.addEventListener('click', async () => {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart.items }),
  });
  const { url } = await response.json();
  window.location = url;
});`,
        lang: 'javascript',
      },
      {
        heading: 'Confirm with a webhook, not the success page',
        body: 'A buyer can close the tab before the redirect. Treat the checkout.session.completed webhook as the moment the order is real — that is exactly how this store does it, in src/routes/checkout.js.',
      },
    ],
  },
  {
    slug: 'connect-your-domain',
    title: 'Pointing a domain at your site',
    minutes: 6,
    level: 'Beginner',
    blurb: 'You bought the domain. Here is the DNS part, which is the bit nobody explains properly.',
    steps: [
      {
        heading: 'Two records, that is all',
        body: 'An A record maps the bare domain (example.com) to an IP address. A CNAME maps a subdomain (www.example.com) to another hostname. Your host tells you which values to use; you add them at your registrar.',
        code: `Type   Name   Value                    TTL
A      @      75.2.60.5                3600
CNAME  www    your-site.netlify.app    3600`,
        lang: 'text',
      },
      {
        heading: 'Add them at the registrar',
        body: 'Find the DNS or Nameservers section wherever you bought the domain. Add the records exactly as your host gave them. The @ symbol means the bare domain.',
      },
      {
        heading: 'Wait, then check',
        body: 'DNS changes propagate in minutes to a few hours. Check from the command line rather than reloading the browser, which caches aggressively.',
        code: `dig example.com +short
dig www.example.com +short`,
        lang: 'bash',
      },
      {
        heading: 'Turn on HTTPS',
        body: 'Netlify, Vercel, Cloudflare and GitHub Pages all issue a free certificate automatically once DNS resolves. If the toggle is greyed out, DNS has not propagated yet — wait rather than changing anything.',
      },
    ],
  },
  {
    slug: 'add-analytics',
    title: 'Knowing whether anyone visited',
    minutes: 4,
    level: 'Beginner',
    blurb: 'Add privacy-friendly analytics in one line, and find out which page people actually leave from.',
    steps: [
      {
        heading: 'Pick one',
        body: 'Plausible and Fathom are paid, cookie-free and need no consent banner in most jurisdictions. GoatCounter is free for personal sites. Google Analytics is free and thorough, but it needs a cookie banner in the EU and UK.',
      },
      {
        heading: 'Add the script',
        body: 'One tag in the <head> of every HTML file. Templates keep the head block identical across pages, so it is a find-and-replace.',
        code: `<script defer data-domain="example.com"
        src="https://plausible.io/js/script.js"></script>`,
        lang: 'html',
      },
      {
        heading: 'Track the events that matter',
        body: 'Page views tell you little on a one-page site. Track the click you care about instead.',
        code: `document.querySelector('[data-cta="buy"]').addEventListener('click', () => {
  window.plausible?.('Checkout started');
});`,
        lang: 'javascript',
      },
      {
        heading: 'Read it once a week, not once an hour',
        body: 'Look at the exit page and the referrer. The exit page tells you where the site loses people; the referrer tells you which of your posts was worth writing.',
      },
    ],
  },
];
