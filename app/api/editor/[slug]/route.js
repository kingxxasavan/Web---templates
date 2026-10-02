import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { libraryFor } from "@/lib/store";
import { bySlug } from "@/lib/catalog";
import { editorAccess } from "@/lib/editor-core";
import { saveProject, deleteProject, ProjectError } from "@/lib/editor";

async function authorise(request, params) {
  if (!sameOrigin(request)) return { error: NextResponse.json({ error: "Bad origin" }, { status: 403 }) };
  const { slug } = await params;
  const template = bySlug(slug);
  const user = await currentUser();
  if (!user) return { error: NextResponse.json({ error: "Sign in to save your changes." }, { status: 401 }) };
  const access = editorAccess(template, await libraryFor(user.id));
  if (!access.ok) {
    return { error: NextResponse.json({ error: "The editor isn't unlocked for this template on your account." }, { status: 403 }) };
  }
  return { user, slug };
}

/** Saves the buyer's edits: changed pages and theme overrides. */
export async function PUT(request, { params }) {
  const { error, user, slug } = await authorise(request, params);
  if (error) return error;

  const project = await request.json().catch(() => null);
  try {
    const saved = await saveProject(user.id, slug, project);
    return NextResponse.json({ ok: true, updatedAt: saved.updatedAt });
  } catch (err) {
    if (err instanceof ProjectError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[editor] save failed:", err);
    return NextResponse.json({ error: "Your changes couldn't be saved. Please try again." }, { status: 500 });
  }
}

/** Starts over from the original template. */
export async function DELETE(request, { params }) {
  const { error, user, slug } = await authorise(request, params);
  if (error) return error;
  await deleteProject(user.id, slug);
  return NextResponse.json({ ok: true });
}
