import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { createOrder } from "@/lib/store";
import { startPayment } from "@/lib/payments";
import { readCart, clearCart } from "@/lib/cart";

/** Turns the cart into an order, priced server-side, and takes payment. */
export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) {
    // The cart survives in its cookie; the visitor returns here after signing up.
    return NextResponse.json(
      {
        error: "Create a free account to complete your purchase — your cart is saved.",
        needsAuth: true,
        redirect: "/register?next=%2Fcart",
      },
      { status: 401 }
    );
  }

  let order;
  try {
    order = await createOrder(user, await readCart(), process.env.STRIPE_SECRET_KEY ? "stripe" : "simulated");
  } catch (err) {
    const empty = err.message === "Your cart is empty.";
    if (!empty) console.error("[checkout] order failed:", err);
    return NextResponse.json(
      { error: empty ? err.message : "We couldn't start checkout. Please try again." },
      { status: empty ? 400 : 500 }
    );
  }

  const origin = new URL(request.url).origin;
  try {
    const { redirect, paid } = await startPayment(order, user, origin, {
      // Stripe returns through a route that clears the cart cookie first.
      successUrl: `/api/checkout/success?order=${order.id}`,
    });
    if (paid) await clearCart();
    return NextResponse.json({ ok: true, redirect });
  } catch (err) {
    console.error("[checkout] payment failed to start:", err);
    return NextResponse.json({ error: "We couldn't start checkout. Please try again." }, { status: 500 });
  }
}
