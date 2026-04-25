"use client";

import { useEffect, useState } from "react";
import { creditLedgerReasonLt } from "@/lib/credit-ledger-labels";

type Entry = {
  id: string;
  delta: number;
  reason: string;
  meta: string | null;
  createdAt: string;
};

function formatMeta(meta: string | null): string {
  if (!meta) return "";
  try {
    const o = JSON.parse(meta) as Record<string, unknown>;
    if (typeof o.url === "string") return o.url;
    if (typeof o.checkoutSessionId === "string") return `Užsakymas: ${String(o.checkoutSessionId).slice(0, 20)}…`;
    if (typeof o.generatorSessionId === "string") return `Sesija: ${String(o.generatorSessionId).slice(0, 16)}…`;
    if (typeof o.stripeEventId === "string") return `Stripe: ${String(o.stripeEventId).slice(0, 28)}…`;
  } catch {
    return meta.slice(0, 80);
  }
  return "";
}

function isEntry(x: unknown): x is Entry {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.delta === "number" &&
    typeof o.reason === "string" &&
    (o.meta === null || typeof o.meta === "string") &&
    typeof o.createdAt === "string"
  );
}

export function CreditLedgerTable() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/credits/ledger?limit=30", { credentials: "include" });
        let data: unknown;
        try {
          data = await res.json();
        } catch {
          if (!cancelled) setError("Nepavyko perskaityti atsakymo.");
          return;
        }
        const obj = data as { entries?: unknown; degraded?: boolean; hint?: string };
        if (!res.ok) {
          if (!cancelled) setError(typeof obj.hint === "string" ? obj.hint : "Nepavyko įkelti žurnalo.");
          return;
        }
        const raw = obj.entries;
        const list = Array.isArray(raw) ? raw.filter(isEntry) : [];
        if (!cancelled) {
          setEntries(list);
          if (obj.degraded && typeof obj.hint === "string") setHint(obj.hint);
        }
      } catch {
        if (!cancelled) setError("Tinklo klaida.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-rose-400">{error}</p>;
  }
  if (entries === null) {
    return <p className="text-sm text-zinc-500">Kraunama…</p>;
  }
  if (entries.length === 0) {
    return (
      <div className="space-y-2">
        {hint ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">{hint}</p>
        ) : null}
        <p className="text-sm text-zinc-500">Dar nėra kreditų judėjimo įrašų.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {hint ? (
        <p className="mb-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
          {hint}
        </p>
      ) : null}
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-zinc-500">
            <th className="pb-2 pr-4 font-medium">Data</th>
            <th className="pb-2 pr-4 font-medium">Veiksmas</th>
            <th className="pb-2 pr-4 font-medium text-right">Suma</th>
            <th className="pb-2 font-medium">Detalės</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {entries.map((e) => (
            <tr key={e.id} className="text-zinc-300">
              <td className="py-2.5 pr-4 align-top text-xs text-zinc-500 whitespace-nowrap">
                {new Date(e.createdAt).toLocaleString("lt-LT")}
              </td>
              <td className="py-2.5 pr-4 align-top">{creditLedgerReasonLt(e.reason)}</td>
              <td
                className={`py-2.5 pr-4 text-right font-mono tabular-nums ${
                  e.delta > 0 ? "text-[var(--color-lime)]" : "text-zinc-200"
                }`}
              >
                {e.delta > 0 ? `+${e.delta}` : e.delta}
              </td>
              <td className="py-2.5 align-top text-xs text-zinc-500 break-all">{formatMeta(e.meta) || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
