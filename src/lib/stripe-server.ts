import Stripe from "stripe";
import { env } from "@/lib/env";
import { getSiteOrigin } from "@/lib/site-url";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, { typescript: true });
  }
  return stripeSingleton;
}

export function getSiteBaseUrl(): string {
  return getSiteOrigin();
}
