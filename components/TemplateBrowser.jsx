"use client";

import { useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import { Icon } from "./icons";
import { openBrief } from "./BriefWizard";
import { CATEGORIES, CATALOG, TIERS, money, priceOf } from "@/lib/catalog";

const SORTS = {
  featured: { label: "Featured", fn: () => 0 },
  low: { label: "Price: low to high", fn: (a, b) => priceOf(a) - priceOf(b) },
  high: { label: "Price: high to low", fn: (a, b) => priceOf(b) - priceOf(a) },
  pages: { label: "Most pages", fn: (a, b) => b.pageList.length - a.pageList.length },
};

/** The full catalogue with search, category, price and sort controls. */
export default function TemplateBrowser({ owned = [], ratings = {}, initialCategory = "All" }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [tier, setTier] = useState("all");
  const [sort, setSort] = useState("featured");
  const ownedSet = useMemo(() => new Set(owned), [owned]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((t) => category === "All" || t.category === category)
      .filter((t) => tier === "all" || t.tier === tier)
      .filter(
        (t) =>
          !q ||
          [t.name, t.tagline, t.blurb, t.audience, t.category, ...(t.keywords ?? []), ...t.stack]
            .join(" ")
            .toLowerCase()
            .includes(q)
      )
      .sort(SORTS[sort].fn);
  }, [query, category, tier, sort]);

  const reset = () => {
    setQuery("");
    setCategory("All");
    setTier("all");
  };

  return (
    <div>
      <div className="card flex flex-col gap-4 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search templates</span>
            <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: coffee, SaaS, dentist, wedding…"
              className="input pl-10"
            />
          </label>
          <div className="flex gap-3">
            <label className="flex-1 md:w-40 md:flex-none">
              <span className="sr-only">Price</span>
              <select value={tier} onChange={(e) => setTier(e.target.value)} className="input pr-8">
                <option value="all">Any price</option>
                {Object.values(TIERS).map((t) => (
                  <option key={t.id} value={t.id}>
                    {money(t.priceCents)} · {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 md:w-48 md:flex-none">
              <span className="sr-only">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input pr-8">
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
          {["All", ...CATEGORIES].map((c) => {
            const n = c === "All" ? CATALOG.length : CATALOG.filter((t) => t.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                  category === c
                    ? "border-ink bg-ink text-on-ink"
                    : "border-line bg-card text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {c} <span className={category === c ? "text-on-ink/60" : "text-faint"}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-[13px] text-faint" aria-live="polite">
        {results.length} template{results.length === 1 ? "" : "s"}
      </p>

      {results.length ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((t, i) => (
            <TemplateCard
              key={t.slug}
              t={t}
              owned={ownedSet.has(t.slug)}
              rating={ratings[t.slug]}
              priority={i < 3}
            />
          ))}
        </div>
      ) : (
        <div className="card mt-4 rounded-2xl p-10 text-center">
          <p className="text-[15px] font-medium">Nothing matches that yet.</p>
          <p className="mt-1 text-[14px] text-muted">
            Try another search, or describe what you need and we&rsquo;ll build it for you in under two weeks.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button onClick={reset} className="btn btn-secondary btn-sm">Clear filters</button>
            <button type="button" onClick={() => openBrief()} className="btn btn-primary btn-sm">Get one made for you</button>
          </div>
        </div>
      )}
    </div>
  );
}
