"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import {
  BUSINESS_TYPES,
  COLOR_ROLES,
  PALETTES,
  TONES,
  briefText,
  isPalette,
  recommend,
  typeById,
} from "@/lib/brief";

/**
 * The Made-for-you brief, one question at a time: like writing a prompt for
 * a website, with the answers assembled into a brief as you go. Mounted once
 * in the layout; anything on the site can open it with openBrief().
 */

const EVENT = "foundry:brief";
const DRAFT = "foundry-brief-v2";
const STEPS = ["Business", "Inspiration", "Details", "Pages", "Colours", "Review"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY = {
  businessType: "",
  businessTypeOther: "",
  business: "",
  tagline: "",
  inspiration: "",
  inspirationUrl: "",
  about: "",
  audience: "",
  tones: [],
  pageList: [],
  paletteId: "",
  palette: null,
  email: "",
  assetsUrl: "",
  notes: "",
};

/** Opens the wizard from anywhere, optionally with a template already picked. */
export function openBrief(detail = {}) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail }));
}

export function BriefButton({ template, className = "btn btn-primary", children }) {
  return (
    <button type="button" onClick={() => openBrief({ template })} className={className}>
      {children}
    </button>
  );
}

export default function BriefWizardRoot({ templates, price, delivery, full }) {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const bySlug = useMemo(() => new Map(templates.map((t) => [t.slug, t])), [templates]);

  // Restore an unfinished brief, e.g. after signing up at the last step.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT) || "null");
      if (saved?.brief) {
        setBrief({ ...EMPTY, ...saved.brief });
        setStep(Math.min(saved.step ?? 0, STEPS.length - 1));
      }
    } catch {
      /* no storage: start fresh */
    }
  }, []);

  const save = useCallback((next, nextStep) => {
    try {
      localStorage.setItem(DRAFT, JSON.stringify({ brief: next, step: nextStep }));
    } catch {
      /* ignore */
    }
  }, []);

  const start = useCallback(
    (detail = {}) => {
      setBrief((b) => {
        const t = detail.template ? bySlug.get(detail.template) : null;
        if (!t) return b;
        const type = BUSINESS_TYPES.find((x) => x.category === t.category);
        return { ...b, inspiration: t.slug, businessType: b.businessType || type?.id || "" };
      });
      setOpen(true);
    },
    [bySlug]
  );

  useEffect(() => {
    const onOpen = (e) => start(e.detail);
    window.addEventListener(EVENT, onOpen);
    const params = new URLSearchParams(window.location.search);
    if (params.get("start") === "1" || window.location.hash === "#brief") start({ template: params.get("template") });
    return () => window.removeEventListener(EVENT, onOpen);
  }, [start]);

  const update = (patch) =>
    setBrief((b) => {
      const next = { ...b, ...patch };
      save(next, step);
      return next;
    });

  const go = (n) => {
    setStep(n);
    save(brief, n);
  };

  if (!open) return null;
  return (
    <Wizard
      brief={brief}
      update={update}
      step={step}
      go={go}
      templates={templates}
      bySlug={bySlug}
      price={price}
      delivery={delivery}
      full={full}
      onClose={() => setOpen(false)}
      onSent={() => {
        try {
          localStorage.removeItem(DRAFT);
        } catch {
          /* ignore */
        }
      }}
    />
  );
}

