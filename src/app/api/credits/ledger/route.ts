import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Prisijungusio vartotojo kreditų žurnalas (Stripe papildymai, kursų skaneris ir kt.). */
export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Reikalingas prisijungimas." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "40", 10) || 40));

  try {
    const rows = await prisma.creditLedgerEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        delta: true,
        reason: true,
        meta: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ entries: rows });
  } catch (e) {
    console.error("[credits/ledger]", e);
    return NextResponse.json(
      {
        entries: [],
        degraded: true as const,
        hint: "Duomenų bazės lentelė nepasiekiama arba schemą reikia atnaujinti (pvz. npx prisma db push).",
      },
      { status: 200 },
    );
  }
}
