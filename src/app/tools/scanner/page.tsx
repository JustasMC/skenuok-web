import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const UrlScanner = dynamic(() => import("@/components/tools/UrlScanner").then((m) => m.UrlScanner), {
  loading: () => (
    <div className="site-skeleton" role="status" aria-live="polite">
      …
    </div>
  ),
});

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const t = dict.tools.scanner;
  const canonical = getCanonicalPath("/tools/scanner");

  return {
    title: t.title,
    description: t.description,
    keywords: ["SEO URL scanner", "Lighthouse", "PageSpeed", "SEO"],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: t.title,
      description: t.description,
      images: [{ url: "/tools/scanner/opengraph-image", width: 1200, height: 630, alt: t.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: ["/tools/scanner/opengraph-image"],
    },
  };
}

export default async function ScannerPage() {
  const { dict } = await getRequestDictionary();
  const t = dict.tools.scanner;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <PageIntro kicker={t.kicker} title={t.title}>
            <p>
              {t.introBefore} <span className="font-medium text-zinc-200">{t.introFree}</span>
              {t.introAfter}{" "}
              <Link href="/#paslaugos" className="site-link-inline">
                {t.services}
              </Link>{" "}
              {t.or}{" "}
              <Link href="/#kontaktai" className="site-link-inline">
                {t.contacts}
              </Link>
              .
            </p>
          </PageIntro>

          <Suspense
            fallback={
              <div className="site-skeleton min-h-[26rem]" role="status" aria-live="polite">
                {dict.common.loading}
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
