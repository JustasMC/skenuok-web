import { DEFAULT_LOCALE, parseLocale, type Locale } from "@/lib/i18n/config";

/** Language the LLM must write user-facing analysis in. */
export function analysisLanguageName(locale: Locale): "Lithuanian" | "English" {
  return locale === "en" ? "English" : "Lithuanian";
}

/**
 * Hard language lock for LLM outputs. Keep this first in system prompts —
 * English Lighthouse audit titles otherwise bias models toward English.
 */
export function analysisLanguageInstruction(locale: Locale): string {
  if (locale === "en") {
    return [
      "LANGUAGE LOCK (mandatory): outputLanguage = English.",
      "Write EVERY user-facing string in clear professional English only:",
      "insights[], siteTopic, siteDescription, summaries, recommendations, verdicts, checklist texts.",
      "Do NOT use Lithuanian. Technical metric names (LCP, CLS, JSON-LD) may stay in English.",
    ].join("\n");
  }
  return [
    "KALBOS UŽRAKTAS (privaloma): outputLanguage = Lithuanian (lietuvių).",
    "VISAS vartotojui skirtas tekstas TIK lietuvių kalba:",
    "insights[], siteTopic, siteDescription, santraukos, rekomendacijos, verdiktai, checklist tekstai.",
    "DRAUDŽIAMA rašyti angliškai (net jei Lighthouse auditų pavadinimai angliški — išversk / parašyk lietuviškai).",
    "Techninius santrumpas (LCP, CLS, JSON-LD) galima palikti, bet paaiškinimai — lietuviškai.",
  ].join("\n");
}

export function analysisOutputLanguageCode(locale: Locale): "lt" | "en" {
  return locale === "en" ? "en" : "lt";
}

/** Prefer explicit body locale, else default (safe for client + server shared imports). */
export function resolveAnalysisLocale(explicit?: string | null): Locale {
  if (explicit) return parseLocale(explicit);
  return DEFAULT_LOCALE;
}
