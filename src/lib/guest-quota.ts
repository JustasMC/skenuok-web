import { createHash } from "crypto";

/** Max free credits granted to a guest identity per UTC day (default 1). */
export function getGuestFreeCreditsPerDay(): number {
  const n = Number(process.env.GUEST_FREE_CREDITS_PER_DAY);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1;
}

/** Max paid+free guest AI scans per UTC day (hard cap; default 3). */
export function getGuestMaxScansPerDay(): number {
  const n = Number(process.env.GUEST_MAX_SCANS_PER_DAY);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 3;
}

export function utcDayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Stable guest identity from IP + device fingerprint.
 * Fingerprint alone is spoofable — combined with IP raises the abuse bar.
 */
export function guestIdentityKey(ip: string, fingerprint: string | null | undefined): string {
  const fp = (fingerprint?.trim() || "nofp").slice(0, 128);
  const raw = `${ip.trim() || "unknown"}|${fp}`;
  return createHash("sha256").update(raw).digest("hex");
}

export function readDeviceFingerprint(req: Request): string | null {
  const h = req.headers.get("x-device-fingerprint")?.trim();
  return h ? h.slice(0, 128) : null;
}
