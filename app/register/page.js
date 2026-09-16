import { Suspense } from "react";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import { currentUser } from "@/lib/auth";

export const metadata = { title: "Create account" };

export default async function Page() {
  if (await currentUser()) redirect("/account");
  return (
    <>
      <Masthead />
      <main className="px-6 py-20">
        <Suspense fallback={null}>
          <AuthForm mode="register" />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
