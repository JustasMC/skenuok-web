import Link from "next/link";
import { MINUTES_SAVED_PER_ARTICLE } from "@/lib/confetti-celebration";

type HistoryRow = { id: string; topic: string; seoScore: number | null; createdAt: string };

type Props = {
  history: HistoryRow[];
  credits: number | null;
  sessionMode: "user" | "session" | null;
};

function formatMinutes(totalMin: number): string {
  if (totalMin < 60) return `${Math.round(totalMin)} min`;
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  return m > 0 ? `${h} val. ${m} min` : `${h} val.`;
}

export function GeneratorWorkspacePanel({ history, credits, sessionMode }: Props) {
  const n = history.length;
  const scored = history.filter((h) => h.seoScore != null);
  const avg =
    scored.length > 0 ? Math.round(scored.reduce((a, h) => a + (h.seoScore ?? 0), 0) / scored.length) : null;
  const timeSavedMin = n * MINUTES_SAVED_PER_ARTICLE;

  const subtitle =
    sessionMode === "user"
      ? "Jūsų paskyros santrauka ir paskutiniai straipsniai."
      : "Anoniminė sesija — prisijunkite, kad istorija išsaugotų visuose įrenginiuose.";

  return (
    <div className="space-y-6">
      <div className="grid min-w-0 gap-3 sm:grid-cols-3">
        <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Likę kreditai</p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-[var(--color-lime)] sm:text-2xl">{credits ?? "—"}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Vidutinis SEO balas</p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-[var(--color-electric)] sm:text-2xl">
            {avg != null ? `${avg}` : "—"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-600">{n > 0 ? `iš ${n} straipsnių` : "dar nėra duomenų"}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Įvert. sutaupytas laikas</p>
          <p className="mt-1 break-words font-mono text-lg font-semibold leading-tight tabular-nums text-zinc-100 sm:text-2xl">
            {n > 0 ? formatMinutes(timeSavedMin) : "—"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-600">~{MINUTES_SAVED_PER_ARTICLE} min / straipsnis vs ranka</p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">Paskutiniai straipsniai</h3>
            <p className="text-xs text-zinc-500">{subtitle}</p>
          </div>
          {sessionMode === "user" ? (
            <Link
              href="/dashboard"
              className="text-xs font-medium text-[var(--color-electric)] underline-offset-4 hover:underline"
            >
              Pilna darbo vieta →
            </Link>
          ) : null}
        </div>

        {history.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg)]/40 px-4 py-8 text-center text-sm text-zinc-500">
            Dar nieko negeneravote. Sukurkite pirmą straipsnį aukščiau.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/30 text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex flex-col gap-1 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:px-4">
                <span className="min-w-0 break-words font-medium text-zinc-200">{h.topic}</span>
                <span className="shrink-0 font-mono text-xs text-zinc-500">
                  SEO {h.seoScore ?? "—"} · {new Date(h.createdAt).toLocaleString("lt-LT")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
