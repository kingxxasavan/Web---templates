import { notFound, redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Stars from "@/components/Stars";
import { currentUser } from "@/lib/auth";
import { isAdmin, adminEmails, needsVerification } from "@/lib/admin";
import VerifyEmail from "@/components/VerifyEmail";
import { salesOverview, topTemplates, dailyRevenue, recentOrders as latestOrders } from "@/lib/metrics";
import { recentEmails } from "@/lib/email";
import { recentMessages, subscriberCount } from "@/lib/inbox";
import { MADE_FOR_YOU, money } from "@/lib/catalog";
import { allBuilds, templateName } from "@/lib/builds";
import AdminBuild from "@/components/AdminBuild";

export const metadata = { title: "Dashboard", robots: { index: false } };

const when = (ts) =>
  new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const KIND_LABEL = { question: "Question", request: "Template request", support: "Support" };

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=%2Fadmin");
  if (needsVerification(user)) {
    return (
      <>
        <Masthead />
        <main className="shell py-16 md:py-24">
          <VerifyEmail email={user.email} />
        </main>
        <Footer />
      </>
    );
  }
  // A 404 rather than a 403: a non-admin should not learn the page exists.
  if (!isAdmin(user)) notFound();

  const [overview, top, daily, recentOrders, emails, messages, subscribers, builds] =
    await Promise.all([
      salesOverview(30),
      topTemplates(),
      dailyRevenue(30),
      latestOrders(8),
      recentEmails(8),
      recentMessages(12),
      subscriberCount(),
      allBuilds().catch(() => []),
    ]);
  const openBuilds = builds.filter((b) => ["queued", "in_progress"].includes(b.status)).length;

  const peak = Math.max(...daily.map((d) => d.cents), 1);

  const tiles = [
    { label: "Revenue, all time", value: money(overview.revenueCents), sub: `${overview.orders} orders` },
    { label: "Last 30 days", value: money(overview.windowRevenueCents), sub: `${overview.windowOrders} orders` },
    { label: "Average order", value: money(overview.averageOrderCents) },
    {
      label: "Signup → purchase",
      value: `${(overview.conversionRate * 100).toFixed(0)}%`,
      sub: `${overview.payingCustomers} of ${overview.signups} accounts`,
    },
    { label: "New-release list", value: subscribers, sub: "email subscribers" },
  ];

  return (
    <>
      <Masthead />
      <main className="shell py-12 md:py-16">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[34px] font-semibold tracking-[-0.025em]">Dashboard</h1>
            <p className="mt-1.5 text-[14px] text-muted">
              Sales, builds and messages from the store database. Traffic is in{" "}
              <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                Vercel Analytics
              </a>
              .
            </p>
          </div>
          <p className="text-[12.5px] text-faint">
            {adminEmails().length} admin{adminEmails().length === 1 ? "" : "s"} configured
          </p>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {tiles.map((t) => (
            <div key={t.label} className="card rounded-2xl p-5">
              <p className="text-[12.5px] text-muted">{t.label}</p>
              <p className="mt-1.5 text-[28px] font-semibold tracking-tight">{t.value}</p>
              {t.sub && <p className="mt-0.5 text-[12px] text-faint">{t.sub}</p>}
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-[19px] font-semibold">Revenue, last 30 days</h2>
          {overview.windowOrders === 0 ? (
            <p className="card mt-4 rounded-2xl px-5 py-8 text-center text-[14px] text-muted">No sales in this window yet.</p>
          ) : (
            <div className="card mt-4 rounded-2xl p-5">
              <div className="flex h-36 items-end gap-[3px]">
                {daily.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${money(d.cents)}`}
                    style={{ height: `${Math.max((d.cents / peak) * 100, 2)}%` }}
                    className={`flex-1 rounded-sm ${d.cents ? "bg-accent/80 hover:bg-accent" : "bg-line"}`}
                  />
                ))}
              </div>
              <div className="mt-2.5 flex justify-between text-[11.5px] text-faint">
                <span>{daily[0]?.date}</span>
                <span>{daily.at(-1)?.date}</span>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[19px] font-semibold">Made-for-you builds</h2>
            <p className="text-[13px] text-muted">
              {openBuilds} of {MADE_FOR_YOU.maxOpen} slots in use
              {openBuilds >= MADE_FOR_YOU.maxOpen ? " · the order form is closed until one is delivered" : ""}
            </p>
          </div>
          {builds.length === 0 ? (
            <p className="card mt-4 rounded-2xl px-5 py-8 text-center text-[14px] text-muted">No builds ordered yet.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {builds.map((b) => (
                <AdminBuild key={b.id} build={b} templateName={templateName(b.template)} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-[19px] font-semibold">Messages and template requests</h2>
          {messages.length === 0 ? (
            <p className="mt-4 text-[14px] text-muted">No messages yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {messages.map((m) => (
                <li key={m.id} className="card rounded-2xl p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11.5px] font-semibold text-accent">
                      {KIND_LABEL[m.kind] ?? m.kind}
                    </span>
                    <span className="font-medium">{m.name}</span>
                    <a href={`mailto:${m.email}`} className="text-accent hover:underline">{m.email}</a>
                    <span className="text-faint">{when(m.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-body">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section>
            <h2 className="text-[19px] font-semibold">Best sellers</h2>
            {top.length === 0 ? (
              <p className="mt-4 text-[14px] text-muted">Nothing sold yet.</p>
            ) : (
              <Table
                head={["Template", "Units", "Revenue"]}
                rows={top.map((t) => [t.name, t.units, money(t.revenueCents)])}
              />
            )}
          </section>
          <section>
            <h2 className="text-[19px] font-semibold">Recent orders</h2>
            {recentOrders.length === 0 ? (
              <p className="mt-4 text-[14px] text-muted">No orders yet.</p>
            ) : (
              <Table
                head={["Customer", "Via", "Total"]}
                rows={recentOrders.map((o) => [o.email, o.provider, money(o.totalCents)])}
              />
            )}
          </section>
        </div>

        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <section className="card rounded-2xl p-5">
            <h2 className="text-[16px] font-semibold">Reviews</h2>
            {overview.reviewCount === 0 ? (
              <p className="mt-3 text-[14px] text-muted">No reviews yet. Only verified buyers can leave one.</p>
            ) : (
              <div className="mt-3 flex items-center gap-3">
                <Stars value={overview.averageRating} size={18} />
                <span className="text-[15px] font-medium">{overview.averageRating.toFixed(1)}</span>
                <span className="text-[13px] text-muted">
                  across {overview.reviewCount} review{overview.reviewCount === 1 ? "" : "s"}
                </span>
              </div>
            )}
          </section>
          <section className="card rounded-2xl p-5">
            <h2 className="text-[16px] font-semibold">Mail log</h2>
            {emails.length === 0 ? (
              <p className="mt-3 text-[14px] text-muted">Nothing sent yet.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {emails.map((e, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="truncate text-muted">{e.kind} → {e.toEmail}</span>
                    <span className={e.status === "failed" ? "text-danger" : "text-faint"}>
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

function Table({ head, rows }) {
  return (
    <div className="card mt-4 overflow-x-auto rounded-2xl">
      <table className="w-full text-left text-[14px]">
        <thead className="bg-sunk text-[12.5px] text-muted">
          <tr>
            {head.map((h, i) => (
              <th key={h} className={`px-4 py-3 font-medium ${i ? "text-right" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, n) => (
            <tr key={n}>
              {r.map((c, i) => (
                <td key={i} className={`px-4 py-3 ${i ? "text-right" : ""} ${i === 1 ? "text-muted" : ""}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
