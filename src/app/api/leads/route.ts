import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { jsonApiError } from "@/lib/api-errors";
import { createStructuredLead } from "@/lib/lead-actions";
import { structuredLeadSchema } from "@/lib/leads-schema";
import { assertContactRateLimit, getRateLimitClientKey, isSyntheticCrawler } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Neteisingas JSON" }, { status: 400 });
  }

  const honeypot = typeof raw.website === "string" ? raw.website.trim() : "";
  if (honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!isSyntheticCrawler(req)) {
    const clientKey = getRateLimitClientKey(req);
    const rate = assertContactRateLimit(`leads:${clientKey}`);
    if (!rate.ok) {
      return NextResponse.json(
        {
          error: "Per daug užklausų. Palaukite ir bandykite vėliau.",
          retryAfterSec: rate.retryAfterSec,
        },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
      );
    }
  }

  const parsed = structuredLeadSchema.safeParse({
    name: typeof raw.name === "string" ? raw.name.trim() : "",
    email: typeof raw.email === "string" ? raw.email.trim() : "",
    company:
      typeof raw.company === "string" && raw.company.trim() ? raw.company.trim() : undefined,
    message: typeof raw.message === "string" ? raw.message.trim() : "",
    type: raw.type,
    service:
      typeof raw.service === "string" && raw.service.trim() ? raw.service.trim() : undefined,
    estimatedValue:
      typeof raw.estimatedValue === "number"
        ? raw.estimatedValue
        : typeof raw.estimatedValue === "string" && raw.estimatedValue
          ? Number(raw.estimatedValue)
          : undefined,
    details: raw.details && typeof raw.details === "object" ? raw.details : undefined,
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const firstMessage =
      (Object.values(flat).flat()[0] as string | undefined) ?? "Patikrinkite įvestus duomenis";
    return NextResponse.json({ error: firstMessage }, { status: 422 });
  }

  try {
    const session = await auth();
    const source =
      parsed.data.type === "trading_bot"
        ? ("trading_bots" as const)
        : parsed.data.type === "web_dev"
          ? ("web_dev" as const)
          : ("leads_api" as const);

    const lead = await createStructuredLead(parsed.data, {
      userId: session?.user?.id ?? null,
      source,
    });

    return NextResponse.json({
      ok: true,
      id: lead.id,
      emailSent: lead.emailNotify.ok,
    });
  } catch (e) {
    return jsonApiError("leads", e);
  }
}
