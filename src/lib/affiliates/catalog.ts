import type { AffiliateRec, NicheId } from "@/lib/niche-scan/types";

function envUrl(key: string): string | null {
  const v = process.env[key]?.trim();
  return v && /^https?:\/\//i.test(v) ? v : null;
}

/** Env-driven affiliate catalog. Missing URLs → card omitted. */
export function affiliatesForNiche(
  niche: NicheId,
  locale: "lt" | "en",
  productHints: string[] = [],
): AffiliateRec[] {
  const cards: AffiliateRec[] = [];
  const isLt = locale === "lt";

  if (niche === "auto") {
    const carVertical = envUrl("NEXT_PUBLIC_AFFILIATE_CARVERTICAL_URL");
    if (carVertical) {
      cards.push({
        slug: "carvertical",
        category: "carvertical",
        title: isLt ? "Patikrinkite VIN istoriją" : "Check VIN history",
        description: isLt
          ? "carVertical — avarijos, rida, savininkų skaičius."
          : "carVertical — accidents, mileage, ownership history.",
        ctaLabel: isLt ? "Tikrinti VIN" : "Check VIN",
        href: carVertical,
      });
    }
    const leasing = envUrl("NEXT_PUBLIC_AFFILIATE_AUTO_LEASING_URL");
    if (leasing) {
      cards.push({
        slug: "auto-leasing",
        category: "auto_leasing",
        title: isLt ? "Automobilio lizingas" : "Car leasing",
        description: isLt ? "Gaukite lizingo pasiūlymą greitai." : "Get a leasing offer quickly.",
        ctaLabel: isLt ? "Gauti pasiūlymą" : "Get offer",
        href: leasing,
      });
    }
  }

  if (niche === "beauty" || niche === "home" || niche === "tech") {
    const amazon = envUrl("NEXT_PUBLIC_AFFILIATE_AMAZON_URL");
    if (amazon) {
      const hint = productHints[0]?.slice(0, 80);
      cards.push({
        slug: "amazon",
        category: "amazon",
        title: hint
          ? isLt
            ? `Rekomenduojama: ${hint}`
            : `Recommended: ${hint}`
          : isLt
            ? "Produktų rekomendacijos"
            : "Product recommendations",
        description: isLt
          ? "Partnerių pasiūlymai pagal AI analizę."
          : "Partner picks based on AI analysis.",
        ctaLabel: isLt ? "Peržiūrėti" : "View deals",
        href: amazon,
      });
    }
    const awin = envUrl("NEXT_PUBLIC_AFFILIATE_AWIN_URL");
    if (awin) {
      cards.push({
        slug: "awin",
        category: "awin",
        title: isLt ? "Vietinės el. parduotuvės" : "Local e-shops",
        description: isLt ? "Atrinkti partneriai pagal nišą." : "Curated partners for this niche.",
        ctaLabel: isLt ? "Žiūrėti" : "Browse",
        href: awin,
      });
    }
  }

  if (niche === "crypto") {
    const exchange = envUrl("NEXT_PUBLIC_AFFILIATE_CRYPTO_EXCHANGE_URL");
    if (exchange) {
      cards.push({
        slug: "crypto-exchange",
        category: "crypto_exchange",
        title: isLt ? "Patikima birža" : "Trusted exchange",
        description: isLt
          ? "Atidarykite sąskaitą partnerinėje biržoje."
          : "Open an account on a partner exchange.",
        ctaLabel: isLt ? "Registruotis" : "Sign up",
        href: exchange,
      });
    }
  }

  if (niche === "web") {
    cards.push({
      slug: "web-dev",
      category: "web_dev",
      title: isLt ? "Svetainių kūrimas B2B" : "B2B website development",
      description: isLt
        ? "Sutvarkysime našumą, SEO ir konversijas."
        : "We fix performance, SEO, and conversions.",
      ctaLabel: isLt ? "Užklausa" : "Request quote",
      href: "/services/web-dev",
    });
  }

  return cards;
}
