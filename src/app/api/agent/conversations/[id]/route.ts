import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Reikalingas prisijungimas." }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const conv = await prisma.agentConversation.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: { id: true, role: true, content: true, metadata: true, createdAt: true },
        },
      },
    });

    if (!conv) {
      return NextResponse.json({ error: "Pokalbis nerastas." }, { status: 404 });
    }

    return NextResponse.json({
      conversation: {
        id: conv.id,
        title: conv.title,
        updatedAt: conv.updatedAt.toISOString(),
        messages: conv.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          metadata: m.metadata ?? null,
          createdAt: m.createdAt.toISOString(),
        })),
      },
    });
  } catch (e) {
    return jsonApiError("agent/conversations/[id]", e);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Reikalingas prisijungimas." }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const deleted = await prisma.agentConversation.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Pokalbis nerastas." }, { status: 404 });
    }

    return NextResponse.json({ ok: true as const });
  } catch (e) {
    return jsonApiError("agent/conversations/[id]", e);
  }
}
