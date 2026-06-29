"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { ClaimSessionCredits } from "@/components/dashboard/ClaimSessionCredits";
import { CreditLedgerTable } from "@/components/dashboard/CreditLedgerTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AgentChatPanel = dynamic(
  () => import("@/components/dashboard/AgentChatPanel").then((m) => m.AgentChatPanel),
  {
    loading: () => (
      <div className="site-skeleton min-h-[420px] rounded-2xl" role="status" aria-live="polite">
        Kraunama agento panelė…
      </div>
    ),
  },
);

const quickLinks = [
  { href: "/irankiai/seo-generatorius", label: "SEO generatorius", desc: "AI turinys pagal raktinius žodžius" },
  { href: "/tools/scanner", label: "URL skaneris", desc: "Lighthouse ir techninė SEO analizė" },
  { href: "/tools/course-scanner", label: "Kursų skaneris", desc: "Kursų kokybės ir pasitikėjimo vertinimas" },
  { href: "/pricing", label: "Kreditai ir planai", desc: "Papildykite balansą per Stripe" },
] as const;

function formatLtCredits(n: number): string {
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  const mod10 = abs % 10;
  let word: string;
  if (mod10 === 1 && mod100 !== 11) word = "kreditas";
  else if (mod10 >= 2 && mod10 <= 9 && (mod100 < 12 || mod100 > 19)) word = "kreditai";
  else word = "kreditų";
  return `${n} ${word}`;
}

type Props = {
  userName: string | null;
  userEmail: string | null;
};

export function DashboardWorkspace({ userName, userEmail }: Props) {
  const [credits, setCredits] = useState<number | null>(null);

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

  const displayName = userName?.trim() || userEmail?.split("@")[0] || "Vartotojas";

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="site-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-electric)]">Darbo vieta</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Sveiki, {displayName}</h1>
            {userEmail ? <p className="text-sm text-zinc-400">{userEmail}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="rounded-xl border border-[color-mix(in_oklab,var(--color-lime)_35%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-lime)_8%,transparent)] px-5 py-3 text-center"
              role="status"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Likutis</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--color-lime)]">
                {credits == null ? "…" : formatLtCredits(credits)}
              </p>
            </div>
            <Link
              href="/pricing#prenumerata"
              className="rounded-xl bg-[var(--color-electric)] px-5 py-3 text-sm font-semibold text-[#041014] transition hover:bg-[var(--color-electric-dim)]"
            >
              Papildyti kreditus
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
            Kraunama…
          </div>
        }
      >
        <ClaimSessionCredits />
      </Suspense>

      <AgentChatPanel />

      <Card>
        <CardHeader>
          <CardTitle>Kreditų žurnalas</CardTitle>
          <CardDescription>Paskutiniai papildymai ir nurašymai — skaidrumas jūsų paskyroje.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreditLedgerTable />
        </CardContent>
      </Card>
    </div>
  );
}
