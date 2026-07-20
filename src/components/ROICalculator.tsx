"use client";

import { useMemo, useState } from "react";
import { useDict, useLocale } from "@/components/i18n/LocaleProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";

export function ROICalculator() {
  const t = useDict().roiCalc;
  const { locale } = useLocale();
  const [hoursPerWeek, setHoursPerWeek] = useState(12);
  const [hourlyCost, setHourlyCost] = useState(35);
  const [automationShare, setAutomationShare] = useState(55);
  const [implementationCost, setImplementationCost] = useState(8500);

  const formatEur = (value: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-US" : "lt-LT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);

  const { annualManualCost, annualSavings, paybackMonths, netYearOne } = useMemo(() => {
    const weeks = 52;
    const annualManual = hoursPerWeek * hourlyCost * weeks;
    const savings = annualManual * (automationShare / 100);
    const monthlySavings = savings / 12;
    const payback = monthlySavings > 0 ? implementationCost / monthlySavings : Infinity;
    return {
      annualManualCost: annualManual,
      annualSavings: savings,
      paybackMonths: payback,
      netYearOne: savings - implementationCost,
    };
  }, [hoursPerWeek, hourlyCost, automationShare, implementationCost]);

  return (
    <section id="roi" className="site-section">
      <div className="site-shell">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} description={t.description} wide />

        <div className="mt-12 grid gap-8 sm:mt-14 lg:grid-cols-2 lg:gap-10">
          <div className="site-card space-y-7 p-6 sm:space-y-8 sm:p-8">
            <Slider
              label={t.hoursWeek}
              min={1}
              max={60}
              step={1}
              value={hoursPerWeek}
              onChange={setHoursPerWeek}
              suffix="h"
            />
            <Slider
              label={t.hourlyCost}
              min={10}
              max={120}
              step={1}
              value={hourlyCost}
              onChange={setHourlyCost}
              suffix="€"
            />
            <Slider
              label={t.automationShare}
              min={10}
              max={90}
              step={5}
              value={automationShare}
              onChange={setAutomationShare}
              suffix="%"
            />
            <Slider
              label={t.budget}
              min={2000}
              max={50000}
              step={500}
              value={implementationCost}
              onChange={setImplementationCost}
              prefix="€"
            />
          </div>

          <div className="site-card flex flex-col justify-between gap-6 bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface)] p-6 sm:p-8">
            <div className="space-y-6">
              <Metric label={t.annualManual} value={formatEur(annualManualCost)} hint={t.annualManualHint} />
              <Metric
                label={t.annualSavings}
                value={formatEur(annualSavings)}
                accent
                hint={`${automationShare}${t.savingsHint}`}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Metric
                  label={t.payback}
                  value={Number.isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} ${t.months}` : "—"}
                  hint={t.paybackHint}
                />
                <Metric
                  label={t.netYear}
                  value={formatEur(netYearOne)}
                  hint={t.netHint}
                  positive={netYearOne >= 0}
                />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500">{t.footer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  suffix,
  prefix,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium leading-snug text-zinc-200">{label}</span>
        <span className="font-mono text-sm tabular-nums text-[var(--color-electric)]">
          {prefix}
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-lime)] motion-safe:transition-[background-color] motion-safe:duration-200"
      />
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  accent,
  positive,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-300">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums sm:text-3xl",
          accent ? "text-[var(--color-lime)]" : positive === false ? "text-rose-400" : "text-white",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-300">{hint}</p>
    </div>
  );
}
