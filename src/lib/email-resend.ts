import nodemailer from "nodemailer";
import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

export type LeadEmailResult =
  | { ok: true; channel: "resend" | "smtp"; to: string }
  | { ok: false; reason: string; detail?: string; to: string };

function notifyTo(): string {
  return process.env.CONTACT_NOTIFY_EMAIL?.trim() || siteConfig.contactEmail;
}

function resendFrom(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!raw) return "Skenuok <onboarding@resend.dev>";
  // Allow bare email or "Name <email>"
  if (raw.includes("<") && raw.includes(">")) return raw;
  if (raw.includes("@")) return `Skenuok <${raw}>`;
  return raw;
}

/**
 * Siunčia lead pranešimą į CONTACT_NOTIFY_EMAIL / siteConfig.contactEmail.
 *
 * Resend be patvirtinto domeno (from = onboarding@resend.dev) leidžia siųsti TIK
 * į el. paštą, kuriuo užsiregistravote Resend. Kitaip API grąžina klaidą.
 */
export async function sendLeadSummaryToPagalba(plainText: string): Promise<LeadEmailResult> {
  const to = notifyTo();
  const subject = "Naujas lead — Skenuok.com";
  const text = plainText.slice(0, 100_000);
  const html = `<pre style="font-family:ui-sans-serif,system-ui,sans-serif;white-space:pre-wrap;font-size:14px;line-height:1.5">${escapeHtml(text)}</pre>`;

  const resendKey = process.env.RESEND_API_KEY?.trim();
  let lastResendDetail: string | undefined;

  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const { data, error } = await resend.emails.send({
        from: resendFrom(),
        to: [to],
        subject,
        text,
        html,
      });
      if (error) {
        lastResendDetail = formatResendError(error);
        console.error("[email-resend] Resend error", { to, from: resendFrom(), error });
      } else if (data?.id) {
        console.info("[email-resend] sent via Resend", { id: data.id, to });
        return { ok: true, channel: "resend", to };
      } else {
        lastResendDetail = "Resend grąžino tuščią atsakymą";
      }
    } catch (e) {
      lastResendDetail = e instanceof Error ? e.message : String(e);
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
      return { ok: true, channel: "smtp", to };
    } catch (e) {
      console.error("[email-resend] SMTP failed", e);
      return {
        ok: false,
        reason: "smtp_failed",
        detail: e instanceof Error ? e.message : String(e),
        to,
      };
    }
  }

  if (!resendKey) {
    return {
      ok: false,
      reason: "no_email_provider",
      detail: "Nėra RESEND_API_KEY ir SMTP (EMAIL_SERVER_*)",
      to,
    };
  }

  return {
    ok: false,
    reason: "resend_failed",
    detail:
      lastResendDetail ??
      "Resend atmetė siuntimą. Su onboarding@resend.dev galima siųsti tik į Resend paskyros el. paštą, arba patvirtinkite skenuok.com domeną.",
    to,
  };
}

function formatResendError(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);
  const e = error as { message?: string; name?: string; statusCode?: number };
  const parts = [e.name, e.message, e.statusCode != null ? `HTTP ${e.statusCode}` : null].filter(Boolean);
  return parts.join(" — ") || JSON.stringify(error);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
