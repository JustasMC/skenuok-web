import type { ContactPayload } from "@/lib/contact-schema";
import { sendLeadSummaryToPagalba } from "@/lib/email-resend";
import { prisma } from "@/lib/prisma";

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

/** Bendras kelias: kontaktų forma ir AI chat įrankis. */
export async function createLeadAndNotify(data: ContactPayload, source: "contact_form" | "chat_bot") {
  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      company: data.company ?? null,
      service: data.service ?? null,
      message:
        source === "chat_bot"
          ? `[Chat bot] ${data.message}`
          : data.message,
    },
  });

  const summary = [
    `<b>${lead.name}</b>`,
    lead.email,
    lead.company ? `Įmonė: ${lead.company}` : null,
    lead.service ? `Paslauga: ${lead.service}` : null,
    source === "chat_bot" ? "<i>Šaltinis: AI chat</i>" : null,
    "",
    lead.message.replace(/^\[Chat bot\]\s*/i, ""),
  ]
    .filter(Boolean)
    .join("\n");

  const plain = summary.replace(/<[^>]+>/g, "");

  void Promise.allSettled([
    notifyDiscord(plain),
    notifyTelegram(summary),
    sendLeadSummaryToPagalba(plain),
    notifyGenericWebhook({
      type: "lead",
      source,
      id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      service: lead.service,
      message: lead.message,
      createdAt: lead.createdAt.toISOString(),
    }),
  ]);

  return { id: lead.id };
}
