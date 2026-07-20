const twitterCreator = process.env.NEXT_PUBLIC_TWITTER_CREATOR?.trim();

export const siteConfig = {
  /** Viešas prekės ženklas (domenas, SEO, OG). */
  name: "Skenuok.com",
  /** Trumpas ženklas logotipe ir manifeste. */
  shortName: "Skenuok",
  titleTemplate: "%s | Skenuok.com",
  defaultTitle: "Svetainių kūrimas, SEO auditas ir AI įrankiai | Skenuok.com",
  defaultDescription:
    "Profesionalūs SEO ir AI įrankiai bei fullstack paslaugos: URL skeneris, turinio generatorius, svetainių kūrimas su Next.js. Aiškūs terminai, matuojami rezultatai ir patikima techninė bazė verslui Lietuvoje.",
  tagline: "SEO · Next.js · AI sprendimai",
  locale: "lt_LT",
  contactEmail: "JustasMc91@gmail.com",
  twitterCreator: twitterCreator && twitterCreator.startsWith("@") ? twitterCreator : twitterCreator ? `@${twitterCreator}` : undefined,
  keywords: [
    "Skenuok.com",
    "SEO auditas",
    "URL skeneris",
    "AI SEO",
    "Next.js",
    "svetainių kūrimas",
    "turinio generatorius",
    "Lighthouse",
    "Core Web Vitals",
    "fullstack",
    "API integracija",
    "Lietuva",
  ],
};
