import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { Check } from "@/components/store";
import { Icon } from "@/components/icons";
import { PageHeader, ClosingCta } from "@/components/sections";
import { LICENCE_CAN, LICENCE_CANNOT, LICENCE_KINDS } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Licence and refunds",
  description:
    "What you can do with a Foundry template, in plain English: unlimited personal and client projects, which designs need a credit, and our money-back guarantee.",
};

export default function LicencePage() {
  return (
    <>
      <Masthead />
      <PageHeader eyebrow="Licence" title="Clear terms." accent="Plain English.">
        Every template can be used on unlimited personal and client projects,
        whichever price you paid. No tiers, no per-domain counting, and it
        never expires. Each listing tells you which licence below applies.
      </PageHeader>

      <section className="shell pt-16 md:pt-20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {LICENCE_KINDS.map((k) => (
            <div key={k.name} className="card rounded-2xl p-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{k.applies}</p>
              <h2 className="mt-2 text-[19px] font-semibold">{k.name}</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{k.body}</p>
            </div>
          ))}
        </div>
      </section>

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
            templates themselves, and leave the author credit where a licence
            asks for one.
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
              Templates use free Google Fonts and artwork we made for them.
              Swap in your own photos and logo before you launch.
            </p>
          </div>
          <p className="mt-6 text-[13.5px] text-faint">
            The full legal text, including the original author&rsquo;s licence for
            open-source editions, is in LICENSE.txt inside every download.
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
