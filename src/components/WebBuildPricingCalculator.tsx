"use client";

import { useMemo, useState } from "react";

const plans = [
  {
    name: "Landing page",
    priceFrom: 690,
    duration: "5-9 darbo dienos",
    includes: [
      "Greitas vieno puslapio dizainas ir turinio struktūra",
      "SEO techninis pagrindas (meta, schema, greitis)",
      "Kontaktų forma ir bazinė analitika",
    ],
  },
  {
    name: "E-komercija",
    priceFrom: 1900,
    duration: "3-6 savaitės",
    includes: [
      "Katalogas, produktų puslapiai, atsiskaitymų integracijos",
      "Pirkimo kelio optimizacija ir konversijų matavimas",
      "Techninis SEO + našumo optimizacija",
    ],
  },
  {
    name: "AI aplikacija",
    priceFrom: 3200,
    duration: "4-8 savaitės",
    includes: [
      "AI Orchestration architektūra ir API integracijos",
      "Autonominiai agentai / darbo srautų automatizacija",
      "Stebėsena, testavimas ir plėtros planas",
    ],
  },
] as const;

export function WebBuildPricingCalculator() {
  const [index, setIndex] = useState(0);
  const selected = useMemo(() => plans[index] ?? plans[0], [index]);

  return (
    <section className="site-card-interactive overflow-hidden p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-electric)]">
          Kainos skaičiuoklė
        </p>
        <h3 className="text-2xl font-semibold tracking-tight text-white">Preliminari projekto apimtis</h3>
        <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
          Pasirinkite projekto tipą slider pagalba ir gaukite orientacinę kainą bei trukmę.
        </p>
      </div>

      <div className="mt-6">
        <label htmlFor="project-type" className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
          Projekto tipas
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
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-zinc-300">
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
          <p className="text-sm text-zinc-300">Preliminari kaina</p>
          <p className="mt-1 text-2xl font-semibold text-white">nuo {selected.priceFrom} EUR</p>
          <p className="mt-3 text-sm text-zinc-300">Kūrimo trukmė</p>
          <p className="mt-1 text-lg font-medium text-[var(--color-lime)]">{selected.duration}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_84%,transparent)] p-4">
          <p className="text-sm font-medium text-zinc-200">Kas įeina</p>
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
