import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import ResetForm from "@/components/ResetForm";
import { checkPasswordReset } from "@/lib/accounts";

export const metadata = { title: "Choose a new password" };

export default async function ResetPage({ searchParams }) {
  const { token } = await searchParams;
  // Validated on the server so an expired link shows the right screen
  // immediately rather than after a failed submit.
  const valid = Boolean(await checkPasswordReset(token));

  return (
    <>
      <Masthead />
      <main className="px-6 py-20">
        <ResetForm token={token ?? ""} valid={valid} />
      </main>
      <Footer />
    </>
  );
}
