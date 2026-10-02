import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/auth";
import { EMAIL_RE, subscribe } from "@/lib/inbox";

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const { email, website, source } = await request.json().catch(() => ({}));
  if (website) return NextResponse.json({ ok: true }); // honeypot
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await subscribe(email, typeof source === "string" ? source.slice(0, 40) : "site");
  } catch (err) {
    console.error("[subscribe] failed:", err);
    return NextResponse.json(
      { error: "That didn't go through. Please try again in a minute." },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true });
}
