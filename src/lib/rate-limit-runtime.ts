import { env, isSharedRateLimitConfigured } from "@/lib/env";

let hasLogged = false;

export function warnIfUsingLocalRateLimit() {
  if (hasLogged || env.NODE_ENV !== "production" || isSharedRateLimitConfigured()) return;
  hasLogged = true;
  // Info-level: in-memory is sufficient for single-instance Railway deployments.
  // Upgrade to Upstash Redis if horizontal scaling is needed.
  console.info(
    "[rate-limit] Using in-memory limits (single-instance). Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for multi-instance shared limits.",
  );
}
