import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";

export default function Footer() {
  return (
    <footer className="border-t border-line px-6 pb-10 pt-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink">
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                  <path d="M2 11.5L8 2l6 9.5H2z" fill="#0a0a0b" />
                </svg>
              </span>
              <span className="text-[15px] font-semibold">Foundry</span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted">
              Original website templates, written from scratch. Buy once, use
              forever.
            </p>
          </div>

          <div className="col-span-2 md:col-span-2">
            <h3 className="text-[12px] font-medium uppercase tracking-[0.14em] text-faint">
              Templates
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
              {TEMPLATES.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/t/${t.slug}`}
                    className="text-[13px] text-muted transition-colors hover:text-ink"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-medium uppercase tracking-[0.14em] text-faint">
              Store
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {[
                ["Licence", "/#licence"],
                ["Questions", "/#faq"],
                ["Bundle", "/#bundle"],
              ].map(([l, h]) => (
                <li key={l}>
                  <Link
                    href={h}
                    className="text-[13px] text-muted transition-colors hover:text-ink"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="text-[12.5px] text-faint">
            © {new Date().getFullYear()} Foundry. Every template is original
            work.
          </p>
        </div>
      </div>
    </footer>
  );
}
