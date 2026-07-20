"use client";

import {
  Bot,
  BrainCircuit,
  Database,
  LayoutPanelTop,
  ServerCog,
  Sparkles,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useDict } from "@/components/i18n/LocaleProvider";

export function TechArsenal() {
  const dict = useDict();
  const cards = [
    {
      title: dict.arsenal.card1Title,
      stack: dict.arsenal.card1Stack,
      value: dict.arsenal.card1Value,
      icon: ServerCog,
      glow: "group-hover:shadow-[0_0_40px_-14px_rgba(34,211,238,0.55)]",
      accent: "from-cyan-400/20 to-transparent",
    },
    {
      title: dict.arsenal.card2Title,
      stack: dict.arsenal.card2Stack,
      value: dict.arsenal.card2Value,
      icon: BrainCircuit,
      glow: "group-hover:shadow-[0_0_40px_-14px_rgba(163,230,53,0.45)]",
      accent: "from-lime-400/20 to-transparent",
    },
    {
      title: dict.arsenal.card3Title,
      stack: dict.arsenal.card3Stack,
      value: dict.arsenal.card3Value,
      icon: Database,
      glow: "group-hover:shadow-[0_0_38px_-14px_rgba(56,189,248,0.5)]",
      accent: "from-sky-400/18 to-transparent",
    },
    {
      title: dict.arsenal.card4Title,
      stack: dict.arsenal.card4Stack,
      value: dict.arsenal.card4Value,
      icon: Bot,
      glow: "group-hover:shadow-[0_0_42px_-16px_rgba(45,212,191,0.48)]",
      accent: "from-teal-400/20 to-transparent",
    },
    {
      title: dict.arsenal.card5Title,
      stack: dict.arsenal.card5Stack,
      value: dict.arsenal.card5Value,
      icon: LayoutPanelTop,
      glow: "group-hover:shadow-[0_0_44px_-16px_rgba(34,211,238,0.55)]",
      accent: "from-cyan-300/20 to-transparent",
    },
  ] as const;

  return (
    <section id="technologinis-arsenalas" className="site-section border-t border-[var(--color-border)]/60">
      <div className="site-shell">
        <SectionHeader
          eyebrow={dict.arsenal.eyebrow}
          title={dict.arsenal.title}
          description={dict.arsenal.description}
        />

        <ul className="mt-10 grid list-none grid-cols-1 gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-2" role="list">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <li key={card.title} className="min-w-0">
                <article
                  className={`site-card-interactive group relative flex h-full min-h-[14.5rem] flex-col overflow-hidden p-6 sm:min-h-[15.5rem] sm:p-7 ${card.glow}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100`}
                  />
                  <div className="relative flex h-full flex-col">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_82%,transparent)] text-[var(--color-electric)]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-white sm:text-xl">{card.title}</h3>
                    <p className="mt-2 text-sm font-medium leading-snug text-zinc-400">{card.stack}</p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-200 sm:text-base sm:leading-relaxed">
                      {card.value}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-balance rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] px-5 py-4 text-center text-sm font-medium leading-relaxed text-zinc-200 sm:mt-10 sm:text-base">
          <Sparkles className="mr-2 inline h-4 w-4 text-[var(--color-lime)]" aria-hidden />
          {dict.arsenal.tagline}
        </p>
      </div>
    </section>
  );
}
