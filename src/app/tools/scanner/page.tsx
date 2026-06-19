import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
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

const title = "SEO URL skeneris ir Svetainių analizė (Lighthouse + AI auditas)";
const description =
  "Nemokamas SEO URL skaneris: Svetainių analizė per Google PageSpeed / Lighthouse, Core Web Vitals, meta, H1, AI rekomendacijos lietuviškai. Toliau — turinio strategija, Paslaugos, Kontaktai. Profesionali web paslauga ant Next.js.";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/tools/scanner");

  return {
    title,
    description,
    keywords: [
      "SEO URL skeneris",
      "Svetainių analizė",
      "Lighthouse",
      "AI SEO auditas",
      "PageSpeed",
      "Core Web Vitals"
    ],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: "/tools/scanner/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/tools/scanner/opengraph-image"],
    },
  };
}

export default function ScannerPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <PageIntro kicker="SEO URL skeneris" title={title}>
            <p>
              Tikrino kurso turinį, SEO balus ir AI rekomendacijas. Toliau — kursų strategija, Paslaugos, Kontaktai.
            </p>
          </PageIntro>

          <Suspense
            fallback={
              <div className="site-skeleton min-h-[26rem]" role="status" aria-live="polite">
                Kraunama…
              </div>
            }
          >
            <UrlScanner />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
