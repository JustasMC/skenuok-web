import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const UrlScanner = dynamic(() => import("@/components/tools/UrlScanner").then((m) => m.UrlScanner), {
  loading: () => (
    <div className="site-skeleton" role="status" aria-live="polite">
      Kraunama…
    </div>
  ),
});

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/tools/scanner");
  const title = "SEO URL skeneris ir Svetainių analizė (Lighthouse + AI auditas)";
  const description =
    "Nemokamas SEO URL skaneris: Svetainių analizė per Google PageSpeed / Lighthouse, Core Web Vitals, meta, H1, AI rekomendacijos lietuviškai. Toliau — turinio strategija, Paslaugos, Kontaktai. Profesionali web paslauga ant Next.js.";

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: "SEO URL skaneris | PageSpeed, Lighthouse, AI",
      description:
        "URL struktūra, našumo ir SEO balai, H1 / meta, AI įžvalgos. Vidinės nuorodos į generatorių ir pagalbą dėl pataisymų.",
      images: [{ url: "/tools/scanner/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: "SEO URL skaneris | PageSpeed, Lighthouse, AI",
      description:
        "Lighthouse, Core Web Vitals, AI rekomendacijos — Svetainių analizė, skirta patobulinti techninę SEO strategiją.",
      images: ["/tools/scanner/opengraph-image"],
    },
    category: "technology",
    keywords: [
      "SEO URL skeneris",
      "Svetainių analizė",
      "Lighthouse",
      "AI SEO auditas",
      "PageSpeed",
      "Core Web Vitals",
    ],
  };
}

export default function ScannerPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <PageIntro kicker="SEO URL skaneris" title="Svetainių analizė ir AI SEO auditas">
          <p>
            <strong className="font-medium text-zinc-200">SEO svetainių</strong> URL ir puslapius tikriname per Lighthouse: našumas, SEO, prieinamumas — su AI paaiškinimais. Ataskaita padeda
            suderinti <strong className="font-medium text-zinc-200">web dizainą</strong>, greitį ir <strong className="font-medium text-zinc-200">SEO strategiją</strong>. Jei reikia pagalbos
            dėl taisymų, žr.{" "}
            <Link href="/#paslaugos" className="site-link-inline">
              Paslaugas
            </Link>{" "}
            arba{" "}
            <Link href="/#kontaktai" className="site-link-inline">
              kontaktus
            </Link>
            .
          </p>
        </PageIntro>
        <UrlScanner />
      </main>
      <SiteFooter />
    </>
  );
}
