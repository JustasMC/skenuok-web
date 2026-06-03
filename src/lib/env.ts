import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().trim().optional(),
  NEXT_PUBLIC_GA_ID: z.string().trim().optional(),
  STRIPE_SECRET_KEY: z.string().trim().optional(),
  AUTH_SECRET: z.string().trim().optional(),
  PSI_API_KEY: z.string().trim().optional(),
  PAGESPEED_API_KEY: z.string().trim().optional(),
  GOOGLE_PAGESPEED_API_KEY: z.string().trim().optional(),
  UPSTASH_REDIS_REST_URL: z.string().trim().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().trim().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment variables: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;

export function getPageSpeedApiKey(): string | null {
  return env.PSI_API_KEY || env.PAGESPEED_API_KEY || env.GOOGLE_PAGESPEED_API_KEY || null;
}

export function isSharedRateLimitConfigured(): boolean {
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}
