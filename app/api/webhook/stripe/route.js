import { NextResponse } from "next/server";
import { fulfillOrder, sendReceipt } from "@/lib/store";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId || session.client_reference_id;
    if (orderId) {
      const result = await fulfillOrder(orderId, session.payment_intent ?? session.id);
      // Only on the first fulfilment, so a replayed webhook cannot re-send.
      if (!result.alreadyPaid) {
        await sendReceipt(orderId, new URL(request.url).origin);
      }
    }
  }

  return NextResponse.json({ received: true });
}
