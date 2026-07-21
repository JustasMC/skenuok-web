import type { AffiliateRec, NicheId } from "@/lib/niche-scan/types";
import type { MarketCategory } from "@/lib/markets/instruments";

function envUrl(key: string): string | null {
  const v = process.env[key]?.trim();
  return v && /^https?:\/\//i.test(v) ? v : null;
}

function brokerCard(locale: "lt" | "en"): AffiliateRec | null {
  const href = envUrl("NEXT_PUBLIC_AFFILIATE_BROKER_URL");
  if (!href) return null;
  const isLt = locale === "lt";
  return {
    slug: "broker",
    category: "broker",
    title: isLt ? "Investuokite per partnerinį brokerį" : "Invest via partner broker",
    description: isLt
      ? "ETF / akcijos — užsiregistravę per Skenuok galite gauti partnerio bonusą."
      : "ETFs / stocks — signup via Skenuok may include a partner bonus.",
    ctaLabel: isLt ? "Atidaryti paskyrą" : "Open account",
    href,
  };
}

function exchangeCard(locale: "lt" | "en"): AffiliateRec | null {
  const href = envUrl("NEXT_PUBLIC_AFFILIATE_CRYPTO_EXCHANGE_URL");
  if (!href) return null;
  const isLt = locale === "lt";
  return {
    slug: "crypto-exchange",
    category: "crypto_exchange",
    title: isLt ? "Prekiaukite biržoje su bonusu" : "Trade on exchange with bonus",
    description: isLt
      ? "Partnerinė birža — nuolaida mokesčiams ar welcome bonusas."
      : "Partner exchange — fee discount or welcome bonus.",
    ctaLabel: isLt ? "Registruotis" : "Sign up",
    href,
  };
}

function hostingCard(locale: "lt" | "en"): AffiliateRec | null {
  const href = envUrl("NEXT_PUBLIC_AFFILIATE_HOSTING_URL");
  if (!href) return null;
  const isLt = locale === "lt";
  return {
    slug: "hosting",
    category: "hosting",
    title: isLt ? "Greitas hostingas projektui" : "Fast hosting for your project",
    description: isLt
      ? "Paleiskite Next.js greitai — partneriniai kreditai serveriui."
      : "Ship Next.js fast — partner cloud credits.",
    ctaLabel: isLt ? "Gauti kreditų" : "Get credits",
    href,
  };
}

export function affiliatesForMarket(
  category: MarketCategory | "signals",
  locale: "lt" | "en",
): AffiliateRec[] {
  const cards: AffiliateRec[] = [];
  if (category === "etf" || category === "fx") {
    const b = brokerCard(locale);
    if (b) cards.push(b);
  }
  if (category === "metals" || category === "signals") {
    const e = exchangeCard(locale);
    if (e) cards.push(e);
    const b = brokerCard(locale);
    if (b) cards.push(b);
  }
  if (category === "signals") {
    const e = exchangeCard(locale);
    if (e && !cards.some((c) => c.slug === e.slug)) cards.push(e);
  }
  return cards;
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
    const e = exchangeCard(locale);
    if (e) cards.push(e);
  }

  if (niche === "web") {
    cards.push({
      slug: "web-dev",
      category: "web_dev",
      title: isLt ? "Svetainių kūrimas B2B" : "B2B website development",
      description: isLt
        ? "SEO balas žemas? Sutvarkysime našumą ir konversijas."
        : "Low SEO score? We fix performance and conversions.",
      ctaLabel: isLt ? "Užklausa" : "Request quote",
      href: "/services/web-dev",
    });
    const h = hostingCard(locale);
    if (h) cards.push(h);
  }

  return cards;
}
