/** Atskiras bucket agento API (ne /api/scan), kad viešas skeneris ir agentas neliktų be limito. */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_AGENT_REQUESTS = 10;

const buckets = new Map<string, number[]>();

function prune(key: string, now: number): number[] {
  const stamps = buckets.get(key) ?? [];
  const fresh = stamps.filter((t) => now - t < WINDOW_MS);
  buckets.set(key, fresh);
  return fresh;
}

export function assertAgentRouteRateLimit(clientKey: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const recent = prune(clientKey, now);
  if (recent.length >= MAX_AGENT_REQUESTS) {
    const oldest = recent[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    return { ok: false, retryAfterSec };
  }
  recent.push(now);
  buckets.set(clientKey, recent);
  return { ok: true };
}
