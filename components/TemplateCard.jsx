import Image from "next/image";
import Link from "next/link";
import { Badge } from "./store";
import Stars from "./Stars";
import { Icon } from "./icons";
import { TIERS, money, pageCount } from "@/lib/catalog";

export default function TemplateCard({ t, owned = false, rating = null, priority = false }) {
  const tier = TIERS[t.tier];

  return (
    <Link
      href={`/t/${t.slug}`}
      className="card card-hover group flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-sunk">
        <Image
          src={`/thumbs/${t.slug}.webp`}
          alt={`${t.name} template preview`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 flex gap-1.5">
          {owned ? <Badge tone="good">Owned</Badge> : <Badge>{tier.name}</Badge>}
        </span>
        {t.livePreview && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            <Icon name="eye" size={13} /> Live preview
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[16.5px] font-semibold tracking-[-0.01em]">{t.name}</h3>
            <p className="mt-0.5 text-[13.5px] text-muted">{t.tagline}</p>
          </div>
          <span className="shrink-0 text-[20px] font-semibold tracking-tight">
            {owned ? <span className="text-[13px] font-medium text-good">In library</span> : money(tier.priceCents)}
          </span>
        </div>

        {rating?.count > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <Stars value={rating.average} size={13} />
            <span className="text-[12px] text-faint">({rating.count})</span>
          </div>
        )}

        <p className="mt-3 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{t.blurb}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-5 text-[12px] text-faint">
          <span>
            {pageCount(t)} page{pageCount(t) === 1 ? "" : "s"} · {t.stack.slice(0, 2).join(", ")}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-ink opacity-70 transition-opacity group-hover:opacity-100">
            View <Icon name="arrow" size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
