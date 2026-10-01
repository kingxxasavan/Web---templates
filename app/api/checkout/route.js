import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { createOrder, getCart, mergeGuestCart } from "@/lib/store";
import { readGuestCart, clearGuestCart } from "@/lib/guest-cart";

export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({
      error: "Sign in to complete your purchase — your cart is saved.", needsAuth: true,
      redirect: "/login?next=%2Fcart",
    }, { status: 401 });
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)
      return NextResponse.json({ error: "Payments are not available yet. Your cart is saved; please try again later." }, { status: 503 });
    const pending = await readGuestCart();
    if (pending.length) { await mergeGuestCart(user.id, pending); await clearGuestCart(); }
    const cart = await getCart(user.id);
    if (!cart.items.length) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const order = await createOrder(user.id, "stripe");
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment", customer_email: user.email, client_reference_id: order.id,
      metadata: { orderId: order.id },
      line_items: order.items.map((i) => ({ quantity: 1, price_data: {
        currency: "usd", unit_amount: i.priceCents,
        product_data: { name: i.name, description: i.tagline },
      } })),
      success_url: origin + "/account?order=" + order.id,
      cancel_url: origin + "/cart?cancelled=1",
    }, { idempotencyKey: "checkout-" + order.id });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return NextResponse.json({ ok: true, redirect: session.url });
  } catch (error) {
    console.error("Checkout failed", error.message);
    return NextResponse.json({ error: "Unable to open checkout. Your cart is saved; please try again." }, { status: 503 });
  }
}
