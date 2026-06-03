import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/privacy");
  const title = "Privatumo politika";
  const description =
    "Mūsų privatumo politika apie, kaip tvarkome ir saugome jūsų duomenis.";

  return {
    title,
    description,
    keywords: [
      "privatumo politika",
      "duomenys",
      "saugumas"
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

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <PageIntro variant="page" kicker="Privatumas" title={title}>
            <p>
              Mūsų privatumo politika apie, kaip tvarkome ir saugome jūsų duomenis.
            </p>
          </PageIntro>

          {/* Add your privacy policy content here */}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
