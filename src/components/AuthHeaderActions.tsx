"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const btnOutline =
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-sm font-medium motion-safe:transition-[border-color,transform] motion-safe:duration-200";

const creditPillBase =
  "inline-flex min-h-9 min-w-[5.5rem] max-w-[10.5rem] shrink-0 items-center justify-center truncate rounded-lg border px-2.5 py-1.5 text-center text-sm font-semibold motion-safe:transition-[border-color,box-shadow,color] motion-safe:duration-200";

function formatLtCredits(n: number, locale: "lt" | "en"): string {
  if (locale === "en") {
    return `${n} credit${n === 1 ? "" : "s"}`;
  }
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

function modeTitle(mode: "user" | "session" | null, dict: Dictionary): string {
  if (mode === "user") return dict.auth.accountCredits;
  if (mode === "session") return dict.auth.sessionCredits;
  return dict.auth.creditsBalance;
}

export function AuthHeaderActions() {
  const { locale, dict } = useLocale();
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [mode, setMode] = useState<"user" | "session" | null>(null);
  const [creditsReady, setCreditsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const userKeyRef = useRef<string>("");
  const pollRef = useRef<number | null>(null);
  const focusTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function renderCreditsPill() {
    if (!creditsReady) return <CreditsSkeleton />;

    if (credits == null) {
      return (
        <span
          className={`${creditPillBase} border-[var(--color-border)]/70 bg-zinc-900/40 text-zinc-300`}
          title={dict.auth.creditsFailed}
          role="status"
        >
          —
        </span>
      );
    }

    const isZero = credits <= 0;
    const mt = modeTitle(mode, dict);
    const balanceLabel = formatLtCredits(credits, locale);
    const href = "/pricing#prenumerata";

    if (isZero) {
      return (
        <Link
          href={href}
          className={`${creditPillBase} credit-zero-pulse border-rose-500/55 bg-rose-500/10 text-rose-100 hover:border-rose-400/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400/60`}
          title={`${mt}. ${dict.auth.creditsGone}`}
          aria-label={`${mt}. ${dict.auth.creditsGone} ${dict.auth.openPricing}`}
        >
          {dict.auth.creditsGoneShort}
        </Link>
      );
    }

    return (
      <Link
        href={href}
        className={`${creditPillBase} border-[var(--color-border)] bg-[var(--color-surface)] text-zinc-100 hover:border-[var(--color-lime)]/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/55`}
        title={`${mt}. ${dict.auth.openPricing}`}
        aria-label={`${mt}: ${balanceLabel}. ${dict.auth.openPricing}`}
      >
        {balanceLabel}
      </Link>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2" aria-busy="true">
        <CreditsSkeleton />
      </div>
    );
  }

  if (session?.user) {
    const email = session.user.email ?? "Paskyra";
    return (
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        {renderCreditsPill()}
        <Link
          href="/dashboard"
          className={`${btnOutline} hidden shrink-0 text-zinc-200 hover:border-[var(--color-lime)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50 md:inline-flex`}
        >
          {dict.auth.workspace}
        </Link>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            className={`${btnOutline} max-w-[9.5rem] gap-1.5 truncate text-zinc-200 hover:border-[var(--color-electric)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50`}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="truncate">{email.split("@")[0]}</span>
            <span aria-hidden className="text-zinc-500">
              ▾
            </span>
          </button>
          {menuOpen ? (
            <div
              id={menuId}
              role="menu"
              className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-xl shadow-black/40"
            >
              <p className="truncate border-b border-[var(--color-border)]/80 px-3 py-2 text-xs text-zinc-400" title={email}>
                {email}
              </p>
              <Link
                href="/dashboard"
                role="menuitem"
                className="block px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/5 hover:text-[var(--color-lime)] md:hidden"
                onClick={() => setMenuOpen(false)}
              >
                {dict.auth.workspace}
              </Link>
              <Link
                href="/pricing#prenumerata"
                role="menuitem"
                className="block px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/5 hover:text-[var(--color-lime)]"
                onClick={() => setMenuOpen(false)}
              >
                {dict.auth.plans}
              </Link>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2.5 text-left text-sm text-rose-300 hover:bg-rose-500/10"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut({ callbackUrl: "/" });
                }}
              >
                {dict.auth.logout}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      {renderCreditsPill()}
      <Link
        href="/login"
        className={`${btnOutline} shrink-0 text-zinc-100 hover:border-[var(--color-electric)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50 active:scale-[0.98]`}
      >
        {dict.auth.login}
      </Link>
    </div>
  );
}
