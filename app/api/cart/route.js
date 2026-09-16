import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { addToCart, removeFromCart, getCart } from "@/lib/store";
import { isSellableSlug } from "@/lib/catalog";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ items: [], subtotalCents: 0 });
  return NextResponse.json(await getCart(user.id));
}

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to add items to your cart.", needsAuth: true },
      { status: 401 }
    );
  }

  const { slug, action = "add" } = await request.json().catch(() => ({}));
  if (!isSellableSlug(slug)) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }

  if (action === "remove") await removeFromCart(user.id, slug);
  else await addToCart(user.id, slug);

  return NextResponse.json(await getCart(user.id));
}
