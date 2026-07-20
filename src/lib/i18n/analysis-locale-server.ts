import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, parseLocale, type Locale } from "@/lib/i18n/config";

/** Resolve analysis locale from request body or `sk_locale` cookie (API routes / RSC only). */
export async function resolveAnalysisLocaleFromCookies(explicit?: string | null): Promise<Locale> {
  if (explicit && (explicit === "lt" || explicit === "en")) return explicit;
  try {
    const jar = await cookies();
    return parseLocale(jar.get(LOCALE_COOKIE)?.value);
  } catch {
    return DEFAULT_LOCALE;
  }
}
