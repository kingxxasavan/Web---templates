import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { getCart } from "@/lib/store";
import { readCart, addCartItem, removeCartItem, writeCart } from "@/lib/cart";
import { BUNDLE, isSellableSlug } from "@/lib/catalog";

export async function GET() {
  const user = await currentUser();
  return NextResponse.json(await getCart(user?.id, await readCart()));
}

/**
 * Works signed out: the cart is a cookie, and an account is only needed at
 * checkout. `upgrade` swaps the cart's contents for the bundle.
 */
export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const { slug, action = "add" } = await request.json().catch(() => ({}));

  let slugs;
  if (action === "upgrade") {
    slugs = await writeCart([BUNDLE.slug]);
  } else if (!isSellableSlug(slug)) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  } else if (action === "remove") {
    slugs = await removeCartItem(slug);
  } else {
    slugs = await addCartItem(slug);
  }

  const user = await currentUser();
  return NextResponse.json(await getCart(user?.id, slugs));
}
