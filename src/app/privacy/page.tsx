import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  PrivacyPolicyContent,
  PrivacyPolicyContentEn,
  privacyToc,
  privacyTocEn,
} from "@/lib/legal-content";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { DEFAULT_OG_IMAGE_PATH, getCanonicalPath } from "@/lib/site-url";

/** Always fresh HTML — avoid long CDN cache after deploy. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const title = dict.legal.privacyTitle;
  const description = dict.legal.privacyDescription;
  const canonical = getCanonicalPath("/privacy");

  return {
    title,
    description,
    keywords: ["privacy policy", "GDPR", "data protection", "cookies", siteConfig.name],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
  };
}

export default async function PrivacyPage() {
  const { dict, locale } = await getRequestDictionary();
  const isEn = locale === "en";

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <LegalPageShell
          kicker={dict.legal.privacyKicker}
          title={dict.legal.privacyTitle}
          description={dict.legal.privacyDescription}
          toc={isEn ? privacyTocEn : privacyToc}
          backLabel={dict.legal.backHome}
          tocLabel={dict.legal.tocLabel}
          tocAria={dict.legal.tocAria}
          helpTitle={dict.legal.helpTitle}
          helpBody={dict.legal.helpBody}
        >
          {isEn ? <PrivacyPolicyContentEn /> : <PrivacyPolicyContent />}
        </LegalPageShell>
      </main>
      <SiteFooter />
    </>
  );
}
