import nodemailer from "nodemailer";
import type Stripe from "stripe";
import { getSiteBaseUrl } from "@/lib/stripe-server";

export function isPurchaseEmailConfigured(): boolean {
  return Boolean(
    process.env.EMAIL_SERVER_HOST &&
      process.env.EMAIL_FROM &&
      process.env.EMAIL_SERVER_USER &&
      process.env.EMAIL_SERVER_PASSWORD,
  );
}

/** Stripe Checkout surinktas el. paštas (guest arba prisijungus). */
export function getCheckoutCustomerEmail(session: Stripe.Checkout.Session): string | null {
  const fromDetails = session.customer_details?.email;
  const fromSession = session.customer_email;
  const raw =
    typeof fromDetails === "string" && fromDetails.trim()
      ? fromDetails
      : typeof fromSession === "string" && fromSession.trim()
        ? fromSession
        : null;
  return raw ? raw.trim().toLowerCase() : null;
}

/**
 * Patvirtinimo laiškas po sėkmingo mokėjimo (SMTP kaip Magic Link).
 * Nepavykus – tik logas; webhook vis tiek grąžina 200.
 */
export async function sendStripePurchaseReceiptEmail(opts: {
  to: string;
  credits: number;
  /** Jei anon. generator sesija – nuoroda su ?claim= ir ID tekste */
  generatorSessionId?: string;
}): Promise<void> {
  if (!isPurchaseEmailConfigured()) {
    return;
  }

  const base = getSiteBaseUrl();
  const claimUrl = opts.generatorSessionId
    ? `${base}/dashboard?claim=${encodeURIComponent(opts.generatorSessionId)}`
    : `${base}/dashboard`;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    secure: Number(process.env.EMAIL_SERVER_PORT ?? 587) === 465,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const hasClaim = Boolean(opts.generatorSessionId);
  const subject = `FS·AI: ${opts.credits} kreditai aktyvuoti`;

  const textLines = [
    "Sveiki,",
    "",
    `Dėkojame už pirkinį. Jūsų paskyrai pridėta ${opts.credits} kreditų.`,
    "",
    hasClaim
      ? `Jei kreditus pirkote be prisijungimo šiame įrenginyje, prisijunkite ir atidarykite darbo vietą – laukas „Pasisavinti“ gali būti užpildytas iš šios nuorodos:\n${claimUrl}`
      : `Darbo vieta: ${base}/dashboard`,
    "",
    hasClaim && opts.generatorSessionId
      ? `Sesijos ID (atsarginė kopija): ${opts.generatorSessionId}`
      : "",
    "",
    "— FS·AI",
  ].filter(Boolean);

  const html = `
    <p>Sveiki,</p>
    <p>Dėkojame už pirkinį. Jūsų paskyrai pridėta <strong>${opts.credits}</strong> kreditų.</p>
    ${
      hasClaim && opts.generatorSessionId
        ? `<p>Jei pirkote be prisijungimo, prisijunkite ir naudokite <a href="${claimUrl}">šią nuorodą į darbo vietą</a> – sesijos laukas gali būti užpildytas automatiškai.</p>
           <p style="font-size:12px;color:#666">Sesijos ID (atsarginė kopija): <code>${escapeHtml(opts.generatorSessionId)}</code></p>`
        : `<p><a href="${base}/dashboard">Atidaryti darbo vietą</a></p>`
    }
    <p style="font-size:12px;color:#888">— FS·AI</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: opts.to,
    subject,
    text: textLines.join("\n"),
    html,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