function Wizard({ brief, update, step, go, templates, bySlug, price, delivery, full, onClose, onSent }) {
  const router = useRouter();
  const [state, setState] = useState({ busy: false, error: null });
  const panel = useRef(null);
  const type = typeById(brief.businessType);
  const picks = useMemo(() => recommend(templates, brief.businessType, brief.businessTypeOther), [templates, brief.businessType, brief.businessTypeOther]);
  const inspiration = bySlug.get(brief.inspiration) ?? null;

  // Close on Escape, and keep the page behind still.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Suggested pages and palette once the kind of business is known.
  useEffect(() => {
    if (!type) return;
    const patch = {};
    if (!brief.pageList.length) patch.pageList = type.pages.map(([name, notes]) => ({ name, notes }));
    if (!brief.palette) {
      patch.paletteId = type.palettes[0];
      patch.palette = PALETTES[type.palettes[0]].colors;
    }
    if (Object.keys(patch).length) update(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief.businessType]);

  const problems = [
    !brief.businessType || (brief.businessType === "other" && !brief.businessTypeOther.trim())
      ? "Choose the kind of business."
      : !brief.business.trim()
        ? "Add your business name."
        : null,
    null,
    brief.about.trim().length < 20 ? "Tell us a little more about the business (at least 20 characters)." : null,
    !brief.pageList.some((p) => p.name.trim()) ? "Add at least one page." : null,
    !isPalette(brief.palette) ? "Choose a palette or set your colours." : null,
    !EMAIL_RE.test(brief.email.trim()) ? "Enter the email we should deliver to." : null,
  ];
  const problem = problems[step];

  async function submit() {
    setState({ busy: true, error: null });
    const payload = {
      ...brief,
      inspirationName: inspiration?.name,
      brief: briefText({ ...brief, inspirationName: inspiration?.name }),
      website: "",
    };
    const res = await fetch("/api/made-for-you", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      if (data?.needsAuth) return router.push(data.redirect);
      return setState({ busy: false, error: data?.error || "That didn't go through. Please try again." });
    }
    onSent();
    window.location.assign(data.redirect);
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Made for you brief"
        className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-paper shadow-[var(--shadow-lift)] outline-none sm:rounded-3xl"
      >
        {/* header */}
        <div className="flex items-center gap-4 border-b border-line px-5 py-4 sm:px-7">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Icon name="sparkle" size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold">Made for you</p>
            <p className="truncate text-[12.5px] text-muted">
              Your website, built to your brief in {delivery} · {price}
            </p>
          </div>
          <ol className="ml-auto hidden items-center gap-1.5 md:flex" aria-label="Steps">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => i < step && go(i)}
                  disabled={i > step}
                  aria-current={i === step ? "step" : undefined}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                    i === step ? "bg-ink text-on-ink" : i < step ? "bg-sunk text-ink hover:bg-line" : "text-faint"
                  }`}
                >
                  {i + 1}. {s}
                </button>
              </li>
            ))}
          </ol>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-sunk hover:text-ink">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="h-1 bg-sunk md:hidden">
          <div className="h-full bg-accent transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        {/* body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 content-start overflow-y-auto lg:grid-cols-[1.2fr_1fr] lg:content-stretch lg:overflow-hidden">
          <div className="p-5 sm:p-7 lg:min-h-0 lg:overflow-y-auto">
            {step === 0 && <StepBusiness brief={brief} update={update} />}
            {step === 1 && <StepInspiration brief={brief} update={update} picks={picks} type={type} templates={templates} />}
            {step === 2 && <StepDetails brief={brief} update={update} />}
            {step === 3 && <StepPages brief={brief} update={update} />}
            {step === 4 && <StepColours brief={brief} update={update} type={type} />}
            {step === 5 && <StepReview brief={brief} update={update} price={price} delivery={delivery} inspiration={inspiration} full={full} />}
          </div>
          <aside className={`border-t border-line bg-sunk/60 p-5 sm:p-7 lg:block lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0 ${step < 3 ? "hidden" : ""}`}>
            {step >= 3 ? (
              <PalettePreview brief={brief} inspiration={inspiration} />
            ) : (
              <BriefSoFar brief={brief} inspiration={inspiration} />
            )}
          </aside>
        </div>

        {/* footer */}
        <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4 sm:px-7">
          {step > 0 && (
            <button type="button" onClick={() => go(step - 1)} className="btn btn-secondary">
              <Icon name="back" size={16} /> Back
            </button>
          )}
          <p className="min-w-0 flex-1 text-[13px] text-danger" role="status">
            {state.error || (problem && state.tried === step ? problem : "")}
          </p>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => (problem ? setState((s) => ({ ...s, tried: step })) : (go(step + 1), setState({ busy: false, error: null })))}
              className="btn btn-primary"
            >
              Continue <Icon name="arrow" size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={state.busy || full}
              onClick={() => (problem ? setState((s) => ({ ...s, tried: step })) : submit())}
              className="btn btn-accent"
            >
              <Icon name="lock" size={16} /> {state.busy ? "Opening checkout…" : `Pay ${price} and send brief`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ steps */

function Q({ n, title, children }) {
  return (
    <div className="mb-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-accent">Step {n}</p>
      <h2 className="mt-1.5 text-[24px] font-semibold tracking-[-0.02em]">{title}</h2>
      {children && <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="mt-5 flex flex-col gap-1.5 text-[13px]">
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="text-[12px] text-faint">{hint}</span>}
    </label>
  );
}

function StepBusiness({ brief, update }) {
  return (
    <>
      <Q n={1} title="What kind of business is it?">
        We&rsquo;ll use this to suggest templates, pages and colours that suit you.
      </Q>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[...BUSINESS_TYPES, { id: "other", label: "Something else" }].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => update({ businessType: t.id, ...(t.id !== brief.businessType ? { pageList: [], palette: null, paletteId: "" } : {}) })}
            aria-pressed={brief.businessType === t.id}
            className={`rounded-xl border px-3.5 py-3 text-left text-[13.5px] font-medium transition-colors ${
              brief.businessType === t.id ? "border-accent bg-accent-soft text-accent-deep" : "border-line bg-card hover:border-line-strong"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {brief.businessType === "other" && (
        <Field label="What is it?">
          <input className="input" value={brief.businessTypeOther} onChange={(e) => update({ businessTypeOther: e.target.value })} placeholder="e.g. dog grooming salon" maxLength={80} />
        </Field>
      )}
      <Field label="Business name">
        <input className="input" value={brief.business} onChange={(e) => update({ business: e.target.value })} placeholder="e.g. Ridgeline Coffee" maxLength={120} />
      </Field>
      <Field label="In one line, what do you do?" hint="Optional. This often becomes the headline.">
        <input className="input" value={brief.tagline} onChange={(e) => update({ tagline: e.target.value })} placeholder="e.g. Small-batch coffee, roasted on Tuesday" maxLength={140} />
      </Field>
    </>
  );
}

