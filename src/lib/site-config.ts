const twitterCreator = process.env.NEXT_PUBLIC_TWITTER_CREATOR?.trim();

export const siteConfig = {
  name: "Fullstack & AI Solutions",
  titleTemplate: "%s | Fullstack & AI Solutions",
  defaultTitle: "Fullstack, AI agentai, SEO, analitika, Rust | Profesionalios paslaugos",
  defaultDescription:
    "Profesionalios fullstack ir AI paslaugos: greitos svetainės ant Next.js, SEO optimizacija, duomenų analitika (SQL, Power BI, GA4), API integracijos ir patikimi sprendimai verslui. Draugiškas bendravimas, aiškūs terminai ir matomas rezultatas — rašykite dėl konsultacijos ar projekto.",
  locale: "lt_LT",
  /** Twitter / X „creator“ — tik jei nustatytas NEXT_PUBLIC_TWITTER_CREATOR (pvz. @vartotojas). */
  twitterCreator: twitterCreator && twitterCreator.startsWith("@") ? twitterCreator : twitterCreator ? `@${twitterCreator}` : undefined,
  keywords: [
    "fullstack",
    "Next.js",
    "SEO",
    "AI agentai",
    "duomenų analitika",
    "Power BI",
    "GA4",
    "PostgreSQL",
    "Rust",
    "TypeScript",
    "React",
    "automatizacija",
    "API integracija",
    "Lighthouse",
    "Lietuva",
  ],
};
