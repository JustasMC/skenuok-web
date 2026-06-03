/**
 * Home page (/) SEO: title, description, FAQ, and JSON-LD.
 * English comments per project rules; user-facing copy is Lithuanian.
 */

export const homePageH1 = "Profesionalus svetainių kūrimas ir AI valdomas SEO auditas";

export const homePageTitle =
  "Svetainių kūrimas, URL skeneris ir AI SEO auditas | Svetainių analizė — Skenuok.com";

export const homePageDescription =
  "Svetainių kūrimas ir SEO auditas su Next.js: greitos AI svetainės su techniškai tvarkingu kodu, skirtos matomumui bei konversijoms Lietuvoje.";

export const homePageKeywords = [
  "SEO URL skeneris",
  "SEO svetainių analizė",
  "AI SEO auditas",
  "Svetainių analizė",
  "web paslaugos",
  "web dizainas",
  "Next.js",
  "React",
  "Lighthouse",
  "PageSpeed",
  "Core Web Vitals",
  "Skenuok.com",
  "Svetainių kūrimas",
] as const;

export const homeFaqContent: readonly { q: string; a: string }[] = [
  {
    q: "Kodėl svarbu naudoti SEO svetainių URL skenerius ir AI SEO auditą?",
    a: "Skeneris parodo, ar URL ir puslapio struktūra dera su paieškos lūkesčiais: trūkstami meta, pasikartojančios temos, silpna našumo ar prieinamumo metrika. AI sluoksnis paverčia dešimtis rodyklių į aiškius veiksmus — be interpretacijų atspėliojimo.",
  },
  {
    q: "Kuo naudinga Skenuok.com: Svetainių analizė be įsipareigojimų?",
    a: "Greitai matote „kur skauda“: techninis SEO, Core Web Vitals, H1 / title / description. Tai pagrindas bet kuriai SEO strategijai — pirmiausia faktai, paskui turinys ir nuorodų architektūra.",
  },
  {
    q: "Kaip Next.js ir React susiję su SEO šioje platformoje?",
    a: "Jūsų skaitote svetainę, pastatytą su Next.js (React ekosistemoje). Serveriniai komponentai ir Metaduomenų API leidžia kiekvienam puslapiui turėti korektiškus title, aprašymus ir atvirą grafiką; tai atitinka rekomendacijas naudoti SSR/SSG semantinį HTML, kurį gali indeksuoti paieška.",
  },
  {
    q: "Kokie pagrindiniai techninio SEO optimizacijos žingsniai po skenavimo?",
    a: "1) Tinkami meta aprašymai ir H1. 2) Svetainės ir vaizdų našumo optimizavimas, kad sumažėtų užkrovimo laikas. 3) Logiškos vidinės nuorodos ir aiški meniu hierarchija. 4) Naudingas, neperkrautas turinys. Mūsų ataskaita padeda nusistatyti pirmenybę, ne tik sąrašą defektų.",
  },
  {
    q: "Kuo skiriasi URL skaneris ir kursų kokybės skenavimas?",
    a: "URL skaneris orientuojasi į domeno ir puslapio techninę santrauką. Kursų skenavimas papildo turinio ir pasiūlos prasme — tinka, kai parduodate mokymus, ne tik „svetainės greitį“.",
  },
  {
    q: "Kiek laiko trunka skenavimas? Ar mano duomenys saugūs?",
    a: "Daugumai domenų — kelios minutėlės. Į skenerį vedate tik viešai pasiekiamą URL; paskyros ar slaptažodžiai nereikalingi. Toliau galite tęsti per kainodarą, generatorių arba kontaktą dėl kūrimo paslaugos.",
  },
] as const;

export function getHomeFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaqContent.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
