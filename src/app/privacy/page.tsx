import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalSection } from "@/components/legal/LegalArticle";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath, getSiteOrigin } from "@/lib/site-url";

const pageTitle = "Privatumo politika (Privacy Policy)";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/privacy");
  const description =
    "Skenuok.com privatumo politika: kokie duomenys renkami (kontaktai, paskyra, mokėjimai), kaip naudojami, saugojimo laikotarpiai, jūsų teisės. Standartinis šablonas SEO / web įrankiams ir Stripe integracijai.";

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
      "privatumo politika",
      "privacy policy",
      "GDPR",
      "duomenų apsauga",
      "Skenuok.com",
      "paslaugų teikimo sąlygos",
    ],
  };
}

export default function PrivacyPage() {
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
              Ši <strong className="font-medium text-zinc-300">privatumo politika</strong> paaiškina, kaip{" "}
              <strong className="font-medium text-zinc-300">Skenuok.com</strong> ({origin}) renka ir tvarko asmens duomenis
              naudojantis svetaine, įrankiais ir mokėjimais. Tai bendras šablonas; detales dėl konkretaus apdorojimo galite
              užklausti žemiau nurodytais kanalais.
            </p>
          </PageIntro>

          <LegalArticle>
            <p className="rounded-lg border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_70%,transparent)] px-4 py-3 text-xs text-zinc-500">
              Paskutinis atnaujinimas: <time dateTime={new Date().toISOString().slice(0, 10)}>{updated}</time>. Kartu su{" "}
              <Link href="/terms" className="site-link-inline font-medium">
                paslaugų teikimo sąlygomis
              </Link>
              .
            </p>

            <LegalSection id="ivadas" title="1. Įvadas">
              <p>
                Duomenų valdytojas: <strong className="text-zinc-300">{siteConfig.name}</strong>. Politika taikoma
                lankytojams, registruotiems vartotojams ir klientams, naudojantiems Skenuok.com paslaugas ES / EEE kontekste
                (BDAR taikymas, kai aktualu).
              </p>
            </LegalSection>

            <LegalSection id="rinkimas" title="2. Duomenų rinkimo metodai ir kategorijos">
              <p>Galime rinkti ir tvarkyti šias duomenų kategorijas:</p>
              <ul className="list-inside list-disc space-y-2 text-zinc-400">
                <li>
                  <strong className="text-zinc-300">Kontaktinė forma:</strong> vardas, el. paštas, įmonė (nebūtina), žinutės
                  turinys, paslaugos pasirinkimas — siunčiant užklausą į serverį.
                </li>
                <li>
                  <strong className="text-zinc-300">Paskyra (Auth.js):</strong> el. paštas, vardas, profilio nuotrauka (jei
                  pateikia Google), sesijos žetonai, paskyros identifikatorius.
                </li>
                <li>
                  <strong className="text-zinc-300">Mokėjimai:</strong> apmokėjimo metu duomenis apdoroja{" "}
                  <strong className="text-zinc-300">Stripe</strong> (kortelės duomenys saugomi pas Stripe, ne pas mus). Mes
                  galime matyti operacijos būseną, produktą / planą ir susietą vartotoją.
                </li>
                <li>
                  <strong className="text-zinc-300">Įrankių naudojimas:</strong> skenuojamas URL, strategija (mobile/desktop),
                  sugeneruotas turinys ir techniniai žurnalai, reikalingi paslaugai teikti ir saugumui.
                </li>
              </ul>
            </LegalSection>

            <LegalSection id="tikslai" title="3. Duomenų naudojimo tikslai">
              <ul className="list-inside list-disc space-y-2 text-zinc-400">
                <li>Paslaugų teikimas, autentifikavimas, kreditų apskaita ir klientų aptarnavimas.</li>
                <li>Saugumas, sukčiavimo prevencija, serverinių klaidų diagnostika.</li>
                <li>Teisinių įsipareigojimų vykdymas ir pagrįstų teisinių reikalavimų tenkinimas.</li>
              </ul>
            </LegalSection>

            <LegalSection id="laikotarpiai" title="4. Saugojimo laikotarpiai">
              <p>
                Užklausas ir paskyrų duomenis saugome tiek, kiek reikia nurodytiems tikslams arba kol galite pagrįstai prašyti
                ištrinti (išskyrus atvejus, kai įstatymai reikalauja ilgesnio saugojimo). Serverio žurnalai
                gali būti trumpesnio ciklo.
              </p>
            </LegalSection>

            <LegalSection id="teises" title="5. Jūsų teisės">
              <p>
                Kai taikoma BDAR, turite teisę prašyti prieigos, taisymo, ištrynimo, apdorojimo apribojimo, duomenų
                perkeliamumo ir nesutikti su tam tikru apdorojimu. Prašymus pateikite per{" "}
                <Link href="/#kontaktai" className="site-link-inline font-medium text-[var(--color-electric)]">
                  kontaktų formą
                </Link>{" "}
                arba el. paštu iš tos pačios paskyros, kurią norite valdyti.
              </p>
            </LegalSection>

            <LegalSection id="treciosios" title="6. Trečiosios šalys">
              <p>
                Naudojame patikimus apdorotojus (pvz., Stripe mokėjimams, Google prisijungimui, el. pašto tiekėjui, debesų
                infrastruktūrai). Jų privatumo politikas rasite atitinkamų paslaugų svetainėse.
              </p>
            </LegalSection>

            <LegalSection id="slapukai" title="7. Slapukai ir panašios technologijos">
              <p>
                Naudojame techninius slapukus / sesijas, būtinas prisijungimui ir saugumui. Jei pridėsite analitikos ar
                rinkodaros slapukų, šį skyrių atnaujinsime ir, jei reikės, paprašysime sutikimo pagal galiojančią tvarką.
              </p>
            </LegalSection>

            <LegalSection id="kontaktai" title="8. Kontaktai dėl privatumo">
              <p>
                Klausimus dėl šios <strong className="text-zinc-300">privatumo politikos</strong> ar duomenų tvarkymo siųskite
                per{" "}
                <Link href="/#kontaktai" className="site-link-inline font-medium text-[var(--color-electric)]">
                  kontaktų formą
                </Link>{" "}
                arba el. paštu, jei nurodėme jį atsakyme į jūsų užklausą.
              </p>
            </LegalSection>
          </LegalArticle>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
