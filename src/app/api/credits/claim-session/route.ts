import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonApiError } from "@/lib/api-errors";
import { mergeGeneratorSessionIntoUser } from "@/lib/auth-merge";
import { prisma } from "@/lib/prisma";
import { assertContactRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  sessionId: z.string().trim().min(12, "Per trumpas ID").max(48, "Per ilgas ID"),
});

/**
 * Rankinis anoniminės GeneratorSession suliejimas su prisijungusia paskyra
 * (kai nėra gen_session slapuko – kitas įrenginys ar naršyklė).
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Reikalingas prisijungimas." }, { status: 401 });
  }

  const limited = assertContactRateLimit(`claim-session:${userId}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Per daug bandymų. Palaukite ir bandykite vėliau.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Neteisingas JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.sessionId?.[0] ?? "Neteisingas sesijos ID";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const sid = parsed.data.sessionId;

  try {
    const gen = await prisma.generatorSession.findUnique({ where: { id: sid } });
    if (!gen) {
      return NextResponse.json(
        { error: "Tokio sesijos ID nerasta. Patikrinkite, ar nukopijavote visą eilutę." },
        { status: 404 },
      );
    }

    if (gen.mergedIntoUserId) {
      return NextResponse.json(
        { error: "Ši sesija jau buvo sulietą su paskyra. Jei reikia pagalbos – rašykite palaikymui." },
        { status: 409 },
      );
    }

    const merge = await mergeGeneratorSessionIntoUser(userId, sid);
    if (!merge.merged) {
      return NextResponse.json({ error: "Nepavyko perkelti kreditų. Bandykite vėliau." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return NextResponse.json({
      ok: true as const,
      creditsTransferred: merge.creditsTransferred,
      creditsLeft: user?.credits ?? 0,
    });
  } catch (e) {
    return jsonApiError("credits/claim-session", e);
  }
}
