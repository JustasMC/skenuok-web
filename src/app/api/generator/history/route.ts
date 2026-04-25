import { auth } from "@/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const authSession = await auth();
    if (authSession?.user?.id) {
      const items = await prisma.generatedContent.findMany({
        where: { userId: authSession.user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, topic: true, seoScore: true, createdAt: true },
      });
      return NextResponse.json({ items });
    }

    const jar = await cookies();
    const sid = jar.get("gen_session")?.value;
    if (!sid) {
      return NextResponse.json({ items: [] as const });
    }

    const items = await prisma.generatedContent.findMany({
      where: { sessionId: sid },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, topic: true, seoScore: true, createdAt: true },
    });

    return NextResponse.json({ items });
  } catch (e) {
    return jsonApiError("generator/history", e);
  }
}
