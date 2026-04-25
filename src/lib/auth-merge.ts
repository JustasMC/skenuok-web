import { prisma } from "@/lib/prisma";

export type MergeResult = {
  merged: boolean;
  creditsTransferred: number;
};

/**
 * Perkelia anoniminės GeneratorSession kreditus ir istoriją į User.
 * Sesijos eilutė lieka (Stripe metadata), pažymima kaip sulietą.
 */
export async function mergeGeneratorSessionIntoUser(
  userId: string,
  generatorSessionId: string,
): Promise<MergeResult> {
  const result = await prisma.$transaction(async (tx) => {
    const gen = await tx.generatorSession.findUnique({ where: { id: generatorSessionId } });
    if (!gen) {
      return { merged: false, creditsTransferred: 0 };
    }

    if (gen.mergedIntoUserId) {
      return { merged: false, creditsTransferred: 0 };
    }

    const creditsTransferred = gen.credits;

    if (creditsTransferred > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: creditsTransferred } },
      });
      await tx.creditLedgerEntry.create({
        data: {
          userId,
          delta: creditsTransferred,
          reason: "generator_session_merge",
          meta: JSON.stringify({
            generatorSessionId,
            via: "merge",
          }),
        },
      });
    }

    await tx.generatedContent.updateMany({
      where: { sessionId: generatorSessionId },
      data: { userId, sessionId: null },
    });

    await tx.generatorSession.update({
      where: { id: generatorSessionId },
      data: {
        credits: 0,
        mergedIntoUserId: userId,
        mergedAt: new Date(),
      },
    });

    return { merged: true, creditsTransferred };
  });

  return {
    merged: result.merged,
    creditsTransferred: result.creditsTransferred,
  };
}
