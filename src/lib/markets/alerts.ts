import { Prisma } from "@prisma/client";
import { escapeHtml, notifyTelegram } from "@/lib/notify";
import { prisma } from "@/lib/prisma";

export type AlertSource = "engine" | "tradingview" | "cron";

export async function recentAlertExists(
  symbol: string,
  title: string,
  withinMs = 30 * 60 * 1000,
): Promise<boolean> {
  const since = new Date(Date.now() - withinMs);
  const found = await prisma.marketAlert.findFirst({
    where: { symbol, title, createdAt: { gte: since } },
    select: { id: true },
  });
  return Boolean(found);
}

export async function createMarketAlert(input: {
  source: AlertSource;
  symbol: string;
  interval?: string | null;
  title: string;
  message: string;
  severity?: string;
  payload?: Prisma.InputJsonValue;
  notify?: boolean;
}) {
  const alert = await prisma.marketAlert.create({
    data: {
      source: input.source,
      symbol: input.symbol.toUpperCase(),
      interval: input.interval ?? null,
      title: input.title,
      message: input.message,
      severity: input.severity ?? "info",
      payload: input.payload ?? undefined,
    },
  });

  if (input.notify !== false) {
    const html = [
      `<b>${escapeHtml(input.title)}</b>`,
      `Symbol: ${escapeHtml(input.symbol.toUpperCase())}`,
      input.interval ? `TF: ${escapeHtml(input.interval)}` : null,
      `Source: ${escapeHtml(input.source)}`,
      "",
      escapeHtml(input.message).slice(0, 3500),
    ]
      .filter(Boolean)
      .join("\n");
    void notifyTelegram(html).catch(() => {});
  }

  return alert;
}

export async function listRecentAlerts(limit = 30) {
  return prisma.marketAlert.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
  });
}
