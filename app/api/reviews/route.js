import { NextResponse } from "next/server";
import { currentUser, sameOrigin } from "@/lib/auth";
import { upsertReview, reviewsFor, ReviewError } from "@/lib/reviews";
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

  try {
    await upsertReview(user, slug, { rating, title, body });
  } catch (err) {
    if (err instanceof ReviewError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[reviews] save failed:", err);
    return NextResponse.json({ error: "Your review couldn't be saved. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reviews: await reviewsFor(slug) });
}
