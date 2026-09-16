import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Stars from "@/components/Stars";
import { currentUser } from "@/lib/auth";
import { isAdmin, adminEmails } from "@/lib/admin";
import {
  salesOverview,
  topTemplates,
  dailyRevenue,
  recentOrders,
} from "@/lib/metrics";
import { recentEmails } from "@/lib/email";
import { money } from "@/lib/catalog";

export const metadata = { title: "Dashboard", robots: { index: false } };

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=%2Fadmin");
  // A 404 rather than a 403: a non-admin should not learn the page exists.
  if (!isAdmin(user)) notFound();

  const [overview, top, daily, orders, emails] = await Promise.all([
    salesOverview(30),
    topTemplates(),
    dailyRevenue(30),
    recentOrders(8),
    recentEmails(8),
  ]);

  const peak = Math.max(...daily.map((d) => d.cents), 1);

  const tiles = [
    { label: "Revenue, all time", value: money(overview.revenueCents) },
    { label: "Last 30 days", value: money(overview.windowRevenueCents), sub: `${overview.windowOrders} orders` },
    { label: "Average order", value: money(overview.averageOrderCents) },
    {
      label: "Signup → purchase",
      value: `${(overview.conversionRate * 100).toFixed(0)}%`,
      sub: `${overview.payingCustomers} of ${overview.signups} accounts`,
    },
  ];

  return (
    <>
      <Masthead />
      <main className="mx-auto w-full max-w-6xl px-6 py-14">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[30px] tracking-[-0.02em]">Dashboard</h1>
            <p className="mt-1.5 text-[13.5px] text-muted">
              Sales data from your own database. Traffic lives in{" "}
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline underline-offset-4 hover:text-accent"
              >
                Vercel Analytics
              </a>
              .
            </p>
          </div>
          <p className="text-[12px] text-faint">
            {adminEmails().length} admin{adminEmails().length === 1 ? "" : "s"} configured
          </p>
        </header>

        {/* headline numbers */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="card rounded-2xl p-5">
              <p className="text-[12px] text-faint">{t.label}</p>
              <p className="mt-1.5 font-display text-3xl tracking-tight">
                {t.value}
              </p>
              {t.sub && <p className="mt-1 text-[11.5px] text-muted">{t.sub}</p>}
            </div>
          ))}
        </div>

        {/* revenue over time */}
        <section className="mt-10">
          <h2 className="text-[18px] tracking-[-0.015em]">
            Revenue, last 30 days
          </h2>
          {overview.windowOrders === 0 ? (
            <p className="mt-4 rounded-2xl border border-line bg-raise px-5 py-8 text-center text-[13.5px] text-faint">
              No sales in this window yet.
            </p>
          ) : (
            <div className="card mt-4 rounded-2xl p-5">
              <div className="flex h-36 items-end gap-[3px]">
                {daily.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date} — ${money(d.cents)}`}
                    style={{ height: `${Math.max((d.cents / peak) * 100, 2)}%` }}
                    className={`flex-1 rounded-sm transition-colors ${
                      d.cents ? "bg-accent/70 hover:bg-accent" : "bg-line"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2.5 flex justify-between text-[11px] text-faint">
                <span>{daily[0]?.date}</span>
                <span>{daily.at(-1)?.date}</span>
              </div>
            </div>
          )}
        </section>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* best sellers */}
          <section>
            <h2 className="text-[18px] tracking-[-0.015em]">Best sellers</h2>
            {top.length === 0 ? (
              <p className="mt-4 text-[13.5px] text-faint">Nothing sold yet.</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-line">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-raise text-faint">
                    <tr>
                      <th className="px-4 py-3 font-medium">Template</th>
                      <th className="px-4 py-3 text-right font-medium">Units</th>
                      <th className="px-4 py-3 text-right font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {top.map((t) => (
                      <tr key={t.slug}>
                        <td className="px-4 py-3">{t.name}</td>
                        <td className="px-4 py-3 text-right text-muted">{t.units}</td>
                        <td className="px-4 py-3 text-right">{money(t.revenueCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* recent orders */}
          <section>
            <h2 className="text-[18px] tracking-[-0.015em]">Recent orders</h2>
            {orders.length === 0 ? (
              <p className="mt-4 text-[13.5px] text-faint">No orders yet.</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-line">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-raise text-faint">
                    <tr>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Via</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="px-4 py-3 text-muted">{o.email}</td>
                        <td className="px-4 py-3 text-faint">{o.provider}</td>
                        <td className="px-4 py-3 text-right">{money(o.totalCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* reviews + mail */}
        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <section className="card rounded-2xl p-5">
            <h2 className="text-[15px] font-medium">Reviews</h2>
            {overview.reviewCount === 0 ? (
              <p className="mt-3 text-[13px] text-faint">
                No reviews yet. Only verified buyers can leave one.
              </p>
            ) : (
              <div className="mt-3 flex items-center gap-3">
                <Stars value={overview.averageRating} size={18} />
                <span className="text-[14px]">
                  {overview.averageRating.toFixed(1)}
                </span>
                <span className="text-[12.5px] text-faint">
                  across {overview.reviewCount} review
                  {overview.reviewCount === 1 ? "" : "s"}
                </span>
              </div>
            )}
          </section>

          <section className="card rounded-2xl p-5">
            <h2 className="text-[15px] font-medium">Mail log</h2>
            {emails.length === 0 ? (
              <p className="mt-3 text-[13px] text-faint">Nothing sent yet.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {emails.map((e, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-[12.5px]">
                    <span className="truncate text-muted">
                      {e.kind} → {e.to_email}
                    </span>
                    <span
                      className={
                        e.status === "failed" ? "text-red-400" : "text-faint"
                      }
                    >
                      {e.provider}/{e.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
