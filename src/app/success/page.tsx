"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDict } from "@/components/i18n/LocaleProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

function SuccessSync() {
  const t = useDict().successPage;
  const sp = useSearchParams();
  const router = useRouter();
  const sessionId = sp.get("session_id");
  const genHint = sp.get("gen_session_hint");
  const [message, setMessage] = useState(t.confirming);

  useEffect(() => {
    if (!sessionId || !sessionId.startsWith("cs_")) {
      setMessage(t.missingSession);
      return;
    }

    const sid = sessionId;
    let cancelled = false;

    async function run() {
      try {
        const r = await fetch("/api/credits/sync-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid }),
        });
        const data = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; credits?: number };
        if (cancelled) return;
        if (!r.ok && data.error) {
          setMessage(data.error);
          return;
        }
        const q = new URLSearchParams();
        q.set("checkout", "success");
        q.set("session_id", sid);
        if (genHint) q.set("gen_session_hint", genHint);
        router.refresh();
        router.replace(`/irankiai/seo-generatorius?${q.toString()}`);
      } catch {
        if (!cancelled) setMessage(t.network);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [sessionId, genHint, router, t.missingSession, t.network]);

  return (
    <div className="site-card mx-auto max-w-md space-y-4 p-8 text-center">
      <h1 className="text-lg font-semibold text-white">{t.title}</h1>
      <p className="text-sm text-zinc-400">{message}</p>
      <Link href="/irankiai/seo-generatorius" className="site-link-inline text-sm font-medium">
        {t.goGenerator}
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  const t = useDict().successPage;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell flex min-h-[50dvh] flex-col items-center justify-center py-16">
        <Suspense
          fallback={
            <div className="site-skeleton h-32 w-full max-w-md rounded-xl" role="status" aria-live="polite">
              {t.loading}
            </div>
          }
        >
          <SuccessSync />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
