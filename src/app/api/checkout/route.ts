import { NextResponse } from "next/server";
import { publicApiErrorMessage } from "@/lib/api-errors";
import { auth } from "@/auth";
import { applyGenSessionCookie, resolveGeneratorSessionId } from "@/lib/generator-session-server";
import { getSiteBaseUrl, getStripe } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Pack = "5" | "20";

function parsePack(body: unknown): Pack {
  if (!body || typeof body !== "object") return "20";
  const key = (body as { priceKey?: unknown }).priceKey;
  if (key === "5" || key === 5) return "5";
  return "20";
}

/**
 * Stripe Checkout: line_items turi naudoti katalogo Price ID (price_...), ne prod_.
 * POST JSON: { "priceKey": "5" | "20" } — atitinka 5 € ir 20 € planus (žr. .env.example).
 */
export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const base = getSiteBaseUrl().replace(/\/+$/, "");

    let body: unknown = {};
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: "Neteisingas JSON kūnas" }, { status: 400 });
      }
    }

    const pack = parsePack(body);

    const priceId5 = process.env.STRIPE_PRICE_ID_5_EUR?.trim() ?? "";
    const priceId20 =
      process.env.STRIPE_PRICE_ID_20_EUR?.trim() ||
      process.env.STRIPE_PRICE_ID?.trim() ||
      "";

    const stripePriceId = pack === "5" ? priceId5 : priceId20;

    if (!stripePriceId.startsWith("price_")) {
      return NextResponse.json(
        {
          error: "Missing Price ID",
          detail:
            pack === "5"
              ? "Trūksta STRIPE_PRICE_ID_5_EUR (turi prasidėti price_)."
              : "Trūksta STRIPE_PRICE_ID_20_EUR arba STRIPE_PRICE_ID (turi prasidėti price_).",
        },
        { status: 501 },
      );
    }

    const credits =
      pack === "5"
        ? Math.max(1, Number.parseInt(process.env.STRIPE_CREDITS_5_EUR ?? process.env.STRIPE_CREDITS_PER_PURCHASE ?? "10", 10))
        : Math.max(
            1,
            Number.parseInt(
              process.env.STRIPE_CREDITS_20_EUR ?? process.env.STRIPE_CREDITS_PER_PURCHASE ?? "50",
              10,
            ),
          );

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
        pack,
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
        pack,
      };
      clientReferenceId = resolved.sessionId;
    }

    const explicitSuccess = process.env.STRIPE_CHECKOUT_SUCCESS_URL?.trim();
    const successPath = (process.env.STRIPE_CHECKOUT_SUCCESS_PATH?.trim() || "/success").replace(/\/+$/, "") || "/success";
    const successBase = explicitSuccess
      ? explicitSuccess.replace(/\/+$/, "")
      : `${base}${successPath.startsWith("/") ? successPath : `/${successPath}`}`;
    const successUrl = `${successBase}?session_id={CHECKOUT_SESSION_ID}${
      !authSession?.user?.id && anonSessionId
        ? `&gen_session_hint=${encodeURIComponent(anonSessionId)}`
        : ""
    }`;

    console.log("[stripe checkout] creating session", {
      pack,
      stripePriceId,
      successUrl,
      cancelUrl: `${base}/pricing?checkout=cancel`,
      hasUser: Boolean(authSession?.user?.id),
    });

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: stripePriceId, quantity: 1 }],
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
  } catch (error) {
    console.error("[stripe checkout] failed", error);
    const raw = error instanceof Error ? error.message : "";
    if (raw.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json(
        { error: "Stripe raktas nesukonfigūruotas. Pridėkite STRIPE_SECRET_KEY į .env." },
        { status: 501 },
      );
    }
    return NextResponse.json(
      { error: "Serverio klaida", detail: publicApiErrorMessage(error) },
      { status: 502 },
    );
  }
}
