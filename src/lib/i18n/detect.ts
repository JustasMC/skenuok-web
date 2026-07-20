import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

/**
 * Pick locale from Accept-Language.
 * Lithuanian preferred → lt; otherwise en (foreign visitors).
 */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header?.trim()) return DEFAULT_LOCALE;

  const parts = header.split(",").map((raw) => {
    const [tagPart, ...params] = raw.trim().split(";");
    const tag = (tagPart ?? "").trim().toLowerCase();
    let q = 1;
    for (const p of params) {
      const m = /q\s*=\s*([\d.]+)/i.exec(p);
      if (m) q = Number.parseFloat(m[1] ?? "1") || 0;
    }
    return { tag, q };
  });

  parts.sort((a, b) => b.q - a.q);

  for (const { tag } of parts) {
    if (tag === "lt" || tag.startsWith("lt-")) return "lt";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }

  // Non-LT primary language → English UI
  const top = parts[0]?.tag ?? "";
  if (top.startsWith("lt")) return "lt";
  return "en";
}
