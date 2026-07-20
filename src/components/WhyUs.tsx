"use client";

import { useDict } from "@/components/i18n/LocaleProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function WhyUs() {
  const t = useDict().whyUs;
  const pillars = [
    {
      title: t.p1Title,
      body: t.p1Body,
      accent: "border-[var(--color-electric)]/40",
      glow: "group-hover:shadow-[0_0_36px_-12px_rgba(0,212,255,0.35)]",
      tag: t.p1Tag,
    },
    {
      title: t.p2Title,
      body: t.p2Body,
      accent: "border-[var(--color-lime)]/40",
      glow: "group-hover:shadow-[0_0_36px_-12px_rgba(200,255,0,0.3)]",
      tag: t.p2Tag,
    },
    {
      title: t.p3Title,
      body: t.p3Body,
      accent: "border-sky-400/40",
      glow: "group-hover:shadow-[0_0_36px_-12px_rgba(56,189,248,0.35)]",
      tag: t.p3Tag,
    },
  ] as const;

  return (
    <section id="kodel-mes" className="site-section border-t border-[var(--color-border)]/60">
      <div className="site-shell">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />

        <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
          {pillars.map((p) => (
            <article
              key={p.title}
              className={`site-card-interactive group flex flex-col border-t-2 ${p.accent} p-6 sm:p-8 ${p.glow} min-h-[18rem]`}
            >
              <span className="inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-electric)]">
                {p.tag}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-white sm:text-xl">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-300 sm:text-base">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
