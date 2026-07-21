import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  category: z.string().trim().min(1).max(80),
  productSlug: z.string().trim().max(120).optional().nullable(),
  locale: z.string().trim().max(8).optional().nullable(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Neteisingas JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neteisingi duomenys" }, { status: 422 });
  }

  try {
    await prisma.affiliateClick.create({
      data: {
        category: parsed.data.category,
        productSlug: parsed.data.productSlug ?? null,
        locale: parsed.data.locale ?? null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Tracking must not break UX
    return NextResponse.json({ ok: true });
  }
}
