"use client";

import { useMemo, useState } from "react";

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function CashSecuredPutCalculator() {
  const [stockPrice, setStockPrice] = useState("120");
  const [strikePrice, setStrikePrice] = useState("110");
  const [premium, setPremium] = useState("250");
  const [daysToExpiry, setDaysToExpiry] = useState("35");

  const result = useMemo(() => {
    const stock = Math.max(0.0001, toNumber(stockPrice));
    const strike = Math.max(0.0001, toNumber(strikePrice));
    const premiumAmount = Math.max(0, toNumber(premium));
    const days = Math.max(1, toNumber(daysToExpiry));

    const collateral = strike * 100;
    const periodRoi = premiumAmount / collateral;
    const annualizedRoiPct = periodRoi * (365 / days) * 100;
    const marginOfSafetyPct = ((stock - strike) / stock) * 100;

    return {
      annualizedRoiPct,
      marginOfSafetyPct,
      collateral,
    };
  }, [stockPrice, strikePrice, premium, daysToExpiry]);

  return (
    <section className="site-card-interactive p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-electric)]">
        Cash-Secured Put ROI Calculator
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Opcijų strategijos greita projekcija</h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
        Įveskite pagrindinius parametrus ir matykite metinę grąžą bei saugumo buferį. Skaičiuoklė skirta edukacinei
        analizei, ne finansinei rekomendacijai.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field
          label="Akcijos kaina"
          value={stockPrice}
          onChange={setStockPrice}
          placeholder="Pvz. 120"
          suffix="USD"
        />
        <Field
          label="Strike Price"
          value={strikePrice}
          onChange={setStrikePrice}
          placeholder="Pvz. 110"
          suffix="USD"
        />
        <Field
          label="Premium suma"
          value={premium}
          onChange={setPremium}
          placeholder="Pvz. 250"
          suffix="USD / kontraktui"
        />
        <Field
          label="Dienos iki galiojimo"
          value={daysToExpiry}
          onChange={setDaysToExpiry}
          placeholder="Pvz. 35"
          suffix="dienos"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ResultCard label="Annualized ROI" value={`${result.annualizedRoiPct.toFixed(2)} %`} accent="text-[var(--color-lime)]" />
        <ResultCard
          label="Margin of Safety"
          value={`${result.marginOfSafetyPct.toFixed(2)} %`}
          accent={result.marginOfSafetyPct >= 0 ? "text-[var(--color-electric)]" : "text-rose-400"}
        />
        <ResultCard label="Collateral (cash)" value={`${result.collateral.toFixed(2)} USD`} accent="text-zinc-200" />
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suffix: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</span>
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-300"
        />
        <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-zinc-300">{suffix}</span>
      </div>
    </label>
  );
}

function ResultCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <article className="rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_86%,transparent)] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
    </article>
  );
}
