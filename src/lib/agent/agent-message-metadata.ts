import type { AgentSseEvent, AgentSsePhase } from "@/lib/agent/agent-stream-events";
import { COMPARE_SITES_TOOL_NAME } from "@/lib/agent/tools/compare-sites-tool";
import { SAVE_SEO_TASKS_TOOL_NAME } from "@/lib/agent/tools/save-seo-tasks-tool";
import { SEO_SCAN_TOOL_NAME } from "@/lib/agent/tools/seo-scan-tool";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";

/** JSON MVP — keičiant struktūrą, didinkite ir migruokite skaitymą pagal šį lauką. */
export const AGENT_MESSAGE_METADATA_SCHEMA_VERSION = 1 as const;

export type AgentRunStepRecord = {
  id: string;
  kind: "status" | "tool" | "progress" | "tool_result";
  at: string;
  phase?: AgentSsePhase;
  /** Trumpas antraštės tekstas UI */
  title: string;
  subtitle?: string;
  /** Viena eilutė: pagrindinė metrika / įžvalga (rodoma be išskleidimo) */
  insight?: string;
  toolName?: string;
  ok?: boolean;
  index?: number;
  total?: number;
  url?: string;
};

export type AgentRunMetadataSummary = {
  /** ReAct ciklo iteracijų sk. (iš agento `steps`) */
  agentSteps: number;
  toolScansUsed: number;
  /** Kai įrašyta į DB */
  recordedAt?: string;
};

/**
 * Pilnas asistento žinutės `metadata` objektas (Prisma Json).
 * Ateityje `steps` galima generuoti iš AgentRunStep lentelės be keičiant UI kontraktą.
 */
export type AgentMessageMetadata = {
  schemaVersion: typeof AGENT_MESSAGE_METADATA_SCHEMA_VERSION;
  steps: AgentRunStepRecord[];
  summary: AgentRunMetadataSummary;
};

/**
 * Iš įrankio JSON stebėjimo ištraukia trumpą eilutę timeline (Lighthouse balai, palyginimas, užduotys).
 * Saugus netinkamai JSON — grąžina undefined.
 */
