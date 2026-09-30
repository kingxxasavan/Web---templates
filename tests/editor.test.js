import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  editorAccess,
  parseThemeVars,
  applyThemeVars,
  overrideCss,
  fontLinkHref,
  withFontLink,
  fontsFromOverrides,
  validateProject,
  FONT_CHOICES,
} from "../lib/editor-core.js";
import { TEMPLATES, bySlug } from "../lib/catalog.js";

const root = path.resolve(import.meta.dirname, "..");
const pro = TEMPLATES.find((t) => t.tier === "pro" && t.livePreview);
const starter = TEMPLATES.find((t) => t.tier === "starter");
const helix = bySlug("helix-ai");

describe("who can use the editor", () => {
  test("owners of Pro templates", () => {
    assert.ok(editorAccess(pro, { owned: new Set([pro.slug]) }).ok);
  });
  test("not people who don't own the template", () => {
    assert.equal(editorAccess(pro, { owned: new Set() }).reason, "not-owned");
  });
  test("Starter templates need All-access", () => {
    const owned = new Set([starter.slug]);
    assert.equal(editorAccess(starter, { owned }).reason, "needs-all-access");
    assert.ok(editorAccess(starter, { owned, allAccess: true }).ok);
  });
  test("never Helix, which is edited in code", () => {
    assert.equal(editorAccess(helix, { owned: new Set([helix.slug]), allAccess: true }).reason, "not-editable");
  });
});

describe("theme variables", () => {
  const css = `/* intro */\n:root {\n  --accent: #5b5bd6;\n  --ink: #16181d; /* note */\n  --radius: 14px;\n  --font-display: "Instrument Serif", Georgia, serif;\n  --container: 1180px;\n  --shadow: 0 4px 20px rgba(0,0,0,.1);\n}\n.btn { color: var(--accent); }\n:root { --accent: #000; }`;

  test("finds colours, fonts and radii, and nothing else", () => {
    const vars = parseThemeVars(css);
    assert.deepEqual(vars.map((v) => [v.name, v.kind]), [
      ["--accent", "color"],
      ["--ink", "color"],
      ["--radius", "radius"],
      ["--font-display", "font"],
    ]);
  });

  test("rewrites only the first :root block and keeps comments", () => {
    const out = applyThemeVars(css, { "--accent": "#ff0000", "--radius": "4px" });
    assert.match(out, /--accent: #ff0000;/);
    assert.match(out, /--radius: 4px;/);
    assert.match(out, /--ink: #16181d; \/\* note \*\//);
    assert.match(out, /:root \{ --accent: #000; \}/, "later blocks untouched");
  });

  test("refuses values that could break out of the stylesheet", () => {
    const out = applyThemeVars(css, { "--accent": "red; } body { display:none" });
    assert.match(out, /--accent: #5b5bd6;/);
    assert.equal(overrideCss({ "--accent": "x}</style><script>" }), "");
  });

  test("every template exposes an accent colour and fonts to edit", () => {
    for (const t of TEMPLATES.filter((t) => t.livePreview)) {
      const vars = parseThemeVars(readFileSync(path.join(root, "templates", t.slug, "assets/style.css"), "utf8"));
      assert.ok(vars.some((v) => v.name === "--accent" && v.kind === "color"), `${t.slug} accent`);
      assert.ok(vars.some((v) => v.kind === "font"), `${t.slug} fonts`);
    }
  });
});

describe("fonts", () => {
  const playfair = FONT_CHOICES.find((f) => f.id === "playfair");

  test("builds one Google Fonts link for the chosen fonts", () => {
    const href = fontLinkHref(["playfair", "inter", "playfair", "nope"]);
    assert.equal(href.match(/family=/g).length, 2);
    assert.match(href, /display=swap$/);
    assert.equal(fontLinkHref([]), null);
  });

  test("reads the chosen fonts back from the overrides", () => {
    assert.deepEqual(fontsFromOverrides({ "--font-display": playfair.stack, "--accent": "#000" }), ["playfair"]);
  });

  test("adds the link to a page once, and replaces it on re-export", () => {
    const html = "<!DOCTYPE html><html><head><title>x</title></head><body></body></html>";
    const once = withFontLink(html, ["playfair"]);
    const twice = withFontLink(once, ["inter"]);
    assert.equal(twice.match(/data-foundry-fonts/g).length, 1);
    assert.match(twice, /family=Inter/);
    assert.equal(withFontLink(once, []), html);
  });
});

describe("saving a project", () => {
  const page = "<!DOCTYPE html><html><head></head><body>Hi</body></html>";

  test("accepts the template's own pages", () => {
    assert.equal(validateProject({ pages: { "index.html": page }, overrides: { "--accent": "#123456" } }, pro), null);
  });
  test("rejects files that aren't part of the template", () => {
    assert.ok(validateProject({ pages: { "../../etc/passwd": page } }, pro));
    assert.ok(validateProject({ pages: { "evil.html": page } }, pro));
  });
  test("rejects oversized pages and unsafe style values", () => {
    assert.ok(validateProject({ pages: { "index.html": `<html>${"x".repeat(310_000)}</html>` } }, pro));
    assert.ok(validateProject({ pages: {}, overrides: { "--accent": "a;b" } }, pro));
    assert.ok(validateProject({ pages: {}, overrides: { "not-a-var": "#fff" } }, pro));
  });
});
