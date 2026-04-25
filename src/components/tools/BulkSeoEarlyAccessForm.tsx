"use client";

import { useState } from "react";

export function BulkSeoEarlyAccessForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const details = String(data.get("details") ?? "").trim();
    const bodyMessage = [
      "Masinis SEO — Early Access užklausa (50+ straipsnių, rankinis vykdymas su analitika).",
      "",
      details || "(detalių nepateikta)",
    ].join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          service: "Masinis SEO — Early Access",
          message: bodyMessage,
          website: String(data.get("website") ?? ""),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; retryAfterSec?: number };
      if (res.status === 429) {
        setStatus("err");
        setMessage(json.error ?? "Per daug bandymų. Bandykite vėliau.");
        return;
      }
      if (!res.ok) {
        setStatus("err");
        setMessage(json.error ?? "Nepavyko išsiųsti. Patikrinkite laukus.");
        return;
      }
      setStatus("ok");
      setMessage("Užklausa gauta. Atsakysiu el. paštu.");
      form.reset();
    } catch {
      setStatus("err");
      setMessage("Tinklo klaida. Bandykite dar kartą.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor="bulk-seo-hp">Website</label>
        <input id="bulk-seo-hp" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bulk-name" className="text-sm font-medium text-zinc-300">
            Vardas
          </label>
          <input
            id="bulk-name"
            name="name"
            required
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-electric)]"
          />
        </div>
        <div>
          <label htmlFor="bulk-email" className="text-sm font-medium text-zinc-300">
            El. paštas
          </label>
          <input
            id="bulk-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-electric)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bulk-details" className="text-sm font-medium text-zinc-300">
          Kiek straipsnių, niša, terminas (nebūtina)
        </label>
        <textarea
          id="bulk-details"
          name="details"
          rows={4}
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-electric)]"
          placeholder="Pvz., 60 straipsnių, B2B SaaS Lietuvoje, per 3 savaites"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-[var(--color-lime)] px-5 py-2.5 text-sm font-semibold text-[#101300] transition hover:bg-[var(--color-lime-dim)] disabled:opacity-50"
      >
        {status === "loading" ? "Siunčiama…" : "Palikti užklausą"}
      </button>

      {message ? (
        <p className={`text-sm ${status === "ok" ? "text-[var(--color-lime)]" : "text-rose-400"}`}>{message}</p>
      ) : null}
    </form>
  );
}
