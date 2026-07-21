import type { Metadata } from "next";
import { AdvertiseLeadForm } from "@/components/ads/AdvertiseLeadForm";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRequestDictionary } from "@/lib/i18n/server";
import { languageAlternates } from "@/lib/seo-hreflang";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getRequestDictionary();
  const isLt = locale === "lt";
  const title = isLt ? "Reklama Skenuok.com" : "Advertise on Skenuok.com";
  const description = isLt
    ? "B2B reklamos pozicijos skenerių puslapiuose — fiksuotas mėnesinis mokestis, tikslinė auditorija."
    : "B2B ad placements on scanner pages — fixed monthly fee, targeted audience.";
  const canonical = getCanonicalPath("/reklama");
  return {
    title,
    description,
    alternates: { canonical, languages: languageAlternates("/reklama") },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: isLt ? siteConfig.locale : "en_US",
    },
  };
}

export default async function ReklamaPage() {
  const { locale } = await getRequestDictionary();
  const isLt = locale === "lt";

  const tiers = [
    { name: isLt ? "Starter skydelis" : "Starter card", price: "100 €", reach: "1 pozicija" },
    { name: isLt ? "Skenerio rėmėjas" : "Scanner sponsor", price: "150 €", reach: isLt ? "1 skeneris / mėn." : "1 scanner / mo" },
    { name: isLt ? "Global" : "Global", price: "300 €", reach: isLt ? "Visose skenerių zonose" : "All scanner slots" },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide space-y-10 py-12 sm:py-16">
          <PageIntro
            kicker="B2B · Ads"
            title={isLt ? "Reklama Skenuok.com" : "Advertise on Skenuok.com"}
          >
            <p>
              {isLt
                ? "Tikslinė auditorija: SEO, investuotojai, krypto ir tech. Fiksuoti skydeliai skenerių puslapiuose — ne AdSense centai, o B2B mėnesinis mokestis. Pozicijos automatiškai paslepiamos pasibaigus terminui."
                : "Target audience: SEO, investors, crypto and tech. Fixed cards on scanner pages — not AdSense pennies, but a B2B monthly fee. Placements auto-hide when the term ends."}
            </p>
          </PageIntro>

          <div className="grid gap-4 sm:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <p className="text-xs uppercase tracking-wide text-[var(--color-electric)]">{t.name}</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {t.price}
                  <span className="text-sm font-normal text-zinc-500">
                    {isLt ? "/mėn." : "/mo"}
                  </span>
                </p>
                <p className="mt-1 text-sm text-zinc-400">{t.reach}</p>
              </div>
            ))}
          </div>

          <AdvertiseLeadForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
