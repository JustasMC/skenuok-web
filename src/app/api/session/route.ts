import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { jsonApiError } from "@/lib/api-errors";
import { applyGenSessionCookie, resolveGeneratorSessionId } from "@/lib/generator-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const jar = await cookies();
    const authSession = await auth();

    let mergeFlash: { credits: number } | null = null;
    const rawFlash = jar.get("auth_merge_flash")?.value;
    if (rawFlash) {
      try {
        mergeFlash = JSON.parse(rawFlash) as { credits: number };
      } catch {
        mergeFlash = null;
      }
    }

    const clearFlash = (res: NextResponse) => {
      if (rawFlash) {
        res.cookies.delete("auth_merge_flash");
      }
    };

    if (authSession?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: authSession.user.id },
        select: { credits: true, email: true, name: true },
      });
      if (!user) {
        return NextResponse.json(
          { error: "Paskyra nerasta. Atsijunkite ir prisijunkite iš naujo." },
          { status: 401 },
        );
      }

      const res = NextResponse.json({
        credits: user.credits,
        sessionId: null,
        user: { email: user.email, name: user.name },
        mergeFlash,
        mode: "user" as const,
      });
      clearFlash(res);
      return res;
    }

    const { sessionId, needsSetCookie } = await resolveGeneratorSessionId();
    const row = await prisma.generatorSession.findUnique({ where: { id: sessionId } });
    if (!row) {
      return NextResponse.json(
        {
          error: "Nepavyko sukurti naršyklės sesijos. Perkraukite puslapį arba išvalykite slapukus šiai svetainei.",
        },
        { status: 503 },
      );
    }

    const res = NextResponse.json({
      credits: row.credits,
      sessionId: row.id,
      user: null,
      mergeFlash,
      mode: "session" as const,
    });
    if (needsSetCookie) {
      applyGenSessionCookie(res, sessionId);
    }
    clearFlash(res);
    return res;
  } catch (e) {
    return jsonApiError("session", e, 503);
  }
}
