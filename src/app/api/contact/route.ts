import { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/api-errors";
import { contactPayloadSchema } from "@/lib/contact-schema";
import { createLeadAndNotify } from "@/lib/lead-actions";
import { assertContactRateLimit, getRateLimitClientKey } from "@/lib/rate-limit";

type JsonBody = Record<string, unknown>;

export async function POST(req: Request) {
  let raw: JsonBody;
  try {
    raw = (await req.json()) as JsonBody;
  } catch {
    return NextResponse.json({ error: "Neteisingas JSON" }, { status: 400 });
  }

  const honeypot = typeof raw.website === "string" ? raw.website.trim() : "";
  if (honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
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

  const normalized = {
    name: typeof raw.name === "string" ? raw.name.trim() : "",
    email: typeof raw.email === "string" ? raw.email.trim() : "",
    company:
      typeof raw.company === "string" && raw.company.trim().length > 0 ? raw.company.trim() : undefined,
    service:
      typeof raw.service === "string" && raw.service.trim().length > 0 ? raw.service.trim() : undefined,
    message: typeof raw.message === "string" ? raw.message.trim() : "",
  };

  const parsed = contactPayloadSchema.safeParse(normalized);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const firstMessage = (Object.values(flat).flat()[0] as string | undefined) ?? "Patikrinkite įvestus duomenis";
    return NextResponse.json({ error: firstMessage }, { status: 422 });
  }

  try {
    const lead = await createLeadAndNotify(parsed.data, "contact_form");
    return NextResponse.json({ ok: true, id: lead.id });
  } catch (e) {
    return jsonApiError("contact", e);
  }
}
