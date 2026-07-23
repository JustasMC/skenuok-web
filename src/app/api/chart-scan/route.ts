import { auth } from "@/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonApiError } from "@/lib/api-errors";
import { assertGuestScanAllowed } from "@/lib/generator-session-server";
import { resolveAnalysisLocaleFromCookies } from "@/lib/i18n/analysis-locale-server";
import { prisma } from "@/lib/prisma";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_IMAGE = 4_500_000;

const bodySchema = z.object({
  imageDataUrl: z
    .string()
    .trim()
    .min(32)
    .max(MAX_IMAGE)
    .refine((s) => s.startsWith("data:image/"), "Must be data:image URL"),
  symbol: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((s) => (s ? s.replace("/", "").toUpperCase() : undefined)),
  timeframe: z.string().trim().max(16).optional(),
  locale: z.enum(["lt", "en"]).optional(),
});

const resultSchema = z.object({
  structure: z.string(),
  patterns: z.array(z.string()).default([]),
  support: z.array(z.union([z.number(), z.string()])).default([]),
  resistance: z.array(z.union([z.number(), z.string()])).default([]),
  entryZone: z.union([
    z.string(),
    z.object({ low: z.number().optional(), high: z.number().optional() }),
  ]),
  invalidation: z.union([z.number(), z.string()]),
  takeProfit: z.union([
    z.number(),
    z.string(),
    z.array(z.union([z.number(), z.string()])),
  ]),
  riskReward: z.union([z.number(), z.string()]),
  setupScore: z.enum(["A+", "A", "B", "C", "D", "F"]),
  bias: z.enum(["bullish", "bearish", "neutral"]),
  summaryLt: z.string(),
  summaryEn: z.string(),
});

async function refundUser(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { credits: { increment: 1 } } });
}
async function refundSession(sid: string) {
  await prisma.generatorSession.update({
    where: { id: sid },
    data: { credits: { increment: 1 } },
  });
}

function visionModel(): string {
  return process.env.OPENAI_VISION_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4o";
}

/** GPT-4o Vision chart structure → Entry / SL / R:R / Setup Score. 1 credit. */
export async function POST(req: Request) {
  const limited = assertScanRateLimit(`chart-scan:${getRateLimitClientKey(req)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Per daug užklausų.", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
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
    return NextResponse.json({ error: "Neteisingi duomenys" }, { status: 422 });
  }

  const locale = await resolveAnalysisLocaleFromCookies(parsed.data.locale);
  const authSession = await auth();
  const userId = authSession?.user?.id ?? null;
  let sessionId: string | null = null;

  if (userId) {
    const ok = await prisma.$transaction(async (tx) => {
      const r = await tx.user.updateMany({
        where: { id: userId, credits: { gte: 1 } },
        data: { credits: { decrement: 1 } },
      });
      return r.count === 1;
    });
    if (!ok) {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
      return NextResponse.json(
        { error: "Nepakanka kreditų.", needCredits: true as const, credits: u?.credits ?? 0 },
        { status: 402 },
      );
    }
  } else {
    const jar = await cookies();
    sessionId = jar.get("gen_session")?.value ?? null;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Nėra sesijos.", needSession: true as const },
        { status: 401 },
      );
    }
    const guestCap = await assertGuestScanAllowed(req);
    if (!guestCap.ok) {
      return NextResponse.json(
        {
          error: `Svečio dienos limitas (${guestCap.max}). Prisijunkite arba pirkite kreditus.`,
          needCredits: true as const,
        },
        { status: 429 },
      );
    }
    const ok = await prisma.$transaction(async (tx) => {
      const r = await tx.generatorSession.updateMany({
        where: { id: sessionId!, mergedAt: null, credits: { gte: 1 } },
        data: { credits: { decrement: 1 } },
      });
      return r.count === 1;
    });
    if (!ok) {
      const s = await prisma.generatorSession.findUnique({
        where: { id: sessionId },
        select: { credits: true },
      });
      return NextResponse.json(
        { error: "Nepakanka kreditų.", needCredits: true as const, credits: s?.credits ?? 0 },
        { status: 402 },
      );
    }
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY missing");
    }

    const system = `You are a professional chart analyst for educational trading education only — never investment advice.
Analyze the uploaded trading chart screenshot. Return ONLY valid JSON (no markdown) with keys:
structure (string), patterns (string[] e.g. Head & Shoulders, Flag, Triangle),
support (number|string[]), resistance (number|string[]),
entryZone (string or {low,high}), invalidation (stop loss level),
takeProfit (number|string|array), riskReward (number|string),
setupScore ("A+"|"A"|"B"|"C"|"D"|"F"), bias ("bullish"|"bearish"|"neutral"),
summaryLt (Lithuanian 2-4 sentences), summaryEn (English 2-4 sentences).
Be conservative: if unclear, use setupScore "D" or "F" and bias "neutral".`;

    const userText = [
      parsed.data.symbol ? `Symbol hint: ${parsed.data.symbol}` : null,
      parsed.data.timeframe ? `Timeframe hint: ${parsed.data.timeframe}` : null,
      "Identify structure, S/R, patterns, entry, invalidation, R:R, score.",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: visionModel(),
        temperature: 0.2,
        max_tokens: 900,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: parsed.data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI ${res.status}`);
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content?.trim() || "{}";
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      throw new Error("Invalid vision JSON");
    }
    const analysis = resultSchema.safeParse(parsedJson);
    if (!analysis.success) {
      throw new Error("Vision schema mismatch");
    }

    const summary = locale === "en" ? analysis.data.summaryEn : analysis.data.summaryLt;

    if (userId) {
      await prisma.creditLedgerEntry.create({
        data: {
          userId,
          delta: -1,
          reason: "chart_vision",
          meta: JSON.stringify({ symbol: parsed.data.symbol ?? null }),
        },
      });
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
      return NextResponse.json({
        ok: true as const,
        analysis: analysis.data,
        summary,
        creditsLeft: u?.credits ?? 0,
        creditsCharged: 1,
      });
    }

    await prisma.creditLedgerEntry.create({
      data: {
        generatorSessionId: sessionId!,
        delta: -1,
        reason: "chart_vision",
        meta: JSON.stringify({ symbol: parsed.data.symbol ?? null }),
      },
    });
    const s = await prisma.generatorSession.findUnique({
      where: { id: sessionId! },
      select: { credits: true },
    });
    return NextResponse.json({
      ok: true as const,
      analysis: analysis.data,
      summary,
      creditsLeft: s?.credits ?? 0,
      creditsCharged: 1,
    });
  } catch (e) {
    if (userId) await refundUser(userId).catch(() => {});
    else if (sessionId) await refundSession(sessionId).catch(() => {});
    return jsonApiError("chart-scan", e, 502);
  }
}
