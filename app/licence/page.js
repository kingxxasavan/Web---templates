import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { Check } from "@/components/store";
import { Icon } from "@/components/icons";
import { PageHeader, ClosingCta } from "@/components/sections";
import { LICENCE_CAN, LICENCE_CANNOT } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Licence and refunds",
  description:
    "One plain-English licence covers every Foundry template: unlimited personal and client projects, no attribution. Plus our money-back guarantee.",
};

export default function LicencePage() {
  return (
    <>
      <Masthead />
      <PageHeader eyebrow="Licence" title="One licence." accent="Plain English.">
        The same terms cover every template, whichever price you paid. No
        tiers, no per-domain counting, and it never expires.
      </PageHeader>

      <section className="shell grid grid-cols-1 gap-5 py-16 md:grid-cols-2 md:py-20">
        <div className="card rounded-2xl p-7">
          <h2 className="text-[19px] font-semibold">You can</h2>
          <ul className="mt-5 flex flex-col gap-3.5">
            {LICENCE_CAN.map((l) => (
              <li key={l} className="flex gap-2.5 text-[15px] leading-snug">
                <Check /> {l}
              </li>
            ))}
          </ul>
        </div>
        <div className="card rounded-2xl p-7">
          <h2 className="text-[19px] font-semibold">You can&rsquo;t</h2>
          <ul className="mt-5 flex flex-col gap-3.5">
            {LICENCE_CANNOT.map((l) => (
              <li key={l} className="flex gap-2.5 text-[15px] leading-snug">
                <Icon name="close" size={16} strokeWidth={2.2} className="mt-[3px] text-danger" /> {l}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-line pt-5 text-[14px] leading-relaxed text-muted">
            In short: sell the websites you build with our templates, not the
            templates themselves.
          </p>
        </div>
      </section>

      <section className="shell pb-16 md:pb-20">
        <div className="card rounded-2xl p-7 md:p-9">
          <h2 className="text-[19px] font-semibold">The details</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 text-[15px] leading-relaxed text-muted md:grid-cols-3">
            <p>
              <strong className="font-semibold text-ink">One purchase, unlimited projects.</strong>{" "}
              Buying a template once lets you, or your team, use it on as many
              websites as you like, including sites you build and hand over to
              clients.
            </p>
            <p>
              <strong className="font-semibold text-ink">Your client owns their site.</strong>{" "}
              When you deliver a finished website to a client, they can keep
              using and editing it. They just can&rsquo;t pull the template out
              and sell it on.
            </p>
            <p>
              <strong className="font-semibold text-ink">Fonts and images.</strong>{" "}
              Templates use free Google Fonts and our own illustrations or
              placeholders. Swap in your own photos before you launch.
            </p>
          </div>
          <p className="mt-6 text-[13.5px] text-faint">
            The full legal text is in LICENSE.txt inside every download.
          </p>
        </div>
      </section>

      <section id="refunds" className="border-y border-line bg-card">
        <div className="shell grid grid-cols-1 gap-10 py-16 md:py-20 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">Refunds</p>
            <h2 className="h-section mt-3">{SITE.refundDays}-day money-back guarantee.</h2>
          </div>
          <div className="flex flex-col gap-4 text-[16px] leading-relaxed text-body">
            <p>
              If a template doesn&rsquo;t work for your project, send us a
              message within {SITE.refundDays} days of buying it and we&rsquo;ll
              refund you in full, to the card you paid with.
            </p>
            <p>
              Tell us which order it was and, if you&rsquo;re willing, what
              didn&rsquo;t work, so we can fix it for the next person. Once a
              refund is issued the template is removed from your library and
              the licence ends.
            </p>
            <p>
              <Link href="/contact?topic=support" className="btn btn-primary">
                Ask for a refund
              </Link>
            </p>
          </div>
        </div>
      </section>

      <ClosingCta />
      <Footer />
    </>
  );
}
