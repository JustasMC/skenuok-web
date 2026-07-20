"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { useDict } from "@/components/i18n/LocaleProvider";

const badgeClass =
  "inline-block rounded-md border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_75%,var(--color-surface-2))] px-2 py-0.5 font-mono text-xs font-medium uppercase tracking-wide text-zinc-300";

export function Services() {
  const dict = useDict();
  const modules = [
    {
      title: dict.modules.m1Title,
      body: dict.modules.m1Body,
      tag: dict.modules.m1Tag,
      badges: null as string[] | null,
    },
    {
      title: dict.modules.m2Title,
      body: dict.modules.m2Body,
      tag: dict.modules.m2Tag,
      badges: null,
    },
    {
      title: dict.modules.m3Title,
      body: dict.modules.m3Body,
      tag: dict.modules.m3Tag,
      badges: null,
    },
    {
      title: dict.modules.m4Title,
      body: dict.modules.m4Body,
      tag: dict.modules.m4Tag,
      badges: ["Rust", "C++", "API"] as string[],
    },
  ];

  return (
    <section id="moduliai" className="site-section">
      <div className="site-shell">
        <SectionHeader
          eyebrow={dict.modules.eyebrow}
          title={dict.modules.title}
          description={dict.modules.description}
        />

        <div className="mt-12 grid gap-5 sm:mt-14 sm:gap-6 lg:grid-cols-2">
          {modules.map((m, i) => (
            <article key={m.title} className="site-card-interactive relative overflow-hidden p-6 sm:p-8">
              <span className="pointer-events-none absolute -right-2 -top-4 select-none font-mono text-7xl font-bold text-[color-mix(in_oklab,var(--color-border)_65%,transparent)] sm:text-8xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-electric)]">
                {m.tag}
              </span>
              <h3 className="relative mt-5 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
                {m.title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base sm:leading-relaxed">{m.body}</p>
              {m.badges ? (
                <ul className="relative mt-5 flex flex-wrap gap-2" aria-label="Tech">
                  {m.badges.map((b) => (
                    <li key={b}>
                      <span className={badgeClass}>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
