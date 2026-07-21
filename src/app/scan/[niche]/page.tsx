import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CryptoB2bLeadSection } from "@/components/services/CryptoB2bLeadSection";
import { NicheScannerClient } from "@/components/tools/NicheScannerClient";
import { getRequestDictionary } from "@/lib/i18n/server";
import { NICHE_IDS, type NicheId } from "@/lib/niche-scan/types";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const UrlScanner = dynamic(() => import("@/components/tools/UrlScanner").then((m) => m.UrlScanner), {
  loading: () => (
    <div className="site-skeleton min-h-[16rem]" role="status" aria-live="polite">
      …
    </div>
  ),
});

type Props = { params: Promise<{ niche: string }> };

function isNiche(v: string): v is NicheId {
  return (NICHE_IDS as readonly string[]).includes(v);
}

export async function generateStaticParams() {
  return NICHE_IDS.map((niche) => ({ niche }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niche: raw } = await params;
  if (!isNiche(raw)) return {};
  const { dict, locale } = await getRequestDictionary();
  const meta = dict.nicheScan.niches[raw];
  const path = `/scan/${raw}`;
  const canonical = getCanonicalPath(path);

  return {
    title: meta.title,
    description: meta.description,
    keywords: [meta.title, "AI scanner", "Skenuok", raw],
    alternates: {
      canonical,
      languages: {
        lt: getCanonicalPath(path),
        en: getCanonicalPath(path),
        "x-default": getCanonicalPath(path),
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function NicheScanPage({ params }: Props) {
  const { niche: raw } = await params;
  if (!isNiche(raw)) notFound();

  const { dict } = await getRequestDictionary();
  const meta = dict.nicheScan.niches[raw];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide space-y-10 py-12 sm:py-16">
          <PageIntro kicker={meta.kicker} title={meta.title}>
            <p>{meta.description}</p>
          </PageIntro>

          {raw === "web" ? (
            <Suspense
              fallback={
                <div className="site-skeleton min-h-[26rem]" role="status" aria-live="polite">
                  {dict.common.loading}
                </div>
              }
            >
              <UrlScanner />
            </Suspense>
          ) : (
            <NicheScannerClient niche={raw} />
          )}

          {raw === "crypto" ? <CryptoB2bLeadSection /> : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
