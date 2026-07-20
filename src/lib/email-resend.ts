import nodemailer from "nodemailer";
import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

export type LeadEmailResult =
  | { ok: true; channel: "resend" | "smtp" }
  | { ok: false; reason: string };

function notifyTo(): string {
  return process.env.CONTACT_NOTIFY_EMAIL?.trim() || siteConfig.contactEmail;
}

function resendFrom(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || "Skenuok <onboarding@resend.dev>";
}

/**
 * Siunčia lead pranešimą į CONTACT_NOTIFY_EMAIL / siteConfig.contactEmail.
 * 1) Resend (jei RESEND_API_KEY)
 * 2) SMTP (jei EMAIL_SERVER_* nustatyti)
 *
 * Resend sandbox (onboarding@resend.dev) leidžia siųsti TIK į Resend paskyros el. paštą.
 * Produkcijai: patvirtinkite domeną ir nustatykite RESEND_FROM_EMAIL=Skenuok <noreply@skenuok.com>.
 */
export async function sendLeadSummaryToPagalba(plainText: string): Promise<LeadEmailResult> {
  const to = notifyTo();
  const subject = "Naujas lead — Skenuok.com";
  const text = plainText.slice(0, 100_000);
  const html = `<pre style="font-family:ui-sans-serif,system-ui,sans-serif;white-space:pre-wrap;font-size:14px;line-height:1.5">${escapeHtml(text)}</pre>`;

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const { error } = await resend.emails.send({
        from: resendFrom(),
        to: [to],
        subject,
        text,
        html,
      });
      if (error) {
        console.error("[email-resend] Resend error", error);
        // Fall through to SMTP if available
      } else {
        return { ok: true, channel: "resend" };
      }
    } catch (e) {
      console.error("[email-resend] Resend threw", e);
    }
  }

  const host = process.env.EMAIL_SERVER_HOST?.trim();
  const user = process.env.EMAIL_SERVER_USER?.trim();
  const pass = process.env.EMAIL_SERVER_PASSWORD?.trim();
  if (host && user && pass) {
    try {
      const port = Number.parseInt(process.env.EMAIL_SERVER_PORT ?? "587", 10) || 587;
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM?.trim() || user,
        to,
        subject,
        text,
        html,
      });
      return { ok: true, channel: "smtp" };
    } catch (e) {
      console.error("[email-resend] SMTP failed", e);
      return { ok: false, reason: "smtp_failed" };
    }
  }

  if (!resendKey) {
    console.warn(
      "[email-resend] Nėra RESEND_API_KEY ir SMTP — lead išsaugotas DB, bet el. laiškas nesiųstas. Nustatykite Railway Variables.",
    );
    return { ok: false, reason: "no_email_provider" };
  }

  return { ok: false, reason: "resend_failed" };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
