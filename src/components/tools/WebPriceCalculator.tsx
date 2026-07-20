"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useDict } from "@/components/i18n/LocaleProvider";

type ProjectType = "landing" | "verslo" | "ecommerce";

const baseRates: Record<ProjectType, { base: number; perPage: number }> = {
  landing: { base: 330, perPage: 0 },
  verslo: { base: 590, perPage: 55 },
  ecommerce: { base: 990, perPage: 75 },
};

const ADDON_META = [
  { id: "seo-pro", price: 129, labelKey: "addonSeoPro", tipKey: "addonSeoProTip", defaultChecked: false },
  { id: "seo-audit-90", price: 249, labelKey: "addonAudit", tipKey: "addonAuditTip", defaultChecked: false },
  { id: "content-starter", price: 390, labelKey: "addonContent", tipKey: "addonContentTip", defaultChecked: false },
  { id: "ai-features", price: 239, labelKey: "addonAi", tipKey: "addonAiTip", defaultChecked: false },
  { id: "premium-hosting", price: 69, labelKey: "addonHosting", tipKey: "addonHostingTip", defaultChecked: true },
] as const;

export function WebPriceCalculator() {
  const dict = useDict();
  const t = dict.webPriceCalc;
  const reduceMotion = useReducedMotion();
  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 28 };

  const [projectType, setProjectType] = useState<ProjectType>("verslo");
  const [extraPages, setExtraPages] = useState(2);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(
    () => new Set(ADDON_META.filter((a) => a.defaultChecked).map((a) => a.id)),
  );

  const addons = useMemo(
    () =>
      ADDON_META.map((a) => ({
        id: a.id,
        price: a.price,
        label: t[a.labelKey],
        tooltip: t[a.tipKey],
      })),
    [t],
  );

  const pricing = useMemo(() => {
    const rate = baseRates[projectType];
    const basePrice = rate.base;
    const pagesPrice = projectType === "landing" ? 0 : rate.perPage * extraPages;
    const addonsPrice = addons
      .filter((a) => selectedAddons.has(a.id))
      .reduce((sum, a) => sum + a.price, 0);

    const total = basePrice + pagesPrice + addonsPrice;
    const duration =
      projectType === "landing"
        ? t.durationLanding
        : projectType === "ecommerce"
          ? t.durationEcommerce
          : t.durationBusiness;

    return {
      basePrice,
      pagesPrice,
      addonsPrice,
      total,
      duration,
      breakdown: [
        { label: t.basePrice, amount: basePrice },
        ...(pagesPrice > 0
          ? [{ label: `+${extraPages} ${t.pagesLine} (${rate.perPage} ${t.perPage})`, amount: pagesPrice }]
          : []),
        ...(addonsPrice > 0 ? [{ label: t.addonsLine, amount: addonsPrice }] : []),
      ],
    };
  }, [projectType, extraPages, selectedAddons, addons, t]);

  function toggleAddon(id: string) {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const projectTypes: Array<{ id: ProjectType; label: string }> = [
    { id: "landing", label: t.typeLanding },
    { id: "verslo", label: t.typeBusiness },
    { id: "ecommerce", label: t.typeEcommerce },
  ];

  const basePages = projectType === "verslo" ? "5" : "8";

  return (
    <section className="site-card-interactive overflow-hidden p-6 sm:p-8" aria-labelledby="price-calc-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-electric)]">{t.kicker}</p>
      <h2 id="price-calc-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {t.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">{t.lead}</p>

      <div className="mt-8">
        <p className="mb-4 text-sm font-medium text-zinc-200">{t.projectType}</p>
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

      {projectType !== "landing" && (
        <motion.div layout transition={spring} className="mt-8">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="extra-pages" className="text-sm font-medium text-zinc-200">
              {t.extraPages}
            </label>
            <span className="font-mono text-sm tabular-nums text-[var(--color-lime)]">
              {extraPages} {t.pagesUnit}
            </span>
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
            aria-label={`${t.extraPages}: ${extraPages}`}
          />
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            {t.pagesHintPrefix} {basePages} {t.pagesHintMid} {baseRates[projectType].perPage} {t.pagesHintSuffix}
          </p>
        </motion.div>
      )}

      <motion.div layout transition={spring} className="mt-8">
        <p className="mb-4 text-sm font-medium text-zinc-200">{t.addonsTitle}</p>
        <div className="space-y-3">
          {addons.map((addon) => {
            const isChecked = selectedAddons.has(addon.id);
            return (
              <label
                key={addon.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] p-4 transition hover:bg-[color-mix(in_oklab,var(--color-surface)_75%,transparent)]"
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
                    <span className="font-mono text-sm tabular-nums text-[var(--color-lime)]">+{addon.price} €</span>
                    <button
                      type="button"
                      className="group relative inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-zinc-300 transition hover:border-[var(--color-electric)] hover:text-[var(--color-electric)]"
                      aria-label={`${t.infoAbout} ${addon.label}`}
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

      <motion.div
        layout
        transition={spring}
        className="mt-8 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-5 sm:p-6"
      >
        <p className="text-sm font-semibold text-zinc-200">{t.breakdownTitle}</p>
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
              <span className="font-mono tabular-nums">{item.amount} €</span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-[var(--color-border)]/60 pt-4">
          <span className="text-base font-semibold text-zinc-100">{t.totalLabel}</span>
          <motion.span
            key={pricing.total}
            initial={reduceMotion ? false : { scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={spring}
            className="text-2xl font-semibold tabular-nums text-[var(--color-lime)]"
          >
            {pricing.total} €
          </motion.span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          {t.durationLabel} <span className="font-medium text-zinc-200">{pricing.duration}</span>
        </p>
      </motion.div>

      <motion.div layout transition={spring} className="mt-8 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/#kontaktai"
            className="site-btn-primary inline-flex min-h-11 items-center justify-center text-center"
          >
            {t.ctaEmail}
          </Link>
          <Link
            href="/#kontaktai"
            className="site-btn-secondary inline-flex min-h-11 items-center justify-center text-center"
          >
            {t.ctaConsult}
          </Link>
        </div>
        <p className="text-xs leading-relaxed text-zinc-400">{t.afterNote}</p>
      </motion.div>

      <motion.div
        layout
        transition={spring}
        className="mt-6 space-y-4 rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-5 sm:p-6"
      >
        <h3 className="text-base font-semibold text-zinc-100 sm:text-lg">{t.valueTitle}</h3>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--color-border)]/80 bg-[var(--color-surface)]/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{t.marketLabel}</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-white">{t.marketRange}</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{t.marketBody}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-lime)]/35 bg-[color-mix(in_oklab,var(--color-lime)_8%,transparent)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-lime)]">Skenuok.com</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-white">{pricing.total} €</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-300">{t.brandBody}</p>
          </div>
        </div>
        <p className="border-l-2 border-[var(--color-electric)]/50 pl-4 text-xs leading-relaxed text-zinc-400 sm:text-sm">
          {t.footnote}
        </p>
      </motion.div>
    </section>
  );
}
