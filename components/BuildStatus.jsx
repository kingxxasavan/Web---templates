import { Icon } from "./icons";
import { BUILD_STATUS, templateName } from "@/lib/builds";

const STEPS = ["queued", "in_progress", "delivered"];
const date = (ts) =>
  ts ? new Date(ts).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";

/** A buyer's view of one Made-for-you build. */
export default function BuildStatus({ build }) {
  const reached = STEPS.indexOf(build.status);
  const cancelled = build.status === "cancelled";

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[16px] font-semibold">{build.business}</p>
          <p className="mt-0.5 text-[13px] text-muted">
            Inspired by {templateName(build.template)}
            {build.dueAt && !cancelled && build.status !== "delivered" && <> · due {date(build.dueAt)}</>}
            {build.deliveredAt && <> · delivered {date(build.deliveredAt)}</>}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
            build.status === "delivered"
              ? "bg-good-soft text-good"
              : cancelled
                ? "bg-sunk text-muted"
                : "bg-accent-soft text-accent"
          }`}
        >
          {BUILD_STATUS[build.status]}
        </span>
      </div>

      {!cancelled && (
        <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-col gap-1.5">
              <span className={`h-1.5 rounded-full ${i <= reached ? "bg-accent" : "bg-line"}`} />
              <span className={`text-[12px] ${i <= reached ? "text-ink" : "text-faint"}`}>{BUILD_STATUS[s]}</span>
            </li>
          ))}
        </ol>
      )}

      {build.note && <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-body">{build.note}</p>}
      {build.deliveryUrl && (
        <a href={build.deliveryUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary mt-4">
          <Icon name="globe" size={15} /> Open your website
        </a>
      )}
    </div>
  );
}
