import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/pricing");
  const title = "Kainodara (SEO URL skaneris, turinio planai)";
  const description =
    "Kainodara: nemokami ir mokami planai — SEO URL skenavimas, Svetainių analizė, kursų įrankis, straipsnių kreditai. Palyginkite, tada tęskite arba rašykite dėl custom web paslaugos.";

  return {
    title,
    description,
    keywords: [
      "SEO strategija",
      "web paslaugos",
      "Svetainių analizė",
      "Kursų kokybės skenavimas",
    ],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: "Kainodara | FS·AI",
      description: "Trys planai — nuo nemokamo skanerio iki komandos licencijos.",
      images: [{ url: "/pricing/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Kainodara | FS·AI",
      description: "Trys planai — nuo nemokamo skanerio iki komandos licencijos.",
      images: ["/pricing/opengraph-image"],
    },
    category: "technology",
  };
}

const plans = [
  {
    slug: "free" as const,
    name: "Nemokamas",
    price: "0 €",
    blurb: "Lead magnet: URL skaneris ir bazinės įžvalgos.",
    features: ["URL skaneris (PageSpeed)", "Lighthouse balai", "AI rekomendacijos (jei sukonfigūruota)", "El. pašto kontaktas"],
    cta: { href: "/tools/scanner", label: "Atidaryti skanerį" },
    highlight: false,
  },
  {
    slug: "starter" as const,
    name: "Pradedantysis",
    price: "5 € / mėn.",
    blurb: "Pradinis planas smulkiam SEO turinio tempui.",
    features: ["10 kreditų per mėnesį", "SEO HTML turinys pagal raktinį žodį", "Istorija ir eksportas", "El. pašto pagalba"],
    cta: { href: "/irankiai/seo-generatorius", label: "Atidaryti generatorių" },
    highlight: false,
  },
  {
    slug: "pro" as const,
    name: "Profesionalus",
    price: "20 € / mėn.",
    blurb: "Turinio generatorius su kreditais — mažoms komandoms.",
    features: ["50 kreditų per mėnesį", "SEO HTML turinys pagal raktinį žodį", "Istorija ir eksportas", "Prioritetinis el. paštas"],
    cta: { href: "/irankiai/seo-generatorius", label: "Atidaryti generatorių" },
    highlight: true,
    badge: "Populiariausias",
  },
  {
    slug: "business" as const,
    name: "Verslui",
    price: "Pagal sutartį",
    blurb: "API integracijos, auditas ir SLA.",
    features: ["Dedikuotas onboarding", "Žodynas ir tonas pagal prekės ženklą", "Integracijos (CMS, Shopify)", "SLA ir stebėsena"],
    cta: { href: "/#kontaktai", label: "Susisiekite" },
    highlight: false,
  },
];

const ctaPrimary =
  "site-btn-primary inline-flex w-full min-h-11 justify-center rounded-xl px-4 py-2.5 text-center text-sm font-semibold";

const ctaSecondary =
  "inline-flex w-full min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-center text-sm font-semibold text-white motion-safe:transition-colors motion-safe:duration-200 hover:border-[var(--color-lime)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50";

function hasConfiguredPrice5(): boolean {
  const id = process.env.STRIPE_PRICE_ID_5_EUR?.trim() ?? "";
  return id.startsWith("price_");
}

export default function PricingPage() {
  const showPack5 = hasConfiguredPrice5();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell py-16 sm:py-20">
        <PageIntro variant="page" kicker="Planai" title="Kainodara" className="mb-12 sm:mb-14">
          <p>
            Skaneris jau veikia kaip nemokamas kabliukas. Mokamas generatorius kuria sutaupymą:{" "}
            <span className="font-medium text-zinc-200">~20 valandų per mėnesį</span> su AI pagalba, o ne rankiniu kopiju
            rašymu.
          </p>
        </PageIntro>

        <div id="prenumerata" className="grid scroll-mt-24 gap-6 lg:grid-cols-4">
          {plans.map((p) => (
            <Card
              key={p.slug}
              className={cn(
                p.highlight && "border-[color-mix(in_oklab,var(--color-electric)_55%,var(--color-border))] shadow-[var(--shadow-glow)]",
              )}
            >
              <CardHeader>
                {"badge" in p ? (
                  <span className="mb-2 inline-flex w-fit rounded-full border border-[var(--color-electric)]/45 bg-[color-mix(in_oklab,var(--color-electric)_12%,var(--color-surface))] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-electric)]">
                    {p.badge}
                  </span>
                ) : null}
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-electric)]">{p.name}</p>
                <CardTitle className="text-2xl">{p.price}</CardTitle>
                <CardDescription>{p.blurb}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-2.5 text-sm text-zinc-300">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-lime)]" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                {p.slug === "starter" ? (
                  <div className="space-y-3">
                    <StripeCheckoutButton priceKey="5" className={ctaPrimary} disabled={!showPack5}>
                      {showPack5 ? "Užsisakyti — 5 €" : "5 € planas neaktyvus"}
                    </StripeCheckoutButton>
                    <Link href={p.cta.href} className={ctaSecondary}>
                      {p.cta.label}
                    </Link>
                  </div>
                ) : p.slug === "pro" ? (
                  <div className="space-y-3">
                    <StripeCheckoutButton priceKey="20" className={ctaPrimary}>
                      Užsisakyti — 20 €
                    </StripeCheckoutButton>
                    <Link href={p.cta.href} className={ctaSecondary}>
                      {p.cta.label}
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={p.cta.href}
                    className={cn(
                      "inline-flex w-full min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-center text-sm font-semibold motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50",
                      p.highlight
                        ? "site-btn-primary"
                        : "border border-[var(--color-border)] bg-[var(--color-surface)] text-white hover:border-[var(--color-lime)]",
                    )}
                  >
                    {p.cta.label}
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-12 max-w-3xl text-pretty text-center text-xs leading-relaxed text-zinc-600 sm:mx-auto">
          Mokėjimai per Stripe Checkout naudoja katalogo <strong className="font-medium text-zinc-500">Price ID</strong>{" "}
          (<code className="rounded bg-zinc-900/80 px-1 py-0.5 font-mono text-zinc-500">price_…</code>). Po apmokėjimo —{" "}
          <Link href="/success" className="text-[var(--color-electric)] hover:underline">
            /success
          </Link>
          , tada generatorius. Kreditus priskiria webhook{" "}
          <code className="rounded bg-zinc-900/80 px-1 py-0.5 font-mono text-zinc-500">/api/webhooks/stripe</code> ir{" "}
          <code className="rounded bg-zinc-900/80 px-1 py-0.5 font-mono text-zinc-500">STRIPE_WEBHOOK_SECRET</code>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
