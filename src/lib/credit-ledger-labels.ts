/** Vartotojo sąsajai – reason kodai iš CreditLedgerEntry */
export function creditLedgerReasonLt(reason: string | null | undefined): string {
  if (reason == null || reason === "") return "—";
  switch (reason) {
    case "stripe_checkout":
      return "Kreditų papildymas (Stripe)";
    case "course_quality_scan":
      return "Kursų kokybės skaneris";
    case "generator_session_merge":
      return "Anoniminės sesijos kreditai";
    default:
      return reason;
  }
}
