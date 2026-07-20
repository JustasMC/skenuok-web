"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDict } from "@/components/i18n/LocaleProvider";

export function ClaimSessionCredits() {
  const t = useDict().dashboard.claim;
  const sp = useSearchParams();
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const claim = sp.get("claim");
    if (!claim?.trim()) return;
    setSessionId((prev) => (prev.trim() ? prev : claim.trim()));
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    u.searchParams.delete("claim");
    window.history.replaceState({}, "", `${u.pathname}${u.search}`);
  }, [sp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/credits/claim-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId: sessionId.trim() }),
      });
      const body = (await res.json()) as {
        error?: string;
        creditsTransferred?: number;
        creditsLeft?: number;
      };
      if (!res.ok) {
        setMessage({ ok: false, text: body.error ?? t.failed });
        return;
      }
      setMessage({
        ok: true,
        text: t.transferred
          .replace("{count}", String(body.creditsTransferred ?? 0))
          .replace("{balance}", String(body.creditsLeft ?? "—")),
      });
      setSessionId("");
    } catch {
      setMessage({ ok: false, text: t.networkError });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-4">
      <p className="text-sm font-medium text-zinc-200">{t.title}</p>
      <p className="mt-1 text-xs text-zinc-500">
        {t.bodyBefore}{" "}
        <span className="text-zinc-400">{t.sessionId}</span> {t.bodyMid}{" "}
        <span className="font-mono">gen_session</span>.
      </p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder={t.placeholder}
          className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 font-mono text-xs text-white outline-none focus:border-[var(--color-electric)]"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !sessionId.trim()}
          className="shrink-0 rounded-lg bg-[var(--color-electric)] px-4 py-2 text-sm font-semibold text-[#041014] transition hover:bg-[var(--color-electric-dim)] disabled:opacity-50"
        >
          {loading ? "…" : t.submit}
        </button>
      </form>
      {message ? (
        <p className={`mt-3 text-sm ${message.ok ? "text-[var(--color-lime)]" : "text-rose-400"}`}>{message.text}</p>
      ) : null}
    </div>
  );
}
