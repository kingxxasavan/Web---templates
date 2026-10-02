import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/sections";
import { currentUser } from "@/lib/auth";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Contact us",
  description:
    "Ask a question, request a new template, or get help with one you own. Messages go straight to the developer who built it.",
};

const SIDE = [
  {
    icon: "chat",
    title: "Straight to the developer",
    body: "No ticket queue or chatbot. Your message goes to the person who wrote the code.",
  },
  {
    icon: "sparkle",
    title: "Requests shape the catalogue",
    body: "Every template request is read, and the most-asked-for ideas are what we build next.",
  },
  {
    icon: "refund",
    title: `${SITE.refundDays}-day refunds`,
    body: "Template not right for you? Ask here within the window and we'll refund you in full.",
  },
];

export default async function ContactPage({ searchParams }) {
  const { topic } = await searchParams;
  const user = await currentUser();

  return (
    <>
      <Masthead />
      <PageHeader eyebrow="Contact" title="Talk to the people" accent="who built it.">
        A question before you buy, an idea for a template, or help getting one
        live. Write to us here and a real person will reply.
      </PageHeader>

      <section className="shell grid grid-cols-1 gap-10 py-16 md:py-20 lg:grid-cols-[1.5fr_1fr]">
        <ContactForm defaultTopic={topic} defaultEmail={user?.email ?? ""} />

        <aside className="flex flex-col gap-4">
          {SIDE.map((s) => (
            <div key={s.title} className="card flex gap-4 rounded-2xl p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon name={s.icon} size={20} />
              </span>
              <div>
                <h2 className="text-[15px] font-semibold">{s.title}</h2>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{s.body}</p>
              </div>
            </div>
          ))}
          <p className="px-1 text-[13.5px] text-muted">
            Quick answers are often on the{" "}
            <Link href="/faq" className="font-medium text-accent hover:underline">FAQ</Link>{" "}
            page.
          </p>
        </aside>
      </section>
      <Footer />
    </>
  );
}
