import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const ContentGenerator = dynamic(() =>
  import("@/components/tools/ContentGenerator").then((m) => m.ContentGenerator),
);

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/irankiai/seo-generatorius");
  const title = "SEO turinio generatorius (H1, meta, vidinės nuorodos)";
  const description =
    "Lietuviškas straipsnis HTML: meta aprašymai, H1, natūralūs raktažodžiai, vidinės nuorodos, SEO patikra. Tinka po URL skenavimo ar atskirai — kreditai, kainodara, Next.js aplinkoje saugus turinys.";

  return {
    title,
    description,
    keywords: [
      "SEO strategija",
      "Svetainių analizė",
      "metaduomenys",
      "H1",
      "vidinės nuorodos",
    ],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: "SEO generatorius",
      description: "HTML straipsnis ir SEO patikra pagal jūsų raktažodį — greitai publikuojamai turinio formai.",
      images: [{ url: "/irankiai/seo-generatorius/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: "SEO generatorius",
      description: "HTML straipsnis ir SEO patikra pagal jūsų raktažodį — greitai publikuojamai turinio formai.",
      images: ["/irankiai/seo-generatorius/opengraph-image"],
    },
    category: "technology",
  };
}

function GenFallback() {
  return (
    <div className="site-card rounded-xl p-8 text-sm text-zinc-400" role="status" aria-live="polite">
      Kraunama…
    </div>
  );
}

export default function SeoGeneratorPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <PageIntro kicker="Skenavimas → idėjos → generavimas" title="SEO turinio generatorius">
          <p>
            Jei atėjote iš{" "}
            <Link href="/tools/scanner" className="site-link-inline">
              URL skanerio
            </Link>
            , tema gali būti jau užpildyta iš nuorodos. Pirmą kartą naršyklė gauna 3 nemokamus kreditus (sesija per slapuką).
          </p>
        </PageIntro>

        <Suspense fallback={<GenFallback />}>
          <ContentGenerator />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
