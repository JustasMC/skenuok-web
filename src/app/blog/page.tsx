import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const pageTitle = "Blogas: strategija, SEO ir AI";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/blog");
  const description =
    "Skenuok.com blogas apie svetainių kūrimą, SEO auditus, AI automatizaciją ir augimo strategijas 2026 metams.";

  return {
    title: pageTitle,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: pageTitle,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function BlogPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <PageIntro variant="page" kicker="Blogas" title={pageTitle}>
            <p>
              Praktiniai straipsniai apie tai, kaip sujungti <strong className="text-zinc-300">svetainių kūrimą</strong>,{" "}
              <strong className="text-zinc-300">SEO auditą</strong> ir{" "}
              <strong className="text-zinc-300">AI automatizaciją</strong> į vieną augimo sistemą.
            </p>
          </PageIntro>

          <section className="grid gap-5 sm:gap-6 md:grid-cols-2">
            <article className="site-card-interactive p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-electric)]">2026</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Svetainių kūrimas ir SEO auditas: planas 2026-iesiems
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Nuo techninės bazės iki turinio ir analitikos: ką daryti pirmiausia, kad svetainė pradėtų rinkti
                kokybišką organinį srautą ir konversijas.
              </p>
              <Link href="/blog/svetainiu-kurimas-ir-seo-auditas-planas-2026" className="site-link-inline mt-6 inline-flex">
                Skaityti straipsnį →
              </Link>
            </article>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
