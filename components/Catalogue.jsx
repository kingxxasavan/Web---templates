"use client";
import { useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import { priceOf } from "@/lib/catalog";

export default function Catalogue({ templates, ownedSlugs = [], ratings = {} }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [budget, setBudget] = useState("All");
  const [sort, setSort] = useState("featured");
  const categories = ["All", ...new Set(templates.map(t => t.category))];
  const owned = new Set(ownedSlugs);
  const visible = useMemo(() => {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const result = templates.filter(t => (category === "All" || t.category === category)
      && (budget === "All" || priceOf(t) === Number(budget))
      && words.every(word => `${t.name} ${t.tagline} ${t.audience} ${t.stack.join(" ")} ${t.source?.provider || "Foundry"}`.toLowerCase().includes(word)));
    if (sort === "low") result.sort((a,b) => priceOf(a)-priceOf(b));
    if (sort === "high") result.sort((a,b) => priceOf(b)-priceOf(a));
    if (sort === "name") result.sort((a,b) => a.name.localeCompare(b.name));
    return result;
  }, [templates, query, category, budget, sort]);
  const control = "w-full rounded-xl border border-line bg-raise px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-accent";
  return <div>
    <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_150px_170px]">
      <label><span className="sr-only">Search templates</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by design, business or technology…" className={control} /></label>
      <label><span className="sr-only">Filter by price</span><select value={budget} onChange={e=>setBudget(e.target.value)} className={control}><option value="All">Every price</option><option value="500">$5</option><option value="1000">$10</option><option value="1500">$15</option></select></label>
      <label><span className="sr-only">Sort templates</span><select value={sort} onChange={e=>setSort(e.target.value)} className={control}><option value="featured">Featured first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name: A–Z</option></select></label>
    </div>
    <div className="mb-6 flex flex-wrap gap-2" aria-label="Template categories">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} aria-pressed={c===category} className={`rounded-full border px-4 py-2 text-xs transition-colors ${c===category?"border-accent bg-accent text-base":"border-line text-muted hover:text-ink"}`}>{c}</button>)}</div>
    <p className="mb-5 text-xs text-faint" role="status">{visible.length} of {templates.length} templates · Individual designs $5–$15</p>
    {visible.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((t,i)=><TemplateCard key={t.slug} t={t} owned={owned.has(t.slug)} rating={ratings[t.slug]} priority={i<3} />)}</div> : <div className="card rounded-2xl p-10 text-center"><p>No designs match these filters.</p><button className="mt-4 text-sm text-accent underline" onClick={()=>{setQuery("");setCategory("All");setBudget("All");}}>Clear filters</button></div>}
  </div>;
}
