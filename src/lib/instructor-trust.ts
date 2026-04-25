import type { FreeAltItem } from "@/lib/verify-free-alternatives";

export type InstructorSerpTrust = "strong_public" | "mixed_or_unknown" | "negative_signals" | "no_hits";

/**
 * Heuristika pagal organinių rezultatų antraštes / snippetus (ne teisinė išvada).
 */
export function classifyInstructorSerpHits(items: FreeAltItem[]): InstructorSerpTrust {
  if (!items.length) return "no_hits";

  const blob = items
    .map((i) => `${i.title} ${i.snippet}`)
    .join(" ")
    .toLowerCase();

  const negative = /(scam|fraud|fake|complaint|rip-?off|apgaul|sukči|negative review|warning)/i.test(blob);
  if (negative) return "negative_signals";

  const positive =
    /(linkedin\.com|github\.com|crunchbase|verified|university|professor|certificate|licen[cs])/i.test(blob) ||
    /(official|interview|speaker|author)/i.test(blob);

  if (positive) return "strong_public";

  return "mixed_or_unknown";
}
