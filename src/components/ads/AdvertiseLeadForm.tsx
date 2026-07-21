"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function AdvertiseLeadForm() {
  const { locale } = useLocale();
  const isLt = locale === "lt";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [placement, setPlacement] = useState("scan_signals");
  const [budget, setBudget] = useState("150");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company: company || undefined,
          type: "seo",
          service: "advertising",
          estimatedValue: Number(budget) || 150,
          message:
            message ||
            (isLt
              ? `Reklamos užklausa: pozicija ${placement}`
              : `Ad inquiry: placement ${placement}`),
          details: { placement, budgetEur: Number(budget) || 150 },
          website: honeypot,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? (isLt ? "Nepavyko" : "Failed"));
        return;
      }
      setDone(true);
    } catch {
      setError(isLt ? "Tinklo klaida" : "Network error");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-xl border border-[var(--color-lime)]/40 p-4 text-sm text-zinc-100">
        {isLt
          ? "Užklausa gauta — susisieksime dėl reklamos pozicijos."
          : "Request received — we will follow up on your ad placement."}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-300" htmlFor="ad-name">
            {isLt ? "Vardas" : "Name"}
          </label>
          <input id="ad-name" required className="site-input w-full" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300" htmlFor="ad-email">
            Email
          </label>
          <input id="ad-email" type="email" required className="site-input w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="ad-co">
          {isLt ? "Įmonė" : "Company"}
        </label>
        <input id="ad-co" className="site-input w-full" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-300" htmlFor="ad-place">
            {isLt ? "Pozicija" : "Placement"}
          </label>
          <select id="ad-place" className="site-input w-full" value={placement} onChange={(e) => setPlacement(e.target.value)}>
            <option value="scan_signals">Signals</option>
            <option value="scan_etf">ETF / Dividends</option>
            <option value="scan_metals">Metals</option>
            <option value="scan_fx">FX</option>
            <option value="scan_web">Web / SEO</option>
            <option value="global">Global</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300" htmlFor="ad-budget">
            {isLt ? "Biudžetas €/mėn." : "Budget €/mo"}
          </label>
          <select id="ad-budget" className="site-input w-full" value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="100">100</option>
            <option value="150">150</option>
            <option value="300">300</option>
            <option value="500">500+</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="ad-msg">
          {isLt ? "Žinutė" : "Message"}
        </label>
        <textarea id="ad-msg" className="site-input min-h-[4rem] w-full" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button type="submit" disabled={busy} className="site-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60">
        {busy ? (isLt ? "Siunčiama…" : "Sending…") : isLt ? "Siųsti užklausą" : "Submit"}
      </button>
    </form>
  );
}
