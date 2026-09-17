import { NextResponse } from "next/server";
import { mergeGuestCart } from "@/lib/store";
import { readGuestCart, clearGuestCart } from "@/lib/guest-cart";
import { guardWrite } from "@/lib/db-errors";
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

  return guardWrite(async () => {
    if (await findUserByEmail(normalised)) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const user = await createUser(normalised, password);
    await createSession(user.id);

    // Carry anything picked out before signing up into the new account.
    const guest = await readGuestCart();
    if (guest.length) {
      await mergeGuestCart(user.id, guest);
      await clearGuestCart();
    }

    return NextResponse.json({
      ok: true,
      email: user.email,
      merged: guest.length,
    });
  }, NextResponse.json);
}
