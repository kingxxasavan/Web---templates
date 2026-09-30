import Link from "next/link";
import { TEMPLATES } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { Logo } from "./icons";
import NewsletterForm from "./NewsletterForm";

const COLUMNS = [
  {
    title: "Company",
    links: [
      ["About us", "/about"],
      ["How it works", "/how-it-works"],
      ["Pricing", "/pricing"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Help",
    links: [
      ["FAQ", "/faq"],
      ["Licence", "/licence"],
      ["Refunds", "/licence#refunds"],
      ["Request a template", "/contact?topic=request"],
      ["My library", "/account"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-card">
      <div className="shell grid grid-cols-2 gap-10 py-14 md:grid-cols-12">
        <div className="col-span-2 md:col-span-5">
          <Logo />
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
            An independent studio making original website templates for small
            businesses, freelancers and founders. $5 to $15, paid once.
          </p>
          <div className="mt-6 max-w-sm">
            <p className="text-[13px] font-medium">Get new templates first</p>
            <p className="mt-1 text-[13px] text-muted">One email per release. Nothing else.</p>
            <div className="mt-3">
              <NewsletterForm source="footer" />
            </div>
          </div>
        </div>

        <div className="col-span-2 md:col-span-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">Templates</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-1">
            {TEMPLATES.map((t) => (
              <li key={t.slug}>
                <Link href={`/t/${t.slug}`} className="text-[14px] text-muted transition-colors hover:text-ink">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {COLUMNS.map((c) => (
          <div key={c.title} className="md:col-span-2">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{c.title}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-[14px] text-muted transition-colors hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-6 text-[13px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. Every template is original work.</p>
          <p>Secure checkout · {SITE.refundDays}-day refunds · Commercial licence</p>
        </div>
      </div>
    </footer>
  );
}
