import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalSection } from "@/components/legal/LegalArticle";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath, getSiteOrigin } from "@/lib/site-url";

const pageTitle = "Paslaugų teikimo sąlygos (Terms of Service)";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/terms");
  const description =
    "Skenuok.com paslaugų teikimo sąlygos: URL skeneris, SEO įrankiai, kreditai, atsakomybės ribojimas. Standartinis šablonas SEO / web paslaugų svetainei — Stripe ir naudotojų skaidrumui.";

  return {
    title: pageTitle,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: { card: "summary", title: pageTitle, description },
    keywords: [
      "paslaugų teikimo sąlygos",
      "terms of service",
      "Skenuok.com",
      "privatumo politika",
      "SEO paslaugos",
    ],
  };
}

export default function TermsPage() {
  const origin = getSiteOrigin();
  const updated = new Date().toLocaleDateString("lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <PageIntro variant="page" kicker="Teisinė informacija" title={pageTitle}>
            <p>
              Šios <strong className="font-medium text-zinc-300">paslaugų teikimo sąlygos</strong> taikomos naudojantis svetaine{" "}
              <strong className="font-medium text-zinc-300">Skenuok.com</strong> ({origin}) ir susijusiomis paslaugomis. Tai
              bendro pobūdžio šablonas; prieš svarbius sprendimus rekomenduojame pasitarti su teisininku.
            </p>
          </PageIntro>

          <LegalArticle>
            <p className="rounded-lg border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_70%,transparent)] px-4 py-3 text-xs text-zinc-500">
              Paskutinis atnaujinimas: <time dateTime={new Date().toISOString().slice(0, 10)}>{updated}</time>. Dokumentas
              skirtas <Link href="/privacy" className="site-link-inline font-medium">privatumo politikai</Link> papildyti, ne
              pakeisti.
            </p>

            <LegalSection id="ivadas" title="1. Įvadas">
              <p>
                Svetainės valdytojas: <strong className="text-zinc-300">{siteConfig.name}</strong> (toliau — „mes“, „paslaugų
                teikėjas“). Naudodamiesi įrankiais, užklausomis ar mokamomis funkcijomis, sutinkate su šiomis sąlygomis. Jei su
                jomis nesutinkate, prašome nesinaudoti paslaugomis.
              </p>
            </LegalSection>

            <LegalSection id="paslaugos" title="2. Paslaugų aprašymas">
              <p>
                Teikiame skaitmenines paslaugas, įskaitant (bet neapsiribojant): nemokamą ir mokamą{" "}
                <Link href="/tools/scanner" className="site-link-inline font-medium text-[var(--color-electric)]">
                  SEO URL / svetainių skenavimą
                </Link>
                ,{" "}
                <Link href="/tools/course-scanner" className="site-link-inline font-medium text-[var(--color-electric)]">
                  kursų kokybės analizę
                </Link>
                ,{" "}
                <Link href="/irankiai/seo-generatorius" className="site-link-inline font-medium text-[var(--color-electric)]">
                  SEO turinio generatorių
                </Link>
                , kreditų sistemą, vartotojo paskyras ir susijusias funkcijas, aprašytas{" "}
                <Link href="/pricing" className="site-link-inline font-medium text-[var(--color-electric)]">
                  kainodaroje
                </Link>
                . Funkcijos gali būti keičiamos techninių ar verslo priežasčių — esmines sąlygos atnaujinsime šiame puslapyje.
              </p>
            </LegalSection>

            <LegalSection id="naudojimas" title="3. Naudojimo sąlygos">
              <ul className="list-inside list-disc space-y-2 text-zinc-400">
                <li>Naudokitės paslaugomis tik teisėtiems tikslams ir nepažeidinėkite trečiųjų šalių teisių.</li>
                <li>Automatizuotą masinį naudojimą, bandymus apeiti saugumą ar ribojimus draudžiame.</li>
                <li>
                  Prisijungę vartotojai atsako už paskyros duomenų slaptumą. Mokėjimus apdoroja{" "}
                  <strong className="text-zinc-300">Stripe</strong> pagal jų naudojimo sąlygas.
                </li>
                <li>
                  AI ir analitikos išvestis naudokite kaip rekomendacinę informaciją — galutinius sprendimus priimate jūs.
                </li>
              </ul>
            </LegalSection>

            <LegalSection id="ribojimai" title="4. Atsakomybės apribojimai">
              <p>
                Paslaugos teikiamos „tokios, kokios yra“. Mes negarantuojame nepertraukiamo veikimo, konkretaus
                paieškos reitingo ar pajamų. Nei mes, nei mūsų tiekėjai neatsako už netiesioginę žalą, pelno praradimą ar duomenų
                praradimą, jei tai neįmanoma apriboti pagal galiojančius teisės aktus.
              </p>
              <p>
                Lighthouse / PageSpeed ir panašūs rodikliai remiasi trečiųjų šalių šaltiniais ir gali skirtis nuo realaus
                naudotojų elgsenos.
              </p>
            </LegalSection>

            <LegalSection id="apmokejimas" title="5. Apmokėjimas ir nutraukimas">
              <p>
                Mokamos prenumeratos ir vienkartiniai mokėjimai vykdomi per Stripe. Grąžinimai — pagal taikomą teisę ir mūsų
                tada galiojančią politiką, nebent sutartyje numatyta kitaip. Paslaugą galime sustabdyti ar apriboti, jei
                pažeidžiate sąlygas ar kyla saugumo rizika.
              </p>
            </LegalSection>

            <LegalSection id="kontaktai" title="6. Kontaktinė informacija">
              <p>
                Klausimus dėl sąlygų galite siųsti per{" "}
                <Link href="/#kontaktai" className="site-link-inline font-medium text-[var(--color-electric)]">
                  kontaktų formą
                </Link>{" "}
                pagrindiniame puslapyje arba el. paštu, jei jį nurodėte registracijoje / atsakyme į užklausą.
              </p>
            </LegalSection>
          </LegalArticle>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
