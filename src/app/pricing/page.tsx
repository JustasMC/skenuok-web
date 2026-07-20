import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const title = dict.pricing.title;
  const description = dict.pricing.description;
  const canonical = getCanonicalPath("/pricing");

  return {
    title,
    description,
    keywords: ["pricing", "kainodara", "SEO", "credits"],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: "/pricing/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/pricing/opengraph-image"],
    },
  };
}

const ctaPrimary =
  "site-btn-primary inline-flex w-full min-h-11 justify-center rounded-xl px-4 py-2.5 text-center text-sm font-semibold";

const ctaSecondary =
  "inline-flex w-full min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-center text-sm font-semibold text-white motion-safe:transition-colors motion-safe:duration-200 hover:border-[var(--color-lime)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50";

function hasConfiguredPrice5(): boolean {
  const id = process.env.STRIPE_PRICE_ID_5_EUR?.trim() ?? "";
  return id.startsWith("price_");
}

export default async function PricingPage() {
  const { dict } = await getRequestDictionary();
  const showPack5 = hasConfiguredPrice5();
  const p = dict.pricing;

  const plans = [
    {
      slug: "free" as const,
      name: p.freeName,
      price: p.freePrice,
      blurb: p.freeBlurb,
      features: [p.freeF1, p.freeF2, p.freeF3, p.freeF4],
      cta: { href: "/tools/scanner", label: p.freeCta },
      highlight: false,
    },
    {
      slug: "starter" as const,
      name: p.starterName,
      price: p.starterPrice,
      blurb: p.starterBlurb,
      features: [p.starterF1, p.starterF2, p.starterF3, p.starterF4],
      cta: { href: "/irankiai/seo-generatorius", label: p.starterCta },
      highlight: false,
    },
    {
      slug: "pro" as const,
      name: p.proName,
      price: p.proPrice,
      blurb: p.proBlurb,
      features: [p.proF1, p.proF2, p.proF3, p.proF4],
      cta: { href: "/irankiai/seo-generatorius", label: p.proCta },
      highlight: true,
      badge: p.proBadge,
    },
    {
      slug: "business" as const,
      name: p.bizName,
      price: p.bizPrice,
      blurb: p.bizBlurb,
      features: [p.bizF1, p.bizF2, p.bizF3, p.bizF4],
      cta: { href: "/#kontaktai", label: p.bizCta },
      highlight: false,
    },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell py-16 sm:py-20">
        <PageIntro variant="page" kicker={p.kicker} title={p.title} className="mb-12 sm:mb-14">
          <p>{p.intro}</p>
          <p className="mt-3 text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">{p.creditsHow}</span>
          </p>
        </PageIntro>

        <div id="prenumerata" className="grid scroll-mt-24 gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.slug}
              className={cn(
                plan.highlight &&
                  "border-[color-mix(in_oklab,var(--color-electric)_55%,var(--color-border))] shadow-[var(--shadow-glow)]",
              )}
            >
              <CardHeader>
                {"badge" in plan && plan.badge ? (
                  <span className="mb-2 inline-flex w-fit rounded-full border border-[var(--color-electric)]/45 bg-[color-mix(in_oklab,var(--color-electric)_12%,var(--color-surface))] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-electric)]">
                    {plan.badge}
                  </span>
                ) : null}
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-electric)]">{plan.name}</p>
                <CardTitle className="text-2xl">{plan.price}</CardTitle>
                <CardDescription>{plan.blurb}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-2.5 text-sm text-zinc-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-lime)]" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.slug === "starter" ? (
                  <div className="space-y-3">
                    <StripeCheckoutButton priceKey="5" className={ctaPrimary} disabled={!showPack5}>
                      {showPack5 ? p.buy5 : p.buy5Off}
                    </StripeCheckoutButton>
                    <Link href={plan.cta.href} className={ctaSecondary}>
                      {plan.cta.label}
                    </Link>
                  </div>
                ) : plan.slug === "pro" ? (
                  <div className="space-y-3">
                    <StripeCheckoutButton priceKey="20" className={ctaPrimary}>
                      {p.buy20}
                    </StripeCheckoutButton>
                    <Link href={plan.cta.href} className={ctaSecondary}>
                      {plan.cta.label}
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={plan.cta.href}
                    className={cn(
                      "inline-flex w-full min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-center text-sm font-semibold motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50",
                      plan.highlight
                        ? "site-btn-primary"
                        : "border border-[var(--color-border)] bg-[var(--color-surface)] text-white hover:border-[var(--color-lime)]",
                    )}
                  >
                    {plan.cta.label}
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <section className="site-shell border-t border-[var(--color-border)]/60 py-12 sm:py-14">
        <div className="site-card mx-auto max-w-3xl space-y-4 p-6 text-center sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{dict.pricingFooter.title}</h2>
          <p className="text-sm leading-relaxed text-zinc-300">{dict.pricingFooter.body}</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/#kontaktai" className="site-btn-primary min-h-11 justify-center">
              {dict.pricingFooter.contact}
            </Link>
            <Link href="/tools/scanner" className="site-btn-secondary min-h-11 justify-center">
              {dict.pricingFooter.scanner}
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
