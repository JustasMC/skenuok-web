import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  TermsOfServiceContent,
  TermsOfServiceContentEn,
  termsToc,
  termsTocEn,
} from "@/lib/legal-content";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { DEFAULT_OG_IMAGE_PATH, getCanonicalPath } from "@/lib/site-url";

/** Always fresh HTML — avoid long CDN cache after deploy. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const title = dict.legal.termsTitle;
  const description = dict.legal.termsDescription;
  const canonical = getCanonicalPath("/terms");

  return {
    title,
    description,
    keywords: ["terms of service", "credits", "SaaS", siteConfig.name],
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

export default async function TermsPage() {
  const { dict, locale } = await getRequestDictionary();
  const isEn = locale === "en";

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <LegalPageShell
          kicker={dict.legal.termsKicker}
          title={dict.legal.termsTitle}
          description={dict.legal.termsDescription}
          toc={isEn ? termsTocEn : termsToc}
          backLabel={dict.legal.backHome}
        >
          {isEn ? <TermsOfServiceContentEn /> : <TermsOfServiceContent />}
        </LegalPageShell>
      </main>
      <SiteFooter />
    </>
  );
}
