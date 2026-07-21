import type { Dictionary } from "@/lib/i18n/get-dictionary";

type CreditReasons = Dictionary["dashboard"]["creditLedger"]["reasons"];

/** User-facing reason codes from CreditLedgerEntry */
export function creditLedgerReason(
  reason: string | null | undefined,
  reasons: CreditReasons,
): string {
  if (reason == null || reason === "") return "—";
  switch (reason) {
    case "stripe_checkout":
      return reasons.stripe_checkout;
    case "course_quality_scan":
      return reasons.course_quality_scan;
    case "niche_scan":
      return reasons.niche_scan;
    case "generator_session_merge":
      return reasons.generator_session_merge;
    case "signup_bonus":
      return reasons.signup_bonus;
    default:
      return reason;
  }
}

/** @deprecated Use creditLedgerReason with dict.dashboard.creditLedger.reasons */
export function creditLedgerReasonLt(reason: string | null | undefined): string {
  return creditLedgerReason(reason, {
    stripe_checkout: "Kreditų papildymas (Stripe)",
    course_quality_scan: "Kursų kokybės skaneris",
    niche_scan: "AI nišinis skaneris",
    generator_session_merge: "Anoniminės sesijos kreditai",
    signup_bonus: "Dovanų kreditai už registraciją",
  });
}
