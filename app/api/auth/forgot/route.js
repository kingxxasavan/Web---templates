import { NextResponse } from "next/server";
import { sameOrigin, findUserByEmail } from "@/lib/auth";
import { createPasswordReset } from "@/lib/accounts";
import { sendEmail, resetEmail } from "@/lib/email";
import { EMAIL_RE } from "@/lib/password";

// Always the same answer, whether or not the address is registered — the
// response must not reveal who has an account.
const ACK = {
  ok: true,
  message: "If that email has an account, a reset link is on its way.",
};

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const { email } = await request.json().catch(() => ({}));
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const normalised = email.trim().toLowerCase();
  const user = await findUserByEmail(normalised);

  if (user) {
    const token = await createPasswordReset(user.id);
    const origin = new URL(request.url).origin;
    await sendEmail(resetEmail({ email: normalised, token, origin }));
  }

  return NextResponse.json(ACK);
}
