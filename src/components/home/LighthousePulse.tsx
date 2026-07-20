"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDict } from "@/components/i18n/LocaleProvider";
import { ScoreRing } from "@/components/tools/ScoreRing";
import { SectionHeader } from "@/components/ui/SectionHeader";

const BEFORE = { perf: 45, seo: 62, a11y: 71 } as const;
const AFTER = { perf: 98, seo: 100, a11y: 97 } as const;

export function LighthousePulse() {
  const t = useDict().pulse;
  const [mode, setMode] = useState<"before" | "after">("before");
  const scores = mode === "before" ? BEFORE : AFTER;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = window.setInterval(() => {
      setMode((m) => (m === "before" ? "after" : "before"));
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="lighthouse-impulsas"
      className="site-section border-t border-[var(--color-border)]/60 bg-[color-mix(in_oklab,var(--color-bg)_97%,var(--color-surface))]"
      aria-labelledby="lighthouse-pulse-title"
    >
      <div className="site-shell">
        <SectionHeader
          id="lighthouse-pulse-title"
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
          wide
        />

        <div className="mt-8 flex flex-wrap gap-2 sm:mt-10" role="group" aria-label={`${t.before} / ${t.after}`}>
          <button
            type="button"
            onClick={() => setMode("before")}
            className={`min-h-10 rounded-lg px-4 text-sm font-semibold motion-safe:transition-colors ${
              mode === "before"
                ? "bg-[var(--color-electric)] text-[#041014]"
                : "border border-[var(--color-border)] text-zinc-300 hover:border-[var(--color-electric)]/50"
            }`}
            aria-pressed={mode === "before"}
          >
            {t.before}
          </button>
          <button
            type="button"
            onClick={() => setMode("after")}
            className={`min-h-10 rounded-lg px-4 text-sm font-semibold motion-safe:transition-colors ${
              mode === "after"
                ? "bg-[var(--color-lime)] text-[#101300]"
                : "border border-[var(--color-border)] text-zinc-300 hover:border-[var(--color-lime)]/50"
            }`}
            aria-pressed={mode === "after"}
          >
            {t.after}
          </button>
        </div>

        <div
          className="mt-8 flex flex-wrap justify-center gap-8 sm:mt-10 sm:gap-12"
          aria-live="polite"
          aria-atomic="true"
        >
          <ScoreRing label={t.perf} value={scores.perf} />
          <ScoreRing label={t.seo} value={scores.seo} />
          <ScoreRing label={t.a11y} value={scores.a11y} />
        </div>

        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-zinc-500 sm:mt-10 sm:text-sm">{t.disclaimer}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/tools/scanner" className="site-btn-primary min-h-11 px-5">
            {t.ctaScanner}
          </Link>
          <Link href="/#kontaktai" className="site-btn-secondary min-h-11 px-4">
            {t.ctaContact}
          </Link>
        </div>
      </div>
    </section>
  );
}
