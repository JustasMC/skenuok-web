type Props = {
  label: string;
  value: number | null;
};

export function ScoreRing({ label, value }: Props) {
  const v = value == null ? null : Math.max(0, Math.min(100, value));
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = v == null ? c : c - (v / 100) * c;
  const color =
    v == null ? "text-zinc-600" : v >= 90 ? "text-[var(--color-lime)]" : v >= 50 ? "text-[var(--color-electric)]" : "text-rose-400";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg width="128" height="128" viewBox="0 0 120 120" className="-rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-[var(--color-border)]" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className={`transition-[stroke-dashoffset] duration-700 ${color}`}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums text-white">{v == null ? "—" : v}</span>
        </div>
      </div>
      <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">{label}</p>
    </div>
  );
}
