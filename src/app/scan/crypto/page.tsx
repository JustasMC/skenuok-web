import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/AdSlot";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CryptoB2bLeadSection } from "@/components/services/CryptoB2bLeadSection";
import { CryptoTradingHub } from "@/components/tools/CryptoTradingHub";
import { getRequestDictionary } from "@/lib/i18n/server";
import { languageAlternates } from "@/lib/seo-hreflang";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const t = dict.cryptoHub;
  const canonical = getCanonicalPath("/scan/crypto");
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical, languages: languageAlternates("/scan/crypto") },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: t.title,
      description: t.description,
    },
  };
}

export default async function CryptoScanPage() {
  const { dict } = await getRequestDictionary();
  const t = dict.cryptoHub;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide space-y-10 py-12 sm:py-16">
          <PageIntro kicker={t.kicker} title={t.title}>
            <p>{t.description}</p>
          </PageIntro>
          <CryptoTradingHub adSlot={<AdSlot location="scan_crypto" />} />
          <CryptoB2bLeadSection />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
