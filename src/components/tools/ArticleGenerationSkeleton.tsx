"use client";

import { useDict } from "@/components/i18n/LocaleProvider";

/** Article layout imitation while generating — feels faster than an empty loader. */

function Bar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[color-mix(in_oklab,var(--color-border)_85%,var(--color-surface-2))] ${className ?? ""}`}
    />
  );
}

export function ArticleGenerationSkeleton() {
  const t = useDict().tools.generatorUi.skeleton;

  return (
    <div className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)]/80 bg-[var(--color-bg)]/50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[var(--color-electric)]" />
        {t.generating}
      </div>
      <Bar className="h-8 w-4/5 max-w-xl" />
      <Bar className="h-3 w-full" />
      <Bar className="h-3 w-[92%]" />
      <Bar className="h-3 w-[88%]" />
      <div className="grid gap-2 pt-2 sm:grid-cols-2">
        <Bar className="h-24 w-full" />
        <Bar className="h-24 w-full" />
      </div>
      <Bar className="h-3 w-3/4" />
      <Bar className="h-3 w-[70%]" />
      <p className="pt-2 text-center text-[11px] text-zinc-600">{t.waitHint}</p>
    </div>
  );
}
