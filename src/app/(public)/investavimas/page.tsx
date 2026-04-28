import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const ibkrReferralUrl =
  process.env.NEXT_PUBLIC_IBKR_REFERRAL_URL?.trim() || "https://www.interactivebrokers.com/";

const ContactForm = dynamic(() => import("@/components/ContactForm").then((m) => m.ContactForm), {
  loading: () => (
    <div className="site-shell">
      <div className="min-h-[min(380px,45vh)] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30" />
    </div>
  ),
});

const CashSecuredPutCalculator = dynamic(
  () => import("@/components/CashSecuredPutCalculator").then((m) => m.CashSecuredPutCalculator),
  {
    loading: () => (
      <div className="min-h-[22rem] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30" />
    ),
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/investavimas");
  const title = "Investavimas: IBKR ir AI parinkčių prekybai";
  const description =
    "Praktinis straipsnis apie tai, kaip naudoju IBKR ir AI opcijų (cash-secured put) strategijoms, su ROI skaičiuokle ir rizikos buferio vertinimu.";

  return {
    title,
    description,
    keywords: [
      "IBKR",
      "investavimas",
      "parinkčių prekyba",
      "cash secured put",
      "ROI skaičiuoklė",
      "AI trading workflow",
    ],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "article",
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

export default function InvestavimasPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-section">
        <div className="site-shell space-y-8 sm:space-y-10">
          <section className="site-card p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-electric)]">Investavimas</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Kaip aš naudoju IBKR ir AI parinkčių prekybai
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">
              Mano procesas remiasi paprasta idėja: AI padeda greitai filtruoti scenarijus, o aš priimu galutinius
              sprendimus pagal rizikos discipliną. IBKR naudoju dėl plataus instrumentų pasirinkimo, patikimo vykdymo ir
              aiškios rizikos kontrolės.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#roi-calculator" className="site-btn-primary">
                Skaičiuoti ROI
              </Link>
              <Link href="/#kontaktai" className="site-btn-secondary">
                Aptarti strategiją
              </Link>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <article className="site-card-interactive p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Praktinis workflow</h2>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                <li>
                  <strong className="text-zinc-200">1.</strong> AI filtras surenka akcijas pagal likvidumą, implied volatility
                  ir kainos zoną.
                </li>
                <li>
                  <strong className="text-zinc-200">2.</strong> IBKR platformoje tikrinu grandinę, bid/ask kokybę ir tikrą
                  vykdymo kainą.
                </li>
                <li>
                  <strong className="text-zinc-200">3.</strong> Prieš atidarydamas poziciją skaičiuoju annualized ROI ir margin
                  of safety.
                </li>
                <li>
                  <strong className="text-zinc-200">4.</strong> Riziką valdau pagal kapitalo paskirstymą, ne pagal emociją.
                </li>
              </ol>
            </article>

            <article className="site-card-interactive p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Kodėl AI šiame procese</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                AI leidžia greičiau atrinkti kandidatus, aptikti pasikartojančius rizikos modelius ir standartizuoti
                pasiruošimą sandoriui. Rezultatas: mažiau rankinio triukšmo, daugiau nuoseklaus sprendimų priėmimo.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Svarbu: tai nėra „automatinio pelno mygtukas“ — AI yra pagalbinis sluoksnis disciplinuotai sistemai.
              </p>
            </article>
          </section>

          <div id="roi-calculator">
            <CashSecuredPutCalculator />
          </div>

          <section className="site-card-interactive relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,color-mix(in_oklab,var(--color-electric)_16%,transparent),transparent_58%)]" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-lime)]">Referral</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Pradėk investuoti su IBKR</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                Jei nori naudoti tą pačią brokerio infrastruktūrą, nuo kurios dirbu aš, pradėk nuo IBKR paskyros. Svarbiausia
                yra procesas, rizikos valdymas ir ilgas horizontas.
              </p>
              <a
                href={ibkrReferralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="site-btn-lime mt-6 inline-flex"
              >
                Atidaryti IBKR registraciją
              </a>
              <p className="mt-4 text-xs leading-relaxed text-zinc-500">
                Pastaba: investavimas susijęs su rizika. Ši informacija yra edukacinė ir nėra individuali finansinė
                rekomendacija.
              </p>
            </div>
          </section>
        </div>

        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
