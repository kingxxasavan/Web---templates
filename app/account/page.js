import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { currentUser } from "@/lib/auth";
import { ownedSlugs, ordersFor } from "@/lib/store";
import { TEMPLATES, BUNDLE, bySlug, money } from "@/lib/catalog";

export const metadata = { title: "Your library" };

export default async function AccountPage({ searchParams }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=%2Faccount");

  const { order: justOrdered } = await searchParams;
  const [owned, orders] = await Promise.all([
    ownedSlugs(user.id),
    ordersFor(user.id),
  ]);

  const library = TEMPLATES.filter((t) => owned.has(t.slug));
  const hasAll = library.length === TEMPLATES.length;

  return (
    <>
      <Masthead />
      <main className="mx-auto w-full max-w-5xl px-6 py-14">
        {justOrdered && (
          <div className="mb-8 rounded-2xl border border-accent/25 bg-accent/10 px-5 py-4">
            <p className="text-[14px] font-medium text-accent">
              Payment complete — your downloads are ready below.
            </p>
            <p className="mt-1 text-[12.5px] text-accent/80">
              Order {String(justOrdered).slice(0, 8)}
            </p>
          </div>
        )}

        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[30px] tracking-[-0.02em]">Your library</h1>
            <p className="mt-1.5 text-[13.5px] text-muted">
              Signed in as {user.email}
            </p>
          </div>
          <p className="text-[13px] text-faint">
            {library.length} of {TEMPLATES.length} templates
          </p>
        </header>

        {/* downloads */}
        <section className="mt-9">
          {library.length === 0 ? (
            <div className="card rounded-2xl p-10 text-center">
              <p className="text-[15px] text-muted">
                You haven&rsquo;t bought anything yet.
              </p>
              <Link
                href="/#templates"
                className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-base"
              >
                Browse templates
              </Link>
            </div>
          ) : (
            <>
              {hasAll && (
                <a
                  href={`/api/download/${BUNDLE.slug}`}
                  className="card mb-3 flex items-center justify-between gap-4 rounded-2xl p-5 transition-colors hover:border-accent/40"
                >
                  <div>
                    <p className="text-[15px] font-medium text-accent">
                      Everything — single download
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      All {TEMPLATES.length} templates in one zip
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-base">
                    Download all
                  </span>
                </a>
              )}

              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {library.map((t) => (
                  <li key={t.slug}>
                    <a
                      href={`/api/download/${t.slug}`}
                      className="card flex h-full items-center justify-between gap-4 rounded-2xl p-5"
                    >
                      <div>
                        <p className="text-[14.5px] font-medium">{t.name}</p>
                        <p className="mt-0.5 text-[12.5px] text-muted">
                          {t.tagline}
                        </p>
                      </div>
                      <span className="shrink-0 text-[12.5px] text-faint">
                        Download ↓
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* receipts */}
        {orders.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[18px] tracking-[-0.015em]">Order history</h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-line">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-raise text-faint">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Items</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-5 py-3.5 font-mono text-[12px] text-muted">
                        {o.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {new Date(o.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {o.items
                          .map((i) =>
                            i.slug === BUNDLE.slug
                              ? BUNDLE.name
                              : (bySlug(i.slug)?.name ?? i.slug)
                          )
                          .join(", ")}
                      </td>
                      <td className="px-5 py-3.5 text-right text-ink">
                        {money(o.totalCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.some((o) => o.provider === "simulated") && (
              <p className="mt-3 text-[12px] text-faint">
                Orders marked as simulated were placed without Stripe keys
                configured. See the README to connect live payments.
              </p>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
