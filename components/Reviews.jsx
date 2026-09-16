"use client";

import { useState } from "react";
import Stars from "./Stars";

const since = (ts) => {
  const days = Math.floor((Date.now() - ts) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(ts).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
};

export default function Reviews({ slug, initialReviews, canReview, mine }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(mine?.rating ?? 5);
  const [title, setTitle] = useState(mine?.title ?? "");
  const [body, setBody] = useState(mine?.body ?? "");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, rating, title, body }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) return setError(data.error || "Something went wrong.");
    setReviews(data.reviews);
    setOpen(false);
  }

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] tracking-[-0.015em]">
          Reviews{" "}
          {reviews.length > 0 && (
            <span className="text-muted">({reviews.length})</span>
          )}
        </h2>

        {canReview && !open && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-full border border-line px-4 py-2 text-[13px] text-ink transition-colors hover:border-ink/25"
          >
            {mine ? "Edit your review" : "Write a review"}
          </button>
        )}
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="card mt-5 rounded-2xl p-5"
          aria-label="Write a review"
        >
          <fieldset className="flex items-center gap-3">
            <legend className="sr-only">Rating</legend>
            <span className="text-[13px] text-muted">Rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  aria-pressed={rating === n}
                  className="p-0.5"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 20 20"
                    className={n <= rating ? "text-accent" : "text-line"}
                    aria-hidden
                  >
                    <path
                      d="M10 1.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L2.2 7.5l5.4-.8z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-[12.5px] text-muted">Title (optional)</span>
            <input
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Shipped my site in an evening"
              className="h-10 rounded-xl border border-line bg-base px-3 text-[14px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent/60"
            />
          </label>

          <label className="mt-3 flex flex-col gap-1.5">
            <span className="text-[12.5px] text-muted">Your review</span>
            <textarea
              value={body}
              rows={4}
              maxLength={1500}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you build with it? What would you tell someone considering it?"
              className="resize-y rounded-xl border border-line bg-base px-3 py-2.5 text-[14px] leading-relaxed text-ink outline-none transition-colors placeholder:text-faint focus:border-accent/60"
            />
          </label>

          {error && (
            <p role="alert" className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300">
              {error}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-base disabled:opacity-60"
            >
              {busy ? "Posting…" : mine ? "Update review" : "Post review"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-4 py-2.5 text-[13px] text-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="mt-5 text-[13.5px] text-faint">
          No reviews yet.{" "}
          {canReview
            ? "You own this — be the first."
            : "Only verified buyers can review."}
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {reviews.map((r, i) => (
            <li key={i} className="card rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Stars value={r.rating} />
                <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10.5px] font-medium text-accent">
                  Verified purchase
                </span>
                <span className="text-[12px] text-faint">
                  {r.author} · {since(r.createdAt)}
                </span>
              </div>
              {r.title && (
                <p className="mt-2.5 text-[14.5px] font-medium">{r.title}</p>
              )}
              <p className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed text-muted">
                {r.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
