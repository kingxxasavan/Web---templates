import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { addToCart, removeFromCart, getCart } from "@/lib/store";
import {
  readGuestCart,
  addGuestItem,
  removeGuestItem,
} from "@/lib/guest-cart";
import { isSellableSlug } from "@/lib/catalog";

export async function GET() {
  const user = await currentUser();
  const guest = user ? [] : await readGuestCart();
  return NextResponse.json(await getCart(user?.id ?? null, guest));
}

/**
 * Works signed out. A visitor builds a cart in a cookie and only needs an
 * account at checkout, at which point the cookie cart is merged in.
 */
export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const { slug, action = "add" } = await request.json().catch(() => ({}));
  if (!isSellableSlug(slug)) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }

  const user = await currentUser();

  if (user) {
    if (action === "remove") await removeFromCart(user.id, slug);
    else await addToCart(user.id, slug);
    return NextResponse.json(await getCart(user.id));
  }

  const guest =
    action === "remove" ? await removeGuestItem(slug) : await addGuestItem(slug);
  return NextResponse.json(await getCart(null, guest));
}
