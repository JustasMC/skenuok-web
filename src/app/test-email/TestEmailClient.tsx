"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6zm0 0 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TestEmailClient() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState<string>("");

  async function sendTest() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; id?: string | null };
      if (!res.ok) {
        setStatus("err");
        setMessage(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setStatus("ok");
      setMessage(data.id ? `Išsiųsta. Resend id: ${data.id}` : "Išsiųsta.");
    } catch {
      setStatus("err");
      setMessage("Tinklo klaida. Bandykite dar kartą.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell max-w-lg space-y-8 py-16">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-electric)]">Vidinis testas</p>
          <h1 className="text-2xl font-semibold text-zinc-100">El. paštas (Resend)</h1>
          <p className="text-sm text-zinc-400">
            Siunčia laišką į <span className="text-zinc-200">pagalba@skenuok.com</span> per{" "}
            <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-300">/api/test-send</code>. Reikia{" "}
            <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-300">RESEND_API_KEY</code>.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] p-6 sm:p-8">
          <button
            type="button"
            onClick={() => void sendTest()}
            disabled={status === "loading"}
            className="group relative flex w-full min-h-[3.25rem] items-center justify-center gap-3 overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-electric)_45%,var(--color-border))] bg-[var(--color-electric)] px-6 py-3.5 text-base font-semibold text-[#041014] shadow-[var(--shadow-glow)] motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-200 hover:bg-[var(--color-electric-dim)] hover:shadow-[0_0_36px_-8px_rgba(34,211,238,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-55 sm:min-h-14 sm:text-lg"
          >
            <MailIcon className="shrink-0 opacity-90 motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-110" />
            <span>{status === "loading" ? "Siunčiama…" : "Siųsti testinį laišką"}</span>
          </button>

          {status === "ok" ? (
            <p className="mt-5 text-sm text-[var(--color-lime)]" role="status">
              {message}
            </p>
          ) : null}
          {status === "err" ? (
            <p className="mt-5 text-sm text-rose-300" role="alert">
              {message}
            </p>
          ) : null}
        </div>

        <p className="text-xs leading-relaxed text-zinc-600">
          Numatytasis siuntėjas: <code className="text-zinc-500">onboarding@resend.dev</code>. Produkcijoje nustatykite{" "}
          <code className="text-zinc-400">RESEND_FROM_EMAIL</code>, pvz. <span className="text-zinc-500">info@skenuok.com</span>{" "}
          arba <span className="text-zinc-500">Skenuok &lt;noreply@skenuok.com&gt;</span>, kai domenas patvirtintas Resende.
        </p>

        <Link href="/" className="site-link-inline text-sm">
          ← Grįžti į pradžią
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
