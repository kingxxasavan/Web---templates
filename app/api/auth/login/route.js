import { describeDbError } from "@/lib/db-errors";
import { NextResponse } from "next/server";
import { sameOrigin, createFirebaseSession, validateCredentials } from "@/lib/auth";
import { firebaseAuth, authError } from "@/lib/firebase";
import { syncFirebaseAccount } from "@/lib/firebase-account";
import { mergeGuestCart } from "@/lib/store";
import { readGuestCart, clearGuestCart } from "@/lib/guest-cart";

export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const { email, password } = await request.json().catch(() => ({}));
  const problem = typeof email !== "string" || typeof password !== "string" || !email.trim() || !password || email.length > 254 || password.length > 200 ? "Enter your email and password." : null;
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  try {
    const credentials = await firebaseAuth("signInWithPassword", {
      email: email.trim().toLowerCase(), password, returnSecureToken: true,
    });
    const identity = (await firebaseAuth("lookup", { idToken: credentials.idToken })).users[0];
    const user = await syncFirebaseAccount(identity, password);
    const guest = await readGuestCart();
    await mergeGuestCart(user.id, guest);
    await createFirebaseSession(credentials.refreshToken);
    await clearGuestCart();
    return NextResponse.json({ ok: true, email: user.email });
  } catch (error) {
    console.error("login failed", error.code || error.message);
    if (!error.code && !error.publicMessage) {
      const {status, message, reason} = describeDbError(error);
      return NextResponse.json({error: message, reason}, {status});
    }
    return NextResponse.json({ error: error.publicMessage || authError(error) }, { status: error.code ? 400 : 503 });
  }
}
