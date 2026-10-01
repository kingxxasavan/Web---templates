import { NextResponse } from "next/server";
import { fulfillStripeSession } from "@/lib/payments";

/**
 * Fulfilment happens here rather than on the success redirect, because a
 * buyer can close the tab before being redirected but the webhook still
 * arrives. The signature check is what makes this endpoint safe to expose.
 */
export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const raw = await request.text();

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    try { await fulfillStripeSession(event.data.object, new URL(request.url).origin); }
    catch (error) {
      console.error("Payment fulfilment failed", error.message);
      return NextResponse.json({ error: "Payment processing failed; please retry." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
