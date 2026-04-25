import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { logApiError, publicApiErrorMessage } from "@/lib/api-errors";
import { getStripe } from "@/lib/stripe-server";
import { applyCheckoutSessionCreditsIfPaid } from "@/lib/stripe-checkout-credits";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET nenustatytas" }, { status: 501 });
  }

  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Nėra Stripe-Signature antraštės" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "Netinkama webhook parašas arba neteisingas kūnas" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    const result = await applyCheckoutSessionCreditsIfPaid(session, { stripeEventId: event.id });
    if (!result.ok) {
      console.warn("[stripe webhook] apply skipped:", result.reason, session.id);
    }
  } catch (e) {
    logApiError("webhooks/stripe", e);
    return NextResponse.json(
      { error: publicApiErrorMessage(e), received: false },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
