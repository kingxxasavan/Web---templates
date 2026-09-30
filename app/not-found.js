import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <Masthead />
      <main className="shell flex flex-col items-center py-24 text-center md:py-32">
        <p className="eyebrow">404</p>
        <h1 className="h-section mt-3">
          That page <span className="serif-accent text-accent">wandered off.</span>
        </h1>
        <p className="lede mt-4 max-w-md">
          The link may be old, or the address mistyped. The templates are all
          still here.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/templates" className="btn btn-primary">Browse templates</Link>
          <Link href="/" className="btn btn-secondary">Home</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
