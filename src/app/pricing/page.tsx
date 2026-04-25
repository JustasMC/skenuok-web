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
    slug: "pro" as const,
    name: "Profesionalus",
    price: "20 € / mėn.",
    blurb: "Turinio generatorius su kreditais — mažoms komandoms.",
    features: ["10 kreditų / mėn.", "SEO HTML turinys pagal raktinį žodį", "Istorija ir eksportas", "Prioritetinis el. paštas"],
    cta: { href: "/irankiai/seo-generatorius", label: "Atidaryti generatorių" },
    highlight: true,
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

export default function PricingPage() {
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

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.slug}
              className={cn(
                p.highlight && "border-[color-mix(in_oklab,var(--color-electric)_55%,var(--color-border))] shadow-[var(--shadow-glow)]",
              )}
            >
              <CardHeader>
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
                {p.slug === "pro" ? (
                  <div className="space-y-3">
                    <StripeCheckoutButton className={ctaPrimary}>Pirkti kreditų paketą (Stripe)</StripeCheckoutButton>
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
          Mokėjimai vyksta per Stripe Checkout; kreditai pridedami po sėkmingo apmokėjimo (webhook į{" "}
          <code className="rounded bg-zinc-900/80 px-1 py-0.5 font-mono text-zinc-500">/api/webhooks/stripe</code>).
          Reikia <code className="rounded bg-zinc-900/80 px-1 py-0.5 font-mono text-zinc-500">STRIPE_SECRET_KEY</code> ir{" "}
          <code className="rounded bg-zinc-900/80 px-1 py-0.5 font-mono text-zinc-500">STRIPE_WEBHOOK_SECRET</code>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
