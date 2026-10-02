import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { TEMPLATES, CATEGORIES, TIERS } from "../lib/catalog.js";
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
  test("only builds on HTML templates", () => {
    assert.ok(validateBrief({ ...ok, template: "helix-ai" }));
    assert.ok(validateBrief({ ...ok, template: "../x" }));
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
