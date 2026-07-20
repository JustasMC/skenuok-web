import { DEFAULT_LOCALE, parseLocale, type Locale } from "@/lib/i18n/config";

/** Language the LLM must write user-facing analysis in. */
export function analysisLanguageName(locale: Locale): "Lithuanian" | "English" {
  return locale === "en" ? "English" : "Lithuanian";
}

export function analysisLanguageInstruction(locale: Locale): string {
  return locale === "en"
    ? "Write ALL user-facing text in clear professional English."
    : "Rašyk VISĄ vartotojui skirtą tekstą aiškia profesionalių lietuvių kalba.";
}

/** Prefer explicit body locale, else default (safe for client + server shared imports). */
export function resolveAnalysisLocale(explicit?: string | null): Locale {
  if (explicit) return parseLocale(explicit);
  return DEFAULT_LOCALE;
}
