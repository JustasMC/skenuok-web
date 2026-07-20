"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AgentChatPanelLoading } from "@/components/dashboard/DashboardLoading";
import { ClaimSessionCredits } from "@/components/dashboard/ClaimSessionCredits";
import { CreditLedgerTable } from "@/components/dashboard/CreditLedgerTable";
import { useDict, useLocale } from "@/components/i18n/LocaleProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AgentChatPanel = dynamic(
  () => import("@/components/dashboard/AgentChatPanel").then((m) => m.AgentChatPanel),
  {
    loading: () => <AgentChatPanelLoading />,
  },
);

function formatCredits(
  n: number,
  labels: { one: string; few: string; many: string },
  locale: string,
): string {
  if (locale === "en") {
    return `${n} ${n === 1 ? labels.one : labels.few}`;
  }
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  const mod10 = abs % 10;
  let word: string;
  if (mod10 === 1 && mod100 !== 11) word = labels.one;
  else if (mod10 >= 2 && mod10 <= 9 && (mod100 < 12 || mod100 > 19)) word = labels.few;
  else word = labels.many;
  return `${n} ${word}`;
}

type Props = {
  userName: string | null;
  userEmail: string | null;
};

export function DashboardWorkspace({ userName, userEmail }: Props) {
  const { locale } = useLocale();
  const t = useDict().dashboard;
  const [credits, setCredits] = useState<number | null>(null);

  const quickLinks = useMemo(
    () =>
      [
        { href: "/irankiai/seo-generatorius", ...t.quickLinks.seoGenerator },
        { href: "/tools/scanner", ...t.quickLinks.urlScanner },
        { href: "/tools/course-scanner", ...t.quickLinks.courseScanner },
        { href: "/pricing", ...t.quickLinks.pricing },
      ] as const,
    [t.quickLinks],
  );

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/session", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { credits?: number } | null) => {
        if (!cancelled && d && typeof d.credits === "number") setCredits(d.credits);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = userName?.trim() || userEmail?.split("@")[0] || t.defaultUser;
  const creditLabels = { one: t.creditsOne, few: t.creditsFew, many: t.creditsMany };

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="site-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-electric)]">{t.badge}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t.greeting.replace("{name}", displayName)}
            </h1>
            {userEmail ? <p className="text-sm text-zinc-400">{userEmail}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="rounded-xl border border-[color-mix(in_oklab,var(--color-lime)_35%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-lime)_8%,transparent)] px-5 py-3 text-center"
              role="status"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{t.balance}</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--color-lime)]">
                {credits == null ? "…" : formatCredits(credits, creditLabels, locale)}
              </p>
            </div>
            <Link
              href="/pricing#prenumerata"
              className="rounded-xl bg-[var(--color-electric)] px-5 py-3 text-sm font-semibold text-[#041014] transition hover:bg-[var(--color-electric-dim)]"
            >
              {t.topUp}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_80%,transparent)] p-4 transition hover:border-[color-mix(in_oklab,var(--color-electric)_45%,var(--color-border))] hover:shadow-[0_0_24px_color-mix(in_oklab,var(--color-electric)_12%,transparent)]"
          >
            <p className="text-sm font-semibold text-white group-hover:text-[var(--color-electric)]">{link.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{link.desc}</p>
          </Link>
        ))}
      </section>

      <Suspense
        fallback={
          <div className="site-skeleton h-28 rounded-xl" role="status">
            {t.creditLedger.loading}
          </div>
        }
      >
        <ClaimSessionCredits />
      </Suspense>

      <AgentChatPanel />

      <Card>
        <CardHeader>
          <CardTitle>{t.ledger.title}</CardTitle>
          <CardDescription>{t.ledger.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <CreditLedgerTable />
        </CardContent>
      </Card>
    </div>
  );
}
