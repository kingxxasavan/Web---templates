import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { TEMPLATES, CATALOG, CATEGORIES, TIERS } from "../lib/catalog.js";
import { briefText, recommend } from "../lib/brief.js";
import { validateReview, maskEmail } from "../lib/reviews.js";
import { validateMessage } from "../lib/inbox.js";
import { validateBrief } from "../lib/builds.js";
import { GUIDES, GUIDE_GROUPS } from "../lib/guides.js";

const root = path.resolve(import.meta.dirname, "..");

describe("catalogue integrity", () => {
  for (const t of TEMPLATES) {
    test(`${t.slug} ships everything a buyer is promised`, () => {
      const dir = path.join(root, "templates", t.slug);
      assert.ok(existsSync(dir), "template folder");
      assert.ok(existsSync(path.join(dir, "README.md")), "README.md");
      assert.ok(existsSync(path.join(dir, "LICENSE.txt")), "LICENSE.txt");
      assert.ok(existsSync(path.join(root, "public", "thumbs", `${t.slug}.webp`)), "thumbnail");
      assert.ok(CATEGORIES.includes(t.category), `category ${t.category}`);
      assert.ok(TIERS[t.tier], `tier ${t.tier}`);
      if (t.livePreview) {
        for (const p of t.pageList) {
          assert.ok(existsSync(path.join(dir, p.file)), `page ${p.file}`);
        }
      }
    });
  }
});

describe("review validation", () => {
  const ok = { rating: 5, title: "Great", body: "Shipped my bakery site in an evening." };

  test("accepts a normal review", () => assert.equal(validateReview(ok), null));
  test("rejects ratings outside 1 to 5", () => {
    assert.ok(validateReview({ ...ok, rating: 0 }));
    assert.ok(validateReview({ ...ok, rating: 6 }));
    assert.ok(validateReview({ ...ok, rating: 4.5 }));
  });
  test("rejects a body that is too short", () => assert.ok(validateReview({ ...ok, body: "meh" })));
  test("rejects a non-string title", () => assert.ok(validateReview({ ...ok, title: { x: 1 } })));
  test("masks the author's email", () => {
    assert.equal(maskEmail("jordan@example.com"), "jo***@example.com");
    assert.equal(maskEmail("not-an-email"), "A buyer");
  });
});

describe("contact validation", () => {
  const ok = { name: "Sam", email: "sam@example.com", kind: "request", message: "A site for a dog groomer, please." };

  test("accepts a normal message", () => assert.equal(validateMessage(ok), null));
  test("needs a real email", () => assert.ok(validateMessage({ ...ok, email: "sam@" })));
  test("needs a known topic", () => assert.ok(validateMessage({ ...ok, kind: "spam" })));
  test("needs some detail", () => assert.ok(validateMessage({ ...ok, message: "hi" })));
  test("needs a name", () => assert.ok(validateMessage({ ...ok, name: "  " })));
});

describe("Made-for-you briefs", () => {
  const ok = {
    template: "ember-table",
    business: "Crumb & Co",
    about: "A family bakery: sourdough, pastries and celebration cakes.",
    email: "owner@example.com",
  };

  test("accepts a minimal brief, with or without a template", () => {
    assert.equal(validateBrief(ok), null);
    assert.equal(validateBrief({ ...ok, template: "" }), null);
  });
  test("needs the three required fields", () => {
    assert.ok(validateBrief({ ...ok, business: " " }));
    assert.ok(validateBrief({ ...ok, about: "Bakery" }));
    assert.ok(validateBrief({ ...ok, email: "nope" }));
  });
  test("takes inspiration from any catalogue template, and nothing else", () => {
    assert.equal(validateBrief({ ...ok, inspiration: "helix-ai" }), null);
    assert.ok(validateBrief({ ...ok, inspiration: "../x" }));
    assert.ok(validateBrief({ ...ok, template: "../x" }));
  });
  test("checks the wizard answers", () => {
    const full = {
      ...ok,
      businessType: "food",
      tones: ["Warm", "Friendly"],
      pageList: [{ name: "Home", notes: "Opening hours" }, { name: "Menu", notes: "" }],
      palette: ["#6b3f2a", "#d9a441", "#faf6f0", "#2a1d16"],
    };
    assert.equal(validateBrief(full), null);
    assert.ok(validateBrief({ ...full, businessType: "casino" }));
    assert.ok(validateBrief({ ...full, tones: ["Warm", "Loud"] }));
    assert.ok(validateBrief({ ...full, tones: ["Warm", "Calm", "Bold", "Playful"] }));
    assert.ok(validateBrief({ ...full, palette: ["red", "#d9a441", "#faf6f0", "#2a1d16"] }));
    assert.ok(validateBrief({ ...full, pageList: Array.from({ length: 11 }, (_, i) => ({ name: `Page ${i}` })) }));
    assert.ok(validateBrief({ ...full, inspirationUrl: "javascript:alert(1)" }));
  });
  test("reads as one brief", () => {
    const text = briefText({
      business: "Crumb & Co",
      businessType: "food",
      inspiration: "ember-table",
      inspirationName: "Ember Table",
      tones: ["Warm"],
      pageList: [{ name: "Home", notes: "Opening hours" }, { name: "Menu" }],
      palette: ["#6b3f2a", "#d9a441", "#faf6f0", "#2a1d16"],
    });
    assert.match(text, /^Build a 2-page website for Crumb & Co, a restaurant or café\./);
    assert.match(text, /Take inspiration from the Ember Table template\./);
    assert.match(text, /1\. Home — Opening hours\n2\. Menu/);
    assert.match(text, /Colours: brand #6b3f2a, accent #d9a441, background #faf6f0, text #2a1d16\./);
  });
  test("recommends five templates, the right kind first", () => {
    const picks = recommend(CATALOG, "food");
    assert.equal(picks.length, 5);
    assert.equal(picks[0].category, "Restaurants & food");
  });
  test("checks links and lengths", () => {
    assert.ok(validateBrief({ ...ok, assetsUrl: "javascript:alert(1)" }));
    assert.equal(validateBrief({ ...ok, assetsUrl: "https://drive.google.com/x" }), null);
    assert.ok(validateBrief({ ...ok, content: "x".repeat(7000) }));
  });
});

describe("guides", () => {
  test("every guide has a unique slug, a known group and steps", () => {
    const slugs = new Set(GUIDES.map((g) => g.slug));
    assert.equal(slugs.size, GUIDES.length);
    for (const g of GUIDES) {
      assert.ok(GUIDE_GROUPS.some((grp) => grp.kind === g.kind), g.slug);
      assert.ok(g.steps.length >= 3, g.slug);
      assert.ok(g.time && g.cost && g.difficulty, g.slug);
    }
  });
  test("covers the platforms the store promises", () => {
    for (const s of ["netlify", "vercel", "cloudflare-pages", "github-pages", "firebase-hosting", "shared-hosting", "shopify", "wordpress"]) {
      assert.ok(GUIDES.some((g) => g.slug === s), s);
    }
  });
});
