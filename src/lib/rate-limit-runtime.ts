import { env, isSharedRateLimitConfigured } from "@/lib/env";

let hasWarned = false;

export function warnIfUsingLocalRateLimit() {
  if (hasWarned || env.NODE_ENV !== "production" || isSharedRateLimitConfigured()) return;
  hasWarned = true;
  console.warn(
    "[rate-limit] Using in-memory limits in production. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for shared limits.",
  );
}
