"use client";

import { useMemo, useState } from "react";
import { useDict } from "@/components/i18n/LocaleProvider";

export function RiskCalculator() {
  const t = useDict().academy;
  const [entry, setEntry] = useState("100");
  const [stop, setStop] = useState("95");
  const [tp, setTp] = useState("110");
  const [capital, setCapital] = useState("10000");
  const [riskPct, setRiskPct] = useState("1");

  const result = useMemo(() => {
    const e = Number(entry);
    const s = Number(stop);
    const p = Number(tp);
    const cap = Number(capital);
    const rp = Number(riskPct);
    if (![e, s, p, cap, rp].every((n) => Number.isFinite(n) && n > 0)) {
      return null;
    }
    const riskPerUnit = Math.abs(e - s);
    const rewardPerUnit = Math.abs(p - e);
    if (riskPerUnit <= 0) return null;
    const rr = rewardPerUnit / riskPerUnit;
    const riskAmount = (cap * rp) / 100;
    const size = riskAmount / riskPerUnit;
    return { rr, riskAmount, size };
  }, [entry, stop, tp, capital, riskPct]);

  const field = (label: string, value: string, set: (v: string) => void) => (
    <label className="block text-xs text-zinc-500">
      {label}
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-white"
      />
    </label>
  );

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="text-lg font-semibold text-white">{t.calcTitle}</h3>
      <p className="mt-1 text-sm text-zinc-400">{t.calcBody}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {field(t.calcEntry, entry, setEntry)}
        {field(t.calcStop, stop, setStop)}
        {field(t.calcTp, tp, setTp)}
        {field(t.calcCapital, capital, setCapital)}
        {field(t.calcRiskPct, riskPct, setRiskPct)}
      </div>
      {result ? (
        <dl className="mt-4 grid gap-2 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-zinc-500">{t.calcRr}</dt>
            <dd className="font-mono text-[var(--color-lime)]">{result.rr.toFixed(2)}R</dd>
          </div>
          <div>
            <dt className="text-zinc-500">{t.calcRiskAmt}</dt>
            <dd className="font-mono text-zinc-100">{result.riskAmount.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">{t.calcSize}</dt>
            <dd className="font-mono text-zinc-100">{result.size.toFixed(4)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">{t.calcInvalid}</p>
      )}
    </div>
  );
}
