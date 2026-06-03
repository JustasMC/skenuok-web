"use client";

import type { SeoScoreBreakdown } from "@/lib/seo-score";

type Props = {
  seo: SeoScoreBreakdown;
  onRefine?: () => void;
};

export function SeoScorePanel({ seo, onRefine }: Props) {
  const v = Math.max(0, Math.min(100, seo.score));
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const ringColor =
    v >= 90 ? "text-[var(--color-lime)]" : v >= 50 ? "text-[var(--color-electric)]" : "text-rose-400";

  const failed = seo.checks.filter((x) => !x.pass).length;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,220px)_1fr]">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_80%,transparent)] p-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">SEO signalas</p>
        <div className="relative mt-4 h-36 w-36">
          <svg width="144" height="144" viewBox="0 0 120 120" className="-rotate-90" aria-hidden>
            <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="9" className="text-[var(--color-border)]" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className={`transition-[stroke-dashoffset] duration-700 ${ringColor}`}
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tabular-nums text-white">{v}</span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">iš 100</span>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-zinc-500">
          {failed === 0 ? (
            <span className="text-[var(--color-lime)]">Visi kontroliniai taškai — žalia.</span>
          ) : (
            <span>
              <span className="font-semibold text-rose-300">{failed}</span> punktai reikalauja patobulinimo — žemiau
              „remonto“ sąrašas.
            </span>
          )}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-200">Ką pataisyti, kad priartėtumėte prie 100</p>
        <ul className="space-y-3">
          {seo.checks.map((c) => (
            <li
              key={c.id}
              className={`rounded-xl border px-4 py-3 text-sm ${
                c.pass
                  ? "border-[color-mix(in_oklab,var(--color-lime)_35%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-lime)_8%,transparent)]"
                  : "border-rose-500/35 bg-rose-950/25"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                    c.pass ? "bg-[var(--color-lime)] text-[#101300]" : "bg-rose-500/20 text-rose-300"
                  }`}
                  aria-hidden
                >
                  {c.pass ? "OK" : "!"}
                </span>
                <div>
                  <p className={`font-medium ${c.pass ? "text-zinc-200" : "text-rose-100"}`}>{c.label}</p>
                  {!c.pass ? <p className="mt-1 text-xs leading-relaxed text-zinc-400">{c.fixHint}</p> : null}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_40%,transparent)] px-4 py-3 text-xs text-zinc-500">
          <span>
            Žodžių: <strong className="text-zinc-300">{seo.wordCount}</strong> · Raktažodis tekste:{" "}
            <strong className="text-zinc-300">{seo.keywordOccurrences}×</strong> · Vidinės nuorodos:{" "}
            <strong className="text-zinc-300">{seo.internalLinks}</strong>
          </span>
        </div>

        {onRefine ? (
          <button
            type="button"
            onClick={onRefine}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 text-sm font-medium text-[var(--color-electric)] transition hover:border-[var(--color-electric)]"
          >
            Bandyti dar kartą (patikslinta tema)
          </button>
        ) : null}
      </div>
    </div>
  );
}
