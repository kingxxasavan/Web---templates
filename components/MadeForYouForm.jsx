"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

const DRAFT = "made-for-you-brief";
const EMPTY = { template: "", business: "", about: "", pages: "", style: "", links: "", content: "", assetsUrl: "", notes: "", email: "" };

export default function MadeForYouForm({ templates, defaultEmail = "", defaultTemplate = "", price, open }) {
  const [brief, setBrief] = useState({ ...EMPTY, email: defaultEmail, template: defaultTemplate });
  const [state, setState] = useState({ busy: false, error: null });
  const router = useRouter();

  // A brief written before signing up is waiting here afterwards.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT) || "null");
      if (saved) setBrief((b) => ({ ...b, ...saved, email: saved.email || b.email, template: defaultTemplate || saved.template || "" }));
    } catch {
      /* no storage: the form simply starts empty */
    }
  }, [defaultTemplate]);

  function set(key) {
    return (e) => {
      const next = { ...brief, [key]: e.target.value };
      setBrief(next);
      try {
        localStorage.setItem(DRAFT, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    };
  }

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: null });
    const res = await fetch("/api/made-for-you", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...brief, website: e.target.website.value }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));

    if (!res?.ok) {
      if (data?.needsAuth) return router.push(data.redirect);
      return setState({ busy: false, error: data?.error || "That didn't go through. Please try again." });
    }
    try {
      localStorage.removeItem(DRAFT);
    } catch {
      /* ignore */
    }
    window.location.assign(data.redirect);
  }

  const field = "flex flex-col gap-1.5 text-[13px]";
  const hint = "text-[12px] text-faint";

  return (
    <form onSubmit={submit} className="card flex flex-col gap-5 rounded-2xl p-6 sm:p-8" id="brief-form">
      <label className={field}>
        <span className="font-medium">Which template should we start from?</span>
        <select value={brief.template} onChange={set("template")} className="input">
          <option value="">Help me choose — you pick the best fit</option>
          {templates.map((t) => (
            <option key={t.slug} value={t.slug}>{t.name} · {t.tagline}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={field}>
          <span className="font-medium">Business name *</span>
          <input required value={brief.business} onChange={set("business")} className="input" maxLength={120} />
        </label>
        <label className={field}>
          <span className="font-medium">Deliver to (email) *</span>
          <input required type="email" value={brief.email} onChange={set("email")} className="input" autoComplete="email" />
        </label>
      </div>

      <label className={field}>
        <span className="font-medium">What does your business do? *</span>
        <textarea required rows={3} value={brief.about} onChange={set("about")} className="input resize-y" maxLength={3000}
          placeholder="e.g. A family bakery in Leeds. Sourdough, pastries and celebration cakes, open Tuesday to Sunday." />
      </label>

      <label className={field}>
        <span className="font-medium">Pages and sections you need</span>
        <textarea rows={2} value={brief.pages} onChange={set("pages")} className="input resize-y" maxLength={2000}
          placeholder="e.g. Home, menu with prices, about us, contact with a map and opening hours." />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={field}>
          <span className="font-medium">Colours and style</span>
          <input value={brief.style} onChange={set("style")} className="input" maxLength={1000} placeholder="e.g. Warm, cream and deep green" />
        </label>
        <label className={field}>
          <span className="font-medium">Links to include</span>
          <input value={brief.links} onChange={set("links")} className="input" maxLength={1000} placeholder="Instagram, booking page, phone…" />
        </label>
      </div>

      <label className={field}>
        <span className="font-medium">Your words</span>
        <textarea rows={5} value={brief.content} onChange={set("content")} className="input resize-y" maxLength={6000}
          placeholder="Paste any text you want on the site: your story, services, prices, opening hours. Rough is fine — we'll tidy it." />
        <span className={hint}>No text yet? Leave it blank and we&rsquo;ll write simple placeholder copy from your description.</span>
      </label>

      <label className={field}>
        <span className="font-medium">Link to your logo and photos</span>
        <input type="url" value={brief.assetsUrl} onChange={set("assetsUrl")} className="input" maxLength={500} placeholder="https://drive.google.com/…" />
        <span className={hint}>A shared Google Drive, Dropbox or iCloud folder works.</span>
      </label>

      <label className={field}>
        <span className="font-medium">Anything else?</span>
        <textarea rows={2} value={brief.notes} onChange={set("notes")} className="input resize-y" maxLength={2000} />
      </label>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state.error && <p role="alert" className="alert-error">{state.error}</p>}

      <div className="flex flex-col items-start gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted">
          <Icon name="lock" size={14} className="-mt-0.5 mr-1 inline" />
          {price}, paid once. The template is included and yours to keep.
        </p>
        <button type="submit" disabled={state.busy || !open} className="btn btn-lg btn-primary">
          {state.busy ? "Sending…" : open ? `Send brief & pay ${price}` : "Fully booked"}
        </button>
      </div>
    </form>
  );
}
