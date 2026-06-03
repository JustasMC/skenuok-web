import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const title = "Darbo vieta";
const description =
  "Jūsų personalus darbo stebėjimo skydas su SEO turinio generatoriu, kreditais ir kitomis funkcijomis.";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/dashboard");

  return {
    title,
    description,
    keywords: [
      "darbo vieta",
      "SEO generatorius",
      "kreditai",
      "prieiga"
    ],
    alternates: { canonical },
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
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

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell py-16 sm:py-20">
        <div className="mx-auto w-full max-w-lg">
          <PageIntro variant="page" kicker="Paskyra" title={title}>
            <p>
              Jūsų personalus darbo stebėjimo skydas su SEO turinio generatoriu, kreditais ir kitomis funkcijomis.
            </p>
          </PageIntro>

          {/* Add your dashboard content here */}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
