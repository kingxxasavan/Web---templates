import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { validateMessage, saveMessage } from "@/lib/inbox";

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  // A hidden field real visitors never fill in. Bots that do get a quiet "ok".
  if (body.website) return NextResponse.json({ ok: true });

  const problem = validateMessage(body);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  try {
    await saveMessage(body, await currentUser());
  } catch (err) {
    console.error("[contact] could not save message:", err);
    return NextResponse.json(
      { error: "Your message couldn't be sent just now. Please try again in a minute." },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true });
}
