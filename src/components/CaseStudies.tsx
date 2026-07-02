"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site-url";

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
};

const cases: CaseStudy[] = [
  {
    id: "ecommerce",
    title: "E. parduotuvės optimizavimas",
    client: "Mažmeninės prekybos startuolis",
    tag: "E. komercija · Next.js",
    problem: "Lėtas krovimasis (4.2 s LCP), prastas SEO, maža konversija mobiluose.",
    solution: "Migracija į Next.js App Router, AVIF vaizdai, Stripe integracija, techninis SEO paketas.",
    lighthouse: [
      { label: "Našumas", before: 45, after: 98 },
      { label: "SEO", before: 72, after: 100 },
      { label: "Prieinamumas", before: 83, after: 100 },
    ],
    outcomes: [
      "Organinis srautas augo ~30 % per du mėnesius (Search Console)",
      "LCP sumažintas nuo 4.2 s iki 1.1 s (Core Web Vitals)",
      "Mobili konversija pagerėjo ~18 % (mokėjimų analitika)",
    ],
    image: DEFAULT_OG_IMAGE_PATH,
    imageAlt: "E. parduotuvės Lighthouse rezultatai po optimizavimo",
  },
  {
    id: "saas-dashboard",
    title: "SaaS valdymo skydas",
    client: "Analitikos platforma",
    tag: "SaaS · React · PostgreSQL",
    problem: "Neoptimizuotos užklausos, lėtas skydo atvaizdavimas, vartotojų nusiskundimai dėl greičio.",
    solution:
      "Serveriniai komponentai, PostgreSQL optimizavimas, podėlio sluoksnis, realaus laiko ataskaitos.",
    lighthouse: [
      { label: "Našumas", before: 52, after: 94 },
      { label: "Geroji praktika", before: 79, after: 100 },
    ],
    outcomes: [
      "Skydo įkrovimo laikas sumažintas ~68 %",
      "NPS pakilo nuo 42 iki 71",
      "Serverio resursų poreikis sumažėjo ~40 %",
    ],
    image: DEFAULT_OG_IMAGE_PATH,
    imageAlt: "SaaS skydo Lighthouse rezultatai po optimizavimo",
  },
  {
    id: "portfolio",
    title: "Kūrėjo portfolio",
    client: "Fotografas / dizaineris",
    tag: "Portfolio · Next.js · AI",
    problem: "Dideli vaizdai lėtino puslapį, trūko SEO, mažas matomumas paieškoje.",
    solution: "next/image su AVIF, lazy loading, struktūriniai duomenys, AI meta pagalba, Search Console.",
    lighthouse: [
      { label: "Našumas", before: 38, after: 96 },
      { label: "SEO", before: 65, after: 100 },
      { label: "Prieinamumas", before: 74, after: 97 },
    ],
    outcomes: [
      "Top rezultatai pagal 3 tikslines užklausas per 6 savaites",
      "Puslapio įkrovimas nuo 8.4 s iki 1.3 s",
      "Organinis srautas augo ~120 %",
    ],
    image: DEFAULT_OG_IMAGE_PATH,
    imageAlt: "Portfolio svetainės optimizavimo rezultatai",
  },
];

function LighthouseBadge({ label, score }: { label: string; score: number }) {
  const color =
    score >= 90 ? "bg-[var(--color-lime)] text-[#101300]" : score >= 50 ? "bg-amber-400 text-amber-950" : "bg-rose-500 text-rose-950";

  const scoreLevel = score >= 90 ? "Puikus" : score >= 50 ? "Vidutinis" : "Žemas";
  const ariaLabel = `${label} balas: ${score} iš 100 — ${scoreLevel}`;

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

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-electric)]">
            {c.tag}
          </span>
          <span className="font-mono text-xs tabular-nums text-zinc-500" aria-label={`Scenarijus ${index + 1}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-white">{c.title}</h3>
        <p className="mt-1 text-xs font-medium text-zinc-400">{c.client}</p>

        <div
          className="mt-4 flex flex-wrap items-center gap-3"
          role="region"
          aria-label="Lighthouse balų palyginimas prieš ir po"
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

        <div className="mt-5">
          <div className={`space-y-3 text-sm leading-relaxed ${!isExpanded ? "max-h-32 overflow-hidden sm:max-h-none" : ""}`}>
            <div>
              <p className="font-semibold text-rose-400">Iššūkis:</p>
              <p className="mt-1 text-zinc-300">{c.problem}</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--color-electric)]">Sprendimas:</p>
              <p className="mt-1 text-zinc-300">{c.solution}</p>
            </div>
          </div>

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

        <ul className="mt-5 flex-1 space-y-2.5 text-sm leading-relaxed text-zinc-300" aria-label="Pasiekti rezultatai">
          {c.outcomes.map((outcome, i) => (
            <li key={i} className="flex gap-2.5">
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
  return (
    <section id="atvejai" className="site-section border-t border-[var(--color-border)]/60">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Atvejai"
          title="Tipiniai scenarijai su matuojamais rezultatais"
          description="Kiekvienas projektas skirtingas — žemiau pavyzdžiai, kaip techninis SEO, našumas ir architektūra veikia realiose situacijose."
          wide
        />

        <ul className="mt-12 grid gap-6 sm:mt-14 lg:grid-cols-3" role="list">
          {cases.map((c, index) => (
            <li key={c.id}>
              <CaseStudyCard caseStudy={c} index={index} />
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-3xl border-l-2 border-[var(--color-border)] pl-4 text-xs leading-relaxed text-zinc-400 sm:mt-12 sm:text-sm">
          Rezultatai priklauso nuo pradinės būklės, nišos ir konkurencijos. Prieš viešus KPI sutariame matavimo modelį
          (Lighthouse, Search Console, GA4).
        </p>
      </div>
    </section>
  );
}
