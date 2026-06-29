import {
  Bot,
  BrainCircuit,
  Database,
  LayoutPanelTop,
  ServerCog,
  Sparkles,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const cards = [
  {
    title: "Branduolinė inžinerija",
    stack: "Rust, C++, Python, Docker",
    value: "Maksimalus greitis ir stabilumas, kai verslui reikia patikimos platformos augti be trikdžių ir nenuspėjamų gedimų.",
    icon: ServerCog,
    glow: "group-hover:shadow-[0_0_40px_-14px_rgba(34,211,238,0.55)]",
    accent: "from-cyan-400/20 to-transparent",
    size: "md:col-span-2 lg:col-span-2",
    minHeight: "min-h-[16rem] md:min-h-[18rem] lg:min-h-[19rem]",
  },
  {
    title: "AI agentai ir automatizacija",
    stack: "LLM integracijos, agentinė logika, API orkestravimas",
    value: "Architektūruojame AI darbo srautus, kurie sumažina rankinį darbą ir klaidas — nuo SEO užduočių iki duomenų apdorojimo su aiškia atskaitomybe.",
    icon: BrainCircuit,
    glow: "group-hover:shadow-[0_0_40px_-14px_rgba(163,230,53,0.45)]",
    accent: "from-lime-400/20 to-transparent",
    size: "md:row-span-2 lg:col-span-1 lg:row-span-2",
    minHeight: "min-h-[16rem] md:min-h-[24rem] lg:min-h-[26rem]",
  },
  {
    title: "Duomenų analitika",
    stack: "SQL, PostgreSQL, Power BI, GA4",
    value: "Sprendimai pagal skaičius: aiškūs KPI, skaidrios ataskaitos ir prioritetai, kurie remiasi realiais duomenimis, ne intuicija.",
    icon: Database,
    glow: "group-hover:shadow-[0_0_38px_-14px_rgba(56,189,248,0.5)]",
    accent: "from-sky-400/18 to-transparent",
    size: "md:col-span-1 lg:col-span-1",
    minHeight: "min-h-[16rem] md:min-h-[18rem] lg:min-h-[19rem]",
  },
  {
    title: "Integracijos ir automatizacija",
    stack: "Webhook'ai, REST API, e. komercija, pranešimai",
    value: "Sujungiame jūsų įrankius į vieną sistemą: Stripe, el. paštas, CRM, analitika — kad procesai veiktų be rankinio kopijavimo.",
    icon: Bot,
    glow: "group-hover:shadow-[0_0_42px_-16px_rgba(45,212,191,0.48)]",
    accent: "from-teal-400/20 to-transparent",
    size: "md:col-span-1 lg:col-span-1",
    minHeight: "min-h-[16rem] md:min-h-[18rem] lg:min-h-[19rem]",
  },
  {
    title: "Fullstack ir UX",
    stack: "Next.js, React, SEO, prieinamumas",
    value: "Svetainės, kurios greitos, indeksuojamos ir konvertuoja — su moderniu UI ir technine baze, kurią galima prižiūrėti ilgą laiką.",
    icon: LayoutPanelTop,
    glow: "group-hover:shadow-[0_0_44px_-16px_rgba(34,211,238,0.55)]",
    accent: "from-cyan-300/20 to-transparent",
    size: "md:col-span-2 lg:col-span-2",
    minHeight: "min-h-[16rem] md:min-h-[18rem] lg:min-h-[19rem]",
  },
] as const;

export function TechArsenal() {
  return (
    <section id="technologinis-arsenalas" className="site-section border-t border-[var(--color-border)]/60">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Kompetencijos"
          title="Inžinerija, AI ir duomenys vienoje sistemoje"
          description="Nuo branduolinio našumo ir agentinės automatizacijos iki SEO/UX rezultatų, kurie tiesiogiai veikia verslo augimą."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 md:grid-cols-3 md:auto-rows-[minmax(18rem,1fr)] lg:auto-rows-[minmax(19rem,1fr)]">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className={`site-card-interactive group relative overflow-hidden p-6 aspect-[4/3] ${card.glow} ${card.size} ${card.minHeight}`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100`}
                />
                <div className="relative flex h-full flex-col">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_82%,transparent)] text-[var(--color-electric)]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">{card.title}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.13em] text-zinc-300">{card.stack}</p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-200 sm:text-base">{card.value}</p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-balance rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] px-5 py-4 text-center text-base font-medium text-zinc-200 sm:mt-10 sm:text-lg">
          <Sparkles className="mr-2 inline h-4 w-4 text-[var(--color-lime)]" aria-hidden />
          Nekuriame tik kodo — kuriame sistemas, kurios dirba jūsų verslui.
        </p>
      </div>
    </section>
  );
}
