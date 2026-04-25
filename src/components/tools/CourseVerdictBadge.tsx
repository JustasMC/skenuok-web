"use client";

import type { SkepticVerdict } from "@/lib/course-skeptic-types";

const LABELS: Record<SkepticVerdict, string> = {
  SAUGU: "Skeptiko verdiktas: saugu",
  ATSARGIAI: "Skeptiko verdiktas: atsargiai",
  RIZIKA: "Skeptiko verdiktas: rizika",
  SCAM: "Skeptiko verdiktas: tikėtinas scam",
};

export function CourseVerdictBadge({
  verdict,
  className = "",
}: {
  verdict: SkepticVerdict;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide sm:text-sm";

  const styles: Record<SkepticVerdict, string> = {
    SAUGU:
      "border-[color-mix(in_oklab,var(--color-electric)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-bg)_88%,var(--color-electric)_12%)] text-[var(--color-electric)] shadow-[0_0_18px_color-mix(in_oklab,var(--color-electric)_35%,transparent)]",
    ATSARGIAI:
      "border-amber-500/40 bg-[color-mix(in_oklab,var(--color-bg)_92%,#b45309_8%)] text-amber-100",
    RIZIKA:
      "border-orange-500/55 bg-[color-mix(in_oklab,var(--color-bg)_90%,#ea580c_10%)] text-orange-100",
    SCAM:
      "animate-pulse border-rose-500/70 bg-[color-mix(in_oklab,var(--color-bg)_85%,#be123c_15%)] text-rose-100 shadow-[0_0_22px_rgba(225,29,72,0.35)]",
  };

  const icon =
    verdict === "SCAM" ? (
      <span className="text-base leading-none" aria-hidden>
        🚨
      </span>
    ) : verdict === "RIZIKA" ? (
      <span className="text-base leading-none" aria-hidden>
        ⚠️
      </span>
    ) : verdict === "SAUGU" ? (
      <span className="text-base leading-none" aria-hidden>
        ✓
      </span>
    ) : (
      <span className="text-base leading-none" aria-hidden>
        ◆
      </span>
    );

  return (
    <span className={`${base} ${styles[verdict]} ${className}`} role="status">
      {icon}
      {LABELS[verdict]}
    </span>
  );
}
