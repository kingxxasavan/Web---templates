"use client";

import { useState } from "react";
import { TEMPLATES } from "@/lib/catalog";

const TOPICS = [
  { id: "question", label: "A question before buying" },
  { id: "request", label: "Request a new template" },
  { id: "support", label: "Help with a template I own" },
];

export default function ContactForm({ defaultTopic = "question", defaultEmail = "" }) {
  const [form, setForm] = useState({
    name: "",
    email: defaultEmail,
    kind: TOPICS.some((t) => t.id === defaultTopic) ? defaultTopic : "question",
    template: "",
    message: "",
  });
  const [state, setState] = useState({ status: "idle", error: null });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setState({ status: "busy", error: null });
    const message =
      form.kind === "support" && form.template
        ? `[${form.template}] ${form.message}`
        : form.message;

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, message, website: e.target.website.value }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));

    if (!res?.ok) {
      setState({ status: "idle", error: data?.error || "That didn't send. Please try again." });
      return;
    }
    setState({ status: "done", error: null });
  }

  if (state.status === "done") {
    return (
      <div role="status" className="card rounded-2xl p-8 text-center">
        <p className="text-[20px] font-semibold">Thanks, {form.name.split(" ")[0]}. It&rsquo;s with us.</p>
        <p className="mt-2 text-[14.5px] text-muted">
          {form.kind === "request"
            ? "Every request is read, and the most-asked-for ideas become the next templates. We'll email you if yours is built."
            : `We'll reply to ${form.email} as soon as we can.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-5 rounded-2xl p-6 sm:p-8">
      <fieldset>
        <legend className="text-[13px] font-medium">What&rsquo;s this about?</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TOPICS.map((t) => (
            <label
              key={t.id}
              className={`cursor-pointer rounded-xl border px-3.5 py-3 text-[13.5px] transition-colors ${
                form.kind === t.id ? "border-accent bg-accent-soft text-accent-deep" : "border-line-strong hover:border-ink"
              }`}
            >
              <input type="radio" name="kind" value={t.id} checked={form.kind === t.id} onChange={set("kind")} className="sr-only" />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Your name</span>
          <input required value={form.name} onChange={set("name")} autoComplete="name" className="input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Email</span>
          <input required type="email" value={form.email} onChange={set("email")} autoComplete="email" className="input" />
        </label>
      </div>

      {form.kind === "support" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Which template?</span>
          <select value={form.template} onChange={set("template")} className="input">
            <option value="">Choose one</option>
            {TEMPLATES.map((t) => (
              <option key={t.slug} value={t.name}>{t.name}</option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium">
          {form.kind === "request" ? "What kind of website do you need?" : "Message"}
        </span>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={set("message")}
          className="input resize-y"
          placeholder={
            form.kind === "request"
              ? "e.g. A site for a dog groomer: services, prices, a gallery and online booking."
              : "How can we help?"
          }
        />
      </label>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={state.status === "busy"} className="btn btn-lg btn-primary self-start">
        {state.status === "busy" ? "Sending…" : form.kind === "request" ? "Send request" : "Send message"}
      </button>
    </form>
  );
}
