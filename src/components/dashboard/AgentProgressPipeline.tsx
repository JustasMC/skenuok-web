"use client";

import type { AgentSsePhase } from "@/lib/agent/agent-stream-events";

/** Sinchronizuota su serverio `phase` lauku (SSE). */
export type AgentPipelinePhase = AgentSsePhase | null;

const STEPS: { phase: AgentSsePhase; label: string; short: string }[] = [
  { phase: "context", label: "Kontekstas", short: "1" },
  { phase: "model", label: "Modelis", short: "2" },
  { phase: "tools", label: "Skenavimas", short: "3" },
  { phase: "answer", label: "Atsakymas", short: "4" },
];

function phaseIndex(p: AgentSsePhase): number {
  return STEPS.findIndex((s) => s.phase === p);
}

/** Iš serverio `status` teksto nustato aktyvų etapą (atsarginis kelias). */
export function inferPipelinePhaseFromStatus(content: string): AgentSsePhase {
  const c = content.toLowerCase();
  if (c.includes("formuluoju")) return "answer";
  if (c.includes("žingsnis") || c.includes("modelis")) return "model";
  if (c.includes("kontekst") || c.includes("renku")) return "context";
  return "model";
}

/** Pirmiausia naudoja serverio `phase`, jei perduotas. */
export function resolvePipelinePhase(content: string, serverPhase?: AgentSsePhase): AgentSsePhase {
  if (serverPhase) return serverPhase;
  return inferPipelinePhaseFromStatus(content);
}

type Props = {
  active: AgentPipelinePhase;
};

/**
 * 4 etapų progresas: kontekstas → modelis → įrankiai → atsakymas.
 */
export function AgentProgressPipeline({ active }: Props) {
  if (active == null) return null;

  const idx = phaseIndex(active);

  return (
    <div
      className="mb-3 rounded-xl border border-[color-mix(in_oklab,var(--color-border)_90%,white_5%)] bg-[color-mix(in_oklab,black_25%,transparent)] px-3 py-3 sm:px-4"
      aria-live="polite"
      aria-label="Agento eiga"
    >
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Eiga</p>
      <ol className="grid grid-cols-4 gap-2">
        {STEPS.map((step, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <li key={step.phase} className="flex flex-col items-center gap-2 text-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                  done
                    ? "bg-[var(--color-lime)]/25 text-[var(--color-lime)] ring-1 ring-[var(--color-lime)]/40"
                    : current
                      ? "bg-[var(--color-electric)]/20 text-[var(--color-electric)] ring-2 ring-[var(--color-electric)]/50"
                      : "bg-zinc-800/80 text-zinc-500"
                }`}
              >
                {done ? "✓" : step.short}
              </span>
              <span
                className={`w-full text-[10px] leading-tight sm:text-[11px] ${
                  current ? "font-medium text-zinc-200" : done ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
