import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  getCheckoutCustomerEmail,
  isPurchaseEmailConfigured,
  sendStripePurchaseReceiptEmail,
} from "@/lib/purchase-receipt-email";

async function sendReceiptAfterPurchase(
  session: Stripe.Checkout.Session,
  credits: number,
  opts: { generatorSessionId?: string; preferUserId?: string },
): Promise<void> {
  if (!isPurchaseEmailConfigured()) return;
  try {
    let to = getCheckoutCustomerEmail(session);
    if (opts.preferUserId) {
      const u = await prisma.user.findUnique({ where: { id: opts.preferUserId }, select: { email: true } });
      if (u?.email?.trim()) to = u.email.trim().toLowerCase();
    }
    if (!to) return;
    await sendStripePurchaseReceiptEmail({
      to,
      credits,
      generatorSessionId: opts.generatorSessionId,
    });
  } catch (e) {
    console.error("[stripe checkout credits] purchase email failed", e);
  }
}

export type ApplyCheckoutCreditsResult =
  | { ok: true; applied: boolean; credits: number; reason?: string }
  | { ok: false; credits: number; reason: string };

/**
 * Įskaito kreditus pagal Checkout sesiją (tas pats kaip webhook).
 * Idempotentiškai: StripeProcessedEvent.id = checkout Session.id (cs_…).
 */
export async function applyCheckoutSessionCreditsIfPaid(
  session: Stripe.Checkout.Session,
  opts?: { stripeEventId?: string },
): Promise<ApplyCheckoutCreditsResult> {
  if (session.status !== "complete") {
    return { ok: false, credits: 0, reason: "session_not_complete" };
  }
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return { ok: false, credits: 0, reason: "not_paid" };
  }

  const credits = Number.parseInt(session.metadata?.credits ?? "0", 10);
  const userId = session.metadata?.userId;
  const gid = session.metadata?.generatorSessionId;

  if (credits <= 0) {
    return { ok: false, credits: 0, reason: "bad_credits_metadata" };
  }

  const processedId = session.id;

  const existing = await prisma.stripeProcessedEvent.findUnique({ where: { id: processedId } });
  if (existing) {
    return { ok: true, applied: false, credits, reason: "already_processed" };
  }

  const metaBase = JSON.stringify({
    checkoutSessionId: session.id,
    paymentStatus: session.payment_status,
    credits,
    ...(opts?.stripeEventId ? { stripeEventId: opts.stripeEventId } : { appliedVia: "checkout_sync" }),
  });

  try {
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { ok: false, credits: 0, reason: "user_not_found" };
      }

      await prisma.$transaction([
        prisma.stripeProcessedEvent.create({ data: { id: processedId } }),
        prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: credits } },
        }),
        prisma.creditLedgerEntry.create({
          data: {
            userId,
            delta: credits,
            reason: "stripe_checkout",
            meta: metaBase,
          },
        }),
      ]);

      void sendReceiptAfterPurchase(session, credits, { preferUserId: userId });
      return { ok: true, applied: true, credits };
    }

    if (gid) {
      const gen = await prisma.generatorSession.findUnique({ where: { id: gid } });
      if (!gen) {
        return { ok: false, credits: 0, reason: "generator_session_not_found" };
      }

      if (gen.mergedIntoUserId) {
        await prisma.$transaction([
          prisma.stripeProcessedEvent.create({ data: { id: processedId } }),
          prisma.user.update({
            where: { id: gen.mergedIntoUserId },
            data: { credits: { increment: credits } },
          }),
          prisma.creditLedgerEntry.create({
            data: {
              userId: gen.mergedIntoUserId,
              delta: credits,
              reason: "stripe_checkout",
              meta: metaBase,
            },
          }),
        ]);

        void sendReceiptAfterPurchase(session, credits, { preferUserId: gen.mergedIntoUserId });
        return { ok: true, applied: true, credits };
      }

      await prisma.$transaction([
        prisma.stripeProcessedEvent.create({ data: { id: processedId } }),
        prisma.generatorSession.update({
          where: { id: gid },
          data: { credits: { increment: credits } },
        }),
        prisma.creditLedgerEntry.create({
          data: {
            generatorSessionId: gid,
            delta: credits,
            reason: "stripe_checkout",
            meta: metaBase,
          },
        }),
      ]);

      void sendReceiptAfterPurchase(session, credits, { generatorSessionId: gid });
      return { ok: true, applied: true, credits };
    }

    return { ok: false, credits: 0, reason: "no_user_or_session_metadata" };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: true, applied: false, credits, reason: "already_processed" };
    }
    throw e;
  }
}
