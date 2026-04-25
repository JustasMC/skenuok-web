import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/api-errors";
import {
  computeCourseScanCreditsCharged,
  getCourseScanCreditsRequired,
} from "@/lib/course-scan-credits";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";
import { scanRequestSchema } from "@/lib/scan-schema";
import { runCourseQualityScan } from "@/lib/course-quality-scan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const authSession = await auth();
  const userId = authSession?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Kursų skaneriui reikalingas prisijungimas.", needSession: true as const },
      { status: 401 },
    );
  }

  const required = getCourseScanCreditsRequired();

  const reserved = await prisma.$transaction(async (tx) => {
    const u = await tx.user.updateMany({
      where: { id: userId, credits: { gte: required } },
      data: { credits: { decrement: required } },
    });
    if (u.count !== 1) {
      return null;
    }
    return tx.user.findUnique({ where: { id: userId }, select: { credits: true } });
  });

  if (!reserved) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
    return NextResponse.json(
      {
        error: `Nepakanka kreditų. Reikia bent ${required} (rezervacija: bazė + galimas Serper).`,
        needCredits: true as const,
        credits: user?.credits ?? 0,
        creditsRequired: required,
      },
      { status: 402 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: required } },
    });
    return NextResponse.json({ error: "Neteisingas JSON" }, { status: 400 });
  }

  const parsed = scanRequestSchema.safeParse(json);
  if (!parsed.success) {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: required } },
    });
    const msg = parsed.error.flatten().fieldErrors.url?.[0] ?? "Patikrinkite URL";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const clientKey = getRateLimitClientKey(req);
  const limited = assertScanRateLimit(`course-scan:${userId}:${clientKey}`);
  if (!limited.ok) {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: required } },
    });
    return NextResponse.json(
      { error: "Per daug skenavimų. Palaukite ir bandykite vėliau.", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let result;
  try {
    result = await runCourseQualityScan(parsed.data);
  } catch (e) {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: required } },
    });
    return jsonApiError("course-scan", e, 502);
  }

  if (!result.ok) {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: required } },
    });
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const charged = computeCourseScanCreditsCharged(result);
  const refund = required - charged;

  const creditsLeft = await prisma.$transaction(async (tx) => {
    if (refund > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: refund } },
      });
    }
    await tx.usageRecord.create({
      data: {
        userId,
        kind: "course_quality_scan",
        credits: charged,
        meta: JSON.stringify({
          url: result.url,
          serper: result.freeAlternatives.status === "completed",
          charged,
          reserved: required,
        }),
      },
    });
    await tx.creditLedgerEntry.create({
      data: {
        userId,
        delta: -charged,
        reason: "course_quality_scan",
        meta: JSON.stringify({
          url: result.url,
          serper: result.freeAlternatives.status === "completed",
          charged,
        }),
      },
    });
    const row = await tx.user.findUnique({ where: { id: userId }, select: { credits: true } });
    return row?.credits ?? 0;
  });

  return NextResponse.json({
    ...result,
    creditsLeft,
    creditsCharged: charged,
  });
}
