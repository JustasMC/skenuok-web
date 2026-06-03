"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { ArticleGenerationSkeleton } from "@/components/tools/ArticleGenerationSkeleton";
import { BulkSeoEarlyAccessForm } from "@/components/tools/BulkSeoEarlyAccessForm";
import { GeneratorWorkspacePanel } from "@/components/tools/GeneratorWorkspacePanel";
import { SeoScorePanel } from "@/components/tools/SeoScorePanel";
import { fireSuccessConfetti } from "@/lib/confetti-celebration";
import type { SeoScoreBreakdown } from "@/lib/seo-score";

type HistoryRow = { id: string; topic: string; seoScore: number | null; createdAt: string };

export function ContentGenerator() {
  const sp = useSearchParams();
  const topicFromUrl = useMemo(() => {
    const raw = sp.get("topic");
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [sp]);

  const contextFromUrl = useMemo(() => {
    const raw = sp.get("context");
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [sp]);

  const toneFromUrl = useMemo(() => {
    const raw = sp.get("tone");
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [sp]);

  const [tab, setTab] = useState<"one" | "bulk">("one");
  const [topic, setTopic] = useState("");
  /** Iš URL skanerio (query context) – niša */
  const [scannerNiche, setScannerNiche] = useState<string | null>(null);
  /** Iš URL skanerio (query tone) – veiklos / tono santrauka */
  const [scannerTone, setScannerTone] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [seo, setSeo] = useState<SeoScoreBreakdown | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [postCheckoutSuccess, setPostCheckoutSuccess] = useState(false);
  const [mergeWelcome, setMergeWelcome] = useState<string | null>(null);
  const [sessionMode, setSessionMode] = useState<"user" | "session" | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const checkoutConfettiDoneRef = useRef(false);

  const refreshSession = useCallback(async (): Promise<number | null> => {
    const res = await fetch("/api/session", { method: "GET", credentials: "same-origin" });
    const body = (await res.json()) as {
      credits?: number;
      mergeFlash?: { credits: number } | null;
      mode?: "user" | "session";
    };
    if (typeof body.credits === "number") setCredits(body.credits);
    if (body.mode) setSessionMode(body.mode);
    if (body.mergeFlash) {
      const c = body.mergeFlash.credits;
      setMergeWelcome(
        c > 0
          ? `Sveiki grįžę! Jūsų sesijos kreditai sėkmingai perkelti į jūsų paskyrą (${c} kreditų).`
          : "Sveiki grįžę! Jūsų anoniminės sesijos istorija perkelta į paskyrą.",
      );
    }
    return typeof body.credits === "number" ? body.credits : null;
  }, []);

  const refreshHistory = useCallback(async () => {
    const res = await fetch("/api/generator/history");
    const body = (await res.json()) as { items?: HistoryRow[] };
    setHistory(body.items ?? []);
  }, []);

  useEffect(() => {
    void refreshSession();
    void refreshHistory();
  }, [refreshSession, refreshHistory]);

  useEffect(() => {
    if (topicFromUrl) {
      setTopic(topicFromUrl);
    }
  }, [topicFromUrl]);

  useEffect(() => {
    const n = contextFromUrl.trim();
    const t = toneFromUrl.trim();
    setScannerNiche(n.length > 0 ? n : null);
    setScannerTone(t.length > 0 ? t : null);
  }, [contextFromUrl, toneFromUrl]);

  useEffect(() => {
    const checkout = sp.get("checkout");
    if (checkout !== "success") return;

    setPostCheckoutSuccess(true);

    const genHint = sp.get("gen_session_hint");
    if (genHint) {
      setSuccessToast(
        `Mokėjimas sėkmingas. Jei vėliau prisijungsite kitame įrenginyje, įveskite šį sesijos ID darbo vietoje („Pasisavinti“): ${genHint}`,
      );
    }

    const stripeSessionId = sp.get("session_id")?.trim() ?? "";

    if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      u.searchParams.delete("checkout");
      u.searchParams.delete("session_id");
      u.searchParams.delete("gen_session_hint");
      window.history.replaceState({}, "", `${u.pathname}${u.search}`);
    }

    let cancelled = false;
    void (async () => {
      if (stripeSessionId.startsWith("cs_")) {
        try {
          const r = await fetch("/api/credits/sync-checkout", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: stripeSessionId }),
          });
          const b = (await r.json()) as {
            ok?: boolean;
            applied?: boolean;
            credits?: number;
            reason?: string;
            error?: string;
          };
          if (!cancelled && r.ok && b.applied && typeof b.credits === "number") {
            setSuccessToast(`Kreditai įskaityti (+${b.credits}). Galite generuoti straipsnius.`);
          }
        } catch {
          /* webhook / sync neprivalomas tinklui */
        }
      }

      const baseline = (await refreshSession()) ?? 0;
      for (let i = 0; i < 30 && !cancelled; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 2000));
        const c = await refreshSession();
        if (typeof c === "number" && c > baseline) {
          if (!cancelled) setSuccessToast("Kreditai atnaujinti — galite generuoti straipsnius.");
          break;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sp, refreshSession]);

  useEffect(() => {
    if (!postCheckoutSuccess || checkoutConfettiDoneRef.current) return;
    checkoutConfettiDoneRef.current = true;
    fireSuccessConfetti("checkout");
  }, [postCheckoutSuccess]);

  useEffect(() => {
    if (!successToast) return;
    const id = window.setTimeout(() => setSuccessToast(null), 5500);
    return () => window.clearTimeout(id);
  }, [successToast]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHtml(null);
    setSeo(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          ...(scannerNiche ? { context: scannerNiche } : {}),
          ...(scannerTone ? { tone: scannerTone } : {}),
        }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        error?: string;
        needCredits?: boolean;
        html?: string;
        seo?: SeoScoreBreakdown;
        creditsLeft?: number;
      };

      if (res.status === 402 || body.needCredits) {
        setError("Kreditai baigėsi — papildykite balansą arba pasirinkite planą.");
        setCredits(0);
        return;
      }

      if (res.status === 401) {
        setError(body.error ?? "Reikia prisijungti.");
        return;
      }

      if (!res.ok) {
        setError(body.error ?? "Generavimas nepavyko");
        return;
      }

      if (body.html) setHtml(body.html);
      if (body.seo) setSeo(body.seo);
      if (typeof body.creditsLeft === "number") setCredits(body.creditsLeft);
      if (body.seo) {
        setSuccessToast(`✅ Straipsnis paruoštas! SEO balas: ${body.seo.score}/100`);
      } else {
        setSuccessToast("✅ Straipsnis paruoštas!");
      }
      fireSuccessConfetti("generate");
      void refreshHistory();
    } catch {
      setError("Tinklo klaida.");
    } finally {
      setLoading(false);
    }
  }

  const outOfCredits = credits !== null && credits < 1;

  return (
    <div className="space-y-8">
      {successToast ? (
        <div
          role="status"
          className="fixed top-4 left-1/2 z-[100] flex w-[min(100vw-1.5rem,26rem)] -translate-x-1/2 items-start gap-3 rounded-xl border border-[var(--color-lime)]/40 bg-[color-mix(in_oklab,var(--color-lime)_14%,#0c0e14)] px-4 py-3 text-sm text-zinc-100 shadow-[var(--shadow-glow)] backdrop-blur-sm sm:top-6"
        >
          <span className="min-w-0 flex-1 leading-snug">{successToast}</span>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="shrink-0 rounded-md px-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Uždaryti pranešimą"
          >
            ×
          </button>
        </div>
      ) : null}

      {mergeWelcome ? (
        <div className="rounded-xl border border-[var(--color-electric)]/40 bg-[color-mix(in_oklab,var(--color-electric)_12%,var(--color-surface))] px-4 py-3 text-sm text-zinc-100">
          {mergeWelcome}
        </div>
      ) : null}

      {postCheckoutSuccess ? (
        <div className="space-y-4 rounded-xl border border-[var(--color-lime)]/35 bg-[color-mix(in_oklab,var(--color-lime)_10%,var(--color-surface))] p-5 text-sm text-zinc-200 shadow-[0_0_40px_-12px_rgba(200,255,0,0.35)]">
          {sessionMode === "user" ? (
            <>
              <div className="space-y-2">
                <p className="text-lg font-semibold tracking-tight text-white">Mokėjimas gautas</p>
                <p className="text-zinc-300">
                  Kreditai paprastai atsiranda per kelias sekundes. Jei skaičius viršuje dar rodo 0 — palaukite arba
                  spauskite „Atnaujinti kreditus“.
                </p>
                {process.env.NODE_ENV === "development" ? (
                  <details className="group rounded-lg border border-zinc-700/80 bg-zinc-950/50 text-xs text-zinc-400">
                    <summary className="cursor-pointer select-none px-3 py-2 font-medium text-zinc-500 marker:text-zinc-600 hover:text-zinc-400">
                      Kūrėjams: Stripe webhook ant localhost
                    </summary>
                    <div className="space-y-2 border-t border-zinc-800 px-3 py-2 leading-relaxed">
                      <p>
                        Stripe negali pats kviesti <code className="rounded bg-zinc-900 px-1 text-zinc-300">localhost</code>.
                        Paleiskite terminale{" "}
                        <code className="rounded bg-zinc-900 px-1 text-zinc-300">stripe listen --forward-to …/api/webhooks/stripe</code>,{" "}
                        gautą <code className="rounded bg-zinc-900 px-1 text-zinc-300">whsec_…</code> įrašykite į{" "}
                        <code className="rounded bg-zinc-900 px-1 text-zinc-300">STRIPE_WEBHOOK_SECRET</code> faile{" "}
                        <code className="rounded bg-zinc-900 px-1 text-zinc-300">.env</code>, tada perkraukite{" "}
                        <code className="rounded bg-zinc-900 px-1 text-zinc-300">npm run dev</code>.
                      </p>
                    </div>
                  </details>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void refreshSession()}
                  className="inline-flex rounded-lg border border-[var(--color-electric)]/50 bg-[color-mix(in_oklab,var(--color-electric)_12%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--color-electric)] transition hover:bg-[color-mix(in_oklab,var(--color-electric)_18%,transparent)]"
                >
                  Atnaujinti kreditus dabar
                </button>
                <button
                  type="button"
                  onClick={() => setPostCheckoutSuccess(false)}
                  className="inline-flex rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
                >
                  Uždaryti
                </button>
              </div>
            </>
          ) : sessionMode === "session" ? (
            <>
              <div className="space-y-2">
                <p className="text-lg font-semibold tracking-tight text-white">Mokėjimas gautas</p>
                <p className="text-zinc-300">
                  Kreditai pridedami anoniminei sesijai. Kad neprarastumėte jų išvalę slapukus, susiekite sesiją su el.
                  paštu.
                </p>
                <p className="text-xs text-zinc-500">
                  Jei skaičius dar 0 — palaukite kelias sekundes arba perkraukite puslapį.
                </p>
                {process.env.NODE_ENV === "development" ? (
                  <details className="mt-2 rounded-lg border border-zinc-700/80 bg-zinc-950/50 text-xs text-zinc-400">
                    <summary className="cursor-pointer select-none px-3 py-2 font-medium text-zinc-500 hover:text-zinc-400">
                      Kūrėjams: webhook lokaliai
                    </summary>
                    <div className="border-t border-zinc-800 px-3 py-2">
                      Naudokite <code className="text-zinc-300">stripe listen</code> ir{" "}
                      <code className="text-zinc-300">STRIPE_WEBHOOK_SECRET</code> faile <code className="text-zinc-300">.env</code>.
                    </div>
                  </details>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/80 px-4 py-3">
                  <p className="text-sm text-zinc-300">
                    Prisijunkite el. paštu (Magic Link) — kreditai ir istorija bus saugiai susieti su jūsų paskyra.
                  </p>
                  <Link
                    href="/login"
                    className="mt-3 inline-flex text-sm font-medium text-[var(--color-electric)] underline-offset-4 hover:underline"
                  >
                    Prisijungti →
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => setPostCheckoutSuccess(false)}
                  className="shrink-0 self-start rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200 sm:self-end"
                >
                  Uždaryti
                </button>
              </div>
            </>
          ) : (
            <p className="text-zinc-400">Gaunama paskyros informacija…</p>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 text-sm">
          <button
            type="button"
            onClick={() => setTab("one")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              tab === "one" ? "bg-[var(--color-electric)] text-[#041014]" : "text-zinc-400 hover:text-white"
            }`}
          >
            Vienas straipsnis
          </button>
          <button
            type="button"
            onClick={() => setTab("bulk")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              tab === "bulk" ? "bg-[var(--color-lime)] text-[#101300]" : "text-zinc-400 hover:text-white"
            }`}
          >
            Masinis SEO
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <p>
            Kreditai:{" "}
            <span className="font-mono font-semibold text-[var(--color-lime)]">{credits ?? "…"}</span>
          </p>
          <StripeCheckoutButton className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-[var(--color-electric)] hover:text-white">
            Pirkti kreditų paketą
          </StripeCheckoutButton>
        </div>
      </div>

      {tab === "one" ? (
        <Card>
          <CardHeader>
            <CardTitle>SEO straipsnio generatorius</CardTitle>
            <CardDescription>
              Įveskite temą arba atkelkite ją iš URL skanerio. Sugeneruojamas struktūrizuotas HTML ir SEO balas pagal
              taisykles (H1, dažnis, vidinės nuorodos, ilgis).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="generator-form" onSubmit={onGenerate} className="space-y-4">
              {topicFromUrl ? (
                <div className="rounded-lg border border-[var(--color-electric)]/35 bg-[color-mix(in_oklab,var(--color-electric)_10%,transparent)] px-3 py-2 text-xs leading-relaxed text-zinc-300">
                  <span className="font-semibold text-[var(--color-electric)]">Iš URL skanerio: </span>
                  patikrinkite H1 antraštę žemiau ir spauskite generuoti. Kontekstas iš skenavimo bus pridėtas prie
                  užklausos.
                  {scannerNiche ? (
                    <span className="mt-1 block text-zinc-200">
                      <span className="text-zinc-500">Niša: </span>
                      {scannerNiche}
                    </span>
                  ) : null}
                  {scannerTone ? (
                    <details className="mt-2 rounded border border-[var(--color-border)]/80 bg-[var(--color-bg)]/50 px-2 py-1.5 text-zinc-400">
                      <summary className="cursor-pointer select-none text-xs text-zinc-500">Tonas / veiklos santrauka</summary>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{scannerTone}</p>
                    </details>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label htmlFor="gen-topic" className="text-sm font-medium text-zinc-300">
                  Straipsnio antraštė (H1) / tema
                </label>
                <textarea
                  id="gen-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-electric)]"
                  placeholder="Pvz., 5 klaidos renkantis valymo paslaugas Vilniuje (ir kaip jų išvengti)"
                  required
                />
              </div>

              {outOfCredits ? (
                <div className="flex flex-wrap items-center gap-3">
                  <StripeCheckoutButton className="inline-flex rounded-lg bg-[var(--color-lime)] px-4 py-2 text-sm font-semibold text-[#101300] transition hover:bg-[var(--color-lime-dim)]">
                    Papildyti balansą (Stripe)
                  </StripeCheckoutButton>
                  <Link
                    href="/pricing"
                    className="text-sm font-medium text-[var(--color-electric)] underline-offset-4 hover:underline"
                  >
                    Kainodara
                  </Link>
                  <span className="text-sm text-zinc-500">Arba Business planas — susisiekite.</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="rounded-lg bg-[var(--color-electric)] px-5 py-2.5 text-sm font-semibold text-[#041014] shadow-[var(--shadow-glow)] transition hover:bg-[var(--color-electric-dim)] disabled:opacity-50"
                >
                  {loading ? "Generuojama…" : "Generuoti straipsnį (1 kreditas)"}
                </button>
              )}

              {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            </form>

            {loading ? <ArticleGenerationSkeleton /> : null}

            {seo ? (
              <SeoScorePanel
                seo={seo}
                onRefine={() => {
                  const el = document.getElementById("gen-topic");
                  el?.focus();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ) : null}

            {html && !loading ? (
              <div className="mt-8 space-y-2">
                <p className="text-sm font-medium text-[var(--color-lime)]">Peržiūra (HTML) · paruošta</p>
                <div
                  className="prose prose-invert max-w-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm text-zinc-300 [&_a]:text-[var(--color-electric)]"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Masinis SEO</CardTitle>
            <CardDescription>
              Reikia 50+ straipsnių vienu metu? Kol kas tai darome rankiniu būdu su individualia analitika — palikite užklausą.
              Automatinė eilė (QStash / worker) bus prasminga tik tada, kai matysime paklausą.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-lg border border-dashed border-[var(--color-electric)]/30 bg-[var(--color-bg)] px-3 py-2 text-xs text-zinc-500">
              Early access: užpildykite formą — gausite atsakymą el. paštu. Vėliau čia atsiras progresas ir santraukos.
            </p>
            <BulkSeoEarlyAccessForm />
          </CardContent>
        </Card>
      )}

      <Card className="border-[color-mix(in_oklab,var(--color-border)_90%,var(--color-electric))]/40">
        <CardHeader>
          <CardTitle>Darbo vieta</CardTitle>
          <CardDescription>
            Santrauka ir istorija — {sessionMode === "user" ? "prisijungusi paskyra" : "anoniminė sesija (slapukas)"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratorWorkspacePanel history={history} credits={credits} sessionMode={sessionMode} />
        </CardContent>
      </Card>
    </div>
  );
}
