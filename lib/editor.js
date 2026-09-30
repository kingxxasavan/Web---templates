import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";
import { db, readOrFallback } from "./firebase-admin.js";
import { bySlug } from "./catalog.js";
import {
  applyThemeVars,
  fontsFromOverrides,
  validateProject,
  withFontLink,
} from "./editor-core.js";

/**
 * Saved editor projects and the customised download.
 *
 *   users/{uid}/projects/{slug}   pages (only the edited ones), overrides
 *
 * The export starts from the original template folder on disk and overlays
 * the buyer's edits, so every asset, the README and the licence ship exactly
 * as they do in the normal download.
 */

const SRC = path.join(process.cwd(), "templates");

const projectRef = async (uid, slug) =>
  (await db()).collection("users").doc(uid).collection("projects").doc(slug);

export async function loadProject(uid, slug) {
  return readOrFallback(async () => {
    const snap = await (await projectRef(uid, slug)).get();
    if (!snap.exists) return null;
    const { pages = {}, overrides = {}, updatedAt = null } = snap.data();
    return { pages, overrides, updatedAt };
  }, null);
}

export class ProjectError extends Error {}

export async function saveProject(uid, slug, project) {
  const template = bySlug(slug);
  const problem = validateProject(project, template);
  if (problem) throw new ProjectError(problem);

  const record = {
    pages: project.pages ?? {},
    overrides: project.overrides ?? {},
    updatedAt: Date.now(),
  };
  await (await projectRef(uid, slug)).set(record);
  return record;
}

export async function deleteProject(uid, slug) {
  await (await projectRef(uid, slug)).delete();
}

async function listFiles(dir, prefix = "") {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...(await listFiles(path.join(dir, entry.name), rel)));
    else out.push(rel);
  }
  return out;
}

/** The template folder with the buyer's edits applied, as a zip. */
export async function buildCustomZip(slug, project) {
  const template = bySlug(slug);
  const dir = path.join(SRC, template.slug);
  const pages = project?.pages ?? {};
  const overrides = project?.overrides ?? {};
  const fonts = fontsFromOverrides(overrides);

  const files = {};
  for (const rel of await listFiles(dir)) {
    const abs = path.join(dir, rel);
    const key = `${template.slug}/${rel}`;
    if (rel.endsWith(".html")) {
      const html = pages[rel] ?? (await readFile(abs, "utf8"));
      files[key] = strToU8(withFontLink(html, fonts));
    } else if (rel === "assets/style.css") {
      files[key] = strToU8(applyThemeVars(await readFile(abs, "utf8"), overrides));
    } else {
      files[key] = new Uint8Array(await readFile(abs));
    }
  }
  return zipSync(files, { level: 6 });
}
