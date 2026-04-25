import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { AgentSseEvent } from "@/lib/agent/agent-stream-events";
import { encodeSseEvent } from "@/lib/agent/agent-stream-events";
import { assertAgentRouteRateLimit } from "@/lib/agent/agent-rate-limit";
import { getAgentLimitsFromEnv } from "@/lib/agent/agent-security";
import { trimMessagesForAgent } from "@/lib/agent/conversation-context";
import { runReactSeoAgent } from "@/lib/agent/react-agent";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";
import {
  buildAgentMessageMetadata,
  buildAgentMessageMetadataMinimal,
} from "@/lib/agent/agent-message-metadata";
import { jsonApiError, publicApiErrorMessage } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { getCombinedRouteAbortSignal } from "@/lib/route-abort";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  message: z.string().trim().min(1, "Įveskite užklausą").max(8000, "Per ilga užklausa"),
  conversationId: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return undefined;
      const s = String(val).trim();
      return s.length > 0 ? s : undefined;
    },
    z.string().min(1).optional(),
  ),
  /** `true` — atsakas kaip SSE (text/event-stream). */
  stream: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Reikalingas prisijungimas." }, { status: 401 });
  }

  const ip = getRateLimitClientKey(req);
  const agentRouteKey = `agent-route:${userId}:${ip}`;
  const routeLim = assertAgentRouteRateLimit(agentRouteKey);
  if (!routeLim.ok) {
    return NextResponse.json(
      {
        error: "Per daug agento užklausų. Palaukite ir bandykite vėliau.",
        retryAfterSec: routeLim.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(routeLim.retryAfterSec) } },
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
    const msg = parsed.error.flatten().fieldErrors.message?.[0] ?? "Neteisinga užklausa";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  try {
  let conversationId = parsed.data.conversationId;
  if (conversationId) {
    const existing = await prisma.agentConversation.findFirst({
      where: { id: conversationId, userId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Pokalbis nerastas." }, { status: 404 });
    }
  } else {
    const created = await prisma.agentConversation.create({
      data: { userId },
      select: { id: true },
    });
    conversationId = created.id;
  }

  const priorRows = await prisma.agentMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });

  const history = trimMessagesForAgent(priorRows);

  const limits = getAgentLimitsFromEnv();
  const scanBucketKey = `user-scan:${userId}`;
  const abortSignal = getCombinedRouteAbortSignal(req);

  const agentOpts = {
    userMessage: parsed.data.message,
    history,
    limits,
    allowExternalScan: () => assertScanRateLimit(scanBucketKey).ok,
    userId,
    abortSignal,
  };

  if (parsed.data.stream === true) {
    const stream = new ReadableStream({
      async start(controller) {
        const enqueue = (e: AgentSseEvent) => {
          controller.enqueue(encodeSseEvent(e));
        };

        try {
          const recorded: AgentSseEvent[] = [];
          const send: (e: AgentSseEvent) => void = (e) => {
            recorded.push(e);
            enqueue(e);
          };

          const result = await runReactSeoAgent({
            ...agentOpts,
            sse: { onEvent: send },
          });

          if (!result.ok) {
            send({
              type: "error",
              message: result.error,
              conversationId,
              steps: result.steps,
              toolScansUsed: result.toolScansUsed,
            });
            controller.close();
            return;
          }

          const convBefore = await prisma.agentConversation.findUnique({
            where: { id: conversationId },
            select: { title: true },
          });
          const nextTitle =
            convBefore?.title && convBefore.title.trim().length > 0
              ? convBefore.title
              : parsed.data.message.slice(0, 80);

          const assistantMetadata = buildAgentMessageMetadata(
            recorded,
            {
              agentSteps: result.steps,
              toolScansUsed: result.toolScansUsed,
            },
            result.toolInsights,
          );

          await prisma.$transaction([
            prisma.agentMessage.create({
              data: {
                conversationId,
                role: "user",
                content: parsed.data.message,
              },
            }),
            prisma.agentMessage.create({
              data: {
                conversationId,
                role: "assistant",
                content: result.answer,
                metadata: assistantMetadata,
              },
            }),
            prisma.agentConversation.update({
              where: { id: conversationId },
              data: { title: nextTitle },
            }),
          ]);

          send({
            type: "done",
            ok: true,
            answer: result.answer,
            steps: result.steps,
            toolScansUsed: result.toolScansUsed,
            conversationId,
            title: nextTitle,
          });
        } catch (e) {
          enqueue({ type: "error", message: publicApiErrorMessage(e), conversationId });
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const result = await runReactSeoAgent(agentOpts);

  if (!result.ok) {
    const needsConfig = result.error.includes("OPENAI_API_KEY");
    return NextResponse.json(
      {
        ok: false as const,
        error: result.error,
        steps: result.steps,
        toolScansUsed: result.toolScansUsed,
        conversationId,
      },
      { status: needsConfig ? 503 : 200 },
    );
  }

  const convBefore = await prisma.agentConversation.findUnique({
    where: { id: conversationId },
    select: { title: true },
  });
  const nextTitle =
    convBefore?.title && convBefore.title.trim().length > 0
      ? convBefore.title
      : parsed.data.message.slice(0, 80);

  const assistantMetadata = buildAgentMessageMetadataMinimal({
    agentSteps: result.steps,
    toolScansUsed: result.toolScansUsed,
  });

  await prisma.$transaction([
    prisma.agentMessage.create({
      data: {
        conversationId,
        role: "user",
        content: parsed.data.message,
      },
    }),
    prisma.agentMessage.create({
      data: {
        conversationId,
        role: "assistant",
        content: result.answer,
        metadata: assistantMetadata,
      },
    }),
    prisma.agentConversation.update({
      where: { id: conversationId },
      data: { title: nextTitle },
    }),
  ]);

  return NextResponse.json({
    ok: true as const,
    answer: result.answer,
    steps: result.steps,
    toolScansUsed: result.toolScansUsed,
    conversationId,
    title: nextTitle,
  });
  } catch (e) {
    return jsonApiError("agent/seo-assistant", e);
  }
}
