"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  children: ReactNode;
  disabled?: boolean;
};

export function StripeCheckoutButton({ className, children, disabled }: Props) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error ?? "Nepavyko paleisti mokėjimo");
    } catch {
      alert("Tinklo klaida");
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
