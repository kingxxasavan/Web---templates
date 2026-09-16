import Image from "next/image";
import Link from "next/link";
import { Price, Badge, Arrow } from "./store";

export default function TemplateCard({ t, priority = false }) {
  return (
    <Link
      href={`/t/${t.slug}`}
      className="card group flex flex-col overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-base">
        <Image
          src={`/thumbs/${t.slug}.webp`}
          alt={`${t.name} template preview`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
        />
        {t.tier === "premium" && (
          <span className="absolute left-3 top-3">
            <Badge tone="accent">Premium</Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-medium tracking-[-0.01em]">{t.name}</h3>
            <p className="mt-0.5 text-[13px] text-muted">{t.tagline}</p>
          </div>
          <Price amount={t.price} />
        </div>

        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-faint">
          {t.blurb}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {t.stack.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-md border border-line bg-white/[0.02] px-2 py-1 text-[11px] text-muted"
            >
              {s}
            </span>
          ))}
          {t.stack.length > 3 && (
            <span className="text-[11px] text-faint">+{t.stack.length - 3}</span>
          )}
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink">
          View template
          <Arrow />
        </span>
      </div>
    </Link>
  );
}
