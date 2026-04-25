import { NextResponse } from "next/server";
import { jsonApiError, publicApiErrorMessage } from "@/lib/api-errors";
import { auth } from "@/auth";
import { resolveGeneratorSessionId } from "@/lib/generator-session-server";
import { getStripe } from "@/lib/stripe-server";
import { applyCheckoutSessionCreditsIfPaid } from "@/lib/stripe-checkout-credits";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Po sėkmingo Stripe Checkout grįžimo: patvirtina sesiją per Stripe API ir įskaito kreditus,
 * jei webhook dar nebuvo (ypač localhost). Tas pats idempotentiškumas kaip webhook (cs_…).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neteisingas JSON" }, { status: 400 });
  }

  const sessionId = typeof (body as { sessionId?: unknown }).sessionId === "string"
    ? (body as { sessionId: string }).sessionId.trim()
    : "";

  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Neteisingas sessionId (tikėtina cs_…)" }, { status: 422 });
  }

  const stripe = getStripe();
  let checkout: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
  try {
    checkout = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (e) {
    return NextResponse.json({ error: publicApiErrorMessage(e) }, { status: 502 });
  }

  const meta = checkout.metadata ?? {};
  const userIdMeta = meta.userId;
  const gidMeta = meta.generatorSessionId;

  const authSession = await auth();

  if (userIdMeta) {
    if (!authSession?.user?.id || authSession.user.id !== userIdMeta) {
      return NextResponse.json({ error: "Sesija nepriklauso šiai paskyrai." }, { status: 403 });
    }
  } else if (gidMeta) {
    const { sessionId: cookieSid } = await resolveGeneratorSessionId();
    if (cookieSid !== gidMeta) {
      return NextResponse.json(
        { error: "Ši naršyklės sesija neatitinka mokėjimo sesijos. Atidarykite tą patį įrenginį / naršyklę." },
        { status: 403 },
      );
    }
  } else {
    return NextResponse.json({ error: "Trūksta metadata (userId arba generatorSessionId)." }, { status: 422 });
  }

  try {
    const result = await applyCheckoutSessionCreditsIfPaid(checkout);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false as const, applied: false, credits: result.credits, reason: result.reason },
        { status: 200 },
      );
    }
    return NextResponse.json({
      ok: true as const,
      applied: result.applied,
      credits: result.credits,
      reason: result.reason,
    });
  } catch (e) {
    return jsonApiError("credits/sync-checkout", e);
  }
}
