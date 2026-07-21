/** Cookie-based i18n: same URL for LT/EN; hreflang still helps Search Console. */
import { getCanonicalPath } from "@/lib/site-url";

export function languageAlternates(path: string): Record<string, string> {
  const url = getCanonicalPath(path);
  return {
    lt: url,
    en: url,
    "x-default": url,
  };
}
