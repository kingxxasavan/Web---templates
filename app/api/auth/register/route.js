import { describeAuthRequestError } from "@/lib/auth-errors";
import { NextResponse } from "next/server";
import { sameOrigin, createFirebaseSession, validateCredentials } from "@/lib/auth";
import { firebaseAuth } from "@/lib/firebase";
import { syncFirebaseAccount } from "@/lib/firebase-account";
import { mergeGuestCart } from "@/lib/store";
import { readGuestCart, clearGuestCart } from "@/lib/guest-cart";

export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const { email, password } = await request.json().catch(() => ({}));
  const problem = validateCredentials(email, password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  try {
    const credentials = await firebaseAuth("signUp", {
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
    console.error("register failed", error.code || error.message);
    const {status, ...data} = describeAuthRequestError(error);
    return NextResponse.json(data, {status});
  }
}
