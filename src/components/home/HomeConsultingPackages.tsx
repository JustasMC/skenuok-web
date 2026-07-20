"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { useDict, useLocale } from "@/components/i18n/LocaleProvider";

export function HomeConsultingPackages() {
  const dict = useDict();
  const { locale } = useLocale();
  const packages = [
    {
      kicker: dict.consultingPackages.p1Kicker,
      title: dict.consultingPackages.p1Title,
      price: dict.consultingPackages.p1Price,
      body: dict.consultingPackages.p1Body,
      cta: dict.consultingPackages.p1Cta,
      serviceHint:
        locale === "en" ? "Technical SEO audit + 90-day plan" : "Techninis SEO auditas + 90 d. planas",
    },
    {
      kicker: dict.consultingPackages.p2Kicker,
      title: dict.consultingPackages.p2Title,
      price: dict.consultingPackages.p2Price,
      body: dict.consultingPackages.p2Body,
      cta: dict.consultingPackages.p2Cta,
      serviceHint: locale === "en" ? "SEO content starter (5 articles)" : "SEO turinio startas (5 straipsniai)",
    },
    {
      kicker: dict.consultingPackages.p3Kicker,
      title: dict.consultingPackages.p3Title,
      price: dict.consultingPackages.p3Price,
      body: dict.consultingPackages.p3Body,
      cta: dict.consultingPackages.p3Cta,
      serviceHint: locale === "en" ? "Monthly SEO / site care" : "Mėnesinė SEO / svetainės priežiūra",
    },
  ] as const;

  return (
    <section id="paketai" className="site-section">
      <div className="site-shell">
        <SectionHeader
          eyebrow={dict.consultingPackages.eyebrow}
          title={dict.consultingPackages.title}
          description={dict.consultingPackages.description}
        />

        <ul className="mt-10 grid list-none gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3" role="list">
          {packages.map((p) => (
            <li key={p.title}>
              <article className="site-card-interactive flex h-full flex-col p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-electric)]">
                    {p.kicker}
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-[var(--color-lime)]">
                    {p.price}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-300 sm:text-base">{p.body}</p>
                <a
                  href={`#kontaktai`}
                  className="site-btn-primary mt-6 inline-flex w-fit text-sm"
                  onClick={() => {
                    try {
                      sessionStorage.setItem("sk_preferred_service", p.serviceHint);
                    } catch {
                      /* ignore */
                    }
                  }}
                >
                  {p.cta}
                </a>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
