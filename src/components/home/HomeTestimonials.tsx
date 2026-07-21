"use client";

import Link from "next/link";
import { useDict } from "@/components/i18n/LocaleProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function HomeTestimonials() {
  const t = useDict().testimonials;
  const items = [
    { id: "audit-first", role: t.t1Role, quote: t.t1Quote },
    { id: "course-scan", role: t.t2Role, quote: t.t2Quote },
    { id: "ai-audit", role: t.t3Role, quote: t.t3Quote },
  ] as const;

  return (
    <section
      id="atsiliepimai"
      className="site-section border-t border-[var(--color-border)]/60 bg-[color-mix(in_oklab,var(--color-bg)_97%,var(--color-surface))]"
    >
      <div className="site-shell">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />
        <ul className="mt-10 grid list-none gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {items.map((item) => (
            <li key={item.id}>
              <figure className="site-card h-full p-6 sm:p-7">
                <blockquote className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                  <p className="text-pretty italic">{`„${item.quote}“`}</p>
                </blockquote>
                <figcaption className="mt-5 text-xs text-zinc-400">
                  <span className="font-medium text-zinc-200">{item.role}</span>
                  <span className="mt-1 block text-[11px] uppercase tracking-wide text-zinc-500">{t.typical}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs leading-relaxed text-zinc-400 sm:mt-10 sm:text-sm">
          {t.ctaBefore}{" "}
          <Link className="site-link-inline" href="/scan/web">
            {t.ctaScanner}
          </Link>{" "}
          {t.ctaOr}{" "}
          <Link className="site-link-inline" href="/#kontaktai">
            {t.ctaContact}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
