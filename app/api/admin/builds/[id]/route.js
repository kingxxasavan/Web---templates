import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { updateBuild, BuildError } from "@/lib/builds";

/** Status and delivery updates from the dashboard. Admins only. */
export async function POST(request, { params }) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  if (!isAdmin(await currentUser())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    await updateBuild(id, body, new URL(request.url).origin);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof BuildError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[admin] build update failed:", err);
    return NextResponse.json({ error: "That update didn't save. Please try again." }, { status: 500 });
  }
}
