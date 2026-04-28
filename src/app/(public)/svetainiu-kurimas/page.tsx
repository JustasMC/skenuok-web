import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCanonicalPath } from "@/lib/site-url";
import { siteConfig } from "@/lib/site-config";

const ContactForm = dynamic(() => import("@/components/ContactForm").then((m) => m.ContactForm), {
  loading: () => (
    <div className="site-shell">
      <div className="min-h-[min(380px,45vh)] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30" />
    </div>
  ),
});

const WebBuildPricingCalculator = dynamic(
  () => import("@/components/WebBuildPricingCalculator").then((m) => m.WebBuildPricingCalculator),
  {
    loading: () => (
      <div className="min-h-[20rem] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30" />
    ),
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/svetainiu-kurimas");
  const title = "Svetainių kūrimas su Next.js ir AI";
  const description =
    "Svetainių kūrimas nuo idėjos iki paleidimo: Next.js architektūra, SEO optimizacija, Stripe integracijos, Railway infrastruktūra ir AI auditai geresnei vartotojo patirčiai.";

  return {
    title,
    description,
    keywords: [
      "Svetainių kūrimas",
      "Next.js kūrimas",
      "SEO optimizacija",
      "AI auditas",
      "Railway",
      "Stripe integracija",
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
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function SvetainiuKurimasPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-section">
        <div className="site-shell space-y-8 sm:space-y-10">
          <section className="site-card p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-electric)]">Svetainių kūrimas</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Next.js svetainės su AI Orchestration: greitesnės, pigesnės ir techniškai stipresnės
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">
              Kuriame svetaines ne „rankinio darbo fabriko“ principu, o su AI Orchestration procesu: nuo struktūros,
              turinio ir SEO iki diegimo. Tai leidžia trumpinti terminus, mažinti kainą ir užtikrinti aukštą techninį
              lygį nuo pirmos dienos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#kontaktai" className="site-btn-primary">
                Gauti pasiūlymą
              </Link>
              <Link href="/tools/scanner" className="site-btn-secondary">
                Pirmiau įvertinti esamą svetainę
              </Link>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <article className="site-card-interactive p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Kodėl Next.js?</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                Next.js suteikia serverinį renderinimą, tvirtą SEO pagrindą ir aukštą našumą. Rezultatas: greitesnis
                pirmas užkrovimas, geresnė indeksacija ir ilgaamžė architektūra, kurią paprasta plėsti augant verslui.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                <li>• Stabilus techninis pagrindas konversijai ir reklamos srautui.</li>
                <li>• Tvarkinga komponentinė architektūra be perteklinio chaoso.</li>
                <li>• Geresni Core Web Vitals rezultatai realiame naudojime.</li>
              </ul>
            </article>

            <article className="site-card-interactive p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">AI integracijos nauda</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                AI Orchestration pagreitina kūrimą ir sumažina kaštus: dalis pasikartojančių užduočių automatizuojama,
                o komanda koncentruojasi į vertę kuriančius sprendimus. Gaunate greitesnį paleidimą ir geresnę kokybę.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                <li>• Spartesnės iteracijos ir trumpesnis time-to-market.</li>
                <li>• Automatinis turinio/SEO paruošimas prieš publikavimą.</li>
                <li>• Mažesnis rankinio darbo kiekis ir mažiau žmogiškų klaidų.</li>
              </ul>
            </article>
          </section>

          <section className="site-card-interactive p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white">SEO garantija: procesas, kuris veikia</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
              SEO srityje negarantuojame „magiško mygtuko“, bet garantuojame disciplinuotą procesą: techninis auditas,
              struktūros optimizacija, turinio semantika ir nuolatinis matavimas. Būtent šis metodas padėjo
              <strong className="font-medium text-zinc-200"> skenuok.com </strong>
              iškelti į aukštas Google pozicijas pagal tikslines užklausas.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">01</p>
                <p className="mt-2 text-sm text-zinc-300">Techninis SEO bazės sutvarkymas prieš paleidimą.</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">02</p>
                <p className="mt-2 text-sm text-zinc-300">AI + analitika pagrįsti turinio ir UX patobulinimai.</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">03</p>
                <p className="mt-2 text-sm text-zinc-300">Metrikų stebėsena ir nuolatinis rezultatų gerinimas.</p>
              </div>
            </div>
          </section>

          <section className="site-card-interactive p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Darbo eiga</h2>
            <ol className="mt-5 grid gap-4 md:grid-cols-2">
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">1. Discovery</strong>
                Tikslų, auditorijos ir verslo KPI išgryninimas.
              </li>
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">2. AI Orchestration planas</strong>
                Architektūra, turinio schema, integracijos ir automatikos.
              </li>
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">3. Kūrimas ir testavimas</strong>
                Next.js įgyvendinimas, našumo testai, SEO validacija.
              </li>
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">4. Paleidimas ir augimas</strong>
                Diegimas, analitika, iteracijos pagal realius duomenis.
              </li>
            </ol>
          </section>

          <WebBuildPricingCalculator />
        </div>

        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
