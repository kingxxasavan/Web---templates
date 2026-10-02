import { readFile } from "node:fs/promises";
import path from "node:path";
import { unzipSync, zipSync, strToU8, strFromU8 } from "fflate";
import { backend } from "./backend.js";
import { readOrFallback } from "./db.js";
import { bySlug, themeFileOf } from "./catalog.js";
import {
  applyThemeVars,
  fontsFromOverrides,
  validateProject,
  withFontLink,
} from "./editor-core.js";

/**
 * Saved editor projects and the customised download.
 *
 * A project holds only the pages the buyer edited, plus their theme
 * overrides. The export starts from the template's normal download and
 * overlays those edits, so every asset, the README and the licence ship
 * exactly as they do in the plain zip.
 */

const ZIPS = path.join(process.cwd(), "private", "downloads");

export async function loadProject(userId, slug) {
  return readOrFallback(() => backend().loadProject(userId, slug), null);
}

export class ProjectError extends Error {}

export async function saveProject(userId, slug, project) {
  const template = bySlug(slug);
  const problem = validateProject(project, template);
  if (problem) throw new ProjectError(problem);

  const record = {
    pages: project.pages ?? {},
    overrides: project.overrides ?? {},
    updatedAt: Date.now(),
  };
  await backend().saveProject(userId, slug, record);
  return record;
}

export async function deleteProject(userId, slug) {
  await backend().deleteProject(userId, slug);
}

/** The template's download with the buyer's edits applied, as a zip. */
export async function buildCustomZip(slug, project) {
  const template = bySlug(slug);
  const pages = project?.pages ?? {};
  const overrides = project?.overrides ?? {};
  const fonts = fontsFromOverrides(overrides);
  const themeFile = `${template.slug}/${themeFileOf(template)}`;

  const files = unzipSync(new Uint8Array(await readFile(path.join(ZIPS, `${template.slug}.zip`))));
  for (const [key, bytes] of Object.entries(files)) {
    const rel = key.slice(template.slug.length + 1);
    if (rel.endsWith(".html") && !rel.includes("/")) {
      const html = pages[rel] ?? strFromU8(bytes);
      files[key] = strToU8(withFontLink(html, fonts));
    } else if (key === themeFile) {
      files[key] = strToU8(applyThemeVars(strFromU8(bytes), overrides));
    }
  }
  return zipSync(files, { level: 6 });
}
