import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getGuestFreeCreditsPerDay,
  getGuestMaxScansPerDay,
  guestIdentityKey,
  readDeviceFingerprint,
  utcDayKey,
} from "@/lib/guest-quota";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export type ResolveSessionOpts = {
  /** Pass the incoming Request so IP + fingerprint can gate free credits. */
  req?: Request;
};

/**
 * Ensures a GeneratorSession exists and returns its id.
 * Free guest credits are granted once per IP+fingerprint per UTC day (DB GuestQuota).
 * Clearing cookies no longer mints endless free credits.
 */
export async function resolveGeneratorSessionId(opts?: ResolveSessionOpts): Promise<{
  sessionId: string;
  needsSetCookie: boolean;
  freeCreditsGranted: number;
}> {
  const jar = await cookies();
  const existing = jar.get("gen_session")?.value;
  if (existing) {
    const row = await prisma.generatorSession.findUnique({ where: { id: existing } });
    if (row && !row.mergedAt) {
      return { sessionId: row.id, needsSetCookie: false, freeCreditsGranted: 0 };
    }
  }

  const req = opts?.req;
  const ip = req ? getRateLimitClientKey(req) : "unknown";
  const fingerprint = req ? readDeviceFingerprint(req) : null;
  const identityKey = guestIdentityKey(ip, fingerprint);
  const dayKey = utcDayKey();
  const freeCap = getGuestFreeCreditsPerDay();

  // Reuse today's last unmerged session for this identity (survives cookie clear).
  const quota = await prisma.guestQuota.findUnique({
    where: { identityKey_dayKey: { identityKey, dayKey } },
  });

  if (quota?.lastSessionId) {
    const prev = await prisma.generatorSession.findUnique({
      where: { id: quota.lastSessionId },
    });
    if (prev && !prev.mergedAt) {
      return { sessionId: prev.id, needsSetCookie: true, freeCreditsGranted: 0 };
    }
  }

  const alreadyGranted = quota?.freeCreditsGranted ?? 0;
  const grant = Math.max(0, freeCap - alreadyGranted);

  const created = await prisma.generatorSession.create({
    data: { credits: grant },
  });

  await prisma.guestQuota.upsert({
    where: { identityKey_dayKey: { identityKey, dayKey } },
    create: {
      identityKey,
      dayKey,
      freeCreditsGranted: grant,
      scansUsed: 0,
      lastSessionId: created.id,
    },
    update: {
      freeCreditsGranted: { increment: grant },
      lastSessionId: created.id,
    },
  });

  if (grant > 0) {
    await prisma.creditLedgerEntry.create({
      data: {
        generatorSessionId: created.id,
        delta: grant,
        reason: "guest_daily_free",
        meta: JSON.stringify({ identityKey: identityKey.slice(0, 16), dayKey, grant }),
      },
    });
  }

  return { sessionId: created.id, needsSetCookie: true, freeCreditsGranted: grant };
}

export function applyGenSessionCookie(res: NextResponse, sessionId: string) {
  res.cookies.set("gen_session", sessionId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/** Increment guest scan counter; returns false if daily scan cap exceeded. */
export async function assertGuestScanAllowed(req: Request): Promise<
  | { ok: true }
  | { ok: false; retryAfterSec: number; scansUsed: number; max: number }
> {
  const max = getGuestMaxScansPerDay();
  const identityKey = guestIdentityKey(getRateLimitClientKey(req), readDeviceFingerprint(req));
  const dayKey = utcDayKey();

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.guestQuota.upsert({
      where: { identityKey_dayKey: { identityKey, dayKey } },
      create: {
        identityKey,
        dayKey,
        freeCreditsGranted: 0,
        scansUsed: 1,
      },
      update: {
        scansUsed: { increment: 1 },
      },
    });
    return row;
  });

  if (updated.scansUsed > max) {
    await prisma.guestQuota.update({
      where: { identityKey_dayKey: { identityKey, dayKey } },
      data: { scansUsed: { decrement: 1 } },
    });
    const now = new Date();
    const tomorrow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    const retryAfterSec = Math.max(60, Math.ceil((tomorrow - now.getTime()) / 1000));
    return { ok: false, retryAfterSec, scansUsed: max, max };
  }

  return { ok: true };
}
