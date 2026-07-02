import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PrivacyPolicyContent, privacyToc } from "@/lib/legal-content";
import { siteConfig } from "@/lib/site-config";
import { DEFAULT_OG_IMAGE_PATH, getCanonicalPath } from "@/lib/site-url";

const title = "Privatumo politika";
const description =
  "Kaip Skenuok.com tvarko jūsų duomenis: kontaktai, paskyros, mokėjimai, AI įrankiai, slapukai, BDAR teisės ir saugumo priemonės.";

/** Visada šviežias HTML — ne 1 metų CDN cache po deploy. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/privacy");

  return {
    title,
    description,
    keywords: ["privatumo politika", "BDAR", "duomenų apsauga", "slapukai", "GDPR", siteConfig.name],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
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

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <LegalPageShell kicker="Privatumas" title={title} description={description} toc={privacyToc}>
          <PrivacyPolicyContent />
        </LegalPageShell>
      </main>
      <SiteFooter />
    </>
  );
}
