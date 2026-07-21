import Link from "next/link";
import { TradingBotLeadForm } from "@/components/services/TradingBotLeadForm";
import { getRequestDictionary } from "@/lib/i18n/server";

/** High-ticket B2B block embedded under crypto/finance scanner. */
export async function CryptoB2bLeadSection() {
  const { dict } = await getRequestDictionary();
  const t = dict.nicheScan;

  return (
    <section
      id="custom-algo"
      className="scroll-mt-28 space-y-6 border-t border-[var(--color-border)]/80 pt-12"
      aria-labelledby="crypto-b2b-heading"
    >
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-electric)]">
          {t.b2bSectionKicker}
        </p>
        <h2 id="crypto-b2b-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {t.b2bSectionTitle}
        </h2>
        <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">{t.b2bSectionBody}</p>
      </div>

      <div className="rounded-2xl border border-[color-mix(in_oklab,var(--color-electric)_28%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-electric)_6%,var(--color-surface))] p-1 sm:p-1.5">
        <div className="rounded-[calc(1rem-2px)] bg-[var(--color-surface)] p-4 sm:p-5">
          <TradingBotLeadForm />
        </div>
      </div>

      <aside className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-100">{t.courseScannerLink}</p>
          <p className="mt-1 text-sm text-zinc-400">{t.courseScannerHint}</p>
        </div>
        <Link
          href="/tools/course-scanner"
          className="site-btn-secondary shrink-0 rounded-lg px-3 py-2 text-center text-sm font-semibold"
        >
          {t.courseScannerLink}
        </Link>
      </aside>
    </section>
  );
}
