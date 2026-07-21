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
import { analyzeCandles, fetchBinanceKlines } from "@/lib/signals/ta";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .transform((s) => s.replace("/", "").toUpperCase()),
  interval: z.enum(["15m", "1h", "4h"]).default("15m"),
  locale: z.enum(["lt", "en"]).optional(),
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

/** AI narrative of current TA — costs 1 credit. */
export async function POST(req: Request) {
  const limited = assertScanRateLimit(`signals-ai:${getRateLimitClientKey(req)}`);
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
    const candles = await fetchBinanceKlines(parsed.data.symbol, parsed.data.interval);
    const snap = analyzeCandles(candles, parsed.data.symbol, parsed.data.interval);

    const apiKey = process.env.OPENAI_API_KEY;
    let summary: string;
    if (!apiKey) {
      summary =
        locale === "en"
          ? `Fallback: ${snap.triggers.map((t) => t.title).join("; ")}. RSI=${snap.rsi14?.toFixed(1)}. Not advice.`
          : `Be AI: ${snap.triggers.map((t) => t.title).join("; ")}. RSI=${snap.rsi14?.toFixed(1)}. Ne patarimas.`;
    } else {
      const lang =
        locale === "en"
          ? "Respond in English. Educational only, not investment advice."
          : "Atsakyk lietuvių kalba. Tik edukacija, ne investicinis patarimas.";
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: `${lang} Summarize the technical snapshot in 4-6 short sentences for a trader dashboard.`,
            },
            {
              role: "user",
              content: JSON.stringify({
                symbol: parsed.data.symbol,
                interval: parsed.data.interval,
                lastClose: snap.lastClose,
                ema20: snap.ema20,
                ema50: snap.ema50,
                rsi14: snap.rsi14,
                volumeSpike: snap.volumeSpike,
                triggers: snap.triggers,
              }),
            },
          ],
        }),
      });
      if (!res.ok) {
        throw new Error(`OpenAI ${res.status}`);
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      summary = data.choices?.[0]?.message?.content?.trim() || "—";
    }

    if (userId) {
      await prisma.creditLedgerEntry.create({
        data: {
          userId,
          delta: -1,
          reason: "signal_ai",
          meta: JSON.stringify({ symbol: parsed.data.symbol }),
        },
      });
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
      return NextResponse.json({
        ok: true as const,
        summary,
        snapshot: snap,
        creditsLeft: u?.credits ?? 0,
        creditsCharged: 1,
      });
    }

    await prisma.creditLedgerEntry.create({
      data: {
        generatorSessionId: sessionId!,
        delta: -1,
        reason: "signal_ai",
        meta: JSON.stringify({ symbol: parsed.data.symbol }),
      },
    });
    const s = await prisma.generatorSession.findUnique({
      where: { id: sessionId! },
      select: { credits: true },
    });
    return NextResponse.json({
      ok: true as const,
      summary,
      snapshot: snap,
      creditsLeft: s?.credits ?? 0,
      creditsCharged: 1,
    });
  } catch (e) {
    if (userId) await refundUser(userId).catch(() => {});
    else if (sessionId) await refundSession(sessionId).catch(() => {});
    return jsonApiError("signals/analyze", e, 502);
  }
}
