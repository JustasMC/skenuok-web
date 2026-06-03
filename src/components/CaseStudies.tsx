"use client";

import { motion } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
  image: string;
  imageAlt: string;
  liveUrl?: string;
};

const cases: CaseStudy[] = [
  {
    id: "ecommerce",
    title: "E-komercijos platforma",
    client: "Fashion Startup",
    tag: "E-komercija · Next.js",
    problem: "Lėtas krovimasis (4.2s LCP), prastas SEO, maža konversija mobiluose.",
    solution: "Migracija į Next.js 15 App Router, vaizdų optimizavimas (AVIF), Stripe integracija, SEO Pro paketas.",
    lighthouse: [
      { label: "Perf", before: 45, after: 98 },
      { label: "SEO", before: 72, after: 100 },
      { label: "A11y", before: 83, after: 100 },
    ],
    outcomes: [
      "+30% organinio srauto per 2 mėnesius (Search Console data)",
      "LCP sumažintas nuo 4.2s iki 1.1s (Core Web Vitals)",
      "Konversija mobiluose pakilo +18% (Stripe analytics)",
    ],
    image: "/og-image.png",
    imageAlt: "E-komercijos platformos Lighthouse audit rezultatai: Performance 98, SEO 100, Accessibility 100",
  },
  {
    id: "saas-dashboard",
    title: "SaaS valdymo skydas",
    client: "Analytics SaaS",
    tag: "SaaS · React · PostgreSQL",
    problem: "Neoptimizuota duomenų užklausa, lėtas dashboard rendering, vartotojų skundai dėl patyrimo.",
    solution:
      "React Server Components, PostgreSQL query optimizavimas, Redis cache layer, Power BI integracija realiam laikui.",
    lighthouse: [
      { label: "Perf", before: 52, after: 94 },
      { label: "Best", before: 79, after: 100 },
    ],
    outcomes: [
      "Dashboard įkrovimo laikas sumažintas 68% (analitiška metrika)",
      "Vartotojų pasitenkinimas (NPS) pakilo nuo 42 į 71",
      "Serveriui reikia 40% mažiau resursų (Railway metrics)",
    ],
    image: "/og-image.png",
    imageAlt: "SaaS dashboard Lighthouse rezultatai po optimizacijos: Performance 94, Best Practices 100",
  },
  {
    id: "portfolio",
    title: "Portfolio svetainė",
    client: "Fotografas / Kūrėjas",
    tag: "Portfolio · Next.js · AI",
    problem: "Didelio formato nuotraukos lėtino puslapį, nebuvo SEO optimizavimo, nematomas Google.",
    solution: "Next.js Image su AVIF, lazy loading, schema markup, AI meta generatorius, Google Search Console setup.",
    lighthouse: [
      { label: "Perf", before: 38, after: 96 },
      { label: "SEO", before: 65, after: 100 },
      { label: "A11y", before: 74, after: 97 },
    ],
    outcomes: [
      "Pirmas Google puslapis pagal 3 tikslines užklausas per 6 savaites",
      "Puslapio įkrovimas sumažintas nuo 8.4s iki 1.3s (Lighthouse)",
      "+120% organinio srauto (Search Console)",
    ],
    image: "/og-image.png",
    imageAlt: "Portfolio svetainės optimizavimo rezultatai: Performance 96, SEO 100, Accessibility 97",
  },
];

