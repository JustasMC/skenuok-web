"use client";

/** Skeleton tik įrankių / skenavimo fazėje — sumažina „tuščio laukimo“ pojūtį. */
export function AgentToolsSkeleton() {
  return (
    <div className="space-y-2 rounded-lg border border-[var(--color-border)] bg-[color-mix(in_oklab,black_40%,transparent)] p-4" aria-hidden>
      <div className="h-2 w-3/4 animate-pulse rounded bg-zinc-700/90" />
      <div className="h-2 w-full animate-pulse rounded bg-zinc-700/70" />
      <div className="h-2 w-5/6 animate-pulse rounded bg-zinc-700/80" />
      <div className="mt-3 h-16 animate-pulse rounded-md bg-zinc-800/80" />
    </div>
  );
}
