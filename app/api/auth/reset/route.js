import { NextResponse } from "next/server";
import { sameOrigin, destroySession } from "@/lib/auth";
import { firebaseAuth, authError } from "@/lib/firebase";

export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const { token, password } = await request.json().catch(() => ({}));
  if (typeof token !== "string" || !token || typeof password !== "string" || password.length < 8 || password.length > 200)
    return NextResponse.json({ error: "Enter a valid reset code and a password of 8–200 characters." }, { status: 400 });
  try {
    await firebaseAuth("resetPassword", { oobCode: token, newPassword: password });
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: authError(error) }, { status: 400 });
  }
}
