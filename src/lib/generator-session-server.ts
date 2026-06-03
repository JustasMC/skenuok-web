import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Ensures a GeneratorSession exists and returns its id.
 * If a new session is created, caller should set `gen_session` cookie on the response.
 */
export async function resolveGeneratorSessionId(): Promise<{
  sessionId: string;
  needsSetCookie: boolean;
}> {
  const jar = await cookies();
  const existing = jar.get("gen_session")?.value;
  if (existing) {
    const row = await prisma.generatorSession.findUnique({ where: { id: existing } });
    if (row) return { sessionId: row.id, needsSetCookie: false };
  }

  const created = await prisma.generatorSession.create({ data: { credits: 3 } });
  return { sessionId: created.id, needsSetCookie: true };
}

export function applyGenSessionCookie(res: NextResponse, sessionId: string) {
  res.cookies.set("gen_session", sessionId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
