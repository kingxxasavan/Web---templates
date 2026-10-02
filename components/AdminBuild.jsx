"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  ["queued", "Brief received"],
  ["in_progress", "In progress"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];

const FIELDS = [
  ["about", "What they do"],
  ["pages", "Pages & sections"],
  ["style", "Colours & style"],
  ["links", "Links"],
  ["content", "Their content"],
  ["notes", "Anything else"],
];

const when = (ts) =>
  ts ? new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

/** One build on the dashboard: the brief, and controls to move it along. */
export default function AdminBuild({ build, templateName }) {
  const [status, setStatus] = useState(build.status);
  const [deliveryUrl, setDeliveryUrl] = useState(build.deliveryUrl ?? "");
  const [note, setNote] = useState(build.note ?? "");
  const [state, setState] = useState({ busy: false, error: null, saved: false });
  const router = useRouter();
  const overdue = build.dueAt && build.dueAt < Date.now() && ["queued", "in_progress"].includes(build.status);

  async function save(e) {
    e.preventDefault();
    setState({ busy: true, error: null, saved: false });
    const res = await fetch(`/api/admin/builds/${build.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, deliveryUrl, note }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok) return setState({ busy: false, error: data?.error || "That didn't save.", saved: false });
    setState({ busy: false, error: null, saved: true });
    router.refresh();
  }

  return (
    <details className="card group rounded-2xl" open={["queued", "in_progress"].includes(build.status)}>
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 p-5 [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-semibold">{build.business}</span>
        <span className="text-[13px] text-muted">{templateName}</span>
        <a href={`mailto:${build.email}`} className="text-[13px] text-accent hover:underline">{build.email}</a>
        <span className={`ml-auto text-[12.5px] ${overdue ? "font-semibold text-danger" : "text-faint"}`}>
          {overdue ? "Overdue · " : ""}due {when(build.dueAt)}
        </span>
      </summary>

      <div className="grid grid-cols-1 gap-6 border-t border-line p-5 lg:grid-cols-[1.4fr_1fr]">
        <dl className="flex flex-col gap-3 text-[13.5px]">
          {FIELDS.filter(([k]) => build[k]).map(([k, label]) => (
            <div key={k}>
              <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">{label}</dt>
              <dd className="mt-1 whitespace-pre-line leading-relaxed text-body">{build[k]}</dd>
            </div>
          ))}
          {build.assetsUrl && (
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">Photos & logo</dt>
              <dd className="mt-1">
                <a href={build.assetsUrl} target="_blank" rel="noopener noreferrer" className="break-all text-accent hover:underline">
                  {build.assetsUrl}
                </a>
              </dd>
            </div>
          )}
        </dl>

        <form onSubmit={save} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              {STATUSES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium">Link to the finished site</span>
            <input value={deliveryUrl} onChange={(e) => setDeliveryUrl(e.target.value)} placeholder="https://…" className="input" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium">Note to the customer</span>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="input resize-y" />
          </label>
          {state.error && <p role="alert" className="alert-error">{state.error}</p>}
          {state.saved && <p role="status" className="text-[13px] text-good">Saved{status === "delivered" ? " — the customer has been emailed." : "."}</p>}
          <button type="submit" disabled={state.busy} className="btn btn-sm btn-primary self-start">
            {state.busy ? "Saving…" : "Update"}
          </button>
        </form>
      </div>
    </details>
  );
}
