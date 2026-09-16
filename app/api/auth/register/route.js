import { NextResponse } from "next/server";
import {
  createUser,
  createSession,
  findUserByEmail,
  validateCredentials,
  sameOrigin,
} from "@/lib/auth";

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const { email, password } = await request.json().catch(() => ({}));
  const problem = validateCredentials(email, password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const normalised = email.trim().toLowerCase();
  if (await findUserByEmail(normalised)) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const user = await createUser(normalised, password);
  await createSession(user.id);
  return NextResponse.json({ ok: true, email: user.email });
}
