"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div className="site-shell flex min-h-[70dvh] flex-col items-center justify-center py-20 text-center">
      <div className="site-card max-w-md space-y-6 p-8 sm:p-10">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-electric)]">Klaida</p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Kažkas nepavyko
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-zinc-400">
            Puslapio negalėjome parodyti iki galo. Tai dažniausiai laikina — galite bandyti dar kartą arba grįžti į pradžią.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="site-btn-primary min-h-11 w-full sm:w-auto"
          >
            Bandyti dar kartą
          </button>
          <Link href="/" className="site-btn-secondary min-h-11 w-full sm:w-auto">
            Į pradžią
          </Link>
        </div>
      </div>
    </div>
  );
}
