import type { Metadata } from "next";
import Link from "next/link";
import { RiskCalculator } from "@/components/academy/RiskCalculator";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ACADEMY_TERMS, CHART_PATTERNS } from "@/lib/academy/chart-patterns";
import { getRequestDictionary } from "@/lib/i18n/server";
import { languageAlternates } from "@/lib/seo-hreflang";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const t = dict.academy;
  const canonical = getCanonicalPath("/academy/patterns");
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical, languages: languageAlternates("/academy/patterns") },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: t.title,
      description: t.description,
    },
  };
}

const CATEGORY_ORDER = [
  "reversal",
  "continuation",
  "candlestick",
  "harmonic",
  "gap",
] as const;

export default async function AcademyPatternsPage() {
  const { dict, locale } = await getRequestDictionary();
  const t = dict.academy;
  const isLt = locale === "lt";

  const catLabel: Record<(typeof CATEGORY_ORDER)[number], string> = {
    reversal: t.catReversal,
    continuation: t.catContinuation,
    candlestick: t.catCandlestick,
    harmonic: t.catHarmonic,
    gap: t.catGap,
  };

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide space-y-12 py-12 sm:py-16">
          <PageIntro kicker={t.kicker} title={t.title}>
            <p>{t.description}</p>
            <p className="mt-2">
              <Link href="/scan/crypto" className="site-link-inline">
                {t.backCrypto}
              </Link>
            </p>
          </PageIntro>

          <RiskCalculator />

          <section className="space-y-8">
            <h2 className="text-xl font-semibold text-white">
              {t.libraryTitle}{" "}
              <span className="text-sm font-normal text-zinc-500">
                ({CHART_PATTERNS.length})
              </span>
            </h2>
            {CATEGORY_ORDER.map((cat) => {
              const items = CHART_PATTERNS.filter((p) => p.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-electric)]">
                    {catLabel[cat]}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <article
                        key={p.id}
                        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-zinc-100">
                            {isLt ? p.nameLt : p.nameEn}
                          </h4>
                          <span className="shrink-0 text-[10px] uppercase tracking-wide text-zinc-500">
                            {p.bias}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-400">
                          {isLt ? p.descriptionLt : p.descriptionEn}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          <span className="text-zinc-400">{t.howTo}: </span>
                          {isLt ? p.howToTradeLt : p.howToTradeEn}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">{t.glossaryTitle}</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {ACADEMY_TERMS.map((term) => (
                <div
                  key={term.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  <dt className="font-medium text-zinc-100">
                    {isLt ? term.termLt : term.termEn}
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-400">
                    {isLt ? term.defLt : term.defEn}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="text-xs text-zinc-600">{t.disclaimer}</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
