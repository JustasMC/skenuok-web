import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TermsOfServiceContent } from "@/lib/legal-content";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const title = "Paslaugų sąlygos";
const description =
  "Skenuok.com naudojimo sąlygos: paskyros, kreditai, mokėjimai, AI turinys ir atsakomybės ribos.";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/terms");

  return {
    title,
    description,
    keywords: ["paslaugų sąlygos", "naudojimo taisyklės", "kreditai", siteConfig.name],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide space-y-10 py-12 sm:py-16">
          <PageIntro variant="page" kicker="Teisinė informacija" title={title}>
            <p>{description}</p>
          </PageIntro>
          <TermsOfServiceContent />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
