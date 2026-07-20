import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { DEFAULT_OG_IMAGE_PATH, getCanonicalPath } from "@/lib/site-url";

const ContentGenerator = dynamic(() => import("@/components/tools/ContentGenerator").then((m) => m.ContentGenerator), {
  loading: () => (
    <div className="site-skeleton" role="status" aria-live="polite">
      …
    </div>
  ),
});

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const t = dict.tools.generator;
  const canonical = getCanonicalPath("/irankiai/seo-generatorius");

  return {
    title: t.title,
    description: t.description,
    keywords: ["SEO generator", "content", "AI", "SEO"],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: t.title,
      description: t.description,
      images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: t.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
  };
}

export default async function SeoGeneratorPage() {
  const { dict } = await getRequestDictionary();
  const t = dict.tools.generator;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <PageIntro variant="page" kicker={t.kicker} title={t.title}>
            <p>{t.intro}</p>
          </PageIntro>

          <Suspense
            fallback={
              <div className="site-skeleton min-h-[26rem]" role="status" aria-live="polite">
                {dict.common.loading}
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
