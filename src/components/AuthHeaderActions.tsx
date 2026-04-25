"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const btnOutline =
  "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium motion-safe:transition-[border-color,transform] motion-safe:duration-200 sm:text-sm";

export function AuthHeaderActions() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-xs text-zinc-600" aria-busy="true">
        …
      </span>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard"
          className={`${btnOutline} hidden text-zinc-300 hover:border-[var(--color-lime)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50 sm:inline`}
        >
          Darbo vieta
        </Link>
        <span className="hidden max-w-[10rem] truncate text-xs text-zinc-500 sm:inline" title={session.user.email ?? ""}>
          {session.user.email}
        </span>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className={`${btnOutline} text-zinc-200 hover:border-rose-500/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500/50 active:scale-[0.98]`}
        >
          Atsijungti
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className={`${btnOutline} text-zinc-100 hover:border-[var(--color-electric)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50 active:scale-[0.98]`}
    >
      Prisijungti
    </Link>
  );
}
