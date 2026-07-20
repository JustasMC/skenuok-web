"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { useDict } from "@/components/i18n/LocaleProvider";

const STORAGE_KEY = "skenuok_cookie_consent";

type Consent = "all" | "essential" | null;

function readConsent(): Consent {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "all" || raw === "essential") return raw;
  return null;
}

export function CookieConsent() {
  const dict = useDict();
  const [consent, setConsent] = useState<Consent>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setVisible(stored === null);
  }, []);

  function save(value: Consent) {
    if (!value) return;
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
    setVisible(false);
  }

  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  const analyticsAllowed = consent === "all" && Boolean(gaId);

  return (
    <>
      {analyticsAllowed && gaId ? <GoogleAnalytics gaId={gaId} /> : null}

      {visible ? (
        <div
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-[var(--color-border)]/90 bg-[color-mix(in_oklab,var(--color-surface)_94%,black)] p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-5"
        >
          <div className="site-shell-wide flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <p id="cookie-consent-title" className="text-sm font-semibold text-white">
                {dict.cookies.title}
              </p>
              <p id="cookie-consent-desc" className="text-sm leading-relaxed text-zinc-400">
                {dict.cookies.body}{" "}
                <Link href="/privacy" className="site-link-inline">
                  {dict.cookies.privacyLink}
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0">
              <button
                type="button"
                onClick={() => save("essential")}
                className="site-btn-secondary min-h-10 px-4 text-sm"
              >
                {dict.cookies.essential}
              </button>
              <button type="button" onClick={() => save("all")} className="site-btn-primary min-h-10 px-4 text-sm">
                {dict.cookies.acceptAll}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
