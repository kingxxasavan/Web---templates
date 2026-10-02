/**
 * Step-by-step guides for putting a template online and wiring it up.
 * Dashboards get redesigned now and then, so steps name the section to look
 * for rather than exact button positions.
 *
 * kind: "host"   — somewhere the whole site can live
 *       "store"  — a site builder that can't host an HTML site outright
 *       "topic"  — something to set up once the site is live
 */

const HELIX_NEXT =
  "Helix is a Next.js project rather than plain HTML, so it needs a host that runs Next.js: Vercel, Netlify or Firebase App Hosting.";

export const GUIDES = [
  {
    slug: "netlify",
    name: "Netlify",
    kind: "host",
    time: "2 minutes",
    cost: "Free plan",
    difficulty: "Easiest",
    bestFor: "The fastest way to get live, with no account setup beyond signing in.",
    steps: [
      { title: "Unzip your download", body: "You'll have a folder named after the template, containing index.html." },
      { title: "Open Netlify Drop", body: "Go to app.netlify.com/drop and sign in (or create a free account)." },
      { title: "Drag the folder in", body: "Drop the template folder, not the zip, onto the page. Netlify uploads it and gives you a live address ending in netlify.app." },
      { title: "Rename the site", body: "Under Site configuration, choose Change site name and pick something memorable." },
      { title: "Add your domain", body: "Domain management → Add a domain. Netlify shows the DNS records to add at your registrar, and issues the HTTPS certificate for you." },
    ],
    notes: [
      "Forms work with no extra service: add data-netlify=\"true\" and a name attribute to the <form> tag, and submissions appear under Forms in your dashboard.",
      "To update the site later, open Deploys and drag the folder in again.",
    ],
    helix: "Helix deploys here too: push it to GitHub and choose Add new site → Import an existing project.",
  },
  {
    slug: "vercel",
    name: "Vercel",
    kind: "host",
    time: "5 minutes",
    cost: "Free Hobby plan (paid plans for commercial use)",
    difficulty: "Easy",
    bestFor: "Anyone already using GitHub, and the best home for Helix.",
    steps: [
      { title: "Put the folder on GitHub", body: "Create a new repository and upload the template folder's contents (GitHub's Add file → Upload files works fine)." },
      { title: "Import it", body: "Go to vercel.com/new, choose the repository and click Import." },
      { title: "Deploy", body: "Vercel detects a static site and needs no settings. Click Deploy and you're live on a vercel.app address." },
      { title: "Add your domain", body: "Project → Settings → Domains → Add. Vercel lists the DNS records to set at your registrar." },
    ],
    notes: [
      "Every change you push to GitHub redeploys automatically.",
      "No GitHub? Install the CLI with npm i -g vercel, then run vercel inside the folder.",
      "Vercel's free Hobby plan is for personal, non-commercial projects. A business site should use a paid plan, or Netlify or Cloudflare Pages.",
    ],
    helix: "Helix is a Next.js app, and Vercel runs it with no configuration at all.",
  },
  {
    slug: "cloudflare-pages",
    name: "Cloudflare Pages",
    kind: "host",
    time: "5 minutes",
    cost: "Free, including commercial use",
    difficulty: "Easy",
    bestFor: "Fast, free hosting with unlimited bandwidth, especially if your domain is already on Cloudflare.",
    steps: [
      { title: "Open Workers & Pages", body: "In the Cloudflare dashboard, go to Workers & Pages → Create, and choose the Pages option." },
      { title: "Upload your folder", body: "Pick Upload assets (Direct Upload), name the project, then drag in the template folder or its zip." },
      { title: "Deploy", body: "Click Deploy site. You're live on a pages.dev address within seconds." },
      { title: "Add your domain", body: "Open the project → Custom domains → Set up a domain. If the domain uses Cloudflare DNS, the records are added for you." },
    ],
    notes: [
      "Prefer the command line? Run npx wrangler pages deploy ./your-template-folder.",
      "You can connect a GitHub repository instead, so every push redeploys.",
    ],
    helix: "Helix can run on Cloudflare with the OpenNext adapter (@opennextjs/cloudflare), but Vercel or Netlify is simpler.",
  },
  {
    slug: "github-pages",
    name: "GitHub Pages",
    kind: "host",
    time: "5 minutes",
    cost: "Free",
    difficulty: "Easy",
    bestFor: "Portfolios, personal sites and anyone who already has a GitHub account.",
    steps: [
      { title: "Create a repository", body: "On github.com, click New repository and make it public." },
      { title: "Upload the files", body: "Add file → Upload files, and drag in everything inside the template folder, so index.html sits at the top level." },
      { title: "Turn on Pages", body: "Settings → Pages → Build and deployment → Deploy from a branch → main, / (root) → Save." },
      { title: "Visit your site", body: "After a minute it's live at your-username.github.io/repository-name. Name the repository your-username.github.io to serve it at the root." },
      { title: "Add your domain", body: "In the same Pages settings, enter a Custom domain and follow the DNS instructions GitHub shows." },
    ],
    notes: ["GitHub Pages only serves static files, so forms need a service such as Formspree (see the forms guide)."],
    helix: HELIX_NEXT,
  },
  {
    slug: "firebase-hosting",
    name: "Firebase Hosting",
    kind: "host",
    time: "10 minutes",
    cost: "Free Spark plan",
    difficulty: "Moderate",
    bestFor: "Anyone already using Firebase for sign-in or a database.",
    steps: [
      { title: "Install the tools", body: "With Node.js installed, run npm install -g firebase-tools, then firebase login." },
      { title: "Set up hosting", body: "Inside the template folder, run firebase init hosting. Choose your project, type . as the public directory, and answer No to single-page app and to overwriting index.html." },
      { title: "Deploy", body: "Run firebase deploy. You're live on a web.app address." },
      { title: "Add your domain", body: "Firebase console → Hosting → Add custom domain, then add the records it gives you at your registrar." },
    ],
    notes: ["Deploying again later is just firebase deploy from the same folder."],
    helix: "Helix runs on Firebase App Hosting, which builds Next.js apps straight from GitHub.",
  },
  {
    slug: "shared-hosting",
    name: "cPanel & shared hosting",
    kind: "host",
    time: "10 minutes",
    cost: "Whatever your host charges",
    difficulty: "Easy",
    bestFor: "Hostinger, GoDaddy, Namecheap, Bluehost, SiteGround or any host that gives you cPanel, hPanel or FTP.",
    steps: [
      { title: "Open File Manager", body: "Log in to your hosting control panel and open File Manager, or connect with an FTP app such as FileZilla." },
      { title: "Go to public_html", body: "This folder is your website's root. Move anything already there (like a default index page) into a backup folder." },
      { title: "Upload and extract", body: "Upload the zip, then right-click it → Extract. Move the files out of the template folder so index.html sits directly in public_html." },
      { title: "Check it", body: "Visit your domain. index.html loads as the home page, and every other page links from it." },
    ],
    notes: [
      "Most hosts include a free SSL certificate. Turn it on in the SSL/TLS or Security section so your site loads on https://.",
      "Forms need a service such as Formspree, since shared hosting won't process them for you.",
    ],
    helix: "Most shared hosting can't run Next.js. Put Helix on Vercel or Netlify and point your domain there.",
  },
  {
    slug: "shopify",
    name: "Shopify",
    kind: "store",
    time: "15–30 minutes",
    cost: "Your Shopify plan",
    difficulty: "Moderate",
    bestFor: "Selling products through Shopify while using a Foundry template for your brand site.",
    summary:
      "Shopify stores run on Shopify's own theme system, so you can't upload an HTML template as your Shopify theme. There are three good ways to use them together.",
    steps: [
      { title: "Option 1: brand site plus shop", body: "Host the template anywhere (Netlify, Cloudflare Pages…) at yourdomain.com, and point shop.yourdomain.com at Shopify under Settings → Domains. Link the template's Shop buttons to your Shopify store." },
      { title: "Option 2: Buy Buttons on your site", body: "In Shopify, add the Buy Button sales channel, create a button for each product, and paste the embed code into your template where the product cards are. Aurora Commerce's product grid is a natural home for them." },
      { title: "Option 3: individual sections in your theme", body: "In Online Store → Themes → Customize, add a Custom Liquid section and paste in the HTML for a section from the template, with its CSS in a <style> tag. Good for a hero, story or FAQ block." },
      { title: "Keep checkout on Shopify", body: "Whichever option you pick, payments, stock and orders stay in Shopify, so nothing about running your store changes." },
    ],
    notes: [
      "Turning a template into a full Shopify theme means rebuilding it in Shopify's Liquid language, which is a developer job.",
      "Aurora Commerce can also take payments without Shopify, using Stripe Payment Links (see the payments guide).",
    ],
  },
  {
    slug: "wordpress",
    name: "WordPress",
    kind: "store",
    time: "10–20 minutes",
    cost: "Your hosting plan",
    difficulty: "Moderate",
    bestFor: "Adding a template alongside, or instead of, a WordPress site.",
    summary:
      "WordPress builds pages from its own themes, so a Foundry template doesn't install as a WordPress theme. It can live next to WordPress, or replace it.",
    steps: [
      { title: "Replacing WordPress", body: "If you only need a simple site, you don't need WordPress at all. Upload the template to public_html instead (see the shared hosting guide), after backing up your WordPress files." },
      { title: "Next to WordPress", body: "Upload the template into a subfolder of public_html (for example /launch) and it's live at yourdomain.com/launch while WordPress keeps running." },
      { title: "On a subdomain", body: "Create a subdomain in your hosting panel, such as shop.yourdomain.com, and upload the template to its folder." },
      { title: "Borrow a section", body: "For a single block, add a Custom HTML block in the WordPress editor and paste in the section's HTML. The template's full styling needs its CSS too, so this suits simple sections best." },
    ],
    notes: ["WordPress.com's lower plans don't allow file uploads like this. Self-hosted WordPress (WordPress.org) does."],
  },
  {
    slug: "squarespace-wix",
    name: "Squarespace & Wix",
    kind: "store",
    time: "10 minutes",
    cost: "Free to move",
    difficulty: "Easy",
    bestFor: "Anyone moving from a site builder to their own site.",
    summary:
      "Squarespace and Wix don't let you upload your own HTML site. Their Code blocks and Embed elements take small snippets, not whole pages. The simple route is to host the template elsewhere and point your domain at it.",
    steps: [
      { title: "Host the template", body: "Put it on Netlify, Cloudflare Pages or Vercel first. All three have free plans." },
      { title: "If the domain was bought through Squarespace or Wix", body: "Keep it there and change its DNS records to the ones your new host gives you, or transfer the domain to a registrar such as Cloudflare or Namecheap." },
      { title: "If the domain is elsewhere", body: "Update its DNS at your registrar to point at the new host instead of Squarespace or Wix." },
      { title: "Cancel the old plan", body: "Once the new site is live on your domain, you can end your site-builder subscription." },
    ],
    notes: ["Only need one small piece on your existing site? Squarespace's Code block and Wix's Embed HTML element can hold a single section."],
  },
  {
    slug: "custom-domain",
    name: "Connecting your domain",
    kind: "topic",
    time: "10 minutes, plus DNS time",
    cost: "About $10–15 a year for the domain",
    difficulty: "Easy",
    bestFor: "Putting your site on yourbusiness.com instead of a host's address.",
    steps: [
      { title: "Buy a domain", body: "Any registrar works: Cloudflare, Namecheap, Porkbun, GoDaddy or Squarespace Domains." },
      { title: "Add it at your host", body: "In your host's Domains section, add both yourdomain.com and www.yourdomain.com. The host shows the DNS records it needs." },
      { title: "Add the records at your registrar", body: "Usually an A record (or ALIAS/flattened CNAME) for the root domain and a CNAME for www. Copy the values exactly." },
      { title: "Wait, then check", body: "DNS changes usually take minutes, occasionally a few hours. Your host issues the HTTPS certificate automatically once it sees the records." },
    ],
    notes: ["Pick one version (with or without www) as the main address and let the host redirect the other to it."],
  },
  {
    slug: "forms",
    name: "Making your forms work",
    kind: "topic",
    time: "5 minutes",
    cost: "Free tiers available",
    difficulty: "Easy",
    bestFor: "Contact, booking and newsletter forms on any host.",
    steps: [
      { title: "Choose a form service", body: "Formspree and Getform work on any host. On Netlify you can use Netlify Forms instead." },
      { title: "Formspree", body: "Create a form at formspree.io, copy its endpoint, and set it as the form's action, with method=\"POST\". Submissions arrive in your inbox." },
      { title: "Netlify Forms", body: "Add data-netlify=\"true\" and a unique name attribute to the <form> tag, then redeploy. Submissions appear under Forms in Netlify." },
      { title: "Test it", body: "Send yourself a message from the live site and confirm it arrives. The template's validation still runs before anything is sent." },
    ],
    notes: ["Each template's README points to the exact form to edit."],
  },
  {
    slug: "payments",
    name: "Taking payments",
    kind: "topic",
    time: "15 minutes",
    cost: "The payment provider's fees",
    difficulty: "Easy",
    bestFor: "Selling products or taking deposits from a static site.",
    steps: [
      { title: "Stripe Payment Links", body: "In Stripe, create a Payment Link for each product or price. Paste each link into the matching Buy button's href. No server or plugin needed." },
      { title: "Shopify Buy Button", body: "Already on Shopify? Its Buy Button channel gives you embed code for each product, with cart and checkout handled by Shopify." },
      { title: "Snipcart", body: "For a full cart on a static site, add Snipcart's script and data attributes to your product buttons. It suits Aurora Commerce's product grid well." },
      { title: "Test before launch", body: "Use each provider's test mode to run a full purchase before switching to live payments." },
    ],
    notes: ["Aurora Commerce's README shows where each product's button lives."],
  },
];

export const GUIDE_GROUPS = [
  { kind: "host", title: "Hosting", blurb: "Everywhere your template can live, most of them free." },
  { kind: "store", title: "Store and site builders", blurb: "Using a template with Shopify, WordPress, Squarespace or Wix." },
  { kind: "topic", title: "After you launch", blurb: "Domains, forms and payments." },
];

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug) ?? null;
