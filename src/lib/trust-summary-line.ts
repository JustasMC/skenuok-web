import type { InstructorPresence } from "@/lib/course-quality-scan";
import type { SkepticVerdict } from "@/lib/course-skeptic-types";

type ScanScores = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
};

/**
 * Viena suvestinė eilutė iš jau apskaičiuotų signalų (be papildomo AI).
 */
export function buildTrustSummaryLine(input: {
  skepticVerdict: SkepticVerdict;
  instructorPresence: InstructorPresence | null;
  valueIndex: number | null;
  overallScore: number;
  scores: ScanScores;
}): string {
  const { skepticVerdict: sv, instructorPresence: ip, valueIndex, overallScore, scores } = input;

  const verdictLt =
    sv === "SCAM"
      ? "skeptikas laiko tai tikėtina apgaule"
      : sv === "RIZIKA"
        ? "skeptikas mato padidėjusią riziką"
        : sv === "ATSARGIAI"
          ? "reikia atsargumo"
          : "signalai santykinai palankesni";

  const low = [scores.performance, scores.seo, scores.accessibility].some((s) => s != null && s < 70);
  const techLt = low
    ? "techninis Lighthouse pagrindas silpnesnis"
    : "techninis Lighthouse pagrindas neblogas";

  const instLt =
    ip === "anonymous"
      ? "lektorius anoniminis arba neįvardytas"
      : ip === "pseudonym"
        ? "lektorius pristatytas slapyvardžiu"
        : ip === "named_real"
          ? "lektorius įvardytas kaip konkretus asmuo"
          : ip === "unclear"
            ? "lektoriaus tapatybė neaiški"
            : "lektoriaus tapatybė neįvertinta";

  const valLt =
    valueIndex != null
      ? `vertės indeksas ${valueIndex}/100`
      : `kokybės indeksas ${overallScore}/100`;

  return `Santrauka: ${verdictLt}; ${techLt}; ${instLt}; ${valLt}.`;
}
