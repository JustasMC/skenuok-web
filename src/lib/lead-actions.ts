import type { ContactPayload } from "@/lib/contact-schema";
import type { StructuredLeadPayload } from "@/lib/leads-schema";
import { sendLeadSummaryToPagalba } from "@/lib/email-resend";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/** Escape HTML special characters to prevent XSS attacks */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

async function notifyDiscord(content: string) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "Naujas lead",
          description: content.slice(0, 4000),
          color: 0x00d4ff,
        },
      ],
    }),
  });
}

async function notifyGenericWebhook(payload: Record<string, unknown>) {
  const url = process.env.CONTACT_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

type LeadCreateInput = {
  name: string;
  email: string;
  company?: string | null;
  message: string;
  service?: string | null;
  type?: string;
  status?: string;
  details?: Prisma.InputJsonValue;
  estimatedValue?: number | null;
  userId?: string | null;
  source: "contact_form" | "chat_bot" | "trading_bots" | "web_dev" | "leads_api";
};

async function persistAndNotify(data: LeadCreateInput) {
  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      company: data.company ?? null,
      service: data.service ?? null,
      message: data.message,
      type: data.type ?? "contact",
      status: data.status ?? "pending",
      details: data.details ?? undefined,
      estimatedValue:
        data.estimatedValue != null ? new Prisma.Decimal(data.estimatedValue) : undefined,
      userId: data.userId ?? null,
    },
  });

  const summary = [
    `<b>${escapeHtml(lead.name)}</b>`,
    escapeHtml(lead.email),
    lead.company ? `Įmonė: ${escapeHtml(lead.company)}` : null,
    lead.service ? `Paslauga: ${escapeHtml(lead.service)}` : null,
    lead.type ? `Tipas: ${escapeHtml(lead.type)}` : null,
    lead.estimatedValue != null ? `Vertė: ${escapeHtml(String(lead.estimatedValue))}` : null,
    data.source === "chat_bot" ? "<i>Šaltinis: AI chat</i>" : null,
    data.source === "trading_bots" ? "<i>Šaltinis: Trading bots forma</i>" : null,
    "",
    escapeHtml(lead.message.replace(/^\[Chat bot\]\s*/i, "")),
  ]
    .filter(Boolean)
    .join("\n");

  const plain = summary.replace(/<[^>]+>/g, "");

  const emailResult = await sendLeadSummaryToPagalba(plain);

  void Promise.allSettled([
    notifyDiscord(plain),
    notifyTelegram(summary),
    notifyGenericWebhook({
      type: "lead",
      source: data.source,
      id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      service: lead.service,
      leadType: lead.type,
      status: lead.status,
      estimatedValue: lead.estimatedValue != null ? Number(lead.estimatedValue) : null,
      details: lead.details,
      message: lead.message,
      createdAt: lead.createdAt.toISOString(),
      emailNotify: emailResult,
    }),
  ]);

  return { id: lead.id, emailNotify: emailResult };
}

/** Bendras kelias: kontaktų forma ir AI chat įrankis. */
export async function createLeadAndNotify(
  data: ContactPayload,
  source: "contact_form" | "chat_bot",
) {
  return persistAndNotify({
    name: data.name,
    email: data.email,
    company: data.company,
    service: data.service,
    message:
      source === "chat_bot" ? `[Chat bot] ${data.message}` : data.message,
    type: "contact",
    source,
  });
}

/** Structured B2B leads (trading bots, web-dev, SEO). */
export async function createStructuredLead(
  data: StructuredLeadPayload,
  opts?: { userId?: string | null; source?: LeadCreateInput["source"] },
) {
  return persistAndNotify({
    name: data.name,
    email: data.email,
    company: data.company,
    service: data.service ?? data.type,
    message: data.message,
    type: data.type,
    details: data.details as Prisma.InputJsonValue | undefined,
    estimatedValue: data.estimatedValue,
    userId: opts?.userId ?? null,
    source: opts?.source ?? "leads_api",
  });
}
