import { auth } from "@/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/api-errors";
import { resolveAnalysisLocaleFromCookies } from "@/lib/i18n/analysis-locale-server";
import { runNicheScan } from "@/lib/niche-scan/factory";
import { getNicheScanCredits } from "@/lib/niche-scan-credits";
import {
  assertNicheScanRateLimit,
  nicheScanRateLimitKey,
} from "@/lib/niche-scan-rate-limit";
import { nicheScanRequestSchema } from "@/lib/niche-scan/types";
import { prisma } from "@/lib/prisma";
import { getRateLimitClientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function refundUser(userId: string, amount: number) {
  if (amount <= 0) return;
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
}

async function refundSession(sessionId: string, amount: number) {
  if (amount <= 0) return;
  await prisma.generatorSession.update({
    where: { id: sessionId },
    data: { credits: { increment: amount } },
  });
}

export async function POST(req: Request) {
  const cost = getNicheScanCredits();
  const ip = getRateLimitClientKey(req);
  const fingerprint = req.headers.get("x-device-fingerprint");
  const limited = assertNicheScanRateLimit(nicheScanRateLimitKey(ip, fingerprint));
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: "Per daug skenavimų. Palaukite ir bandykite vėliau.",
        retryAfterSec: limited.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Neteisingas JSON" }, { status: 400 });
  }

  const parsed = nicheScanRequestSchema.safeParse(json);
  if (!parsed.success) {
    const msg =
      parsed.error.flatten().fieldErrors.niche?.[0] ??
      parsed.error.flatten().fieldErrors.text?.[0] ??
      parsed.error.flatten().fieldErrors.imageDataUrl?.[0] ??
      "Neteisinga užklausa";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const locale = await resolveAnalysisLocaleFromCookies(parsed.data.locale);
  const authSession = await auth();
  const userId = authSession?.user?.id ?? null;

  if (userId) {
    const reserved = await prisma.$transaction(async (tx) => {
      const r = await tx.user.updateMany({
        where: { id: userId, credits: { gte: cost } },
        data: { credits: { decrement: cost } },
      });
      return r.count === 1;
    });

    if (!reserved) {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
      return NextResponse.json(
        {
          error: "Nepakanka kreditų.",
          needCredits: true as const,
          credits: u?.credits ?? 0,
          creditsRequired: cost,
        },
        { status: 402 },
      );
    }

    try {
      const result = await runNicheScan(parsed.data, locale);
      if (!result.ok) {
        await refundUser(userId, cost);
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      const creditsLeft = await prisma.$transaction(async (tx) => {
        await tx.usageRecord.create({
          data: {
            userId,
            kind: `niche_scan_${parsed.data.niche}`,
            credits: cost,
            meta: JSON.stringify({ niche: parsed.data.niche }),
          },
        });
        await tx.creditLedgerEntry.create({
          data: {
            userId,
            delta: -cost,
            reason: "niche_scan",
            meta: JSON.stringify({ niche: parsed.data.niche }),
          },
        });
        const row = await tx.user.findUnique({ where: { id: userId }, select: { credits: true } });
        return row?.credits ?? 0;
      });

      return NextResponse.json({ ...result, creditsLeft, creditsCharged: cost });
    } catch (e) {
      await refundUser(userId, cost).catch(() => {});
      return jsonApiError("niche-scan", e, 502);
    }
  }

  const jar = await cookies();
  const sid = jar.get("gen_session")?.value;
  if (!sid) {
    return NextResponse.json(
      { error: "Nėra sesijos. Perkraukite puslapį arba prisijunkite.", needSession: true as const },
      { status: 401 },
    );
  }

  const reservedSession = await prisma.$transaction(async (tx) => {
    const r = await tx.generatorSession.updateMany({
      where: { id: sid, mergedAt: null, credits: { gte: cost } },
      data: { credits: { decrement: cost } },
    });
    return r.count === 1;
  });

  if (!reservedSession) {
    const s = await prisma.generatorSession.findUnique({ where: { id: sid }, select: { credits: true } });
    return NextResponse.json(
      {
        error: "Nepakanka kreditų. Prisijunkite arba įsigykite paketą.",
        needCredits: true as const,
        credits: s?.credits ?? 0,
        creditsRequired: cost,
      },
      { status: 402 },
    );
  }

  try {
    const result = await runNicheScan(parsed.data, locale);
    if (!result.ok) {
      await refundSession(sid, cost);
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await prisma.creditLedgerEntry.create({
      data: {
        generatorSessionId: sid,
        delta: -cost,
        reason: "niche_scan",
        meta: JSON.stringify({ niche: parsed.data.niche }),
      },
    });
    const s = await prisma.generatorSession.findUnique({ where: { id: sid }, select: { credits: true } });
    return NextResponse.json({
      ...result,
      creditsLeft: s?.credits ?? 0,
      creditsCharged: cost,
    });
  } catch (e) {
    await refundSession(sid, cost).catch(() => {});
    return jsonApiError("niche-scan", e, 502);
  }
}
