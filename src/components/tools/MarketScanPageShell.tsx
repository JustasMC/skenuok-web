import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/AdSlot";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { MarketScannerClient } from "@/components/tools/MarketScannerClient";
import { getRequestDictionary } from "@/lib/i18n/server";
import type { MarketCategory } from "@/lib/markets/instruments";
import { languageAlternates } from "@/lib/seo-hreflang";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

type Props = { category: MarketCategory; path: string };

export function marketPageMetadata(
  _category: MarketCategory,
  path: string,
  title: string,
  description: string,
  locale: string,
): Metadata {
  const canonical = getCanonicalPath(path);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
    },
  };
}

export async function MarketScanPageShell({ category }: Props) {
  const { dict } = await getRequestDictionary();
  const meta = dict.markets.categories[category];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide space-y-10 py-12 sm:py-16">
          <PageIntro kicker={meta.kicker} title={meta.title}>
            <p>{meta.description}</p>
          </PageIntro>
          <MarketScannerClient
            category={category}
            adSlot={<AdSlot location={`scan_${category}`} />}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
