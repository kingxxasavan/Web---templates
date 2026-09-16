import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import LogoCloud from "@/components/LogoCloud";
import Showcase from "@/components/Showcase";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Results from "@/components/Results";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is Helix different from the AI already in my helpdesk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bundled helpdesk AI mostly deflects by suggesting articles. Helix reasons over your full history and takes the action the ticket needs, then writes back a resolution.",
      },
    },
    {
      "@type": "Question",
      name: "Do you train on our customer data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Your data is isolated to your workspace and never used to train shared models. Helix is SOC 2 Type II and GDPR compliant.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Nav />
      <main>
        <Hero />
        <LogoCloud />
        <Showcase />
        <Features />
        <HowItWorks />
        <Results />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
