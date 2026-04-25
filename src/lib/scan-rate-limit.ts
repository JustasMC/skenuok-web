/** Rate limit for /api/scan (separate bucket from contact form). */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 12;

const buckets = new Map<string, number[]>();

function prune(key: string, now: number): number[] {
  const stamps = buckets.get(key) ?? [];
  const fresh = stamps.filter((t) => now - t < WINDOW_MS);
  buckets.set(key, fresh);
  return fresh;
}

export function assertScanRateLimit(clientKey: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const recent = prune(clientKey, now);
  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    return { ok: false, retryAfterSec };
  }
  recent.push(now);
  buckets.set(clientKey, recent);
  return { ok: true };
}
