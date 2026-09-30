/**
 * Editor logic shared by the browser editor and the server export, kept free
 * of DOM and Node APIs so every rule is unit tested.
 *
 * A template is themed entirely from the custom properties in the first
 * `:root { … }` block of assets/style.css, so the editor's style controls are
 * built from — and written back to — exactly that block.
 */

/** Who may use the editor on a template, and why not. */
export function editorAccess(template, { owned = new Set(), allAccess = false } = {}) {
  if (!template) return { ok: false, reason: "unknown" };
  // Helix is a Next.js project: there is no HTML page to edit in a browser.
  if (!template.livePreview) return { ok: false, reason: "not-editable" };
  if (!owned.has(template.slug)) return { ok: false, reason: "not-owned" };
  // Starter templates unlock the editor through All-access.
  if (template.tier === "starter" && !allAccess) return { ok: false, reason: "needs-all-access" };
  return { ok: true, reason: null };
}

/* ------------------------------------------------------------ theme vars */

function rootBlock(css) {
  const start = css.search(/:root\s*\{/);
  if (start === -1) return null;
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  if (close === -1) return null;
  return { open, close, body: css.slice(open + 1, close) };
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const PX = /^(\d+(?:\.\d+)?)px$/;

const label = (name) =>
  name
    .replace(/^--/, "")
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

/**
 * The theme variables a buyer can change: hex colours, font stacks and
 * corner radii. Layout values (container width, gutters) are left alone.
 */
export function parseThemeVars(css) {
  const block = rootBlock(css);
  if (!block) return [];
  const vars = [];
  for (const m of block.body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const [, name, raw] = m;
    const value = raw.trim();
    let kind = null;
    if (/font/.test(name)) kind = "font";
    else if (HEX.test(value)) kind = "color";
    else if (/radius/.test(name) && PX.test(value)) kind = "radius";
    if (kind) vars.push({ name, value, kind, label: label(name) });
  }
  return vars;
}

/** A value the editor may write into CSS: nothing that can close a rule. */
export function safeCssValue(value) {
  return typeof value === "string" && value.length <= 160 && !/[;{}<>\\]/.test(value);
}

/** Returns the stylesheet with the given variables replaced in :root. */
export function applyThemeVars(css, overrides = {}) {
  const block = rootBlock(css);
  if (!block) return css;
  let body = block.body;
  for (const [name, value] of Object.entries(overrides)) {
    if (!/^--[\w-]+$/.test(name) || !safeCssValue(value)) continue;
    const re = new RegExp(`(${name.replace(/[-]/g, "\\-")}\\s*:\\s*)([^;]+)(;)`);
    body = body.replace(re, (_, a, _old, c) => `${a}${value}${c}`);
  }
  return css.slice(0, block.open + 1) + body + css.slice(block.close);
}

/** `:root { … }` overriding the given variables, for the live preview. */
export function overrideCss(overrides = {}) {
  const decls = Object.entries(overrides)
    .filter(([name, value]) => /^--[\w-]+$/.test(name) && safeCssValue(value))
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ");
  return decls ? `:root { ${decls} }` : "";
}

/* ----------------------------------------------------------------- fonts */

/** Google Fonts a buyer can switch to. `google` is the css2 family param. */
export const FONT_CHOICES = [
  { id: "inter", label: "Inter", stack: '"Inter", system-ui, sans-serif', google: "Inter:wght@400;500;600;700" },
  { id: "dm-sans", label: "DM Sans", stack: '"DM Sans", system-ui, sans-serif', google: "DM+Sans:wght@400;500;700" },
  { id: "manrope", label: "Manrope", stack: '"Manrope", system-ui, sans-serif', google: "Manrope:wght@400;500;700;800" },
  { id: "space-grotesk", label: "Space Grotesk", stack: '"Space Grotesk", system-ui, sans-serif', google: "Space+Grotesk:wght@400;500;700" },
  { id: "archivo", label: "Archivo", stack: '"Archivo", system-ui, sans-serif', google: "Archivo:wght@400;600;800" },
  { id: "oswald", label: "Oswald", stack: '"Oswald", "Arial Narrow", sans-serif', google: "Oswald:wght@400;600;700" },
  { id: "instrument-serif", label: "Instrument Serif", stack: '"Instrument Serif", Georgia, serif', google: "Instrument+Serif:ital@0;1" },
  { id: "playfair", label: "Playfair Display", stack: '"Playfair Display", Georgia, serif', google: "Playfair+Display:wght@400;600;700" },
  { id: "fraunces", label: "Fraunces", stack: '"Fraunces", Georgia, serif', google: "Fraunces:wght@400;600;700" },
  { id: "cormorant", label: "Cormorant Garamond", stack: '"Cormorant Garamond", Georgia, serif', google: "Cormorant+Garamond:wght@400;600;700" },
  { id: "libre-baskerville", label: "Libre Baskerville", stack: '"Libre Baskerville", Georgia, serif', google: "Libre+Baskerville:ital,wght@0,400;0,700;1,400" },
  { id: "jetbrains-mono", label: "JetBrains Mono", stack: '"JetBrains Mono", ui-monospace, monospace', google: "JetBrains+Mono:wght@400;500" },
];

export const fontById = (id) => FONT_CHOICES.find((f) => f.id === id) ?? null;

/** One stylesheet link that loads every chosen font, or null. */
export function fontLinkHref(fontIds = []) {
  const families = [...new Set(fontIds)].map(fontById).filter(Boolean);
  if (!families.length) return null;
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f.google}`).join("&")}&display=swap`;
}

/** Adds (or replaces) the editor's font link in a page's <head>. */
export function withFontLink(html, fontIds = []) {
  const cleaned = html.replace(/\s*<link[^>]*data-foundry-fonts[^>]*>/g, "");
  const href = fontLinkHref(fontIds);
  if (!href) return cleaned;
  const tag = `<link rel="stylesheet" href="${href}" data-foundry-fonts>`;
  // Inserted as "\n  <link …>" so removing it later restores the page exactly.
  return cleaned.replace(/\s*<\/head>/i, (end) => `\n  ${tag}${end}`);
}

/** Font ids referenced by the chosen overrides, for the font link. */
export function fontsFromOverrides(overrides = {}) {
  return Object.entries(overrides)
    .filter(([name]) => /font/.test(name))
    .map(([, value]) => FONT_CHOICES.find((f) => f.stack === value)?.id)
    .filter(Boolean);
}

/* --------------------------------------------------------------- project */

export const MAX_PAGE_BYTES = 300_000;
export const MAX_PROJECT_BYTES = 900_000; // Firestore's limit is 1 MiB

/**
 * Checks a saved project before it is stored: only the template's own pages,
 * sane sizes, and theme values that can't break out of the stylesheet.
 */
export function validateProject(project, template) {
  if (!project || typeof project !== "object") return "Nothing to save.";
  const { pages = {}, overrides = {} } = project;
  const allowed = new Set(template.pageList.map((p) => p.file));

  if (typeof pages !== "object" || Array.isArray(pages)) return "Pages are not valid.";
  let total = 0;
  for (const [file, html] of Object.entries(pages)) {
    if (!allowed.has(file)) return `${file} is not part of this template.`;
    if (typeof html !== "string" || !/<html[\s>]/i.test(html)) return `${file} is not a valid page.`;
    const size = new TextEncoder().encode(html).length;
    if (size > MAX_PAGE_BYTES) return `${file} is too large to save.`;
    total += size;
  }
  if (total > MAX_PROJECT_BYTES) return "This project is too large to save.";

  if (typeof overrides !== "object" || Array.isArray(overrides)) return "Style changes are not valid.";
  for (const [name, value] of Object.entries(overrides)) {
    if (!/^--[\w-]+$/.test(name) || !safeCssValue(value)) return `The value for ${name} is not allowed.`;
  }
  return null;
}
