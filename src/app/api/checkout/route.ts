import { NextResponse } from "next/server";
import { publicApiErrorMessage } from "@/lib/api-errors";
import { auth } from "@/auth";
import { applyGenSessionCookie, resolveGeneratorSessionId } from "@/lib/generator-session-server";
import { getSiteBaseUrl, getStripe } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Sukuria Stripe Checkout sesiją kreditų paketui.
 * POST be body — prisijungus: kreditai į User; kitaip: gen_session slapukas.
 */
export async function POST() {
  try {
    const stripe = getStripe();
    const base = getSiteBaseUrl();

    const credits = Math.max(1, Number.parseInt(process.env.STRIPE_CREDITS_PER_PURCHASE ?? "20", 10));
    const amountCents = Math.max(50, Number.parseInt(process.env.STRIPE_PACK_AMOUNT_CENTS ?? "1000", 10));
    /** Stripe kataloge sukurtas produkto ID (pradeda nuo prod_) — sieti Checkout su jūsų kataloge sukurtu prekės įrašu. */
    const catalogProductId = process.env.STRIPE_CREDIT_PRODUCT_ID?.trim() || null;

    const authSession = await auth();

    let metadata: Record<string, string>;
    let clientReferenceId: string;
    let anonSessionId: string | null = null;
    let needsSetCookie = false;

    if (authSession?.user?.id) {
      metadata = {
        userId: authSession.user.id,
        credits: String(credits),
        kind: "user_credits",
      };
      clientReferenceId = authSession.user.id;
    } else {
      const resolved = await resolveGeneratorSessionId();
      anonSessionId = resolved.sessionId;
      needsSetCookie = resolved.needsSetCookie;
      metadata = {
        generatorSessionId: resolved.sessionId,
        credits: String(credits),
        kind: "session_credits",
      };
      clientReferenceId = resolved.sessionId;
    }

    const productDescription = authSession?.user?.id
      ? "Kreditai SEO turinio generatoriui (paskyra)"
      : "Kreditai SEO turinio generatoriui (anoniminė sesija)";

    const successUrl = authSession?.user?.id
      ? `${base}/irankiai/seo-generatorius?checkout=success&session_id={CHECKOUT_SESSION_ID}`
      : `${base}/irankiai/seo-generatorius?checkout=success&session_id={CHECKOUT_SESSION_ID}${
          anonSessionId ? `&gen_session_hint=${encodeURIComponent(anonSessionId)}` : ""
        }`;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            ...(catalogProductId
              ? { product: catalogProductId }
              : {
                  product_data: {
                    name: `SEO straipsnių kreditai (${credits} vnt.)`,
                    description: productDescription,
                  },
                }),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: `${base}/pricing?checkout=cancel`,
      metadata,
      client_reference_id: clientReferenceId,
    });

    if (!checkout.url) {
      return NextResponse.json({ error: "Stripe negrąžino checkout URL" }, { status: 502 });
    }

    const res = NextResponse.json({ ok: true as const, url: checkout.url });
    if (anonSessionId && needsSetCookie) {
      applyGenSessionCookie(res, anonSessionId);
    }
    return res;
  } catch (e) {
    const raw = e instanceof Error ? e.message : "";
    if (raw.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json(
        { error: "Stripe raktas nesukonfigūruotas. Pridėkite STRIPE_SECRET_KEY į .env." },
        { status: 501 },
      );
    }
    return NextResponse.json({ error: publicApiErrorMessage(e) }, { status: 502 });
  }
}
