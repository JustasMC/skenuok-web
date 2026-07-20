import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getRequestDictionary();
  const t = dict.notFound;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      siteName: siteConfig.name,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "404" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.metaTitle,
      description: t.metaDescription,
      images: ["/opengraph-image"],
    },
  };
}

export default async function NotFound() {
  const { dict } = await getRequestDictionary();
  const t = dict.notFound;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell flex min-h-[60dvh] flex-col items-center justify-center py-20 text-center">
        <div className="site-card max-w-md space-y-6 p-8 sm:p-10">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-electric)]">404</p>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t.title}</h1>
            <p className="text-pretty text-sm leading-relaxed text-zinc-400">{t.body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="site-btn-primary min-h-11 w-full sm:w-auto">
              {t.home}
            </Link>
            <Link href="/#kontaktai" className="site-btn-secondary min-h-11 w-full sm:w-auto">
              {t.contact}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
