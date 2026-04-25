"use client";

import type { InstructorPresence } from "@/lib/course-quality-scan";
import type { SkepticVerdict } from "@/lib/course-skeptic-types";

function emojiFor(presence: InstructorPresence, skepticVerdict: SkepticVerdict | null): string {
  if (skepticVerdict === "SCAM") return "🚨";
  if (presence === "anonymous") return "🚨";
  if (presence === "pseudonym") return "⚠️";
  if (presence === "named_real") return "👤";
  return "❔";
}

export function InstructorBadge({
  instructorIdentity,
  instructorPresence,
  skepticVerdict,
  className = "",
}: {
  instructorIdentity: string;
  instructorPresence: InstructorPresence;
  skepticVerdict: SkepticVerdict | null;
  className?: string;
}) {
  const emoji = emojiFor(instructorPresence, skepticVerdict);
  const short =
    instructorPresence === "anonymous"
      ? "Anonimas"
      : instructorPresence === "pseudonym"
        ? "Slapyvardis"
        : instructorPresence === "named_real"
          ? "Įvardytas"
          : "Neaišku";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_70%,transparent)] px-2.5 py-1 text-[11px] font-medium text-zinc-200 ${className}`}
      title={`Lektoriaus tapatybė: ${instructorPresence}`}
    >
      <span aria-hidden>{emoji}</span>
      <span className="text-zinc-500">Lektorius:</span>
      <span className="max-w-[14rem] truncate text-zinc-100">{instructorIdentity}</span>
      <span className="text-zinc-500">·</span>
      <span className="text-zinc-400">{short}</span>
    </span>
  );
}
