import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

const TO = siteConfig.contactEmail;

/**
 * Sends a plain-text notification to the inbox when RESEND_API_KEY is set.
 * Failures are logged only — callers should not block UX on email.
 */
export async function sendLeadSummaryToPagalba(plainText: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "Skenuok <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [TO],
    subject: "Naujas lead — Skenuok.com",
    text: plainText.slice(0, 100_000),
  });

  if (error) {
    console.error("[email-resend] lead notify failed", error);
  }
}
