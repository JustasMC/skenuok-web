import { NextResponse } from "next/server";
import { z } from "zod";
import { publicApiErrorMessage } from "@/lib/api-errors";
import { getChatBotSystemPrompt } from "@/lib/chat-bot-context";
import { CHAT_OPENAI_TOOLS, executeChatTool } from "@/lib/chat-tools";
import { assertChatRateLimit, getRateLimitClientKey } from "@/lib/rate-limit";
import { getCombinedRouteAbortSignal, isAbortError } from "@/lib/route-abort";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(8000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).max(24),
});

type OaiToolCall = {
  id: string;
  type: string;
  function: { name: string; arguments: string };
};

type OaiMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: OaiToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

function parseOpenAiSseChunks(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      try {
        while (true) {
          if (signal?.aborted) {
            await reader.cancel().catch(() => {});
            break;
          }
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.replace(/^data:\s*/, "");
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const piece = json.choices?.[0]?.delta?.content;
              if (piece) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ t: piece })}\n\n`));
              }
            } catch {
              /* ignore */
            }
          }
        }
        const tail = buffer.trim();
        if (tail.startsWith("data:")) {
          const data = tail.replace(/^data:\s*/, "");
          if (data && data !== "[DONE]") {
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const piece = json.choices?.[0]?.delta?.content;
              if (piece) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ t: piece })}\n\n`));
              }
            } catch {
              /* ignore */
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

async function emitTextChunks(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  text: string,
  signal?: AbortSignal,
) {
  const chunk = 36;
  for (let i = 0; i < text.length; i += chunk) {
    if (signal?.aborted) break;
    const piece = text.slice(i, i + chunk);
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ t: piece })}\n\n`));
    if (i % (chunk * 5) === 0) await Promise.resolve();
  }
}

async function pipeStreamingCompletion(
  controller: ReadableStreamDefaultController<Uint8Array>,
  apiKey: string,
  model: string,
  messages: OaiMessage[],
  signal?: AbortSignal,
) {
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      model,
      temperature: 0.45,
      stream: true,
      messages,
      tool_choice: "none",
    }),
  });

  if (!upstream.ok || !upstream.body) {
    await upstream.text().catch(() => "");
    const msg =
      upstream.status === 401 || upstream.status === 403
        ? "AI paslauga atmetė užklausą. Patikrinkite API raktą serveryje."
        : "Nepavyko gauti srautinio atsakymo iš AI. Bandykite vėliau.";
    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
    return;
  }

  const reader = parseOpenAiSseChunks(upstream.body, signal).getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    controller.enqueue(value);
  }
}

export async function POST(req: Request) {
  const ip = getRateLimitClientKey(req);
  const lim = assertChatRateLimit(`chat:${ip}`);
  if (!lim.ok) {
    return NextResponse.json(
      { error: "Per daug užklausų. Palaukite ir bandykite vėliau.", retryAfterSec: lim.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(lim.retryAfterSec) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Neteisingas JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neteisinga užklausos struktūra" }, { status: 422 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Chat paslauga laikinai nepasiekiama (nėra OPENAI_API_KEY)." }, { status: 503 });
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const system = getChatBotSystemPrompt();
  const signal = getCombinedRouteAbortSignal(req);

  try {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (obj: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      const messages: OaiMessage[] = [
        { role: "system", content: system },
        ...parsed.data.messages.map((m) => ({ role: m.role, content: m.content }) as OaiMessage),
      ];

      try {
        for (let round = 0; round < 6; round++) {
          if (signal.aborted) {
            send({ error: "Užklausa nutraukta arba baigėsi skirtasis laikas.", cancelled: true });
            controller.close();
            return;
          }

          let res: Response;
          try {
            res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              signal,
              body: JSON.stringify({
                model,
                temperature: 0.45,
                messages,
                tools: CHAT_OPENAI_TOOLS,
                tool_choice: "auto",
              }),
            });
          } catch (e) {
            if (isAbortError(e)) {
              send({ error: "Užklausa nutraukta arba baigėsi skirtasis laikas.", cancelled: true });
            } else {
              throw e;
            }
            controller.close();
            return;
          }

          if (!res.ok) {
            await res.text().catch(() => "");
            send({
              error:
                res.status === 401 || res.status === 403
                  ? "AI paslauga atmetė užklausą. Patikrinkite API raktą serveryje."
                  : "Nepavyko gauti atsakymo iš AI. Bandykite vėliau.",
            });
            controller.close();
            return;
          }

          const data = (await res.json()) as {
            choices?: {
              message?: {
                content?: string | null;
                tool_calls?: OaiToolCall[];
              };
            }[];
          };
          const msg = data.choices?.[0]?.message;
          if (!msg) {
            send({ error: "Tuščias atsakymas iš modelio." });
            controller.close();
            return;
          }

          if (msg.tool_calls && msg.tool_calls.length > 0) {
            messages.push({
              role: "assistant",
              content: msg.content ?? null,
              tool_calls: msg.tool_calls,
            });

            for (const tc of msg.tool_calls) {
              if (tc.type !== "function") continue;
              if (signal.aborted) {
                send({ error: "Užklausa nutraukta prieš įrankį.", cancelled: true });
                controller.close();
                return;
              }
              send({ phase: "tool", status: "start", name: tc.function.name });
              const result = await executeChatTool(tc.function.name, tc.function.arguments, ip);
              if (signal.aborted) {
                send({
                  phase: "tool",
                  status: "done",
                  ok: true,
                  name: tc.function.name,
                  detail: "Įrašas užbaigtas; užklausa nutraukta — tolesni žingsniai nevykdomi.",
                });
                controller.close();
                return;
              }
              let ok = true;
              let detail: string | undefined;
              try {
                const j = JSON.parse(result) as { ok?: boolean; detail?: string; error?: string };
                ok = j.ok !== false;
                detail = j.ok ? j.detail : j.error;
              } catch {
                detail = undefined;
              }
              send({
                phase: "tool",
                status: "done",
                ok,
                name: tc.function.name,
                detail,
              });
              messages.push({
                role: "tool",
                tool_call_id: tc.id,
                content: result,
              });
            }
            continue;
          }

          const text = (typeof msg.content === "string" ? msg.content : "").trim();
          const hasToolContext = messages.some((m) => m.role === "tool");

          if (!text && hasToolContext) {
            try {
              await pipeStreamingCompletion(controller, apiKey, model, messages, signal);
            } catch (e) {
              if (isAbortError(e)) {
                send({ error: "Užklausa nutraukta arba baigėsi skirtasis laikas.", cancelled: true });
              } else {
                throw e;
              }
            }
            controller.close();
            return;
          }

          if (text) {
            await emitTextChunks(controller, encoder, text, signal);
            controller.close();
            return;
          }

          send({ error: "Modelis negrąžino teksto." });
          controller.close();
          return;
        }

        send({ error: "Pasiektas įrankių ciklo limitas." });
        controller.close();
      } catch (e) {
        if (isAbortError(e)) {
          send({ error: "Užklausa nutraukta arba baigėsi skirtasis laikas.", cancelled: true });
        } else {
          send({ error: publicApiErrorMessage(e) });
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
  } catch (e) {
    return NextResponse.json({ error: publicApiErrorMessage(e) }, { status: 500 });
  }
}