export function extractToolInsightForMetadata(
  toolName: string,
  observation: string,
  locale: Locale = "lt",
): string | undefined {
  const m = getDictionary(locale).agent.metadata;
  try {
    const j = JSON.parse(observation) as Record<string, unknown>;
    if (typeof j.error === "string" && j.error.length > 0) {
      return j.error.length > 120 ? `${j.error.slice(0, 117)}…` : j.error;
    }

    if (toolName === SEO_SCAN_TOOL_NAME) {
      const scores = j.scores as Record<string, number | null> | undefined;
      if (!scores || typeof scores !== "object") return undefined;
      const parts: string[] = [];
      const perf = scores.performance;
      const seo = scores.seo;
      const a11y = scores.accessibility;
      if (typeof perf === "number") parts.push(`${m.performance} ${Math.round(perf)}`);
      if (typeof seo === "number") parts.push(`${m.seo} ${Math.round(seo)}`);
      if (typeof a11y === "number") parts.push(`${m.accessibility} ${Math.round(a11y)}`);
      return parts.length ? parts.join(" · ") : undefined;
    }

    if (toolName === COMPARE_SITES_TOOL_NAME) {
      const pick = (side: string) => {
        const block = j[side] as Record<string, unknown> | undefined;
        if (!block || typeof block !== "object") return null;
        const scores = block.scores as Record<string, number | null> | undefined;
        if (!scores) return null;
        const perf = scores.performance;
        const seo = scores.seo;
        if (typeof perf === "number" && typeof seo === "number") {
          return `${side.toUpperCase()}: ${Math.round(perf)}/${Math.round(seo)}`;
        }
        if (typeof perf === "number") return `${side.toUpperCase()}: ${m.perfShort} ${Math.round(perf)}`;
        return null;
      };
      const a = pick("a");
      const b = pick("b");
      if (a && b) return `${a} vs ${b}`;
      if (j.compared === true) return m.comparedBoth;
      return undefined;
    }

    if (toolName === SAVE_SEO_TASKS_TOOL_NAME) {
      const tasks = j.tasks as unknown[] | undefined;
      const n = Array.isArray(tasks) ? tasks.length : 0;
      if (n > 0) return m.tasksSaved.replace("{n}", String(n));
      return m.tasksSavedGeneric;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function toolTitle(name: string, tools: Dictionary["agent"]["tools"]): string {
  switch (name) {
    case "scan_site_seo":
      return tools.scan_site_seo;
    case "compare_sites_seo":
      return tools.compare_sites_seo;
    case "save_seo_tasks":
      return tools.save_seo_tasks;
    default:
      return name;
  }
}

/**
 * Surenka vientisą žingsnių seką iš SSE įvykių (be `delta` triukšmo).
 * Laiko žymės — serverio momento ISO (MVP; vėliau galima tikslinti iš įrankio telemetry).
 */
function attachInsightsToToolResults(steps: AgentRunStepRecord[], toolInsights: (string | undefined)[]): void {
  let i = 0;
  for (const step of steps) {
    if (step.kind !== "tool_result") continue;
    const line = toolInsights[i];
    i += 1;
    if (line?.trim()) step.insight = line.trim();
  }
}

export function buildAgentMessageMetadata(
  events: AgentSseEvent[],
  summary: AgentRunMetadataSummary,
  toolInsights?: (string | undefined)[],
  locale: Locale = "lt",
): AgentMessageMetadata {
  const { agent } = getDictionary(locale);
  const steps: AgentRunStepRecord[] = [];
  let n = 0;
  const nextId = () => `step-${n++}`;

  for (const e of events) {
    if (e.type === "delta") continue;
    const at = new Date().toISOString();

    switch (e.type) {
      case "status":
        steps.push({
          id: nextId(),
          kind: "status",
          at,
          phase: e.phase,
          title: e.content,
        });
        break;
      case "tool_start": {
        const label = toolTitle(e.name, agent.tools);
        const sub =
          e.detail ??
          (e.url
            ? e.index != null && e.total != null
              ? `${e.index}/${e.total} · ${e.url}`
              : e.url
            : undefined);
        steps.push({
          id: nextId(),
          kind: "tool",
          at,
          phase: e.phase,
          title: label,
          subtitle: sub,
          toolName: e.name,
          index: e.index,
          total: e.total,
          url: e.url,
        });
        break;
      }
      case "tool_progress":
        steps.push({
          id: nextId(),
          kind: "progress",
          at,
          phase: "tools",
          title: `${e.index}/${e.total}`,
          subtitle: e.url,
          toolName: e.name,
          index: e.index,
          total: e.total,
          url: e.url,
        });
        break;
      case "tool_end":
        steps.push({
          id: nextId(),
          kind: "tool_result",
          at,
          phase: "tools",
          title: toolTitle(e.name, agent.tools),
          subtitle: e.ok ? agent.metadata.toolDone : agent.metadata.toolError,
          toolName: e.name,
          ok: e.ok,
          index: e.index,
          total: e.total,
        });
        break;
      default:
        break;
    }
  }

  if (toolInsights?.length) {
    attachInsightsToToolResults(steps, toolInsights);
  }

  return {
    schemaVersion: AGENT_MESSAGE_METADATA_SCHEMA_VERSION,
    steps,
    summary: {
      ...summary,
      recordedAt: new Date().toISOString(),
    },
  };
}

/** Minimali suvestinė be SSE istorijos (ne-stream užklausa). */
export function buildAgentMessageMetadataMinimal(summary: AgentRunMetadataSummary): AgentMessageMetadata {
  return {
    schemaVersion: AGENT_MESSAGE_METADATA_SCHEMA_VERSION,
    steps: [],
    summary: {
      ...summary,
      recordedAt: new Date().toISOString(),
    },
  };
}

/** Saugus skaitymas iš API / DB (nežinomi laukai ignoruojami). */
export function parseAgentMessageMetadata(raw: unknown): AgentMessageMetadata | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.schemaVersion !== AGENT_MESSAGE_METADATA_SCHEMA_VERSION) return null;
  if (!Array.isArray(o.steps)) return null;
  if (!o.summary || typeof o.summary !== "object") return null;
  return raw as AgentMessageMetadata;
}
