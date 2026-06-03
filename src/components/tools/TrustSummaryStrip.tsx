"use client";

import { buildTrustSummaryLine } from "@/lib/trust-summary-line";
import type { InstructorPresence } from "@/lib/course-quality-scan";
import type { SkepticVerdict } from "@/lib/course-skeptic-types";

type ScanScores = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
};

export function TrustSummaryStrip(props: {
  skepticVerdict: SkepticVerdict;
  instructorPresence: InstructorPresence | null;
  valueIndex: number | null;
  overallScore: number;
  scores: ScanScores;
}) {
  const line = buildTrustSummaryLine(props);

  return (
    <div className="rounded-xl border border-[color-mix(in_oklab,var(--color-electric)_28%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-bg)_92%,var(--color-electric)_8%)] px-4 py-3 text-sm leading-relaxed text-zinc-200 shadow-[0_0_24px_-8px_color-mix(in_oklab,var(--color-electric)_35%,transparent)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-electric)]">Pasitikėjimo suvestinė</p>
      <p className="mt-1.5 text-zinc-100">{line}</p>
    </div>
  );
}
