import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import ForgotForm from "@/components/ForgotForm";

export const metadata = { title: "Reset your password" };

export default function ForgotPage() {
  return (
    <>
      <Masthead />
      <main className="shell py-16 md:py-24">
        <ForgotForm />
      </main>
      <Footer />
    </>
  );
}
