import { NextResponse } from "next/server";
import {
  findUserByEmail,
  verifyPassword,
  createSession,
  tooManyAttempts,
  recordAttempt,
  clearAttempts,
  sameOrigin,
} from "@/lib/auth";

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const { email, password } = await request.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  if (await tooManyAttempts(normalised)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const user = await findUserByEmail(normalised);
  const ok = user && (await verifyPassword(password, user.password));

  if (!ok) {
    await recordAttempt(normalised);
    // Deliberately identical whether the email exists or the password is
    // wrong, so the response cannot be used to enumerate accounts.
    return NextResponse.json(
      { error: "Email or password is incorrect." },
      { status: 401 }
    );
  }

  await clearAttempts(normalised);
  await createSession(user.id);
  return NextResponse.json({ ok: true, email: user.email });
}
