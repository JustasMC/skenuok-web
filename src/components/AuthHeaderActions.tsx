"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

const btnOutline =
  "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium motion-safe:transition-[border-color,transform] motion-safe:duration-200 sm:text-sm";

const creditPillBase =
  "inline-flex min-h-8 min-w-[7.25rem] max-w-[14rem] shrink-0 items-center justify-center truncate rounded-lg border px-2.5 py-1.5 text-center text-xs font-semibold motion-safe:transition-[border-color,box-shadow,color] motion-safe:duration-200 sm:min-h-9 sm:px-3 sm:text-sm";

function formatLtCredits(n: number): string {
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  const mod10 = abs % 10;
  let word: string;
  if (mod10 === 1 && mod100 !== 11) {
    word = "kreditas";
  } else if (mod10 >= 2 && mod10 <= 9 && (mod100 < 12 || mod100 > 19)) {
    word = "kreditai";
  } else {
    word = "kreditų";
  }
  return `${n} ${word}`;
}

function CreditsSkeleton() {
  return (
    <span
      className={`${creditPillBase} border-[var(--color-border)]/60 bg-zinc-900/50 motion-safe:animate-pulse`}
      aria-hidden
    />
  );
}

function modeTitle(mode: "user" | "session" | null): string {
  if (mode === "user") return "Paskyros kreditų likutis";
  if (mode === "session") return "Naršyklės sesijos kreditų likutis";
  return "Kreditų likutis";
}

export function AuthHeaderActions() {
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [mode, setMode] = useState<"user" | "session" | null>(null);
  const [creditsReady, setCreditsReady] = useState(false);
  const userKeyRef = useRef<string>("");
  const pollRef = useRef<number | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCredits = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/session", { method: "GET", credentials: "include", signal });
      if (!res.ok) {
        setCredits(null);
        setMode(null);
        return;
      }
      const body = (await res.json()) as { credits?: number; mode?: "user" | "session" };
      if (typeof body.credits === "number") setCredits(body.credits);
      else setCredits(null);
      if (body.mode === "user" || body.mode === "session") setMode(body.mode);
      else setMode(null);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setCredits(null);
      setMode(null);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    const key = session?.user?.id ?? "guest";
    if (userKeyRef.current !== key) {
      userKeyRef.current = key;
      setCredits(null);
      setMode(null);
      setCreditsReady(false);
    }

    const ac = new AbortController();
    void loadCredits(ac.signal).finally(() => {
      if (!ac.signal.aborted) setCreditsReady(true);
    });

    return () => ac.abort();
  }, [status, session?.user?.id, loadCredits]);

  useEffect(() => {
    if (status === "loading") return;

    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      const ac = new AbortController();
      void loadCredits(ac.signal);
    };

    pollRef.current = window.setInterval(tick, 60000);

    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };

    const onFocus = () => {
      if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
      focusTimerRef.current = window.setTimeout(tick, 400);
    };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    };
  }, [status, session?.user?.id, loadCredits]);

  function renderCreditsPill() {
    if (!creditsReady) return <CreditsSkeleton />;

    if (credits == null) {
      return (
        <span
          className={`${creditPillBase} border-[var(--color-border)]/70 bg-zinc-900/40 text-zinc-500`}
          title="Nepavyko užkrauti kreditų. Bandykite atnaujinti puslapį."
          role="status"
        >
          —
        </span>
      );
    }

    const isZero = credits <= 0;
    const mt = modeTitle(mode);
    const balanceLabel = formatLtCredits(credits);
    const href = "/pricing#prenumerata";

    if (isZero) {
      return (
        <Link
          href={href}
          className={`${creditPillBase} credit-zero-pulse border-rose-500/55 bg-rose-500/10 text-rose-100 hover:border-rose-400/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400/60`}
          title={`${mt}. Kreditai baigėsi — pereikite į planus.`}
          aria-label={`${mt}. Kreditai baigėsi. Atidaryti kainodarą ir prenumeratos planus.`}
        >
          0 kreditų · Pildyti planą
        </Link>
      );
    }

    return (
      <div className="flex min-w-0 max-w-full items-center gap-1.5 sm:gap-2">
        <span
          className={`${creditPillBase} cursor-default border-[var(--color-border)] bg-[var(--color-surface)] text-zinc-100`}
          title={`${mt}. Pakeisti planą galite per nuorodą „Planai“ dešinėje.`}
          role="status"
          aria-label={`${mt}: ${balanceLabel}`}
        >
          {balanceLabel}
        </span>
        <Link
          href={href}
          className="shrink-0 text-[11px] font-semibold text-zinc-500 underline decoration-zinc-600/55 underline-offset-[3px] motion-safe:transition-colors motion-safe:duration-200 hover:text-[var(--color-lime)] hover:decoration-[color-mix(in_oklab,var(--color-lime)_45%,transparent)] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/55 sm:text-xs"
          aria-label="Kainodara ir prenumeratos planai"
        >
          Planai
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 sm:gap-3" aria-busy="true">
        <CreditsSkeleton />
        <span className="text-xs text-zinc-600">…</span>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {renderCreditsPill()}
        <Link
          href="/dashboard"
          className={`${btnOutline} hidden shrink-0 text-zinc-300 hover:border-[var(--color-lime)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50 sm:inline`}
        >
          Darbo vieta
        </Link>
        <span className="hidden max-w-[10rem] shrink truncate text-xs text-zinc-500 sm:inline" title={session.user.email ?? ""}>
          {session.user.email}
        </span>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className={`${btnOutline} shrink-0 text-zinc-200 hover:border-rose-500/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500/50 active:scale-[0.98]`}
        >
          Atsijungti
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      {renderCreditsPill()}
      <Link
        href="/login"
        className={`${btnOutline} shrink-0 text-zinc-100 hover:border-[var(--color-electric)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50 active:scale-[0.98]`}
      >
        Prisijungti
      </Link>
    </div>
  );
}