function LighthouseBadge({ label, score }: { label: string; score: number }) {
  const color =
    score >= 90 ? "bg-[var(--color-lime)] text-[#101300]" : score >= 50 ? "bg-amber-400 text-amber-950" : "bg-rose-500 text-rose-950";
  
  const scoreLevel = score >= 90 ? "Puikus" : score >= 50 ? "Vidutinis" : "Žemas";
  const ariaLabel = `${label} balas: ${score} iš 100 - ${scoreLevel} rezultatas`;
  
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={ariaLabel}>
      <div 
        className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${color}`}
        aria-hidden="true"
      >
        {score}
      </div>
      <span className="text-xs font-medium text-zinc-300" aria-hidden="true">{label}</span>
    </div>
  );
}

function CaseStudyCard({ caseStudy, index }: { caseStudy: CaseStudy; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const c = caseStudy;

  return (
    <motion.article
      initial={false}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md shadow-black/25 transition-shadow hover:shadow-xl hover:shadow-black/40"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-bg)]">
        <Image
          src={c.image}
          alt={c.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={index === 0}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-electric)]">
            {c.tag}
          </span>
          <span className="font-mono text-xs tabular-nums text-zinc-500" aria-label={`Projektas ${index + 1}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-white">{c.title}</h3>
        <p className="mt-1 text-xs font-medium text-zinc-400">{c.client}</p>

        {/* Lighthouse Badges */}
        <div 
          className="mt-4 flex flex-wrap items-center gap-3"
          role="region"
          aria-label="Lighthouse balų palyginimas prieš ir po optimizavimo"
        >
          {c.lighthouse.map((ls) => (
            <div key={ls.label} className="flex items-center gap-1">
              <LighthouseBadge label={ls.label} score={ls.before} />
              <span className="text-zinc-500" aria-label="pagerinta į">
                →
              </span>
              <LighthouseBadge label={ls.label} score={ls.after} />
            </div>
          ))}
        </div>

        {/* Problem & Solution - Collapsible on mobile */}
        <div className="mt-5">
          <div className={`space-y-3 text-sm leading-relaxed ${!isExpanded ? "max-h-32 overflow-hidden sm:max-h-none" : ""}`}>
            <div>
              <p className="font-semibold text-rose-400">Problema:</p>
              <p className="mt-1 text-zinc-300">{c.problem}</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--color-electric)]">Sprendimas:</p>
              <p className="mt-1 text-zinc-300">{c.solution}</p>
            </div>
          </div>

          {/* Read More Toggle (Mobile Only) */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-electric)] transition hover:text-[var(--color-lime)] sm:hidden"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Rodyti mažiau" : "Skaityti daugiau"}
          >
            {isExpanded ? "Rodyti mažiau" : "Skaityti daugiau"}
            <ChevronDown 
              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>

        {/* Outcomes */}
        <ul className="mt-5 flex-1 space-y-2.5 text-sm leading-relaxed text-zinc-300" aria-label="Pasiekti rezultatai">
          {c.outcomes.map((outcome, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-lime)]" aria-hidden />
              <span>{outcome}</span>
            </li>
          ))}
        </ul>

        {/* Live Button (appears on hover) */}
        {c.liveUrl && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="mt-5"
          >
            <Link
              href={c.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-electric)] bg-[color-mix(in_oklab,var(--color-electric)_14%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--color-electric)] transition hover:bg-[color-mix(in_oklab,var(--color-electric)_22%,transparent)]"
              aria-label={`Pamatyti ${c.title} gyvai`}
            >
              Pamatyti gyvai
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}

export function CaseStudies() {
  return (
    <section id="atvejai" className="site-section border-t border-[var(--color-border)]/60">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Portfolio"
          title="Realūs projektai, matuojami rezultatai"
          description="Ne tik gražios nuotraukos — mes rodome Lighthouse balus, Core Web Vitals pokyčius ir organinio srauto augimą. Kiekvienas projektas turi savo 'prieš/po' istoriją."
          wide
        />

        <ul className="mt-12 grid gap-6 sm:mt-14 lg:grid-cols-3" role="list">
          {cases.map((c, index) => (
            <li key={c.id}>
              <CaseStudyCard caseStudy={c} index={index} />
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-3xl border-l-2 border-[var(--color-border)] pl-4 text-xs leading-relaxed text-zinc-300 sm:mt-12 sm:text-sm">
          <strong className="font-medium text-zinc-200">Skaidrumas:</strong> rodomi rezultatai yra realūs, bet kiekvienas
          projektas turi savo pradinę būklę, nišą ir konkurenciją. Prieš viešus KPI sutariame matavimo modelį (Lighthouse,
          Search Console, GA4, Stripe).
        </p>
      </div>
    </section>
  );
}
