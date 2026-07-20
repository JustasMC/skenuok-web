"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useDict } from "@/components/i18n/LocaleProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/i18n/dictionaries/lt";

type LighthouseScore = { label: string; before: number; after: number };

type CaseStudy = {
  id: string;
  title: string;
  client: string;
  tag: string;
  problem: string;
  solution: string;
  lighthouse: LighthouseScore[];
  outcomes: string[];
};

function LighthouseBadge({
  label,
  score,
  t,
}: {
  label: string;
  score: number;
  t: Dictionary["caseStudies"];
}) {
  const color =
    score >= 90
      ? "bg-[var(--color-lime)] text-[#101300]"
      : score >= 50
        ? "bg-amber-400 text-amber-950"
        : "bg-rose-500 text-rose-950";

  const scoreLevel = score >= 90 ? t.scoreExcellent : score >= 50 ? t.scoreAverage : t.scoreLow;
  const ariaLabel = `${label} ${t.scoreOf}: ${score} ${t.outOf} 100 — ${scoreLevel}`;

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={ariaLabel}>
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${color}`}
        aria-hidden="true"
      >
        {score}
      </div>
      <span className="text-xs font-medium text-zinc-300" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}

function CaseStudyCard({
  caseStudy,
  index,
  t,
}: {
  caseStudy: CaseStudy;
  index: number;
  t: Dictionary["caseStudies"];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const c = caseStudy;

  return (
    <motion.article
      initial={false}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md shadow-black/25 transition-shadow hover:shadow-xl hover:shadow-black/40"
    >
      <div
        className="relative flex aspect-[16/10] items-end overflow-hidden bg-[color-mix(in_oklab,var(--color-surface-2)_80%,var(--color-electric)_8%)] p-5"
        aria-hidden
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--color-electric)_22%,transparent),transparent_55%)]" />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-electric)]">
            {t.scenario}
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-400">{c.tag}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-electric)]">
            {c.tag}
          </span>
          <span
            className="font-mono text-xs tabular-nums text-zinc-500"
            aria-label={`${t.scenario} ${index + 1}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-white">{c.title}</h3>
        <p className="mt-1 text-xs font-medium text-zinc-400">{c.client}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3" role="region" aria-label={t.lighthouseCompare}>
          {c.lighthouse.map((ls) => (
            <div key={ls.label} className="flex items-center gap-1">
              <LighthouseBadge label={ls.label} score={ls.before} t={t} />
              <span className="text-zinc-500" aria-label={t.improvedTo}>
                →
              </span>
              <LighthouseBadge label={ls.label} score={ls.after} t={t} />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div
            className={`space-y-3 text-sm leading-relaxed ${!isExpanded ? "max-h-32 overflow-hidden sm:max-h-none" : ""}`}
          >
            <div>
              <p className="font-semibold text-rose-400">{t.challenge}</p>
              <p className="mt-1 text-zinc-300">{c.problem}</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--color-electric)]">{t.solution}</p>
              <p className="mt-1 text-zinc-300">{c.solution}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-electric)] transition hover:text-[var(--color-lime)] sm:hidden"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? t.showLess : t.showMore}
          >
            {isExpanded ? t.showLess : t.showMore}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>

        <ul className="mt-5 flex-1 space-y-2.5 text-sm leading-relaxed text-zinc-300" aria-label={t.results}>
          {c.outcomes.map((outcome) => (
            <li key={outcome} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-lime)]" aria-hidden />
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function CaseStudies() {
  const t = useDict().caseStudies;

  const cases: CaseStudy[] = useMemo(
    () => [
      {
        id: "ecommerce",
        title: t.c1Title,
        client: t.c1Client,
        tag: t.c1Tag,
        problem: t.c1Problem,
        solution: t.c1Solution,
        lighthouse: [
          { label: t.perf, before: 45, after: 98 },
          { label: t.seo, before: 72, after: 100 },
          { label: t.a11y, before: 83, after: 100 },
        ],
        outcomes: [t.c1o1, t.c1o2, t.c1o3],
      },
      {
        id: "saas-dashboard",
        title: t.c2Title,
        client: t.c2Client,
        tag: t.c2Tag,
        problem: t.c2Problem,
        solution: t.c2Solution,
        lighthouse: [
          { label: t.perf, before: 52, after: 94 },
          { label: t.bestPractices, before: 79, after: 100 },
        ],
        outcomes: [t.c2o1, t.c2o2, t.c2o3],
      },
      {
        id: "portfolio",
        title: t.c3Title,
        client: t.c3Client,
        tag: t.c3Tag,
        problem: t.c3Problem,
        solution: t.c3Solution,
        lighthouse: [
          { label: t.perf, before: 38, after: 96 },
          { label: t.seo, before: 65, after: 100 },
          { label: t.a11y, before: 74, after: 97 },
        ],
        outcomes: [t.c3o1, t.c3o2, t.c3o3],
      },
    ],
    [t],
  );

  return (
    <section id="atvejai" className="site-section border-t border-[var(--color-border)]/60">
      <div className="site-shell">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} description={t.description} wide />

        <ul className="mt-12 grid gap-6 sm:mt-14 lg:grid-cols-3" role="list">
          {cases.map((c, index) => (
            <li key={c.id}>
              <CaseStudyCard caseStudy={c} index={index} t={t} />
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-3xl border-l-2 border-[var(--color-border)] pl-4 text-xs leading-relaxed text-zinc-400 sm:mt-12 sm:text-sm">
          {t.disclaimer}
        </p>
      </div>
    </section>
  );
}
