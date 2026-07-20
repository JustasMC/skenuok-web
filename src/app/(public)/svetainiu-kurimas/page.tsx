import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { DEFAULT_OG_IMAGE_PATH, getCanonicalPath } from "@/lib/site-url";

const ContactForm = dynamic(() => import("@/components/ContactForm").then((m) => m.ContactForm), {
  loading: () => (
    <div className="site-shell">
      <div className="min-h-[min(380px,45vh)] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30" />
    </div>
  ),
});

const WebPriceCalculator = dynamic(
  () => import("@/components/tools/WebPriceCalculator").then((m) => m.WebPriceCalculator),
  {
    loading: () => (
      <div className="min-h-[28rem] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30" />
    ),
  },
);

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
  const title = "Svetainių kūrimas su Next.js | SEO ir AI";
  const description =
    "Profesionalus svetainių kūrimas Lietuvoje: Next.js, SEO, Stripe ir AI pagalba. Aiškūs terminai, matuojami rezultatai ir orientacinė kainų skaičiuoklė.";

  return {
    title,
    description,
    keywords: [
      "svetainių kūrimas",
      "Next.js",
      "SEO optimizacija",
      "AI svetainė",
      "verslo svetainė",
      "el. parduotuvė",
      "Lietuva",
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
      images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE_PATH],
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-electric)]">
              Svetainių kūrimas
            </p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Svetainės ant Next.js: greitos, SEO paruoštos ir aiškiai kainuojamos
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">
              Kuriame verslo svetaines ir el. parduotuves nuo struktūros iki paleidimo. Naudojame Next.js, techninį SEO
              ir AI ten, kur tai taupo laiką — kad gautumėte greitesnį paleidimą, tvarkingą kodą ir matuojamus
              rezultatus.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#kontaktai" className="site-btn-primary">
                Gauti pasiūlymą
              </Link>
              <Link href="/tools/scanner" className="site-btn-secondary">
                Įvertinti esamą svetainę
              </Link>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <article className="site-card-interactive p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Kodėl Next.js?</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                Serverinis renderinimas, tvirtas SEO pagrindas ir aukštas našumas. Rezultatas — greitesnis pirmas
                užkrovimas, geresnė indeksacija ir architektūra, kurią lengva plėsti augant verslui.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                <li>• Stabilus pagrindas konversijai ir reklamai</li>
                <li>• Aiški komponentinė struktūra be chaoso</li>
                <li>• Geriau Core Web Vitals realioje aplinkoje</li>
              </ul>
            </article>

            <article className="site-card-interactive p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">AI pagalba kūrime</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                AI naudojame pasikartojančioms užduotims: turinio juodraščiams, SEO santraukoms, testavimo kontroliniams
                sąrašams. Žmogus lieka atsakingas už sprendimus, dizainą ir kokybę.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                <li>• Trumpesnis kelias iki paleidimo</li>
                <li>• Mažiau rankinio darbo ir klaidų</li>
                <li>• Aiškesni prioritetai pagal duomenis</li>
              </ul>
            </article>
          </section>

          <section className="site-card-interactive p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white">SEO: procesas, o ne pažadai</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
              Negarantuojame „pirmos vietos Google“ — garantuojame disciplinuotą procesą: techninis auditas, struktūra,
              turinio semantika ir nuolatinis matavimas. Tai pagrindas, kurį Google ir klientai įvertina ilguoju
              laikotarpiu.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">01</p>
                <p className="mt-2 text-sm text-zinc-300">Techninis SEO prieš paleidimą</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">02</p>
                <p className="mt-2 text-sm text-zinc-300">Turinio ir UX patobulinimai pagal duomenis</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">03</p>
                <p className="mt-2 text-sm text-zinc-300">Metrikų stebėsena ir iteracijos</p>
              </div>
            </div>
          </section>

          <section className="site-card-interactive p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Darbo eiga</h2>
            <ol className="mt-5 grid gap-4 md:grid-cols-2">
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">1. Poreikių išgryninimas</strong>
                Tikslai, auditorija ir verslo KPI.
              </li>
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">2. Planas ir architektūra</strong>
                Struktūra, turinys, integracijos, automatika.
              </li>
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">3. Kūrimas ir testavimas</strong>
                Next.js įgyvendinimas, našumas, SEO patikra.
              </li>
              <li className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-2)]/45 p-4 text-sm text-zinc-300">
                <strong className="block text-white">4. Paleidimas ir augimas</strong>
                Diegimas, analitika, patobulinimai pagal duomenis.
              </li>
            </ol>
          </section>

          <div className="space-y-8">
            <WebPriceCalculator />
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">Supaprastinta versija</p>
              <WebBuildPricingCalculator />
            </div>
          </div>
        </div>

        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
