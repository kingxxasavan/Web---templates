import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { createOrder, fulfillOrder, sendReceipt } from "@/lib/store";
import { readCart, clearCart } from "@/lib/cart";
import { bySlug, BUNDLE } from "@/lib/catalog";

const stripeKey = process.env.STRIPE_SECRET_KEY;

/**
 * With STRIPE_SECRET_KEY set this hands off to Stripe Checkout and waits for
 * the webhook to fulfil. Without it the order is fulfilled immediately and
 * flagged as a simulation, so the whole flow is exercisable before a payment
 * account exists. The total is always computed server-side.
 */
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
    order = await createOrder(user, await readCart(), stripeKey ? "stripe" : "simulated");
  } catch (err) {
    const empty = err.message === "Your cart is empty.";
    if (!empty) console.error("[checkout] order failed:", err);
    return NextResponse.json(
      { error: empty ? err.message : "We couldn't start checkout. Please try again." },
      { status: empty ? 400 : 500 }
    );
  }

  const origin = new URL(request.url).origin;

  // No card needed: simulation mode, or credit already covers the total.
  if (!stripeKey || order.totalCents === 0) {
    await fulfillOrder(order.id, stripeKey ? "fully-credited" : "simulated-payment");
    await sendReceipt(order.id, origin);
    await clearCart();
    return NextResponse.json({ ok: true, redirect: `/account?order=${order.id}` });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(stripeKey);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    line_items: order.items.map((i) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: i.priceCents,
        product_data: {
          name: i.name,
          description:
            i.slug === BUNDLE.slug ? BUNDLE.tagline : bySlug(i.slug)?.tagline,
        },
      },
    })),
    success_url: `${origin}/api/checkout/success?order=${order.id}`,
    cancel_url: `${origin}/cart`,
  });

  return NextResponse.json({ ok: true, redirect: session.url });
}
