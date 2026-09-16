import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { owns } from "@/lib/store";
import { BUNDLE, TEMPLATES, isSellableSlug } from "@/lib/catalog";

const DIR = path.join(process.cwd(), "private", "downloads");

/**
 * The only way to reach a zip. The files sit outside public/, so a direct URL
 * cannot serve them — every download passes the ownership check below.
 */
export async function GET(_request, { params }) {
  const { slug } = await params;

  // Validated against the catalogue before it ever touches a path, which
  // rules out traversal via a crafted slug.
  if (!isSellableSlug(slug)) {
    return NextResponse.json({ error: "Unknown product." }, { status: 404 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to download." }, { status: 401 });
  }

  const entitled =
    slug === BUNDLE.slug
      ? (await Promise.all(TEMPLATES.map((t) => owns(user.id, t.slug)))).every(Boolean)
      : await owns(user.id, slug);

  if (!entitled) {
    return NextResponse.json(
      { error: "You don't own this template." },
      { status: 403 }
    );
  }

  const file = path.join(DIR, `${path.basename(slug)}.zip`);
  try {
    await stat(file);
  } catch {
    return NextResponse.json(
      { error: "Download is being rebuilt. Try again shortly." },
      { status: 503 }
    );
  }

  const body = await readFile(file);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(body.length),
      "Content-Disposition": `attachment; filename="${slug}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
