import { siteConfig } from "@/lib/site-config";
import { getSiteOrigin } from "@/lib/site-url";

function parseSameAs(): string[] | undefined {
  const raw = process.env.NEXT_PUBLIC_ORGANIZATION_SAME_AS?.trim();
  if (!raw) return undefined;
  const urls = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
  return urls.length ? urls : undefined;
}

/** Pagrindinė JSON-LD grafa: WebSite, WebPage, Organization, ProfessionalService (LT). */
export function getSoftwareServiceJsonLd() {
  const siteUrl = getSiteOrigin();
  const logoUrl = `${siteUrl}/images/fs-ai-mark.svg`;
  const sameAs = parseSameAs();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteConfig.name,
        description: siteConfig.defaultDescription,
        inLanguage: "lt-LT",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: siteConfig.defaultTitle,
        description: siteConfig.defaultDescription,
        inLanguage: "lt-LT",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#service` },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteConfig.name,
        url: siteUrl,
        description: siteConfig.defaultDescription,
        ...(sameAs ? { sameAs } : {}),
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          contentUrl: logoUrl,
        },
        knowsAbout: [
          "Fullstack programavimas",
          "Dirbtinis intelektas",
          "SEO optimizacija",
          "Duomenų analitika",
          "Rust programavimas",
          "Next.js",
        ],
        areaServed: [
          { "@type": "Country", name: "Lietuva" },
          { "@type": "Place", name: "Worldwide" },
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#service`,
        name: "Fullstack, AI ir SEO paslaugos",
        serviceType: "Programinės įrangos kūrimas ir skaitmeninė rinkodara",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: [
          { "@type": "Country", name: "Lietuva" },
          { "@type": "Place", name: "Worldwide" },
        ],
        url: siteUrl,
        description: siteConfig.defaultDescription,
        inLanguage: "lt-LT",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Paslaugų katalogas",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Žiniatinklio sprendimai (Next.js / Rust)",
                description: "Serveriniai komponentai, SEO, našumas ir patikimas diegimas.",
              },
            },
            {
              "@type": "Offer",
              priceCurrency: "EUR",
              price: "249",
              itemOffered: {
                "@type": "Service",
                name: "Techninis SEO auditas + 90 d. planas",
                description: "Giluminis auditas su prioritetizuotu 90 dienų veiksmų planu ir KPI.",
              },
            },
            {
              "@type": "Offer",
              priceCurrency: "EUR",
              price: "390",
              itemOffered: {
                "@type": "Service",
                name: "SEO turinio startas",
                description: "Penki SEO straipsniai ir vidinių nuorodų schema pagal nišą.",
              },
            },
            {
              "@type": "Offer",
              priceCurrency: "EUR",
              price: "149",
              itemOffered: {
                "@type": "Service",
                name: "Mėnesinė SEO / svetainės priežiūra",
                description: "Techniniai pataisymai, turinio ritmas ir mėnesio ataskaita.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Verslo logika ir automatizacija (Python / AI)",
                description: "AI agentai, API integracijos ir aiškiai aprašyta verslo logika.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Duomenų analitika (SQL / Power BI / GA4)",
                description: "KPI, ataskaitos ir vieningas duomenų modelis sprendimams.",
              },
            },
          ],
        },
      },
    ],
  };
}
