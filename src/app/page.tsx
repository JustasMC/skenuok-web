import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";
import { HomePrimaryServices } from "@/components/home/HomePrimaryServices";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { homePageDescription, homePageKeywords, homePageTitle } from "@/lib/home-seo";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { DEFAULT_OG_IMAGE_PATH, getDefaultOgImageUrl, getMetadataBaseUrl, getSiteOrigin } from "@/lib/site-url";

const sectionSkeleton = (minH: string) => (
  <div
    className={`animate-pulse rounded-2xl border border-[var(--color-border)]/40 bg-[var(--color-surface)]/25 ${minH}`}
    aria-hidden
  />
);

const HomeConsultingPackages = dynamic(
  () => import("@/components/home/HomeConsultingPackages").then((m) => m.HomeConsultingPackages),
  { loading: () => sectionSkeleton("min-h-[22rem]") },
);
const SeoSpeedChallenge = dynamic(
  () => import("@/components/home/SeoSpeedChallenge").then((m) => m.SeoSpeedChallenge),
  { loading: () => sectionSkeleton("min-h-[18rem]") },
);
const LighthousePulse = dynamic(
  () => import("@/components/home/LighthousePulse").then((m) => m.LighthousePulse),
  { loading: () => sectionSkeleton("min-h-[18rem]") },
);
const HomeTestimonials = dynamic(
  () => import("@/components/home/HomeTestimonials").then((m) => m.HomeTestimonials),
  { loading: () => sectionSkeleton("min-h-[16rem]") },
);
const CaseStudies = dynamic(() => import("@/components/CaseStudies").then((m) => m.CaseStudies), {
  loading: () => sectionSkeleton("min-h-[20rem]"),
});
const Services = dynamic(() => import("@/components/Services").then((m) => m.Services), {
  loading: () => sectionSkeleton("min-h-[20rem]"),
});
const WhyUs = dynamic(() => import("@/components/WhyUs").then((m) => m.WhyUs), {
  loading: () => sectionSkeleton("min-h-[16rem]"),
});
const TechArsenal = dynamic(() => import("@/components/TechArsenal").then((m) => m.TechArsenal), {
  ssr: true,
  loading: () => <div className="min-h-[600px]" aria-hidden />,
});
const TechStack = dynamic(() => import("@/components/TechStack").then((m) => m.TechStack), {
  loading: () => sectionSkeleton("min-h-[14rem]"),
});
const ROICalculator = dynamic(() => import("@/components/ROICalculator").then((m) => m.ROICalculator), {
  loading: () => sectionSkeleton("min-h-[min(420px,50vh)]"),
});
const HomeFaq = dynamic(() => import("@/components/home/HomeFaq").then((m) => m.HomeFaq), {
  loading: () => sectionSkeleton("min-h-[18rem]"),
});
const ContactForm = dynamic(() => import("@/components/ContactForm").then((m) => m.ContactForm), {
  loading: () => sectionSkeleton("min-h-[min(380px,45vh)]"),
});

const ogImageUrl = getDefaultOgImageUrl();

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteOrigin();
  const base = getMetadataBaseUrl();
  const { locale, dict } = await getRequestDictionary();

  const title =
    locale === "en"
      ? dict.meta.homeTitle
      : homePageTitle || "Svetainių kūrimas, URL skeneris ir AI SEO auditas | Svetainių analizė — Skenuok.com";
  const description =
    locale === "en"
      ? dict.meta.homeDescription
      : homePageDescription ||
        "Svetainių kūrimas ir SEO auditas su Next.js: greitos AI svetainės su techniškai tvarkingu kodu, skirtos matomumui bei konversijoms Lietuvoje.";
  const keywords = Array.from(new Set([...siteConfig.keywords, ...homePageKeywords])).filter(Boolean);

  return {
    metadataBase: base,
    title: { absolute: title },
    description,
    keywords,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteUrl }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: siteUrl },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: siteUrl,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(siteConfig.twitterCreator ? { creator: siteConfig.twitterCreator } : {}),
      images: [ogImageUrl],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    other: {
      "og:description": description,
      "description": description,
    },
    category: "technology",
  };
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="overflow-x-hidden">
        <Hero />
        <HomePrimaryServices />
        <HomeConsultingPackages />
        <SeoSpeedChallenge />
        <LighthousePulse />
        <HomeTestimonials />
        <CaseStudies />
        <Services />
        <WhyUs />
        <TechArsenal />
        <TechStack />
        <ROICalculator />
        <HomeFaq />
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
