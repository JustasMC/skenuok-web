import type { AgentSseEvent } from "@/lib/agent/agent-stream-events";
import { emitAnswerAsDeltas } from "@/lib/agent/agent-stream-events";
import { isAbortError } from "@/lib/route-abort";
import {
  createScanSlotTracker,
  estimateTextTokens,
  type AgentRunLimits,
  type ScanSlotTracker,
} from "@/lib/agent/agent-security";
import { COMPARE_SITES_TOOL_NAME, compareSitesOpenAiTool, executeCompareSitesTool } from "@/lib/agent/tools/compare-sites-tool";
import { SAVE_SEO_TASKS_TOOL_NAME, executeSaveSeoTasksTool, saveSeoTasksOpenAiTool } from "@/lib/agent/tools/save-seo-tasks-tool";
import { extractToolInsightForMetadata } from "@/lib/agent/agent-message-metadata";
import {
  executeSeoScanTool,
  parseToolArguments,
  SEO_SCAN_TOOL_NAME,
  seoScanOpenAiTool,
} from "@/lib/agent/tools/seo-scan-tool";

const AGENT_OPENAI_TOOLS = [seoScanOpenAiTool, compareSitesOpenAiTool, saveSeoTasksOpenAiTool];

type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

function approximateDialogTokens(messages: ChatMessage[]): number {
  let raw = 0;
  for (const m of messages) {
    if (m.role === "tool" || m.role === "system" || m.role === "user") {
      raw += (m as { content: string }).content.length;
    } else {
      raw += (m.content ?? "").length;
      if (m.tool_calls) raw += JSON.stringify(m.tool_calls).length;
    }
  }
  return estimateTextTokens(String(raw));
}

const DEFAULT_SYSTEM = `Tu esi oficialus FS-AI SaaS asistentas (SEO ir našumas). Kalbėk lietuviškai.
Taisyklės:
- Naudok scan_site_seo vienam URL; compare_sites_seo — kai reikia palyginti du URL (du skenavimai).
- Naudok save_seo_tasks, kai vartotojas aiškiai prašo užsirašyti užduotis ar checklistę į darbo vietą.
- Nekurk išgalvotų Lighthouse balų — visada remkis įrankių išvestimi.
- Nesiūlyk keisti DNS/serverio be aiškaus „tik rekomendacija“ įspėjimo.
- Būk glaustas; pirmiausia įrankiai (jei reikia duomenų), tada išvados.
- Jei įrankis grąžina klaidą, paaiškink ir pasiūlyk patikrinti URL ar bandyti vėliau.`;

export type AgentToolRuntimeContext = {
  userId: string;
  allowExternalScan: () => boolean;
  scanSlots: ScanSlotTracker;
  abortSignal?: AbortSignal;
};

function allowScanFactory(ctx: AgentToolRuntimeContext) {
  return () => ctx.allowExternalScan() && ctx.scanSlots.tryConsume();
}

function toolStartDetail(name: string, args: unknown): string | undefined {
  if (!args || typeof args !== "object") return undefined;
  const o = args as Record<string, unknown>;
  if (name === SEO_SCAN_TOOL_NAME && typeof o.url === "string") {
    return o.url.length > 120 ? `${o.url.slice(0, 120)}…` : o.url;
  }
  if (name === COMPARE_SITES_TOOL_NAME) {
    const a = typeof o.url_a === "string" ? o.url_a : "";
    const b = typeof o.url_b === "string" ? o.url_b : "";
    if (a && b) return `${a.slice(0, 60)}… ↔ ${b.slice(0, 60)}…`;
  }
  if (name === SAVE_SEO_TASKS_TOOL_NAME && Array.isArray(o.tasks)) {
    return `${o.tasks.length} užduotis (-ys)`;
  }
  return undefined;
}

function toolObservationOk(observation: string): boolean {
  try {
    const j = JSON.parse(observation) as { error?: string };
    return typeof j.error !== "string" || j.error.length === 0;
  } catch {
    return true;
  }
}

