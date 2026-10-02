import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/store";
import { PageHeader, SectionHeading, Steps, ClosingCta } from "@/components/sections";
import { BUILD_STEPS, BUY_STEPS } from "@/lib/content";
import { GUIDES } from "@/lib/guides";

export const metadata = {
  title: "How it works",
  description:
    "How Foundry templates are designed and built, how buying works, and step-by-step guides to putting your site live on Netlify, Vercel, GitHub Pages or cPanel.",
};

const INSIDE = [
  ["index.html and friends", "One HTML file per page, written as plain, well-structured markup."],
  ["assets/style.css", "All the styling, themed from a short list of colour and font variables at the top."],
  ["assets/app.js", "Small, plain JavaScript for menus, forms, galleries and carts. No framework."],
  ["README.md", "How to change the text, colours, fonts and images, and how to connect forms."],
  ["LICENSE.txt", "The plain-English licence, so you always know what you can do."],
];

const NEXT_STEPS = [
  {
    title: "Make it yours",
    body: "Change the colour and font variables at the top of style.css and the whole site follows. Replace the words in each HTML file and swap the images in the assets folder.",
  },
  {
    title: "Connect your forms",
    body: "Contact and booking forms work with Formspree or Netlify Forms. Paste your form address into the form's action attribute and messages arrive in your inbox.",
  },
  {
    title: "Take payments",
    body: "The shop templates work with Stripe Payment Links: create a link for each product in Stripe and paste it into the Buy button. No server needed.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Masthead />
      <PageHeader eyebrow="How it works" title="How we build them," accent="and how you'll use them.">
        Every Foundry template goes through the same process before it&rsquo;s
        listed, and every one goes live the same simple way once it&rsquo;s
        yours.
      </PageHeader>

      {/* how we build */}
      <section className="shell py-16 md:py-24">
        <SectionHeading eyebrow="How we build" title="Five steps from idea to your download.">
          No page builders, no generated code, no themes bought in. This is
          how each template is made.
        </SectionHeading>
        <ol className="mt-12 flex flex-col">
          {BUILD_STEPS.map((s, i) => (
            <li key={s.title}>
              <Reveal>
                <div className="grid grid-cols-[auto_1fr] gap-5 border-t border-line py-7 md:grid-cols-[80px_280px_1fr] md:gap-8">
                  <span className="text-[14px] font-semibold text-accent">0{i + 1}</span>
                  <h3 className="text-[19px] font-semibold tracking-[-0.015em]">{s.title}</h3>
                  <p className="col-span-2 text-[15.5px] leading-relaxed text-muted md:col-span-1">{s.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* how buying works */}
      <section className="border-y border-line bg-card">
        <div className="shell py-16 md:py-24">
          <SectionHeading eyebrow="How buying works" title="Four steps. No calls, no quotes." center />
          <div className="mt-12">
            <Steps steps={BUY_STEPS} />
          </div>
        </div>
      </section>

      {/* what's inside */}
      <section className="shell grid grid-cols-1 gap-12 py-16 md:py-24 lg:grid-cols-2">
        <SectionHeading eyebrow="In the download" title="What's inside the folder.">
          The complete, unminified source. Everything is in plain files you
          can open in any text editor, even Notepad.
        </SectionHeading>
        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-night font-mono text-[13.5px] text-white shadow-[var(--shadow-lift)]">
            <div className="flex items-center gap-1.5 border-b border-night-line px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-[12px] text-night-muted">your-template/</span>
            </div>
            <ul className="divide-y divide-night-line">
              {INSIDE.map(([file, what]) => (
                <li key={file} className="px-5 py-3.5">
                  <p className="text-[#a5b4fc]">{file}</p>
                  <p className="mt-1 font-sans text-[13.5px] text-night-muted">{what}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* launch guides */}
      <section id="launch" className="border-y border-line bg-sunk/60">
        <div className="shell py-16 md:py-24">
          <SectionHeading eyebrow="Launch guides" title="Put it online in minutes.">
            The HTML templates are plain files, so they&rsquo;ll run on almost
            any host, most of them free. Here are four favourites.
          </SectionHeading>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GUIDES.filter((g) => g.kind === "host").slice(0, 4).map((g, i) => (
              <Reveal key={g.slug} delay={i * 0.04} className="h-full">
                <Link href={`/guides/${g.slug}`} className="card card-hover flex h-full flex-col rounded-2xl p-6">
                  <h3 className="text-[17px] font-semibold">{g.name}</h3>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted">{g.bestFor}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] text-faint">
                    <Icon name="clock" size={14} /> {g.time} · {g.cost}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="mt-8">
            <Link href="/guides" className="btn btn-secondary">
              All {GUIDES.length} guides, including Shopify and WordPress <Icon name="arrow" size={16} />
            </Link>
          </p>
        </div>
      </section>

      {/* after launch */}
      <section className="shell py-16 md:py-24">
        <SectionHeading eyebrow="After that" title="Making it yours." />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {NEXT_STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05}>
              <div className="card h-full rounded-2xl p-7">
                <h3 className="text-[17px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-accent/20 bg-accent-soft p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[16px] font-semibold text-accent-deep">Stuck somewhere?</p>
            <p className="mt-1 text-[14.5px] text-accent-deep/80">
              Send a message and the person who wrote the template will help you get it working.
            </p>
          </div>
          <Link href="/contact?topic=support" className="btn btn-accent">
            Get help <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>

      <ClosingCta />
      <Footer />
    </>
  );
}
