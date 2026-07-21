import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { DEFAULT_OG_IMAGE_PATH, getCanonicalPath } from "@/lib/site-url";

const ContactForm = dynamic(() => import("@/components/ContactForm").then((m) => m.ContactForm), {
  loading: () => (
    <div className="site-shell">
      <div className="min-h-[min(380px,45vh)] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30" />
    </div>
  ),
});

const WebPriceCalculator = dynamic(
  () => import("@/components/tools/WebPriceCalculator").then((m) => m.WebPriceCalculator),
  {
    loading: () => (
      <div className="min-h-[28rem] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30" />
    ),
  },
);

const WebBuildPricingCalculator = dynamic(
  () => import("@/components/WebBuildPricingCalculator").then((m) => m.WebBuildPricingCalculator),
  {
    loading: () => (
      <div className="min-h-[20rem] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30" />
    ),
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const t = dict.webBuildPage;
  const canonical = getCanonicalPath("/svetainiu-kurimas");

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    keywords:
      locale === "en"
        ? ["web development", "Next.js", "SEO", "AI website", "business website", "online store"]
        : ["svetainių kūrimas", "Next.js", "SEO optimizacija", "AI svetainė", "verslo svetainė", "el. parduotuvė", "Lietuva"],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: t.metaTitle,
      description: t.metaDescription,
      images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: t.metaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.metaTitle,
      description: t.metaDescription,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
  };
}

export default async function SvetainiuKurimasPage() {
  const { dict } = await getRequestDictionary();
  const t = dict.webBuildPage;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-section">
        <div className="site-shell space-y-8 sm:space-y-10">
          <section className="site-card p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-electric)]">{t.eyebrow}</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t.h1}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">{t.lead}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#kontaktai" className="site-btn-primary">
                {t.ctaOffer}
              </Link>
              <Link href="/scan/web" className="site-btn-secondary">
                {t.ctaScan}
              </Link>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <article className="site-card-interactive p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">{t.whyTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">{t.whyBody}</p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                <li>• {t.why1}</li>
                <li>• {t.why2}</li>
                <li>• {t.why3}</li>
              </ul>
            </article>

            <article className="site-card-interactive p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">{t.aiTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">{t.aiBody}</p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                <li>• {t.ai1}</li>
                <li>• {t.ai2}</li>
                <li>• {t.ai3}</li>
              </ul>
            </article>
          </section>

          <section className="site-card-interactive p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white">{t.seoTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">{t.seoBody}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">01</p>
                <p className="mt-2 text-sm text-zinc-300">{t.seo1}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">02</p>
                <p className="mt-2 text-sm text-zinc-300">{t.seo2}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">03</p>
                <p className="mt-2 text-sm text-zinc-300">{t.seo3}</p>
              </div>
            </div>
          </section>

          <section className="site-card-interactive p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white">{t.flowTitle}</h2>
            <ol className="mt-5 grid gap-4 md:grid-cols-2">
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">{t.flow1Title}</strong>
                {t.flow1Body}
              </li>
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">{t.flow2Title}</strong>
                {t.flow2Body}
              </li>
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">{t.flow3Title}</strong>
                {t.flow3Body}
              </li>
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">{t.flow4Title}</strong>
                {t.flow4Body}
              </li>
            </ol>
          </section>

          <section className="site-card-interactive p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white">{t.extraTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">{t.extraBody}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-electric)]">
                  {t.extra1Price}
                </p>
                <p className="mt-2 font-medium text-white">{t.extra1Title}</p>
                <p className="mt-2 text-sm text-zinc-300">{t.extra1Body}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-electric)]">
                  {t.extra2Price}
                </p>
                <p className="mt-2 font-medium text-white">{t.extra2Title}</p>
                <p className="mt-2 text-sm text-zinc-300">{t.extra2Body}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-electric)]">
                  {t.extra3Price}
                </p>
                <p className="mt-2 font-medium text-white">{t.extra3Title}</p>
                <p className="mt-2 text-sm text-zinc-300">{t.extra3Body}</p>
              </div>
            </div>
            <div className="mt-5">
              <Link href="#kontaktai" className="site-btn-secondary">
                {t.extraCta}
              </Link>
            </div>
          </section>

          <div className="space-y-8">
            <WebPriceCalculator />
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">{t.simpleCalcLabel}</p>
              <WebBuildPricingCalculator />
            </div>
          </div>
        </div>

        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
