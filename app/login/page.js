import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AuthPage from "@/components/AuthPage";
import { currentUser } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function Page() {
  if (await currentUser()) redirect("/account");
  return (
    <>
      <Masthead />
      <AuthPage mode="login" />
      <Footer />
    </>
  );
}
