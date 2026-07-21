import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SignalsDashboard } from "@/components/tools/SignalsDashboard";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const t = dict.signals;
  const canonical = getCanonicalPath("/scan/signals");
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical,
      languages: { lt: canonical, en: canonical, "x-default": canonical },
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: t.title,
      description: t.description,
    },
  };
}

export default async function SignalsPage() {
  const { dict } = await getRequestDictionary();
  const t = dict.signals;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide space-y-10 py-12 sm:py-16">
          <PageIntro kicker={t.kicker} title={t.title}>
            <p>{t.description}</p>
          </PageIntro>
          <SignalsDashboard />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
