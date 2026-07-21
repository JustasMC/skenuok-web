import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TradingBotLeadForm } from "@/components/services/TradingBotLeadForm";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getRequestDictionary();
  const isLt = locale === "lt";
  const title = isLt
    ? "Trading botų ir algo kūrimas"
    : "Trading bot & algo development";
  const description = isLt
    ? "Užsakomieji MetaTrader (MT4/MT5), Interactive Brokers ir kripto biržų API botai — deterministinė logika, rizikos kontrolė, aukštas našumas."
    : "Custom MetaTrader (MT4/MT5), Interactive Brokers and crypto exchange API bots — deterministic logic, risk controls, high performance.";
  const canonical = getCanonicalPath("/services/trading-bots");

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        lt: canonical,
        en: canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      type: "website",
      locale: isLt ? siteConfig.locale : "en_US",
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
    },
  };
}

export default async function TradingBotsPage() {
  const { locale } = await getRequestDictionary();
  const isLt = locale === "lt";

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide space-y-10 py-12 sm:py-16">
          <PageIntro
            kicker={isLt ? "B2B · Algo sistemos" : "B2B · Algo systems"}
            title={
              isLt ? "Trading botų ir algo kūrimas" : "Trading bot & algo development"
            }
          >
            <p>
              {isLt
                ? "Kuriame patikimas realaus laiko prekybos automatizavimo sistemas: MT4/MT5 ekspertai, IBKR API, Binance/Bybit integracijos. Aiškūs SLA, audituojama logika, rizikos ribos — ne spekuliaciniai „juodosios dėžės“ botai."
                : "We build reliable real-time trading automation: MT4/MT5 experts, IBKR API, Binance/Bybit integrations. Clear SLAs, auditable logic, risk limits — not speculative black-box bots."}
            </p>
          </PageIntro>

          <ul className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
            <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              {isLt
                ? "Deterministinės taisyklės ir atgalinis testavimas"
                : "Deterministic rules and backtesting"}
            </li>
            <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              {isLt
                ? "API integracijos ir stebėsena"
                : "API integrations and monitoring"}
            </li>
            <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              {isLt
                ? "Biudžetas nuo 300 € iki 5000 €+"
                : "Budgets from €300 to €5000+"}
            </li>
          </ul>

          <TradingBotLeadForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
