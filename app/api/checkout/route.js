import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { createOrder, fulfillOrder, getCart } from "@/lib/store";
import { money } from "@/lib/catalog";

const stripeKey = process.env.STRIPE_SECRET_KEY;

/**
 * With STRIPE_SECRET_KEY set this hands off to Stripe Checkout and waits for
 * the webhook to fulfil. Without it the order is fulfilled immediately and
 * flagged as a simulation, so the whole flow is exercisable before any
 * payment account exists. The total is always computed server-side.
 */
export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first.", needsAuth: true }, { status: 401 });
  }

  const cart = await getCart(user.id);
  if (!cart.items.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  if (!stripeKey) {
    const order = await createOrder(user.id, "simulated");
    await fulfillOrder(order.id, "simulated-payment");
    return NextResponse.json({
      ok: true,
      simulated: true,
      orderId: order.id,
      total: money(order.totalCents),
      redirect: `/account?order=${order.id}`,
    });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(stripeKey);
  const order = await createOrder(user.id, "stripe");
  const origin = new URL(request.url).origin;

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
        product_data: { name: i.name, description: i.tagline },
      },
    })),
    success_url: `${origin}/account?order=${order.id}`,
    cancel_url: `${origin}/cart`,
  });

  return NextResponse.json({ ok: true, simulated: false, redirect: session.url });
}
