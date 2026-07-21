"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { fingerprintHeaders } from "@/lib/device-fingerprint";

export type StripePackKey = "5" | "20";

type Props = {
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  priceKey?: StripePackKey;
};

export function StripeCheckoutButton({ className, children, disabled, priceKey = "20" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...fingerprintHeaders() },
        body: JSON.stringify({ priceKey }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Nepavyko paleisti mokėjimo");
    } catch {
      setError("Tinklo klaida. Bandykite dar kartą.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex max-w-full flex-col items-stretch gap-1.5">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void onClick()}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 motion-safe:transition-opacity motion-safe:duration-200",
          className,
        )}
      >
        {loading ? "Kraunama…" : children}
      </button>
      {error ? (
        <span className="text-center text-xs text-rose-400" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
