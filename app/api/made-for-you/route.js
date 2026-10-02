import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { createServiceOrder } from "@/lib/store";
import { paymentsConfigured, startStripeCheckout } from "@/lib/payments";
import { validateBrief, hasCapacity, createBuild, linkOrder } from "@/lib/builds";

/** Takes a Made-for-you brief and payment for it. */
export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const brief = await request.json().catch(() => ({}));
  if (brief.website) return NextResponse.json({ ok: true, redirect: "/" }); // honeypot

  const user = await currentUser();
  if (!user) {
    // The form keeps the brief in the browser, so nothing is lost at sign-up.
    return NextResponse.json(
      {
        error: "Create a free account to send your brief — what you've written is saved.",
        needsAuth: true,
        redirect: "/register?next=%2Fmade-for-you%23brief",
      },
      { status: 401 }
    );
  }

  const problem = validateBrief(brief);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  if (!paymentsConfigured()) {
    return NextResponse.json(
      { error: "Payments aren't switched on yet, so we can't take briefs. Leave a message on the contact page and we'll be in touch." },
      { status: 503 }
    );
  }

  if (!(await hasCapacity())) {
    return NextResponse.json(
      { error: "We're fully booked right now, so we can't promise 3 days. Leave a message on the contact page and we'll tell you the moment a slot opens." },
      { status: 409 }
    );
  }

  try {
    const buildId = await createBuild(user, brief);
    const order = await createServiceOrder(user.id, "stripe");
    await linkOrder(buildId, order.id);
    const redirect = await startStripeCheckout(order, user, new URL(request.url).origin, {
      success: "/account?order=" + order.id + "#builds",
      cancel: "/made-for-you?cancelled=1#brief",
    });
    return NextResponse.json({ ok: true, redirect });
  } catch (err) {
    console.error("[made-for-you] order failed:", err);
    return NextResponse.json({ error: "We couldn't take your brief just now. Please try again." }, { status: 500 });
  }
}
