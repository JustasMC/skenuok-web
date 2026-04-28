import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { CaseStudies } from "@/components/CaseStudies";
import { Hero } from "@/components/Hero";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomePrimaryServices } from "@/components/home/HomePrimaryServices";
import { HomeTestimonials } from "@/components/home/HomeTestimonials";
import { Services } from "@/components/Services";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TechArsenal } from "@/components/TechArsenal";
import { TechStack } from "@/components/TechStack";
import { WhyUs } from "@/components/WhyUs";
import { homePageDescription, homePageKeywords, homePageTitle } from "@/lib/home-seo";
import { siteConfig } from "@/lib/site-config";
import { getMetadataBaseUrl, getSiteOrigin } from "@/lib/site-url";

const ROICalculator = dynamic(() => import("@/components/ROICalculator").then((m) => m.ROICalculator), {
  loading: () => (
    <div
      className="min-h-[min(420px,50vh)] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30"
      aria-hidden
    />
  ),
});

const ContactForm = dynamic(() => import("@/components/ContactForm").then((m) => m.ContactForm), {
  loading: () => (
    <div
      className="min-h-[min(380px,45vh)] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30"
      aria-hidden
    />
  ),
});

const ogImageUrl = "https://skenuok.com/og-image.png";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteOrigin();
  const base = getMetadataBaseUrl();

  return {
    metadataBase: base,
    title: { absolute: homePageTitle },
    description: homePageDescription,
    keywords: Array.from(new Set([...siteConfig.keywords, ...homePageKeywords])),
    authors: [{ name: siteConfig.name, url: siteUrl }],
    creator: siteConfig.name,
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: siteUrl },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteUrl,
      siteName: siteConfig.name,
      title: homePageTitle,
      description: homePageDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: homePageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: homePageTitle,
      description: homePageDescription,
      ...(siteConfig.twitterCreator ? { creator: siteConfig.twitterCreator } : {}),
      images: [ogImageUrl],
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
