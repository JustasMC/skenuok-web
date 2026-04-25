import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Reikalingas prisijungimas." }, { status: 401 });
  }

  try {
    const conversations = await prisma.agentConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: {
        id: true,
        title: true,
        updatedAt: true,
        createdAt: true,
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title ?? "Naujas pokalbis",
        updatedAt: c.updatedAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
        messageCount: c._count.messages,
      })),
    });
  } catch (e) {
    return jsonApiError("agent/conversations", e);
  }
}

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Reikalingas prisijungimas." }, { status: 401 });
  }

  try {
    const conv = await prisma.agentConversation.create({
      data: { userId },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ id: conv.id, createdAt: conv.createdAt.toISOString() });
  } catch (e) {
    return jsonApiError("agent/conversations", e);
  }
}
