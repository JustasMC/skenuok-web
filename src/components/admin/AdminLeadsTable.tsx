"use client";

import { useState } from "react";

export type AdminLeadRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  type: string;
  status: string;
  estimatedValue: number | null;
  details: unknown;
  message: string;
  createdAt: string;
};

const STATUSES = ["pending", "contacted", "closed"] as const;

export function AdminLeadsTable({ initial }: { initial: AdminLeadRow[] }) {
  const [rows, setRows] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setError(data.error ?? "Nepavyko atnaujinti");
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      setError("Tinklo klaida");
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return <p className="text-sm text-zinc-400">Leadų dar nėra.</p>;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--color-surface-2)] text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Vardas</th>
              <th className="px-3 py-2">Tipas</th>
              <th className="px-3 py-2">Vertė</th>
              <th className="px-3 py-2">Statusas</th>
              <th className="px-3 py-2">Žinutė</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[var(--color-border)] align-top">
                <td className="whitespace-nowrap px-3 py-2 text-zinc-400">
                  {new Date(r.createdAt).toLocaleString("lt-LT")}
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium text-zinc-100">{r.name}</div>
                  <div className="text-xs text-zinc-500">{r.email}</div>
                </td>
                <td className="px-3 py-2 text-zinc-300">{r.type}</td>
                <td className="px-3 py-2 text-zinc-300">
                  {r.estimatedValue != null ? `${r.estimatedValue} €` : "—"}
                </td>
                <td className="px-3 py-2">
                  <select
                    className="site-input py-1 text-sm"
                    value={r.status}
                    disabled={busyId === r.id}
                    onChange={(e) => void setStatus(r.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="max-w-xs px-3 py-2 text-zinc-400">
                  <span className="line-clamp-3">{r.message}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