function StepInspiration({ brief, update, picks, type, templates }) {
  const chosen = templates.find((t) => t.slug === brief.inspiration);
  const shown = chosen && !picks.some((p) => p.slug === chosen.slug) ? [chosen, ...picks.slice(0, 4)] : picks;
  return (
    <>
      <Q n={2} title="Is there a template you like?">
        {type ? `The five that suit a ${type.label.toLowerCase()} best.` : "Five good places to start."} Pick one to take inspiration from, or let us choose.
      </Q>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {shown.map((t) => {
          const on = brief.inspiration === t.slug;
          return (
            <div key={t.slug} className={`overflow-hidden rounded-2xl border transition-colors ${on ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-line-strong"}`}>
              <button type="button" onClick={() => update({ inspiration: on ? "" : t.slug })} aria-pressed={on} className="block w-full text-left">
                <span className="relative block aspect-[4/3] bg-sunk">
                  <Image src={`/thumbs/${t.slug}.webp`} alt="" fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover object-top" />
                  {on && (
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-on-accent">
                      <Icon name="check" size={16} strokeWidth={2.4} />
                    </span>
                  )}
                </span>
                <span className="block bg-card px-3.5 pb-1 pt-3">
                  <span className="block text-[14px] font-semibold">{t.name}</span>
                  <span className="block text-[12.5px] text-muted">{t.tagline}</span>
                </span>
              </button>
              <a href={`/t/${t.slug}`} target="_blank" rel="noopener noreferrer" className="block bg-card px-3.5 pb-3 text-[12.5px] font-medium text-accent hover:underline">
                Preview it ↗
              </a>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={() => update({ inspiration: "" })} aria-pressed={!brief.inspiration} className={`mt-3 w-full rounded-xl border px-4 py-3 text-[13.5px] font-medium ${!brief.inspiration ? "border-accent bg-accent-soft text-accent-deep" : "border-line bg-card hover:border-line-strong"}`}>
        None of these. Choose for me.
      </button>
      <Field label="A website you like the look of" hint="Optional. Any site at all, not just ours.">
        <input className="input" value={brief.inspirationUrl} onChange={(e) => update({ inspirationUrl: e.target.value })} placeholder="https://" maxLength={300} />
      </Field>
    </>
  );
}

function StepDetails({ brief, update }) {
  const toggle = (t) => update({ tones: brief.tones.includes(t) ? brief.tones.filter((x) => x !== t) : [...brief.tones, t].slice(0, 3) });
  return (
    <>
      <Q n={3} title="Describe the business and the site.">
        What you sell or do, who it&rsquo;s for, and what visitors should do on the site. Bullet points are fine.
      </Q>
      <Field label="Description">
        <textarea
          rows={6}
          className="input resize-y"
          value={brief.about}
          onChange={(e) => update({ about: e.target.value })}
          maxLength={3000}
          placeholder="e.g. We roast single-origin coffee and sell it online and at two markets. The site should sell beans and subscriptions, tell our story, and list where to find us on weekends."
        />
      </Field>
      <Field label="Who are your customers?" hint="Optional.">
        <input className="input" value={brief.audience} onChange={(e) => update({ audience: e.target.value })} placeholder="e.g. home coffee lovers, local cafés" maxLength={200} />
      </Field>
      <div className="mt-5">
        <p className="text-[13px] font-medium">How should it feel? <span className="font-normal text-faint">Pick up to three.</span></p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button key={t} type="button" onClick={() => toggle(t)} aria-pressed={brief.tones.includes(t)} className={`rounded-full border px-3.5 py-1.5 text-[13px] ${brief.tones.includes(t) ? "border-ink bg-ink text-on-ink" : "border-line bg-card text-muted hover:text-ink"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function StepPages({ brief, update }) {
  const pages = brief.pageList;
  const setCount = (n) => {
    const next = pages.slice(0, n);
    while (next.length < n) next.push({ name: "", notes: "" });
    update({ pageList: next });
  };
  const edit = (i, patch) => update({ pageList: pages.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  return (
    <>
      <Q n={4} title="How many pages, and what goes on each?">
        We&rsquo;ve suggested the usual ones for your kind of business. Rename, describe or remove them.
      </Q>
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-medium">Pages</span>
        <div className="flex items-center overflow-hidden rounded-full border border-line-strong bg-card">
          <button type="button" onClick={() => setCount(Math.max(1, pages.length - 1))} aria-label="Fewer pages" className="flex h-9 w-10 items-center justify-center hover:bg-sunk">
            <Icon name="minus" size={16} />
          </button>
          <span className="w-8 text-center text-[15px] font-semibold" aria-live="polite">{pages.length}</span>
          <button type="button" onClick={() => setCount(Math.min(10, pages.length + 1))} aria-label="More pages" className="flex h-9 w-10 items-center justify-center hover:bg-sunk">
            <Icon name="plus" size={16} />
          </button>
        </div>
        <span className="text-[12px] text-faint">Up to 10</span>
      </div>
      <ol className="mt-5 flex flex-col gap-3">
        {pages.map((p, i) => (
          <li key={i} className="card flex gap-3 rounded-2xl p-3.5">
            <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sunk text-[12px] font-semibold">{i + 1}</span>
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[0.8fr_1.6fr]">
              <input className="input" value={p.name} onChange={(e) => edit(i, { name: e.target.value })} placeholder="Page name" maxLength={40} aria-label={`Page ${i + 1} name`} />
              <input className="input" value={p.notes} onChange={(e) => edit(i, { notes: e.target.value })} placeholder="What should be on it?" maxLength={240} aria-label={`Page ${i + 1} contents`} />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function StepColours({ brief, update, type }) {
  const order = type ? [...type.palettes, ...Object.keys(PALETTES).filter((k) => !type.palettes.includes(k))] : Object.keys(PALETTES);
  const setColor = (i, v) => {
    const next = [...(brief.palette ?? PALETTES.mono.colors)];
    next[i] = v;
    update({ palette: next, paletteId: "custom" });
  };
  return (
    <>
      <Q n={5} title="Pick your colours.">
        Start from a palette that suits your business, then fine-tune any colour. The preview shows how it looks.
      </Q>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {order.map((id, i) => {
          const p = PALETTES[id];
          const on = brief.paletteId === id;
          return (
            <button key={id} type="button" onClick={() => update({ paletteId: id, palette: p.colors })} aria-pressed={on} className={`rounded-xl border p-2.5 text-left transition-colors ${on ? "border-accent ring-2 ring-accent/25" : "border-line bg-card hover:border-line-strong"}`}>
              <span className="flex h-9 overflow-hidden rounded-lg">
                {p.colors.map((c) => (
                  <span key={c} className="flex-1" style={{ background: c }} />
                ))}
              </span>
              <span className="mt-2 flex items-center justify-between text-[12.5px] font-medium">
                {p.name}
                {type && i < 5 && <span className="text-[10.5px] font-semibold uppercase tracking-wide text-accent">Suits you</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-[13px] font-medium">Fine-tune</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {COLOR_ROLES.map((role, i) => (
          <label key={role} className="card flex items-center gap-2 rounded-xl p-2.5 text-[12.5px]">
            <input type="color" value={brief.palette?.[i] ?? "#000000"} onChange={(e) => setColor(i, e.target.value)} className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
            <span>
              <span className="block font-medium">{role}</span>
              <span className="font-mono text-[11px] text-faint">{brief.palette?.[i]}</span>
            </span>
          </label>
        ))}
      </div>
    </>
  );
}

function StepReview({ brief, update, price, delivery, inspiration, full }) {
  return (
    <>
      <Q n={6} title="Check your brief, then send it.">
        This is exactly what our designer will build from. Go back to change anything.
      </Q>
      <pre className="whitespace-pre-wrap rounded-2xl border border-line bg-card p-4 font-mono text-[12.5px] leading-relaxed text-body">
        {briefText({ ...brief, inspirationName: inspiration?.name })}
      </pre>
      <Field label="Your email" hint="We send progress and the finished site here.">
        <input className="input" type="email" value={brief.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@example.com" maxLength={200} />
      </Field>
      <Field label="Link to your logo and photos" hint="Optional. A shared Google Drive, Dropbox or iCloud folder works.">
        <input className="input" value={brief.assetsUrl} onChange={(e) => update({ assetsUrl: e.target.value })} placeholder="https://" maxLength={500} />
      </Field>
      <Field label="Anything else?" hint="Optional. Opening hours, prices, links to your socials or booking system.">
        <textarea rows={3} className="input resize-y" value={brief.notes} onChange={(e) => update({ notes: e.target.value })} maxLength={2000} />
      </Field>
      <ul className="mt-6 flex flex-col gap-2 rounded-2xl bg-accent-soft p-4 text-[13.5px] text-accent-deep">
        <li className="flex gap-2"><Icon name="check" size={16} strokeWidth={2.2} /> {price} once, delivered in {delivery}</li>
        <li className="flex gap-2"><Icon name="check" size={16} strokeWidth={2.2} /> {inspiration ? `${inspiration.name} added to your library` : "The template we build from, added to your library"}</li>
        <li className="flex gap-2"><Icon name="check" size={16} strokeWidth={2.2} /> One round of changes after delivery</li>
      </ul>
      {full && <p className="alert-error mt-4">We&rsquo;re fully booked right now. Your brief is saved; try again in a few days or contact us.</p>}
    </>
  );
}

/* ------------------------------------------------------------------ aside */

function BriefSoFar({ brief, inspiration }) {
  const text = briefText({ ...brief, inspirationName: inspiration?.name });
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">Your brief so far</p>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-line bg-card p-4 font-mono text-[12.5px] leading-relaxed text-body">
        {brief.business || brief.businessType ? text : "Answer a few questions and your brief writes itself here, like a prompt for your website."}
      </pre>
      {inspiration && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-card">
          <span className="relative block aspect-[16/10]">
            <Image src={`/thumbs/${inspiration.slug}.webp`} alt="" fill sizes="400px" className="object-cover object-top" />
          </span>
          <p className="px-4 py-3 text-[13px]">
            Inspired by <strong>{inspiration.name}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

const HEX6 = /^#[0-9a-f]{6}$/i;
const RGB_RE = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/g;
const clamp01 = (n) => Math.min(1, Math.max(0, n));
const hueGap = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/** Hue (degrees), saturation and lightness (0 to 1) of a hex or [r, g, b] colour. */
const hslOf = (c) => {
  const n = typeof c === "string" ? parseInt(c.slice(1), 16) : 0;
  const [r, g, b] = (typeof c === "string" ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : c).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};

const rgbFromHsl = (h, s, l) => {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  return [0, 8, 4].map((n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))));
};

const readable = (bg) => {
  const n = parseInt(bg.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#111111" : "#ffffff";
};

function PalettePreview({ brief, inspiration }) {
  const [brand, accent, bg, text] = isPalette(brief.palette) ? brief.palette : PALETTES.mono.colors;
  const [view, setView] = useState("mock");
  const canShowTemplate = inspiration?.livePreview;
  const name = brief.business || "Your business";
  const pages = brief.pageList.filter((p) => p.name.trim()).slice(0, 5);
  const frame = useRef(null);

  // Paint the chosen colours onto the real template: its theme variables,
  // and every colour in its stylesheets that shares the accent's hue, so
  // light and dark shades of the brand colour follow along.
  const tint = useCallback(() => {
    const win = frame.current?.contentWindow;
    const doc = frame.current?.contentDocument;
    if (!doc?.head || !win) return;
    if (!win.__brief) {
      const style = doc.createElement("style");
      doc.head.append(style);
      const accent = win.getComputedStyle(doc.documentElement).getPropertyValue("--accent").trim();
      const targets = [];
      const walk = (rules) => {
        for (const rule of rules) {
          if (rule.cssRules) walk(rule.cssRules);
          const s = rule.style;
          if (!s) continue;
          for (let i = 0; i < s.length; i++) {
            const value = s.getPropertyValue(s[i]);
            if (value.includes("rgb")) targets.push({ s, prop: s[i], value, priority: s.getPropertyPriority(s[i]) });
          }
        }
      };
      for (const sheet of doc.styleSheets) {
        if (sheet.ownerNode === style) continue;
        try {
          walk(sheet.cssRules);
        } catch {
          /* a cross-origin stylesheet: leave it */
        }
      }
      win.__brief = { style, targets, base: HEX6.test(accent) ? hslOf(accent) : null };
    }
    const { style, targets, base } = win.__brief;
    style.textContent = `:root{--accent:${brand} !important;--accent-dark:color-mix(in srgb,${brand} 85%,#000) !important;--accent-text:${brand} !important;--accent-soft:color-mix(in srgb,${brand} 12%,#fff) !important;--accent-ink:${readable(brand)} !important}`;
    if (!base) return;
    const to = hslOf(brand);
    for (const t of targets) {
      const next = t.value.replace(RGB_RE, (m, r, g, b, alpha) => {
        const [h, sat, l] = hslOf([+r, +g, +b]);
        if (sat < 0.22 || hueGap(h, base[0]) > 30) return m;
        const rgb = rgbFromHsl(to[0], to[1], clamp01(l + to[2] - base[2]));
        return alpha === undefined ? `rgb(${rgb.join(", ")})` : `rgba(${rgb.join(", ")}, ${alpha})`;
      });
      if (next !== t.s.getPropertyValue(t.prop)) t.s.setProperty(t.prop, next, t.priority);
    }
  }, [brand]);
  useEffect(tint, [tint]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">Preview</p>
        {canShowTemplate && (
          <div className="flex rounded-full border border-line bg-card p-0.5 text-[12px]">
            {[["mock", "Your colours"], ["template", `On ${inspiration.name}`]].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} className={`rounded-full px-3 py-1 font-medium ${view === v ? "bg-ink text-on-ink" : "text-muted"}`}>
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === "template" && canShowTemplate ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-card">
          <div className="relative aspect-[16/11] overflow-hidden">
            <iframe
              ref={frame}
              src={`/preview/${inspiration.slug}/index.html`}
              title={`${inspiration.name} with your colours`}
              onLoad={tint}
              className="absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[0.4] border-0"
            />
          </div>
          <p className="border-t border-line px-4 py-2.5 text-[12px] text-muted">Buttons, links and highlights in your brand colour. Artwork and photos stay as they are.</p>
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)]" style={{ background: bg, color: text }}>
          <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: `${text}22` }}>
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-3.5">
            <span className="flex items-center gap-2 text-[14px] font-bold">
              <span className="h-5 w-5 rounded-md" style={{ background: brand }} />
              {name}
            </span>
            <span className="hidden gap-3 text-[11.5px] opacity-75 sm:flex">
              {pages.map((p) => (
                <span key={p.name}>{p.name}</span>
              ))}
            </span>
          </div>
          <div className="px-5 pb-6 pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
              {typeById(brief.businessType)?.label ?? "Welcome"}
            </p>
            <p className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.02em]">{brief.tagline || `Welcome to ${name}`}</p>
            <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed opacity-75">
              {brief.about ? `${brief.about.slice(0, 120)}${brief.about.length > 120 ? "…" : ""}` : "A short introduction to what you do and who it's for."}
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full px-4 py-2 text-[12px] font-semibold" style={{ background: brand, color: readable(brand) }}>
                {pages[1]?.name ? `See ${pages[1].name.toLowerCase()}` : "Get started"}
              </span>
              <span className="rounded-full border px-4 py-2 text-[12px] font-semibold" style={{ borderColor: `${text}33` }}>
                Contact us
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 px-5 pb-5">
            {(pages.slice(1, 4).length ? pages.slice(1, 4) : [{ name: "Services" }, { name: "About" }, { name: "Contact" }]).map((p, i) => (
              <div key={p.name + i} className="rounded-xl p-3" style={{ background: `${text}0d` }}>
                <span className="block h-6 w-6 rounded-lg" style={{ background: i === 1 ? accent : brand, opacity: i === 2 ? 0.75 : 1 }} />
                <span className="mt-2 block text-[11.5px] font-semibold">{p.name}</span>
                <span className="mt-1 block h-1.5 w-4/5 rounded" style={{ background: `${text}22` }} />
                <span className="mt-1 block h-1.5 w-3/5 rounded" style={{ background: `${text}22` }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {COLOR_ROLES.map((role, i) => (
          <div key={role} className="flex-1">
            <span className="block h-8 rounded-lg border border-line" style={{ background: [brand, accent, bg, text][i] }} />
            <span className="mt-1 block text-[11px] text-muted">{role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
