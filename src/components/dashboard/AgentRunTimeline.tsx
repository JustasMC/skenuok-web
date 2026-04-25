"use client";

import type { AgentRunStepRecord } from "@/lib/agent/agent-message-metadata";
import { parseAgentMessageMetadata } from "@/lib/agent/agent-message-metadata";

function stepDotClass(step: AgentRunStepRecord): string {
  if (step.kind === "tool_result") {
    return step.ok === false
      ? "bg-amber-500/90 ring-amber-400/40"
      : "bg-emerald-500/90 ring-emerald-400/40";
  }
  if (step.kind === "tool" || step.kind === "progress") {
    return "bg-[var(--color-electric)] ring-[color-mix(in_oklab,var(--color-electric)_45%,transparent)]";
  }
  return "bg-zinc-500 ring-zinc-600";
}

function formatClock(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}

type Props = {
  /** Žali JSON iš API; `null` — dar nebuvo analizės su įrašu */
  metadata: unknown | null;
  /** Senas atsakymas be `metadata` — raginame naują SSE analizę */
  legacyWithoutMetadata?: boolean;
  /** Pvz. „Ankstesnis atsakymas“, kai žiūrite ne paskutinį burbulą */
  selectionHint?: string | null;
};

export function AgentRunTimeline({ metadata, legacyWithoutMetadata, selectionHint }: Props) {
  if (legacyWithoutMetadata) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-600/50 bg-[color-mix(in_oklab,black_35%,#0c1018)] p-4 shadow-[inset_0_0_24px_-12px_rgba(0,0,0,0.5)]">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Analizės eiga</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Šiai istorinei žinutei nėra įrašytos eigos (prieš įvedant chronologiją arba be SSE srauto).
        </p>
        <p className="mt-3 text-sm font-medium text-[var(--color-electric)]">
          Paleiskite naują analizę: įveskite užklausą ir spauskite <span className="whitespace-nowrap">„Siųsti“</span> —
          užfiksuosime visą žingsnių seką su srautu.
        </p>
      </div>
    );
  }

  if (metadata == null) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[color-mix(in_oklab,black_25%,transparent)] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Analizės eiga</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Čia bus rodomi etapai (kontekstas, įrankiai, rezultatai), kai užbaigsite SEO analizės sesiją su srautu.
        </p>
      </div>
    );
  }

  const parsed = parseAgentMessageMetadata(metadata);
  if (!parsed) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,black_30%,transparent)] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Analizės eiga</p>
        <p className="mt-2 text-sm text-zinc-500">Šiai žinutei nėra įrašytų metaduomenų.</p>
      </div>
    );
  }

  if (parsed.steps.length === 0) {
    const { summary } = parsed;
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,black_30%,transparent)] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Analizės suvestinė</p>
        {selectionHint ? (
          <p className="mt-1 text-[11px] font-medium text-[color-mix(in_oklab,var(--color-electric)_85%,white)]">{selectionHint}</p>
        ) : null}
        <p className="mt-2 text-sm text-zinc-300">
          Agentas: {summary.agentSteps} žingsn. · Skenavimų: {summary.toolScansUsed}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Chronologinį žingsnių sąrašą gaunate per SSE srautą (įprastas „Siųsti“). Ne-JSON API palieka tik šią suvestinę.
        </p>
      </div>
    );
  }

  const { steps, summary } = parsed;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,black_30%,transparent)] p-4">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Analizės eiga</p>
          {selectionHint ? (
            <p className="mt-1 text-[11px] font-medium text-[color-mix(in_oklab,var(--color-electric)_85%,white)]">{selectionHint}</p>
          ) : null}
          <p className="mt-1 text-xs text-zinc-500">
            Žingsniai: {summary.agentSteps} · Skenavimų: {summary.toolScansUsed}
          </p>
        </div>
      </div>
      <ol className="relative mt-4 space-y-0 pl-1">
        {steps.map((step, i) => (
          <li key={step.id} className="flex gap-3 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1.5 size-2.5 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-[color-mix(in_oklab,black_30%,transparent)] ${stepDotClass(step)}`}
                title={step.kind}
              />
              {i < steps.length - 1 ? (
                <span className="mt-1 w-px flex-1 min-h-[1.25rem] bg-[color-mix(in_oklab,var(--color-border)_80%,transparent)]" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 pt-0">
              <p className="text-[11px] font-mono text-zinc-500">{formatClock(step.at)}</p>
              <p className="text-sm font-medium leading-snug text-zinc-100">{step.title}</p>
              {step.subtitle ? (
                <p className="mt-0.5 break-words text-xs leading-relaxed text-zinc-400">{step.subtitle}</p>
              ) : null}
              {step.insight ? (
                <p className="mt-1.5 rounded-md border border-[color-mix(in_oklab,var(--color-lime)_25%,transparent)] bg-[color-mix(in_oklab,var(--color-lime)_6%,transparent)] px-2 py-1 text-[11px] leading-snug text-[color-mix(in_oklab,var(--color-lime)_90%,white)]">
                  {step.insight}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
