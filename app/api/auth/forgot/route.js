import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/auth";
import { firebaseAuth, authError } from "@/lib/firebase";
import { EMAIL_RE } from "@/lib/password";

export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const { email } = await request.json().catch(() => ({}));
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  try {
    await firebaseAuth("sendOobCode", { requestType: "PASSWORD_RESET", email: email.trim().toLowerCase() });
  } catch (error) {
    if (error.code !== "EMAIL_NOT_FOUND")
      return NextResponse.json({ error: authError(error) }, { status: 503 });
  }
  return NextResponse.json({ ok: true, message: "If that email has an account, a reset link is on its way." });
}
