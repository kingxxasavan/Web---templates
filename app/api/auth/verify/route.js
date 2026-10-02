import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { idTokenFor, sendVerificationEmail } from "@/lib/firebase";

/** Re-sends the email that confirms the signed-in user owns their address. */
export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (user.emailVerified) return NextResponse.json({ ok: true, verified: true });
  try {
    const idToken = await idTokenFor((await cookies()).get("firebase_refresh")?.value);
    if (!idToken) throw new Error("No session");
    await sendVerificationEmail(idToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("verify email failed", err.code || err.message);
    return NextResponse.json({ error: "We couldn't send the email just now. Try again in a minute." }, { status: 503 });
  }
}
