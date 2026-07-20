import { prisma } from "@/lib/prisma";

const SIGNUP_BONUS_REASON = "signup_bonus";

export function signupBonusCredits(): number {
  const n = Number.parseInt(process.env.SIGNUP_BONUS_CREDITS ?? "3", 10);
  if (!Number.isFinite(n) || n <= 0) return 3;
  return Math.min(n, 50);
}

export type SignupBonusResult =
  | { granted: true; amount: number }
  | { granted: false; amount: 0; reason: "already_granted" | "disabled" | "no_user" };

/**
 * One-time welcome credits for a user (ledger reason signup_bonus).
 * Safe to call on every signIn — idempotent via ledger check.
 */
export async function grantSignupBonusIfEligible(userId: string): Promise<SignupBonusResult> {
  const amount = signupBonusCredits();
  if (amount <= 0) {
    return { granted: false, amount: 0, reason: "disabled" };
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.creditLedgerEntry.findFirst({
      where: { userId, reason: SIGNUP_BONUS_REASON },
      select: { id: true },
    });
    if (existing) {
      return { granted: false, amount: 0, reason: "already_granted" };
    }

    const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      return { granted: false, amount: 0, reason: "no_user" };
    }

    await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });
    await tx.creditLedgerEntry.create({
      data: {
        userId,
        delta: amount,
        reason: SIGNUP_BONUS_REASON,
        meta: JSON.stringify({ via: "signup_bonus", amount }),
      },
    });

    return { granted: true, amount };
  });
}
