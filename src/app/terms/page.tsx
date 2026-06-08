import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const title = "Terms of Service";
const description =
  "Mūsų naudojimo sąlygos apie, kaip naudotis mūsų paslaugomis.";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/terms");

  return {
    title,
    description,
    keywords: [
      "naudojimo sąlygos",
      "paslaugos",
      "tarpininkavimas"
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

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <PageIntro variant="page" kicker="Terms" title={title}>
            <p>
              Mūsų naudojimo sąlygos apie, kaip naudotis mūsų paslaugomis.
            </p>
          </PageIntro>

          {/* Add your terms of service content here */}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
