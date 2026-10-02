import Image from "next/image";
import Link from "next/link";
import { bySlug, money, priceOf } from "@/lib/catalog";

// The most visual templates, in two rows that drift in opposite directions.
const ROWS = [
  ["helix-ai", "saltbox-seafood", "tessel-saas", "forno-nero-pizza", "keyline-estates", "loose-threads-podcast", "hollis-photography", "window-light-course"],
  ["wren-calloway-law", "aurora-commerce", "copperfield-plumbing", "signal-conference", "leaf-clay-shop", "noor-haddad", "panetto-bakery", "clearview-dental"],
];

/**
 * A moving wall of real templates under the hero, so the first screen shows
 * what people get rather than describing it. Pauses on hover and focus, and
 * becomes a plain scrollable row for people who prefer reduced motion.
 */
export default function Showcase() {
  return (
    <div className="showcase" aria-label="A selection of templates">
      {ROWS.map((row, r) => {
        const items = row.map(bySlug).filter((t) => t && !t.retired);
        return (
          <div key={r} className="showcase__row" data-dir={r % 2 ? "rev" : "fwd"}>
            <ul className="showcase__track">
              {[...items, ...items].map((t, i) => {
                const copy = i >= items.length;
                return (
                  <li key={`${t.slug}-${i}`} aria-hidden={copy || undefined}>
                    <Link href={`/t/${t.slug}`} tabIndex={copy ? -1 : undefined} className="showcase__card">
                      <span className="showcase__img">
                        <Image
                          src={`/thumbs/${t.slug}.webp`}
                          alt={copy ? "" : `${t.name}: ${t.tagline}`}
                          fill
                          sizes="320px"
                          className="object-cover object-top"
                        />
                      </span>
                      <span className="showcase__meta">
                        <b>{t.name}</b>
                        <span>{t.tagline}</span>
                        <em>{money(priceOf(t))}</em>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
