"use client";

import { useDict } from "@/components/i18n/LocaleProvider";

/**
 * Shared liability limitation for AI / scanning tools.
 */
export function LegalDisclaimer() {
  const t = useDict().tools.courseReport.legalDisclaimer;

  return (
    <div className="mt-8 border-t border-[var(--color-border)] pt-4 text-xs leading-relaxed text-zinc-300">
      <p>
        <span className="font-semibold not-italic text-zinc-200">{t.heading} </span>
        <span className="italic">{t.body}</span>
      </p>
    </div>
  );
}
