"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function ClaimSessionCredits() {
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
        setMessage({ ok: false, text: body.error ?? "Nepavyko" });
        return;
      }
      setMessage({
        ok: true,
        text: `Perkelta ${body.creditsTransferred ?? 0} kreditų. Dabar balanse: ${body.creditsLeft ?? "—"}.`,
      });
      setSessionId("");
    } catch {
      setMessage({ ok: false, text: "Tinklo klaida." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-4">
      <p className="text-sm font-medium text-zinc-200">Anoniminiai kreditai iš kito įrenginio?</p>
      <p className="mt-1 text-xs text-zinc-500">
        Tas pats, kas automatiškai suliejama prisijungus su tuo pačiu įrenginiu. Jei pirkote kitoje vietoje – įveskite{" "}
        <span className="text-zinc-400">sesijos ID</span> (naršyklės slapukas „gen_session“ vertė arba išsaugotas
        kopijuotas ID). Po anoniminio Stripe mokėjimo tas pats ID gali būti atsiųstas el. paštu. Kūrėjams: Application →
        Cookies → <span className="font-mono">gen_session</span>.
      </p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="Sesijos ID (pvz. clx…)"
          className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 font-mono text-xs text-white outline-none focus:border-[var(--color-electric)]"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !sessionId.trim()}
          className="shrink-0 rounded-lg bg-[var(--color-electric)] px-4 py-2 text-sm font-semibold text-[#041014] transition hover:bg-[var(--color-electric-dim)] disabled:opacity-50"
        >
          {loading ? "…" : "Pasisavinti"}
        </button>
      </form>
      {message ? (
        <p className={`mt-3 text-sm ${message.ok ? "text-[var(--color-lime)]" : "text-rose-400"}`}>{message.text}</p>
      ) : null}
    </div>
  );
}
