import { auth } from "@/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonApiError, publicApiErrorMessage } from "@/lib/api-errors";
import { generateSeoArticleHtml } from "@/lib/article-openai";
import { prisma } from "@/lib/prisma";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";
import { scoreSeoHtml } from "@/lib/seo-score";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  topic: z.string().trim().min(3, "Per trumpa tema").max(360, "Per ilga tema"),
  /** URL skanerio siteTopic – niša */
  context: z.string().trim().max(400).optional(),
  /** URL skanerio siteDescription – tonas / veikla */
  tone: z.string().trim().max(650).optional(),
});

export async function POST(req: Request) {
  const key = getRateLimitClientKey(req);
  const lim = assertScanRateLimit(key);
  if (!lim.ok) {
    return NextResponse.json(
      { error: "Per daug generavimų. Palaukite.", retryAfterSec: lim.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(lim.retryAfterSec) } },
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
    const msg = parsed.error.flatten().fieldErrors.topic?.[0] ?? "Neteisinga tema";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const genCtx = {
    siteNiche: parsed.data.context ?? null,
    brandVoice: parsed.data.tone ?? null,
  };

  const authSession = await auth();
  if (authSession?.user?.id) {
    const uid = authSession.user.id;
    try {
      const reserved = await prisma.$transaction(async (tx) => {
        const r = await tx.user.updateMany({
          where: { id: uid, credits: { gte: 1 } },
          data: { credits: { decrement: 1 } },
        });
        return r.count === 1;
      });

      if (!reserved) {
        const u = await prisma.user.findUnique({ where: { id: uid }, select: { credits: true } });
        return NextResponse.json(
          { error: "Nėra kreditų.", needCredits: true as const, credits: u?.credits ?? 0 },
          { status: 402 },
        );
      }

      let html: string;
      try {
        html = await generateSeoArticleHtml(parsed.data.topic, genCtx);
      } catch (e) {
        await prisma.user.update({ where: { id: uid }, data: { credits: { increment: 1 } } }).catch(() => {});
        const msg = publicApiErrorMessage(e);
        return NextResponse.json({ error: msg }, { status: 502 });
      }

      const seo = scoreSeoHtml(html, parsed.data.topic);

      try {
        const [, u] = await prisma.$transaction([
          prisma.generatedContent.create({
            data: {
              userId: uid,
              topic: parsed.data.topic,
              content: html,
              seoScore: seo.score,
            },
          }),
          prisma.user.findUniqueOrThrow({ where: { id: uid }, select: { credits: true } }),
        ]);
        return NextResponse.json({
          ok: true as const,
          html,
          seo,
          creditsLeft: u.credits,
        });
      } catch (e) {
        await prisma.user.update({ where: { id: uid }, data: { credits: { increment: 1 } } }).catch(() => {});
        return jsonApiError("generate", e);
      }
    } catch (e) {
      return jsonApiError("generate", e);
    }
  }

  const jar = await cookies();
  const sid = jar.get("gen_session")?.value;
  if (!sid) {
    return NextResponse.json({ error: "Nėra sesijos. Perkraukite puslapį.", needSession: true }, { status: 401 });
  }

  try {
    const session = await prisma.generatorSession.findUnique({ where: { id: sid } });
    if (!session) {
      return NextResponse.json({ error: "Sesija nerasta. Perkraukite puslapį.", needSession: true }, { status: 401 });
    }

    if (session.mergedIntoUserId) {
      return NextResponse.json(
        {
          error: "Ši anoniminė sesija jau sulietą su paskyra. Prisijunkite, kad naudotumėte kreditus.",
          needSession: true as const,
        },
        { status: 401 },
      );
    }

    const reserved = await prisma.$transaction(async (tx) => {
      const r = await tx.generatorSession.updateMany({
        where: { id: sid, credits: { gte: 1 }, mergedIntoUserId: null },
        data: { credits: { decrement: 1 } },
      });
      return r.count === 1;
    });

    if (!reserved) {
      const row = await prisma.generatorSession.findUnique({ where: { id: sid }, select: { credits: true } });
      return NextResponse.json(
        { error: "Nėra kreditų.", needCredits: true as const, credits: row?.credits ?? 0 },
        { status: 402 },
      );
    }

    let html: string;
    try {
      html = await generateSeoArticleHtml(parsed.data.topic, genCtx);
    } catch (e) {
      await prisma.generatorSession.update({ where: { id: sid }, data: { credits: { increment: 1 } } }).catch(() => {});
      const msg = publicApiErrorMessage(e);
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const seo = scoreSeoHtml(html, parsed.data.topic);

    try {
      const [, row] = await prisma.$transaction([
        prisma.generatedContent.create({
          data: {
            sessionId: sid,
            topic: parsed.data.topic,
            content: html,
            seoScore: seo.score,
          },
        }),
        prisma.generatorSession.findUniqueOrThrow({ where: { id: sid }, select: { credits: true } }),
      ]);

      return NextResponse.json({
        ok: true as const,
        html,
        seo,
        creditsLeft: row.credits,
      });
    } catch (e) {
      await prisma.generatorSession.update({ where: { id: sid }, data: { credits: { increment: 1 } } }).catch(() => {});
      return jsonApiError("generate", e);
    }
  } catch (e) {
    return jsonApiError("generate", e);
  }
}
