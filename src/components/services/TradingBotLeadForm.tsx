"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

const PLATFORMS = [
  { id: "mt4", lt: "MetaTrader 4", en: "MetaTrader 4" },
  { id: "mt5", lt: "MetaTrader 5", en: "MetaTrader 5" },
  { id: "ibkr", lt: "Interactive Brokers (API)", en: "Interactive Brokers (API)" },
  { id: "binance", lt: "Binance API", en: "Binance API" },
  { id: "bybit", lt: "Bybit API", en: "Bybit API" },
] as const;

const BUDGETS = [
  { id: "300-800", value: 800, lt: "300–800 €", en: "€300–800" },
  { id: "800-2000", value: 2000, lt: "800–2000 €", en: "€800–2000" },
  { id: "2000-5000", value: 5000, lt: "2000–5000 €", en: "€2000–5000" },
  { id: "5000+", value: 7500, lt: "5000 €+", en: "€5000+" },
] as const;

export function TradingBotLeadForm() {
  const { locale } = useLocale();
  const isLt = locale === "lt";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [platform, setPlatform] = useState<string>("mt5");
  const [strategy, setStrategy] = useState("");
  const [indicators, setIndicators] = useState("");
  const [budget, setBudget] = useState<string>("800-2000");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const band = BUDGETS.find((b) => b.id === budget);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company: company || undefined,
          type: "trading_bot",
          service: "trading_bots",
          estimatedValue: band?.value,
          message: [
            isLt ? "Strategijos aprašymas:" : "Strategy description:",
            strategy,
            "",
            isLt ? "Indikatoriai:" : "Indicators:",
            indicators || "—",
          ].join("\n"),
          details: {
            platform,
            strategy,
            indicators,
            budgetBand: budget,
          },
          website: honeypot,
        }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setError(data.error ?? (isLt ? "Nepavyko išsiųsti" : "Failed to submit"));
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
      <p className="rounded-xl border border-[var(--color-lime)]/40 bg-[color-mix(in_oklab,var(--color-lime)_12%,transparent)] p-4 text-sm text-zinc-100">
        {isLt
          ? "Užklausa gauta. Susisieksime dėl techninio įvertinimo ir terminų."
          : "Request received. We will follow up with a technical estimate and timeline."}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-300" htmlFor="tb-name">
            {isLt ? "Vardas" : "Name"}
          </label>
          <input
            id="tb-name"
            required
            className="site-input w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300" htmlFor="tb-email">
            {isLt ? "El. paštas" : "Email"}
          </label>
          <input
            id="tb-email"
            type="email"
            required
            className="site-input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="tb-company">
          {isLt ? "Įmonė (nebūtina)" : "Company (optional)"}
        </label>
        <input
          id="tb-company"
          className="site-input w-full"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm text-zinc-300">
          {isLt ? "Platforma" : "Platform"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <label
              key={p.id}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                platform === p.id
                  ? "border-[var(--color-electric)] bg-[color-mix(in_oklab,var(--color-electric)_15%,transparent)] text-white"
                  : "border-[var(--color-border)] text-zinc-300"
              }`}
            >
              <input
                type="radio"
                name="platform"
                className="sr-only"
                checked={platform === p.id}
                onChange={() => setPlatform(p.id)}
              />
              {isLt ? p.lt : p.en}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="tb-strategy">
          {isLt ? "Strategijos aprašymas" : "Strategy description"}
        </label>
        <textarea
          id="tb-strategy"
          required
          className="site-input min-h-[6rem] w-full"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          placeholder={
            isLt
              ? "Įėjimo / išėjimo taisyklės, rizikos valdymas, instrumentai…"
              : "Entry/exit rules, risk management, instruments…"
          }
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="tb-ind">
          {isLt ? "Techniniai indikatoriai" : "Technical indicators"}
        </label>
        <input
          id="tb-ind"
          className="site-input w-full"
          value={indicators}
          onChange={(e) => setIndicators(e.target.value)}
          placeholder="RSI, EMA, MACD…"
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm text-zinc-300">
          {isLt ? "Biudžeto juosta" : "Budget band"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <label
              key={b.id}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                budget === b.id
                  ? "border-[var(--color-lime)] bg-[color-mix(in_oklab,var(--color-lime)_12%,transparent)] text-white"
                  : "border-[var(--color-border)] text-zinc-300"
              }`}
            >
              <input
                type="radio"
                name="budget"
                className="sr-only"
                checked={budget === b.id}
                onChange={() => setBudget(b.id)}
              />
              {isLt ? b.lt : b.en}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="site-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {busy
          ? isLt
            ? "Siunčiama…"
            : "Sending…"
          : isLt
            ? "Siųsti užklausą"
            : "Submit request"}
      </button>
    </form>
  );
}
