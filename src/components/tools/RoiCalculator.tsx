"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatPct(n: number): string {
  return `${n.toFixed(2)} %`;
}

function riskBarColor(mosPct: number): string {
  if (mosPct < 2) return "bg-rose-500";
  if (mosPct > 10) return "bg-[var(--color-lime)]";
  return "bg-amber-400";
}

function riskLabel(mosPct: number): string {
  if (mosPct < 2) return "Aukšta rizika (žemas buferis)";
  if (mosPct > 10) return "Konfortiškesnis buferis";
  return "Vidutinis buferis";
}

export function RoiCalculator() {
  const reduceMotion = useReducedMotion();
  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 28 };
  const springSoft = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 400, damping: 30 };
  const springBar = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 26 };

  const [ticker, setTicker] = useState("AAPL");
  const [currentPrice, setCurrentPrice] = useState("175");
  const [strike, setStrike] = useState("165");
  const [premiumPerShare, setPremiumPerShare] = useState("3.25");
  const [dte, setDte] = useState("35");
  const [contracts, setContracts] = useState("1");

  const metrics = useMemo(() => {
    const S = Math.max(0.0001, toNumber(currentPrice));
    const K = Math.max(0.0001, toNumber(strike));
    const prem = Math.max(0, toNumber(premiumPerShare));
    const days = Math.max(1, Math.floor(toNumber(dte)));
    const n = Math.max(1, Math.floor(toNumber(contracts)));

    const cap = K * n * 100;
    const income = prem * n * 100;
    const annualizedRoiPct = cap > 0 && days > 0 ? (income / cap / days) * 365 * 100 : 0;
    const marginOfSafetyPct = ((S - K) / S) * 100;

    return { cap, income, annualizedRoiPct, marginOfSafetyPct, days, n };
  }, [currentPrice, strike, premiumPerShare, dte, contracts]);

  const barWidthPct = Math.min(100, Math.max(0, (metrics.marginOfSafetyPct / 25) * 100));

  return (
    <section className="site-card-interactive overflow-hidden p-6 sm:p-8" aria-labelledby="roi-calc-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-electric)]">Parinkčių ROI</p>
      <h2 id="roi-calc-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Cash-Secured Put — kapitalas, pelnas ir metinė grąža
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
        Įveskite parametrus — skaičiuojama pagal jūsų pateiktas formules: užstatas{" "}
        <span className="font-mono text-zinc-200">Strike × Kontraktai × 100</span>, gautas premium{" "}
        <span className="font-mono text-zinc-200">Premium × Kontraktai × 100</span>, metinis ROI ir saugumo marža. Tik
        edukacijai — ne investicinė rekomendacija.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block sm:col-span-2 lg:col-span-1" htmlFor="roi-ticker">
          <span className="mb-1.5 block text-sm font-medium text-zinc-300">Akcijos simbolis (ticker)</span>
          <input
            id="roi-ticker"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 8))}
            autoComplete="off"
            aria-label="Akcijos simbolis"
            className="site-input min-h-11 w-full font-mono uppercase"
            placeholder="AAPL"
          />
        </label>
        <Field id="roi-current" label="Dabartinė kaina ($)" value={currentPrice} onChange={setCurrentPrice} inputMode="decimal" />
        <Field id="roi-strike" label="Strike kaina ($)" value={strike} onChange={setStrike} inputMode="decimal" />
        <Field id="roi-premium" label="Premium už akciją ($)" value={premiumPerShare} onChange={setPremiumPerShare} inputMode="decimal" />
        <Field id="roi-dte" label="Dienos iki galiojimo (DTE)" value={dte} onChange={setDte} inputMode="numeric" />
        <Field id="roi-contracts" label="Kontraktų skaičius" value={contracts} onChange={setContracts} inputMode="numeric" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.article
          layout
          transition={spring}
          className="site-card relative flex flex-col rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">Reikalingas kapitalas</p>
          <motion.p
            key={metrics.cap}
            initial={reduceMotion ? false : { opacity: 0.65, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springSoft}
            className="mt-2 text-xl font-semibold tabular-nums text-white sm:text-2xl"
          >
            {formatUsd(metrics.cap)}
          </motion.p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-300">Užstatas: Strike × {metrics.n} × 100</p>
        </motion.article>

        <motion.article
          layout
          transition={spring}
          className="site-card relative flex flex-col rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">Grynasis premium (pelnas)</p>
          <motion.p
            key={metrics.income}
            initial={reduceMotion ? false : { opacity: 0.65, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springSoft}
            className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-lime)] sm:text-2xl"
          >
            {formatUsd(metrics.income)}
          </motion.p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-300">Premium × {metrics.n} × 100</p>
        </motion.article>

        <motion.article
          layout
          transition={spring}
          className="site-card relative flex flex-col rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] p-5 md:col-span-2 lg:col-span-1"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">Metinė grąža (annualized)</p>
          <motion.p
            key={metrics.annualizedRoiPct}
            initial={reduceMotion ? false : { opacity: 0.65, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springSoft}
            className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-electric)] sm:text-2xl"
          >
            {formatPct(metrics.annualizedRoiPct)}
          </motion.p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-300">(Income ÷ Cap ÷ DTE) × 365 × 100 %</p>
        </motion.article>

        <motion.article
          layout
          transition={spring}
          className="site-card relative flex flex-col rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] p-5 md:col-span-2 lg:col-span-1"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">Saugumo marža (MoS)</p>
          <motion.p
            key={metrics.marginOfSafetyPct}
            initial={reduceMotion ? false : { opacity: 0.65, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springSoft}
            className="mt-2 text-xl font-semibold tabular-nums text-white sm:text-2xl"
          >
            {formatPct(metrics.marginOfSafetyPct)}
          </motion.p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-300">(Kaina − Strike) ÷ Kaina × 100 %</p>
        </motion.article>
      </div>

      <div className="mt-6 rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-zinc-200">Rizikos indikatorius (pagal MoS)</p>
          <span className="text-xs font-medium text-zinc-300">{riskLabel(metrics.marginOfSafetyPct)}</span>
        </div>
        <div
          className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-800/80"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(barWidthPct)}
          aria-label={`Saugumo marža apie ${metrics.marginOfSafetyPct.toFixed(1)} procentų`}
        >
          <motion.div
            className={`h-full rounded-full ${riskBarColor(metrics.marginOfSafetyPct)}`}
            initial={false}
            animate={{ width: `${barWidthPct}%` }}
            transition={springBar}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-300">
          Žalia, jei MoS &gt; 10 %; raudona, jei MoS &lt; 2 %; tarpinis tonas — tarpinė zona. Juosta sutrumpinta iki ~25 %
          MoS vizualizacijai.
        </p>
      </div>

      <motion.div
        layout
        className="mt-8 rounded-xl border border-[color-mix(in_oklab,var(--color-electric)_28%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-electric)_10%,transparent)] p-5 sm:p-6"
      >
        <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
          <strong className="font-semibold text-zinc-100">Nori automatizuoti parinkčių analizę?</strong>{" "}
          <Link href="/#kontaktai" className="site-link-inline font-medium">
            Susisiek
          </Link>{" "}
          — aptarsime workflow, duomenis ir galimus automatizavimo žingsnius.
        </p>
      </motion.div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "decimal" | "numeric" | "text";
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</span>
      <input
        id={id}
        type="text"
        inputMode={inputMode ?? "decimal"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="site-input min-h-11 w-full"
        autoComplete="off"
      />
    </label>
  );
}
