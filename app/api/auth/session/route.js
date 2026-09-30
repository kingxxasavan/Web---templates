import { NextResponse } from "next/server";
import { createSession, destroySession, sameOrigin, AuthError } from "@/lib/auth";
import { firebaseConfigured } from "@/lib/firebase-admin";

/**
 * Exchanges a fresh Firebase ID token from the browser for an httpOnly
 * session cookie. Called straight after sign-up, sign-in or Google sign-in.
 */
export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  if (!firebaseConfigured()) {
    console.error("[auth] FIREBASE_SERVICE_ACCOUNT is not set; cannot create sessions.");
    return NextResponse.json(
      { error: "Accounts are temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const { idToken } = await request.json().catch(() => ({}));

  try {
    const user = await createSession(idToken);
    return NextResponse.json({ ok: true, email: user.email });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[auth] session exchange failed:", err);
    return NextResponse.json(
      { error: "We couldn't finish signing you in. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
