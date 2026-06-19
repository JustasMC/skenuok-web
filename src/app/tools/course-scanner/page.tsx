import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const CourseScanner = dynamic(() => import("@/components/tools/CourseQualityScanner").then((m) => m.CourseQualityScanner), {
  loading: () => (
    <div className="site-skeleton" role="status" aria-live="polite">
      Kraunama…
    </div>
  ),
});

const title = "Kursų kokybės skaneris";
const description =
  "Nemokamas kursų kokybės skaneris: tikrino kurso turinį, SEO balus ir AI rekomendacijas. Toliau — kursų strategija, Paslaugos, Kontaktai.";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/tools/course-scanner");

  return {
    title,
    description,
    keywords: [
      "kursų kokybės skaneris",
      "SEO",
      "AI",
      "kursų strategija"
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
      images: [{ url: "/tools/course-scanner/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/tools/course-scanner/opengraph-image"],
    },
  };
}

export default function CourseScannerPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <PageIntro kicker="Kursų kokybės skaneris" title={title}>
            <p>
              Tikrino kurso turinį, SEO balus ir AI rekomendacijas. Toliau — kursų strategija, Paslaugos, Kontaktai.
            </p>
          </PageIntro>

          <Suspense
            fallback={
              <div className="site-skeleton min-h-[26rem]" role="status" aria-live="polite">
                Kraunama…
              </div>
            }
          >
            <CourseScanner />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
