import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, parseLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";

export async function getRequestLocale(): Promise<Locale> {
  try {
    const jar = await cookies();
    return parseLocale(jar.get(LOCALE_COOKIE)?.value);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export async function getRequestDictionary(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getRequestLocale();
  return { locale, dict: getDictionary(locale) };
}
