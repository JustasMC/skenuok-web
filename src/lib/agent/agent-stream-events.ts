/**
 * Klientui siunčiami SSE įvykiai (JSON kiekvienoje `data:` eilutėje).
 */
export type AgentSsePhase = "context" | "model" | "tools" | "answer";

export type AgentSseEvent =
  | {
      type: "status";
      content: string;
      /** Struktūruotas etapas — klientas gali naudoti vietoj teksto interpretacijos. */
      phase?: AgentSsePhase;
      index?: number;
      total?: number;
      url?: string;
    }
  | {
      type: "tool_start";
      name: string;
      detail?: string;
      phase?: AgentSsePhase;
      index?: number;
      total?: number;
      url?: string;
    }
  | {
      type: "tool_progress";
      name: string;
      index: number;
      total: number;
      url: string;
      /** Paruoštas trumpas aprašas UI (pvz. „1/2: https://…“). */
      content?: string;
    }
  | { type: "tool_end"; name: string; ok: boolean; index?: number; total?: number }
  | { type: "delta"; content: string }
  | {
      type: "done";
      ok: true;
      answer: string;
      steps: number;
      toolScansUsed: number;
      conversationId: string;
      title: string;
    }
  | { type: "error"; message: string; conversationId?: string; steps?: number; toolScansUsed?: number };

export function encodeSseEvent(event: AgentSseEvent): Uint8Array {
  const line = `data: ${JSON.stringify(event)}\n\n`;
  return new TextEncoder().encode(line);
}

/** Skaido tekstą mažais gabalais, kad UI galėtų „pildytis“ be tikro OpenAI tokenų srauto. */
export async function emitAnswerAsDeltas(
  text: string,
  emit: (e: Extract<AgentSseEvent, { type: "delta" }>) => void,
  chunkSize = 40,
): Promise<void> {
  for (let i = 0; i < text.length; i += chunkSize) {
    emit({ type: "delta", content: text.slice(i, i + chunkSize) });
    if (i % (chunkSize * 4) === 0) {
      await Promise.resolve();
    }
  }
}
