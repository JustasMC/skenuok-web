"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type ProjectType = "landing" | "verslo" | "ecommerce";

const baseRates: Record<ProjectType, { base: number; perPage: number; duration: string }> = {
  landing: { base: 690, perPage: 0, duration: "5-9 darbo dienos" },
  verslo: { base: 1400, perPage: 120, duration: "2-4 savaitės" },
  ecommerce: { base: 2200, perPage: 180, duration: "3-6 savaitės" },
};

const addons: ReadonlyArray<{
  id: string;
  label: string;
  price: number;
  tooltip: string;
  defaultChecked?: boolean;
}> = [
  {
    id: "seo-pro",
    label: "SEO Pro paketas",
    price: 390,
    tooltip:
      "Užtikriname 100/100 Lighthouse balus: meta optimizavimas, schema markup, Core Web Vitals patikrinimas ir Search Console integracija.",
  },
  {
    id: "ai-features",
    label: "AI funkcijos",
    price: 650,
    tooltip:
      "AI Chat botai, turinio generavimas, automatinis SEO auditas — pritaikyta jūsų verslo poreikiams, ne generic chatbot'as.",
  },
  {
    id: "premium-hosting",
    label: "Premium Hosting & Support",
    price: 180,
    tooltip:
      "Railway deployment, CDN optimizavimas, automatiniai backup'ai ir 3 mėnesių techninė pagalba po paleidimo (atnaujinimai, bugfix'ai).",
    defaultChecked: true,
  },
];