function truncateUrl(u: string, max = 120): string {
  const t = u.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Metaduomenys tool_start įvykiui (index/total/url be teksto spėliojimo kliente). */
function toolStartMeta(name: string, args: unknown): { index?: number; total?: number; url?: string } {
  if (!args || typeof args !== "object") return {};
  const o = args as Record<string, unknown>;
  if (name === SEO_SCAN_TOOL_NAME && typeof o.url === "string") {
    return { index: 1, total: 1, url: truncateUrl(o.url, 200) };
  }
  if (name === COMPARE_SITES_TOOL_NAME) {
    const ua = typeof o.url_a === "string" ? o.url_a : "";
    return { index: 1, total: 2, url: ua ? truncateUrl(ua, 200) : undefined };
  }
  if (name === SAVE_SEO_TASKS_TOOL_NAME) {
    return { index: 1, total: 1 };
  }
  return {};
}

async function dispatchAgentTool(
  name: string,
  args: unknown,
  ctx: AgentToolRuntimeContext,
  emitSse?: (e: AgentSseEvent) => void,
): Promise<string> {
  const allowScan = allowScanFactory(ctx);
  switch (name) {
    case SEO_SCAN_TOOL_NAME:
      return executeSeoScanTool(args, { allowScan, abortSignal: ctx.abortSignal });
    case COMPARE_SITES_TOOL_NAME:
      return executeCompareSitesTool(args, {
        allowScan,
        abortSignal: ctx.abortSignal,
        onScanProgress: (p) => {
          emitSse?.({
            type: "tool_progress",
            name: COMPARE_SITES_TOOL_NAME,
            index: p.index,
            total: p.total,
            url: p.url,
            content: `${p.index}/${p.total}: ${truncateUrl(p.url, 100)}`,
          });
        },
      });
    case SAVE_SEO_TASKS_TOOL_NAME:
      return executeSaveSeoTasksTool(args, ctx.userId);
    default:
      return JSON.stringify({ error: `Nežinomas įrankis: ${name}` });
  }
}

export type ReactAgentOptions = {
  userMessage: string;
  /** Ankstesnės user/assistant žinutės (be sistemos žinutės). */
  history?: { role: "user" | "assistant"; content: string }[];
  limits: AgentRunLimits;
  allowExternalScan: () => boolean;
  userId: string;
  systemPrompt?: string;
  /** Pasirinktinai: SSE įvykiai (statusas, įrankiai, teksto fragmentai). */
  sse?: {
    onEvent: (e: AgentSseEvent) => void;
  };
  /** Nutraukia OpenAI ir PageSpeed užklausas; neperduodama į lead įrankius. */
  abortSignal?: AbortSignal;
};

export type ReactAgentResult =
  | { ok: true; answer: string; steps: number; toolScansUsed: number; toolInsights: (string | undefined)[] }
  | { ok: false; error: string; steps: number; toolScansUsed: number; toolInsights: (string | undefined)[] };

export async function runReactSeoAgent(opts: ReactAgentOptions): Promise<ReactAgentResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Trūksta OPENAI_API_KEY.", steps: 0, toolScansUsed: 0, toolInsights: [] };
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const system = opts.systemPrompt ?? DEFAULT_SYSTEM;
  const scanSlots = createScanSlotTracker(opts.limits.maxToolScans);
  const toolCtx: AgentToolRuntimeContext = {
    userId: opts.userId,
    allowExternalScan: opts.allowExternalScan,
    scanSlots,
    abortSignal: opts.abortSignal,
  };

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...(opts.history ?? []).map(
      (h) =>
        ({
          role: h.role,
          content: h.content,
        }) as ChatMessage,
    ),
    { role: "user", content: opts.userMessage },
  ];

  let steps = 0;
  let toolScansUsed = 0;
  /** Kiekvienam įrankio užbaigimui — sutampa su timeline `tool_result` žingsniais. */
  const toolInsights: (string | undefined)[] = [];

  const emit = opts.sse?.onEvent;

  emit?.({ type: "status", content: "Renku kontekstą ir rengiu užklausą modeliui…", phase: "context" });

  for (let i = 0; i < opts.limits.maxSteps; i++) {
    if (opts.abortSignal?.aborted) {
      return {
        ok: false,
        error: "Užklausa nutraukta arba baigėsi skirtasis laikas.",
        steps,
        toolScansUsed,
        toolInsights,
      };
    }

    if (approximateDialogTokens(messages) > opts.limits.maxEstimatedTokens) {
      return {
        ok: false,
        error: "Pasiektas apytikslis tokenų biudžetas. Sutrumpinkite užklausą arba pradėkite naują pokalbį.",
        steps,
        toolScansUsed,
        toolInsights,
      };
    }

    steps += 1;

    emit?.({
      type: "status",
      content: `Žingsnis ${steps}: modelis sprendžia…`,
      phase: "model",
    });

    let res: Response;
    try {
      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: opts.abortSignal,
        body: JSON.stringify({
          model,
          temperature: 0.3,
          messages,
          tools: AGENT_OPENAI_TOOLS,
          tool_choice: "auto",
        }),
      });
    } catch (e) {
      if (isAbortError(e)) {
        return {
          ok: false,
          error: "Užklausa nutraukta arba baigėsi skirtasis laikas.",
          steps,
          toolScansUsed,
          toolInsights,
        };
      }
      throw e;
    }

    if (!res.ok) {
      const t = await res.text();
      return {
        ok: false,
        error: `OpenAI klaida ${res.status}: ${t.slice(0, 400)}`,
        steps,
        toolScansUsed,
        toolInsights,
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string | null; tool_calls?: ToolCall[] } }[];
    };
    const msg = data.choices?.[0]?.message;
    if (!msg) {
      return { ok: false, error: "Tuščias atsakymas iš modelio.", steps, toolScansUsed, toolInsights };
    }

    const toolCalls = msg.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      messages.push({
        role: "assistant",
        content: msg.content ?? null,
        tool_calls: toolCalls,
      });

      if (opts.abortSignal?.aborted) {
        for (const tc of toolCalls) {
          if (tc.type !== "function") continue;
          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify({ error: "Užklausa nutraukta prieš įrankius." }),
          });
        }
        return {
          ok: false,
          error: "Užklausa nutraukta arba baigėsi skirtasis laikas.",
          steps,
          toolScansUsed,
          toolInsights,
        };
      }

      for (let ti = 0; ti < toolCalls.length; ti++) {
        const tc = toolCalls[ti]!;
        if (tc.type !== "function") continue;
        if (opts.abortSignal?.aborted) {
          for (let j = ti; j < toolCalls.length; j++) {
            const tj = toolCalls[j]!;
            if (tj.type !== "function") continue;
            messages.push({
              role: "tool",
              tool_call_id: tj.id,
              content: JSON.stringify({ error: "Užklausa nutraukta prieš įrankį." }),
            });
          }
          return {
            ok: false,
            error: "Užklausa nutraukta arba baigėsi skirtasis laikas.",
            steps,
            toolScansUsed,
            toolInsights,
          };
        }
        const name = tc.function.name;
        const args = parseToolArguments(tc.function.arguments);
        const meta = toolStartMeta(name, args);
        emit?.({
          type: "tool_start",
          name,
          detail: toolStartDetail(name, args),
          phase: "tools",
          ...meta,
        });
        const observation = await dispatchAgentTool(name, args, toolCtx, emit);
        toolInsights.push(extractToolInsightForMetadata(name, observation));
        toolScansUsed = scanSlots.getUsed();
        emit?.({
          type: "tool_end",
          name,
          ok: toolObservationOk(observation),
          index: meta.index,
          total: meta.total,
        });
        messages.push({ role: "tool", tool_call_id: tc.id, content: observation });
      }
      continue;
    }

    const text = msg.content?.trim() ?? "";
    if (!text) {
      return { ok: false, error: "Modelis negrąžino teksto.", steps, toolScansUsed, toolInsights };
    }

    if (emit) {
      emit({ type: "status", content: "Formuluoju atsakymą…", phase: "answer" });
      await emitAnswerAsDeltas(text, (e) => emit(e));
    }

    return { ok: true, answer: text, steps, toolScansUsed, toolInsights };
  }

  return {
    ok: false,
    error: `Pasiektas maksimalus žingsnių skaičius (${opts.limits.maxSteps}).`,
    steps,
    toolScansUsed,
    toolInsights,
  };
}
