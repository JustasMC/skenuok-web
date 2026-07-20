"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useDict } from "@/components/i18n/LocaleProvider";

export function HomePrimaryServices() {
  const dict = useDict();
  const cards = [
    {
      title: dict.homeServices.card1Title,
      kicker: dict.homeServices.card1Kicker,
      body: dict.homeServices.card1Body,
      href: "/tools/scanner",
      cta: dict.homeServices.card1Cta,
    },
    {
      title: dict.homeServices.card2Title,
      kicker: dict.homeServices.card2Kicker,
      body: dict.homeServices.card2Body,
      href: "/tools/course-scanner",
      cta: dict.homeServices.card2Cta,
    },
    {
      title: dict.homeServices.card3Title,
      kicker: dict.homeServices.card3Kicker,
      body: dict.homeServices.card3Body,
      href: "/irankiai/seo-generatorius",
      cta: dict.homeServices.card3Cta,
    },
    {
      title: dict.homeServices.card4Title,
      kicker: dict.homeServices.card4Kicker,
      body: dict.homeServices.card4Body,
      href: "/svetainiu-kurimas",
      cta: dict.homeServices.card4Cta,
    },
  ] as const;

  return (
    <section id="paslaugos" className="site-section">
      <div className="site-shell">
        <SectionHeader
          eyebrow={dict.homeServices.eyebrow}
          title={dict.homeServices.title}
          description={dict.homeServices.description}
        />

        <ul className="mt-10 grid list-none gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-4" role="list">
          {cards.map((c) => (
            <li key={c.title}>
              <article className="site-card-interactive flex h-full flex-col p-6 sm:p-8">
                <span className="inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-electric)]">
                  {c.kicker}
                </span>
                <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">{c.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-300 sm:text-base">{c.body}</p>
                <Link
                  href={c.href}
                  className="site-link-inline mt-6 inline-flex w-fit font-medium text-[var(--color-electric)] underline-offset-4"
                >
                  {c.cta} →
                </Link>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-sm text-zinc-300 sm:mt-12">
          {dict.homeServices.footerBefore}{" "}
          <Link className="site-link-inline font-medium" href="/pricing">
            {dict.homeServices.footerGen}
          </Link>
          {dict.homeServices.footerAnd} {dict.homeServices.footerPricing} {dict.homeServices.footerPlans}{" "}
          <a className="site-link-inline font-medium" href="#kontaktai">
            {dict.homeServices.footerContact}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
