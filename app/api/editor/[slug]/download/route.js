import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { libraryFor } from "@/lib/store";
import { bySlug } from "@/lib/catalog";
import { editorAccess } from "@/lib/editor-core";
import { loadProject, buildCustomZip } from "@/lib/editor";

/** The buyer's customised site as a zip, built from their saved project. */
export async function GET(_request, { params }) {
  const { slug } = await params;
  const template = bySlug(slug);

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in to download." }, { status: 401 });
  if (!editorAccess(template, await libraryFor(user.id)).ok) {
    return NextResponse.json({ error: "The editor isn't unlocked for this template." }, { status: 403 });
  }

  try {
    const zip = await buildCustomZip(slug, await loadProject(user.id, slug));
    return new NextResponse(zip, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": String(zip.length),
        "Content-Disposition": `attachment; filename="${slug}-custom.zip"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[editor] export failed:", err);
    return NextResponse.json({ error: "The download couldn't be built. Please try again." }, { status: 500 });
  }
}
