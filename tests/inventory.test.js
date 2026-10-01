import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, stat, mkdtemp, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { TEMPLATES, priceOf } from "../lib/catalog.js";
import { downloadStream } from "../lib/download-stream.js";
const root = path.resolve(import.meta.dirname, "..");

test("all imported designs have source notices, usable pages and artwork previews", async () => {
 const imported = TEMPLATES.filter(t => t.source);
 assert.ok(imported.length >= 50);
 for (const t of imported) {
  assert.ok(priceOf(t) >= 500 && priceOf(t) <= 1500, t.slug);
  const dir = path.join(root, "templates", t.slug);
  const source = JSON.parse(await readFile(path.join(dir, "SOURCE.json"), "utf8"));
  assert.equal(source.license, t.source.license);
  const license = await readFile(path.join(dir, "LICENSE.txt"), "utf8");
  assert.match(license, /Creative Commons Attribution|MIT License/);
  const guide = await readFile(path.join(dir, "README.md"), "utf8");
  assert.ok(guide.includes(t.source.url));
  assert.ok(guide.includes("available free"));
  for (const page of t.pageList) {
   const html = await readFile(path.join(dir, page.file), "utf8");
   assert.match(html, /foundry\.css/);
   assert.match(html, /foundry\.js/);
   assert.doesNotMatch(html, /user-scalable=no/);
  }
  assert.ok((await stat(path.join(root, "public", "thumbs", t.slug + ".webp"))).size > 1000, t.slug);
 }
});

test("large downloads stream intact beyond the buffered-response size limit", async () => {
 const dir = await mkdtemp(path.join(tmpdir(), "foundry-download-"));
 const file = path.join(dir, "large.zip");
 const data = Buffer.alloc(6 * 1024 * 1024, 0x53);
 try {
  await writeFile(file, data);
  const reader = downloadStream(file).getReader();
  let bytes = 0, chunks = 0;
  while (true) {
   const { done, value } = await reader.read(); if (done) break;
   assert.ok(value.every(byte => byte === 0x53)); bytes += value.length; chunks++;
  }
  assert.equal(bytes, data.length);
  assert.ok(chunks > 1);
 } finally { await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
});
