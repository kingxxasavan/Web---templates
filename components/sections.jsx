import Link from "next/link";
import { Icon } from "./icons";
import { Reveal } from "./store";
import NewsletterForm from "./NewsletterForm";
import { PROMISES } from "@/lib/content";

/** The heading block at the top of every inner page. */
export function PageHeader({ eyebrow, title, accent, children }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="pointer-events-none absolute inset-0 -z-10 dot-grid" />
      <div className="shell py-16 md:py-20">
        <Reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="h-display mt-4 max-w-3xl text-balance">
            {title}
            {accent && (
              <>
                {" "}
                <span className="serif-accent text-accent">{accent}</span>
              </>
            )}
          </h1>
          {children && <div className="lede mt-5 max-w-2xl text-pretty">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, children, center = false }) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h-section mt-3 text-balance">{title}</h2>
      {children && <p className="lede mt-4 text-pretty">{children}</p>}
    </Reveal>
  );
}

export function PromiseGrid({ items = PROMISES }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <Reveal key={p.title} delay={(i % 3) * 0.05}>
          <div className="card h-full rounded-2xl p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icon name={p.icon} size={20} />
            </span>
            <h3 className="mt-5 text-[16.5px] font-semibold tracking-[-0.01em]">{p.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{p.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function Steps({ steps, numbered = true }) {
  return (
    <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="list-none">
          <Reveal delay={i * 0.05} className="h-full">
            <div className="card h-full rounded-2xl p-6">
              {numbered && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-on-ink">
                  {i + 1}
                </span>
              )}
              <h3 className="mt-4 text-[16px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.body}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

/** The dark closing band used at the foot of most pages. */
export function ClosingCta({
  title = "Your next website is",
  accent = "already built.",
  body = "Preview any template for free. When it fits, it's yours for $5 to $15, once.",
  primary = { href: "/templates", label: "Browse templates" },
  secondary = { href: "/pricing", label: "See pricing" },
}) {
  return (
    <section className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-night ring-1 ring-night-line px-6 py-14 text-white sm:px-12 md:py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="h-section text-balance">
              {title} <span className="serif-accent text-[#a5b4fc]">{accent}</span>
            </h2>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-night-muted">{body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={primary.href} className="btn btn-lg btn-on-dark">
                {primary.label} <Icon name="arrow" size={16} />
              </Link>
              <Link href={secondary.href} className="btn btn-lg border border-night-line text-white hover:border-white/50">
                {secondary.label}
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-night-line bg-night-raise p-6">
            <p className="text-[15px] font-semibold">Get new templates first</p>
            <p className="mt-1 text-[13.5px] text-night-muted">
              One short email when a new template ships. Unsubscribe any time.
            </p>
            <div className="mt-4">
              <NewsletterForm source="cta" dark />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq({ items }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform duration-300 group-open:rotate-45">
              <Icon name="plus" size={14} />
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