export function WebPriceCalculator() {
  const reduceMotion = useReducedMotion();
  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 28 };

  const [projectType, setProjectType] = useState<ProjectType>("verslo");
  const [extraPages, setExtraPages] = useState(3);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(
    new Set(addons.filter((a) => a.defaultChecked).map((a) => a.id)),
  );

  const pricing = useMemo(() => {
    const rate = baseRates[projectType];
    const basePrice = rate.base;
    const pagesPrice = projectType === "landing" ? 0 : rate.perPage * extraPages;
    const addonsPrice = addons
      .filter((a) => selectedAddons.has(a.id))
      .reduce((sum, a) => sum + a.price, 0);

    const total = basePrice + pagesPrice + addonsPrice;

    return {
      basePrice,
      pagesPrice,
      addonsPrice,
      total,
      duration: rate.duration,
      breakdown: [
        { label: "Bazinė kaina", amount: basePrice },
        ...(pagesPrice > 0 ? [{ label: `+${extraPages} psl. (${rate.perPage} EUR/psl.)`, amount: pagesPrice }] : []),
        ...(addonsPrice > 0 ? [{ label: "Priedai", amount: addonsPrice }] : []),
      ],
    };
  }, [projectType, extraPages, selectedAddons]);

  function toggleAddon(id: string) {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const projectTypes: Array<{ id: ProjectType; label: string }> = [
    { id: "landing", label: "Landing page" },
    { id: "verslo", label: "Verslo svetainė" },
    { id: "ecommerce", label: "E-komercija" },
  ];

  return (
    <section className="site-card-interactive overflow-hidden p-6 sm:p-8" aria-labelledby="price-calc-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-electric)]">
        Interaktyvus įrankis
      </p>
      <h2 id="price-calc-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Svetainių kūrimo kainų skaičiuoklė
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
        Pasirinkite projekto tipą, norimus priedus ir puslapių skaičių. Matote realaus laiko kainą su detaliu išskaidymu —
        skaidrumas yra mūsų prioritetas.
      </p>

      {/* Project Type Selector */}
      <div className="mt-8">
        <p className="mb-4 text-sm font-medium text-zinc-200">Projekto tipas</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {projectTypes.map((pt) => {
            const isActive = projectType === pt.id;
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => setProjectType(pt.id)}
                className={`rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                  isActive
                    ? "border-[var(--color-electric)] bg-[color-mix(in_oklab,var(--color-electric)_16%,transparent)] text-[var(--color-electric)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]/50 text-zinc-300 hover:border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                }`}
                aria-pressed={isActive}
              >
                {pt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Extra Pages Slider */}
      {projectType !== "landing" && (
        <motion.div layout transition={spring} className="mt-8">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="extra-pages" className="text-sm font-medium text-zinc-200">
              Papildomi puslapiai
            </label>
            <span className="font-mono text-sm tabular-nums text-[var(--color-lime)]">{extraPages} psl.</span>
          </div>
          <input
            id="extra-pages"
            type="range"
            min={0}
            max={15}
            step={1}
            value={extraPages}
            onChange={(e) => setExtraPages(Number(e.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-lime)]"
            aria-valuemin={0}
            aria-valuemax={15}
            aria-valuenow={extraPages}
            aria-label={`Papildomi puslapiai: ${extraPages}`}
          />
          <p className="mt-2 text-xs leading-relaxed text-zinc-300">
            Bazinė versija — iki {projectType === "verslo" ? "5" : "8"} puslapių (apie, paslaugos, kontaktai). Virš to —{" "}
            {baseRates[projectType].perPage} EUR / psl.
          </p>
        </motion.div>
      )}

      {/* Addons Checkboxes */}
      <motion.div layout transition={spring} className="mt-8">
        <p className="mb-4 text-sm font-medium text-zinc-200">Priedai</p>
        <div className="space-y-3">
          {addons.map((addon) => {
            const isChecked = selectedAddons.has(addon.id);
            return (
              <label
                key={addon.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] p-4 transition hover:border-[var(--color-border)] hover:bg-[color-mix(in_oklab,var(--color-surface)_75%,transparent)]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAddon(addon.id)}
                  className="mt-0.5 h-5 w-5 cursor-pointer appearance-none rounded border-2 border-[var(--color-border)] bg-transparent checked:border-[var(--color-electric)] checked:bg-[var(--color-electric)] focus:outline-none focus:ring-2 focus:ring-[var(--color-electric)]/50 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
                  aria-describedby={`${addon.id}-tooltip`}
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-zinc-100">{addon.label}</span>
                    <span className="font-mono text-sm tabular-nums text-[var(--color-lime)]">+{addon.price} EUR</span>
                    <button
                      type="button"
                      className="group relative inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-zinc-300 transition hover:border-[var(--color-electric)] hover:text-[var(--color-electric)]"
                      aria-label={`Info apie ${addon.label}`}
                    >
                      <Info className="h-3.5 w-3.5" aria-hidden />
                      <span
                        id={`${addon.id}-tooltip`}
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs leading-relaxed text-zinc-300 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                      >
                        {addon.tooltip}
                      </span>
                    </button>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </motion.div>

      {/* Pricing Breakdown */}
      <motion.div layout transition={spring} className="mt-8 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-5 sm:p-6">
        <p className="text-sm font-semibold text-zinc-200">Kainos išskaidymas (breakdown)</p>
        <ul className="mt-4 space-y-2.5 text-sm">
          {pricing.breakdown.map((item, i) => (
            <motion.li
              key={i}
              initial={reduceMotion ? false : { opacity: 0.7, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={spring}
              className="flex items-baseline justify-between gap-3 text-zinc-300"
            >
              <span>{item.label}</span>
              <span className="font-mono tabular-nums">{item.amount} EUR</span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-[var(--color-border)]/60 pt-4">
          <span className="text-base font-semibold text-zinc-100">Viso</span>
          <motion.span
            key={pricing.total}
            initial={reduceMotion ? false : { scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={spring}
            className="text-2xl font-semibold tabular-nums text-[var(--color-lime)]"
          >
            {pricing.total} EUR
          </motion.span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-zinc-300">
          Orientacinė trukmė: <span className="font-medium text-zinc-200">{pricing.duration}</span>
        </p>
      </motion.div>

      {/* CTA Section */}
      <motion.div layout transition={spring} className="mt-8 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/#kontaktai"
            className="site-btn-primary inline-flex min-h-11 items-center justify-center text-center"
          >
            Gauti šį pasiūlymą PDF formatu
          </Link>
          <Link
            href="/#kontaktai"
            className="site-btn-secondary inline-flex min-h-11 items-center justify-center text-center"
          >
            Rezervuoti konsultaciją
          </Link>
        </div>
        <p className="text-xs leading-relaxed text-zinc-300">
          <strong className="font-medium text-zinc-200">SEO efektas:</strong> Interaktyvūs įrankiai padidina puslapio
          engagement — Google tai mato kaip kokybės signalą ir geriau ranguoja svetainę.
        </p>
      </motion.div>
    </section>
  );
}
