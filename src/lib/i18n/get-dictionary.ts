import type { Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/dictionaries/en";
import { lt, type Dictionary } from "@/lib/i18n/dictionaries/lt";

export type { Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return locale === "en" ? en : lt;
}
