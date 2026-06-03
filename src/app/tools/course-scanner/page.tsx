import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const CourseQualityScanner = dynamic(
  () => import("@/components/tools/CourseQualityScanner").then((m) => m.CourseQualityScanner),
  {
    loading: () => (
      <div className="site-skeleton" role="status" aria-live="polite">
        Kraunama…
      </div>
    ),
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/tools/course-scanner");
  const title = "Kursų kokybės skenavimas (SEO URL analizė + PageSpeed + AI)";
  const description =
    "Kursų kokybės skenavimas: Svetainių analizė (Lighthouse) ir AI įžvalgos apie pasiūlą, kainą, programą, pažadus. Tinka SEO strategijai, kai parduodate mokymus online. Toliau — generatorius, Paslaugos, Kontaktai.";

  return {
    title,
    description,
    keywords: [
      "Kursų kokybės skenavimas",
      "Svetainių analizė",
      "AI SEO auditas",
      "web paslaugos",
    ],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: "Kursų kokybės skaneris",
      description: "Našumas, SEO, prieiga ir suvestinis vertinimas mokymų pasiūlos puslapiui.",
      images: [{ url: "/tools/course-scanner/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Kursų kokybės skaneris",
      description: "Našumas, SEO, prieiga ir suvestinis vertinimas mokymų pasiūlos puslapiui.",
      images: ["/tools/course-scanner/opengraph-image"],
    },
    category: "technology",
  };
}

export default function CourseScannerPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <PageIntro kicker="Įrankis" title="Kursų kokybės skaneris">
          <p>
            Tas pats PageSpeed pagrindas kaip ir{" "}
            <Link href="/tools/scanner" className="site-link-inline">
              URL skaneryje
            </Link>
            , plius rinkos sluoksnis: ką parduoda tekstas, ar verta pirkti ar pirmiau YouTube/docs.{" "}
            <Link href="/#kontaktai" className="site-link-inline">
              Rašykite
            </Link>
            , jei reikia gilesnės strategijos.
          </p>
        </PageIntro>
        <CourseQualityScanner />
      </main>
      <SiteFooter />
    </>
  );
}
