/**
 * Packages each template in templates/ into private/downloads/<slug>.zip (served only through the authorised API route),
 * plus one bundle zip containing all of them.
 *
 * Runs before `next build`, so the downloads always match the source in the
 * repo and nothing stale gets committed. Anything a buyer shouldn't receive
 * (dependencies, build output, local env) is excluded here.
 */
import { createWriteStream } from "node:fs";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "templates");
const OUT = path.join(ROOT, "private", "downloads");

const EXCLUDE = ["node_modules/**", ".next/**", ".env*", "**/.DS_Store", "out/**"];

async function zip(entries, outFile) {
  await mkdir(path.dirname(outFile), { recursive: true });
  return new Promise((resolve, reject) => {
    const out = createWriteStream(outFile);
    const archive = archiver("zip", { zlib: { level: 9 } });
    out.on("close", () => resolve(archive.pointer()));
    archive.on("warning", (e) => {
      if (e.code !== "ENOENT") reject(e);
    });
    archive.on("error", reject);
    archive.pipe(out);
    for (const { dir, prefix } of entries) {
      archive.glob("**/*", { cwd: dir, dot: true, ignore: EXCLUDE }, { prefix });
    }
    archive.finalize();
  });
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function main() {
  await rm(OUT, { recursive: true, force: true });

  const slugs = (await readdir(SRC, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  if (!slugs.length) throw new Error(`No templates found in ${SRC}`);

  const all = [];
  for (const slug of slugs) {
    const dir = path.join(SRC, slug);
    const size = await zip([{ dir, prefix: slug }], path.join(OUT, `${slug}.zip`));
    all.push({ dir, prefix: slug });
    console.log(`  ${slug}.zip — ${kb(size)}`);
  }

  const bundleSize = await zip(all, path.join(OUT, "everything.zip"));
  console.log(`  everything.zip — ${kb(bundleSize)}`);
  console.log(`packaged ${slugs.length} templates`);
}

main().catch((e) => {
  console.error("zip build failed:", e.message);
  process.exit(1);
});
