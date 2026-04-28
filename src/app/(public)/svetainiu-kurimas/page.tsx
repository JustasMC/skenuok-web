import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCanonicalPath } from "@/lib/site-url";
import { siteConfig } from "@/lib/site-config";

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
      <main id="main-content" className="site-shell py-14 sm:py-16">
        <section className="site-card p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-electric)]">Paslauga</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Svetainių kūrimas: nuo idėjos iki greito, SEO paruošto produkto
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">
            Kuriu modernias svetaines su Next.js taip, kad jos ne tik atrodytų tvarkingai, bet ir konvertuotų: greitas
            užkrovimas, aiški informacijos architektūra, tvarkingas SEO ir paruoštos integracijos augimui.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/#kontaktai" className="site-btn-primary">
              Aptarti projektą
            </a>
            <Link href="/tools/scanner" className="site-btn-secondary">
              Išbandyti URL auditą
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-3">
          <article className="site-card-interactive p-6">
            <h2 className="text-xl font-semibold text-white">Kodėl Next.js</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Next.js leidžia turėti serverinį renderinimą, gerą indeksaciją ir aiškią komponentinę architektūrą.
              Rezultatas: greitas pirmas įkėlimas ir paprastesnė ilgalaikė priežiūra.
            </p>
          </article>

          <article className="site-card-interactive p-6">
            <h2 className="text-xl font-semibold text-white">Greitis ir patikimumas</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Diegimas ant Railway, mokėjimai per Stripe ir modernus TypeScript stack leidžia turėti stabilų pagrindą
              tiek MVP, tiek augančiam verslui be techninės skolos kaupimo.
            </p>
          </article>

          <article className="site-card-interactive p-6">
            <h2 className="text-xl font-semibold text-white">AI auditai UX gerinimui</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              AI + Lighthouse auditai padeda pamatyti, kur prarandate konversiją: lėti puslapiai, neaiškus turinys ar
              silpni veiksmo kvietimai. Tai paverčiama prioritetiniu darbų planu.
            </p>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
