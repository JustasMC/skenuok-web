/**
 * Simple in-memory rate limiter for a single Node instance.
 * On serverless with many instances each has its own map — use Redis/Upstash for strict global limits.
 */
import { warnIfUsingLocalRateLimit } from "@/lib/rate-limit-runtime";

/**
 * Returns true for known synthetic crawlers (Lighthouse, PageSpeed, bots)
 * that should bypass rate limiting to avoid false positives in audits.
 */
export function isSyntheticCrawler(req: Request): boolean {
  const ua = req.headers.get("user-agent") ?? "";
  return (
    ua.includes("Lighthouse") ||
    ua.includes("Chrome-Lighthouse") ||
    ua.includes("PageSpeed") ||
    ua.includes("Google Page Speed") ||
    ua.includes("GoogleBot") ||
    ua.includes("Googlebot")
  );
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

const buckets = new Map<string, number[]>();

function prune(key: string, now: number): number[] {
  const stamps = buckets.get(key) ?? [];
  const fresh = stamps.filter((t) => now - t < WINDOW_MS);
  buckets.set(key, fresh);
  return fresh;
}

export function assertContactRateLimit(clientKey: string): { ok: true } | { ok: false; retryAfterSec: number } {
  warnIfUsingLocalRateLimit();
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

export function getRateLimitClientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

/** Viešas AI chat botas (platesnis langas nei kontaktų forma). */
const CHAT_WINDOW_MS = 15 * 60 * 1000;
const CHAT_MAX_REQUESTS = 40;
const chatBuckets = new Map<string, number[]>();

function pruneChat(key: string, now: number): number[] {
  const stamps = chatBuckets.get(key) ?? [];
  const fresh = stamps.filter((t) => now - t < CHAT_WINDOW_MS);
  chatBuckets.set(key, fresh);
  return fresh;
}

export function assertChatRateLimit(clientKey: string): { ok: true } | { ok: false; retryAfterSec: number } {
  warnIfUsingLocalRateLimit();
  const now = Date.now();
  const recent = pruneChat(clientKey, now);
  if (recent.length >= CHAT_MAX_REQUESTS) {
    const oldest = recent[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((CHAT_WINDOW_MS - (now - oldest)) / 1000));
    return { ok: false, retryAfterSec };
  }
  recent.push(now);
  chatBuckets.set(clientKey, recent);
  return { ok: true };
}
