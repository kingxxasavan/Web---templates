import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import ForgotForm from "@/components/ForgotForm";

export const metadata = { title: "Reset your password" };

export default function ForgotPage() {
  return (
    <>
      <Masthead />
      <main className="px-6 py-20">
        <ForgotForm />
      </main>
      <Footer />
    </>
  );
}
