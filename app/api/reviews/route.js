import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { upsertReview, reviewsFor } from "@/lib/reviews";
import { isSellableSlug } from "@/lib/catalog";

export async function GET(request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!isSellableSlug(slug)) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }
  return NextResponse.json({ reviews: await reviewsFor(slug) });
}

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const { slug, rating, title, body } = await request.json().catch(() => ({}));
  if (!isSellableSlug(slug)) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }

  try {
    await upsertReview(user.id, slug, { rating, title, body });
  } catch (err) {
    // canReview failing is a 403; a validation message is a 400.
    const forbidden = err.message.includes("Only buyers");
    return NextResponse.json(
      { error: err.message },
      { status: forbidden ? 403 : 400 }
    );
  }

  return NextResponse.json({ ok: true, reviews: await reviewsFor(slug) });
}
