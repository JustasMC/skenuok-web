import type { Dictionary } from "@/lib/i18n/dictionaries/lt";
import type { InstructorPresence } from "@/lib/course-quality-scan";
import type { SkepticVerdict } from "@/lib/course-skeptic-types";

type ScanScores = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
};

export type TrustSummaryLabels = Dictionary["tools"]["courseReport"]["trustSummary"];

/**
 * Single summary line from computed signals (no extra AI).
 */
export function buildTrustSummaryLine(
  input: {
    skepticVerdict: SkepticVerdict;
    instructorPresence: InstructorPresence | null;
    valueIndex: number | null;
    overallScore: number;
    scores: ScanScores;
  },
  labels: TrustSummaryLabels,
): string {
  const { skepticVerdict: sv, instructorPresence: ip, valueIndex, overallScore, scores } = input;

  const verdictText = labels.verdict[sv];

  const low = [scores.performance, scores.seo, scores.accessibility].some((s) => s != null && s < 70);
  const techText = low ? labels.techWeak : labels.techGood;

  const instText =
    ip === "anonymous"
      ? labels.instructor.anonymous
      : ip === "pseudonym"
        ? labels.instructor.pseudonym
        : ip === "named_real"
          ? labels.instructor.named_real
          : ip === "unclear"
            ? labels.instructor.unclear
            : labels.instructor.none;

  const valText =
    valueIndex != null
      ? labels.valueIndex.replace("{n}", String(valueIndex))
      : labels.qualityIndex.replace("{n}", String(overallScore));

  return `${labels.prefix} ${verdictText}; ${techText}; ${instText}; ${valText}.`;
}
