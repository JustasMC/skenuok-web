import { auth } from "@/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonApiError } from "@/lib/api-errors";
import { assertGuestScanAllowed } from "@/lib/generator-session-server";
import { resolveAnalysisLocaleFromCookies } from "@/lib/i18n/analysis-locale-server";
import { fetchYahooCandles } from "@/lib/markets/instruments";
import { prisma } from "@/lib/prisma";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";
import { analyzeCandles } from "@/lib/signals/ta";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  symbol: z.string().trim().min(1).max(24),
  category: z.enum(["etf", "metals", "fx"]),
  locale: z.enum(["lt", "en"]).optional(),
});

export async function POST(req: Request) {
  const limited = assertScanRateLimit(`markets-ai:${getRateLimitClientKey(req)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Per daug užklausų.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
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
    const ok = await prisma.user.updateMany({
      where: { id: userId, credits: { gte: 1 } },
      data: { credits: { decrement: 1 } },
    });
    if (ok.count !== 1) {
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
      return NextResponse.json({ error: "Nėra sesijos.", needSession: true as const }, { status: 401 });
    }
    const guestCap = await assertGuestScanAllowed(req);
    if (!guestCap.ok) {
      return NextResponse.json(
        { error: "Svečio dienos limitas.", needCredits: true as const },
        { status: 429 },
      );
    }
    const ok = await prisma.generatorSession.updateMany({
      where: { id: sessionId, mergedAt: null, credits: { gte: 1 } },
      data: { credits: { decrement: 1 } },
    });
    if (ok.count !== 1) {
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
    const candles = await fetchYahooCandles(parsed.data.symbol);
    const snap = analyzeCandles(candles, parsed.data.symbol, "1d");
    const apiKey = process.env.OPENAI_API_KEY;
    const categoryHint =
      parsed.data.category === "etf"
        ? "ETF / dividends / payout context"
        : parsed.data.category === "metals"
          ? "precious metals / energy commodities"
          : "FX pairs / rate-decision context (ECB/Fed — high level only)";

    let summary: string;
    if (!apiKey) {
      summary = snap.triggers.map((t) => t.title).join("; ");
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 450,
          messages: [
            {
              role: "system",
              content:
                locale === "en"
                  ? `Educational market summary only — not investment advice. Focus: ${categoryHint}. 4-6 short sentences.`
                  : `Tik edukacinė rinkos santrauka — ne investicinis patarimas. Fokusas: ${categoryHint}. 4–6 trumpi sakiniai lietuvių kalba.`,
            },
            {
              role: "user",
              content: JSON.stringify({
                symbol: parsed.data.symbol,
                category: parsed.data.category,
                lastClose: snap.lastClose,
                ema20: snap.ema20,
                ema50: snap.ema50,
                rsi14: snap.rsi14,
                triggers: snap.triggers,
              }),
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}`);
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      summary = data.choices?.[0]?.message?.content?.trim() || "—";
    }

    await prisma.creditLedgerEntry.create({
      data: {
        userId: userId ?? undefined,
        generatorSessionId: sessionId ?? undefined,
        delta: -1,
        reason: "signal_ai",
        meta: JSON.stringify({
          kind: "market_ai",
          category: parsed.data.category,
          symbol: parsed.data.symbol,
        }),
      },
    });

    const creditsLeft = userId
      ? (await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } }))?.credits ?? 0
      : (await prisma.generatorSession.findUnique({ where: { id: sessionId! }, select: { credits: true } }))
          ?.credits ?? 0;

    return NextResponse.json({
      ok: true as const,
      summary,
      snapshot: snap,
      creditsLeft,
      creditsCharged: 1,
    });
  } catch (e) {
    if (userId) {
      await prisma.user.update({ where: { id: userId }, data: { credits: { increment: 1 } } }).catch(() => {});
    } else if (sessionId) {
      await prisma.generatorSession
        .update({ where: { id: sessionId }, data: { credits: { increment: 1 } } })
        .catch(() => {});
    }
    return jsonApiError("markets/analyze", e, 502);
  }
}
