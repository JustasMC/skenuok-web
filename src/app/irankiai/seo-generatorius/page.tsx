import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const ContentGenerator = dynamic(() => import("@/components/tools/ContentGenerator").then((m) => m.ContentGenerator), {
  loading: () => (
    <div className="site-skeleton" role="status" aria-live="polite">
      Kraunama…
    </div>
  ),
});

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/irankiai/seo-generatorius");
  const title = "SEO turinio generatorius";
  const description =
    "Generuokite SEO optimizuotą turinį pagal jūsų raktinius žodžius su AI pagrindu. Sutaupykite laiko ir užtikrinkite gerą SEO balą.";

  return {
    title,
    description,
    keywords: [
      "SEO generatorius",
      "turinys",
      "AI",
      "optimizacija"
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
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function SeoGeneratorPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <PageIntro variant="page" kicker="SEO" title={title}>
            <p>
              Generuokite SEO optimizuotą turinį pagal jūsų raktinius žodžius su AI pagrindu. Sutaupykite laiko ir užtikrinkite gerą SEO balą.
            </p>
          </PageIntro>

          <Suspense
            fallback={
              <div className="site-skeleton min-h-[26rem]" role="status" aria-live="polite">
                Kraunama…
              </div>
            }
          >
            <ContentGenerator />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
