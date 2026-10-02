import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import ResetForm from "@/components/ResetForm";
import { firebaseAuth } from "@/lib/firebase";

export const metadata = { title: "Choose a new password" };

export default async function ResetPage({ searchParams }) {
  const { oobCode, token: legacyToken } = await searchParams;
  const token = oobCode || legacyToken;
  // Validated on the server so an expired link shows the right screen
  // immediately rather than after a failed submit.
  let valid = false;
  if (token) {
    try { await firebaseAuth("resetPassword", { oobCode: token }); valid = true; }
    catch { /* An invalid or expired code shows the request-new-link screen. */ }
  }

  return (
    <>
      <Masthead />
      <main className="shell py-16 md:py-24">
        <ResetForm token={token ?? ""} valid={valid} />
      </main>
      <Footer />
    </>
  );
}
