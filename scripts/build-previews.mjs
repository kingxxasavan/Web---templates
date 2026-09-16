/**
 * Copies the static templates into public/preview/<slug>/ so they can be shown
 * live — in the tour and in the walkthrough on each product page.
 *
 * A live demo is what makes the tour honest: the visitor really is inside the
 * template. The trade-off is that a served template's markup is viewable, the
 * same as on any template marketplace. The paid artefact remains the packaged
 * source, its README and its licence, which still only come through the
 * authorised download route.
 *
 * Templates that need a build step (livePreview: false) are skipped.
 */
import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { TEMPLATES } from "../lib/catalog.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "templates");
const OUT = path.join(ROOT, "public", "preview");

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  let copied = 0;
  for (const t of TEMPLATES) {
    if (!t.livePreview) continue;

    await cp(path.join(SRC, t.slug), path.join(OUT, t.slug), {
      recursive: true,
      filter: (src) => !/(README\.md|LICENSE\.txt)$/.test(src),
    });

    const files = await readdir(path.join(OUT, t.slug));
    console.log(`  ${t.slug} — ${files.length} entries`);
    copied++;
  }

  // Belt and braces alongside the noindex header in next.config.mjs.
  await writeFile(
    path.join(OUT, "robots.txt"),
    "User-agent: *\nDisallow: /preview/\n"
  );

  console.log(`previews ready for ${copied} templates`);
}

main().catch((e) => {
  console.error("preview build failed:", e.message);
  process.exit(1);
});
