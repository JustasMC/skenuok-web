import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { siteConfig } from "@/lib/site-config";
import { getSoftwareServiceJsonLd } from "@/lib/jsonld";
import { getMetadataBaseUrl, getSiteOrigin } from "@/lib/site-url";
import { Providers } from "@/app/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const siteUrl = getSiteOrigin();
const ogTitle = "Skenuok.com | Pilna AI & SEO Ekosistema";
const ogDescription =
  "Svetainių kūrimas ir SEO auditas su Next.js: greitos AI svetainės su techniškai tvarkingu kodu, skirtos matomumui bei konversijoms Lietuvoje.";
const ogKeywords = ["AI SEO", "Python automation", "React UI", "Kursų analizė", "Market intelligence"];
const ogImageUrl = "https://skenuok.com/og-image.png";

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: {
    default: ogTitle,
    template: siteConfig.titleTemplate,
  },
  description: ogDescription,
  keywords: ogKeywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteUrl,
    siteName: siteConfig.name,
    title: ogTitle,
    description: ogDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: ogTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
    ...(siteConfig.twitterCreator ? { creator: siteConfig.twitterCreator } : {}),
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: siteUrl,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = getSoftwareServiceJsonLd();
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim() || "G-J29QGBZ1MT";

  return (
    <html lang="lt" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh font-sans">
        <a
          href="#main-content"
          className="pointer-events-none fixed left-4 top-0 z-[100] -translate-y-full rounded-lg bg-[var(--color-electric)] px-4 py-2 text-sm font-semibold text-[#041014] opacity-0 shadow-lg motion-safe:transition-[transform,opacity] motion-safe:duration-200 focus:pointer-events-auto focus:translate-y-4 focus:opacity-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#041014]"
        >
          Peršokti prie turinio
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
        {gaId ? (
          <>
            <Script
              id="ga-script"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="lazyOnload"
            />
            <Script id="ga-inline" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
