/** Detect visitor country / preferred checkout currency from request headers. */

const EU_EEA = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
]);

export type CheckoutCurrency = "eur" | "usd";

export function detectCountryCode(req: Request): string | null {
  const cf = req.headers.get("cf-ipcountry")?.trim().toUpperCase();
  if (cf && cf !== "XX" && cf.length === 2) return cf;

  const vercel = req.headers.get("x-vercel-ip-country")?.trim().toUpperCase();
  if (vercel && vercel.length === 2) return vercel;

  const al = req.headers.get("accept-language")?.toLowerCase() ?? "";
  if (al.includes("lt")) return "LT";
  if (al.startsWith("en-us") || al.includes("en-us")) return "US";
  return null;
}

export function currencyForCountry(country: string | null): CheckoutCurrency {
  if (!country) return "eur";
  if (country === "LT" || EU_EEA.has(country)) return "eur";
  return "usd";
}

export function resolveStripePriceId(
  pack: "5" | "20",
  currency: CheckoutCurrency,
): { priceId: string; currency: CheckoutCurrency; credits: number } {
  const credits5 = Math.max(
    1,
    Number.parseInt(process.env.STRIPE_CREDITS_5_EUR ?? process.env.STRIPE_CREDITS_PER_PURCHASE ?? "15", 10),
  );
  const credits20 = Math.max(
    1,
    Number.parseInt(
      process.env.STRIPE_CREDITS_20_EUR ?? process.env.STRIPE_CREDITS_PER_PURCHASE ?? "80",
      10,
    ),
  );

  const eur5 = process.env.STRIPE_PRICE_ID_5_EUR?.trim() ?? "";
  const eur20 =
    process.env.STRIPE_PRICE_ID_20_EUR?.trim() || process.env.STRIPE_PRICE_ID?.trim() || "";
  const usd5 = process.env.STRIPE_PRICE_ID_5_USD?.trim() ?? "";
  const usd20 = process.env.STRIPE_PRICE_ID_20_USD?.trim() ?? "";

  if (currency === "usd") {
    const usdId = pack === "5" ? usd5 : usd20;
    if (usdId.startsWith("price_")) {
      return {
        priceId: usdId,
        currency: "usd",
        credits: pack === "5" ? credits5 : credits20,
      };
    }
    // Graceful fallback to EUR
  }

  const eurId = pack === "5" ? eur5 : eur20;
  return {
    priceId: eurId,
    currency: "eur",
    credits: pack === "5" ? credits5 : credits20,
  };
}
