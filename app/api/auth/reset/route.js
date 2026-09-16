import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/auth";
import { resetPassword, checkPasswordReset } from "@/lib/accounts";

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const { token, password } = await request.json().catch(() => ({}));

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (password.length > 200) {
    return NextResponse.json({ error: "Password is too long." }, { status: 400 });
  }

  const userId = await resetPassword(token, password);
  if (!userId) {
    return NextResponse.json(
      { error: "That reset link has expired or already been used." },
      { status: 400 }
    );
  }

  // Sessions were cleared by the reset, so the user signs in fresh.
  return NextResponse.json({ ok: true });
}

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token");
  const userId = await checkPasswordReset(token);
  return NextResponse.json({ valid: Boolean(userId) });
}
