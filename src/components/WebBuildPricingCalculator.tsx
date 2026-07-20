"use client";

import { useMemo, useState } from "react";
import { useDict } from "@/components/i18n/LocaleProvider";

export function WebBuildPricingCalculator() {
  const dict = useDict();
  const t = dict.webBuildSimple;
  const [index, setIndex] = useState(1);

  const plans = useMemo(
    () =>
      [
        {
          name: t.landingName,
          priceFrom: 330,
          duration: t.landingDuration,
          includes: [t.landing1, t.landing2, t.landing3],
        },
        {
          name: t.businessName,
          priceFrom: 590,
          duration: t.businessDuration,
          includes: [t.business1, t.business2, t.business3],
        },
        {
          name: t.shopName,
          priceFrom: 990,
          duration: t.shopDuration,
          includes: [t.shop1, t.shop2, t.shop3],
        },
        {
          name: t.aiName,
          priceFrom: 1690,
          duration: t.aiDuration,
          includes: [t.ai1, t.ai2, t.ai3],
        },
      ] as const,
    [t],
  );

  const selected = plans[index] ?? plans[1];

  return (
    <section className="site-card-interactive overflow-hidden p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-electric)]">{t.kicker}</p>
        <h3 className="text-2xl font-semibold tracking-tight text-white">{t.title}</h3>
        <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">{t.lead}</p>
      </div>

      <div className="mt-6">
        <label htmlFor="project-type" className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
          {t.projectType}
        </label>
        <input
          id="project-type"
          type="range"
          min={0}
          max={plans.length - 1}
          step={1}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color-mix(in_oklab,var(--color-border)_75%,transparent)] accent-[var(--color-electric)]"
          aria-valuemin={0}
          aria-valuemax={plans.length - 1}
          aria-valuenow={index}
          aria-valuetext={selected.name}
        />
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs text-zinc-400 sm:grid-cols-4">
          {plans.map((plan, i) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded-md px-2 py-1.5 transition ${i === index ? "bg-[color-mix(in_oklab,var(--color-electric)_18%,transparent)] text-[var(--color-electric)]" : "hover:bg-white/5 hover:text-zinc-300"}`}
            >
              {plan.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_90%,transparent)] p-4">
          <p className="text-sm text-zinc-400">{t.priceLabel}</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {t.from} {selected.priceFrom} €
          </p>
          <p className="mt-3 text-sm text-zinc-400">{t.durationLabel}</p>
          <p className="mt-1 text-lg font-medium text-[var(--color-lime)]">{selected.duration}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_84%,transparent)] p-4">
          <p className="text-sm font-medium text-zinc-200">{t.includesLabel}</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-300">
            {selected.includes.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-electric)]" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
