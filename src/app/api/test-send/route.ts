import { Resend } from "resend";
import { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/api-errors";
import { assertContactRateLimit, getRateLimitClientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TO = "pagalba@skenuok.com" as const;
const SUBJECT = "Testas iš skenuok.com";
const BODY = "Sveikas, Justai! Jei gavai šį laišką, tavo pašto sistema veikia puikiai.";

/** Resend sandbox; set RESEND_FROM_EMAIL for a verified domain (e.g. info@skenuok.com). */
function resolveFrom(): string {
  const configured = process.env.RESEND_FROM_EMAIL?.trim();
  if (configured) return configured;
  return "onboarding@resend.dev";
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Nesukonfigūruotas RESEND_API_KEY. Pridėkite raktą į aplinkos kintamuosius." },
      { status: 503 },
    );
  }

  const clientKey = getRateLimitClientKey(req);
  const rate = assertContactRateLimit(clientKey);
  if (!rate.ok) {
    return NextResponse.json(
      {
        error: "Per daug užklausų iš šio tinklo. Palaukite ir bandykite vėliau.",
        retryAfterSec: rate.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  const from = resolveFrom();

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [TO],
      subject: SUBJECT,
      text: BODY,
    });

    if (error) {
      console.error("[api:test-send] Resend error", error);
      return NextResponse.json(
        { error: "Resend atmetė užklausą. Patikrinkite RESEND_FROM_EMAIL ir domeno patvirtinimą." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (e) {
    return jsonApiError("test-send", e);
  }
}
